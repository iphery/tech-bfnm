import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function ensureHolidaysTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Holidays (
        date DATE NOT NULL PRIMARY KEY,
        description VARCHAR(255) NULL,
        type VARCHAR(50) DEFAULT 'Nasional',
        year INT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist if table was already created with minimal schema
    const [cols] = await pool.query('SHOW COLUMNS FROM Holidays');
    const fieldNames = cols.map((c) => c.Field.toLowerCase());

    if (!fieldNames.includes('description')) {
      await pool.query('ALTER TABLE Holidays ADD COLUMN description VARCHAR(255) NULL AFTER date');
    }
    if (!fieldNames.includes('type')) {
      await pool.query("ALTER TABLE Holidays ADD COLUMN type VARCHAR(50) DEFAULT 'Nasional' AFTER description");
    }
    if (!fieldNames.includes('year')) {
      await pool.query('ALTER TABLE Holidays ADD COLUMN year INT NULL AFTER type');
      await pool.query('UPDATE Holidays SET year = YEAR(date) WHERE year IS NULL');
    }
  } catch (err) {
    console.error('ensureHolidaysTable error:', err);
  }
}

export async function GET(request) {
  try {
    await ensureHolidaysTable();
    const url = new URL(request.url);
    const queryYear = Number(url.searchParams.get('year')) || new Date().getFullYear();

    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, 
              COALESCE(description, 'Hari Libur') as description, 
              COALESCE(type, 'Nasional') as type, 
              COALESCE(year, YEAR(date)) as year 
       FROM Holidays 
       WHERE (year = ? OR YEAR(date) = ?) 
       ORDER BY date ASC`,
      [queryYear, queryYear]
    );

    return NextResponse.json({
      success: true,
      year: queryYear,
      holidays: rows || [],
    });
  } catch (error) {
    console.error('holidays GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureHolidaysTable();
    const body = await request.json();
    const action = body.action || 'save_one';
    const year = Number(body.year) || new Date().getFullYear();

    if (action === 'delete_one') {
      const { date } = body;
      if (date) {
        await pool.query('DELETE FROM Holidays WHERE date = ?', [date]);
      }
      return NextResponse.json({ success: true, message: 'Hari libur berhasil dihapus' });
    }

    // Save or Edit Single Record (Supports changing date or updating description/type)
    if (action === 'save_one' || action === 'add_one') {
      const { old_date, date, description, type } = body;
      if (!date || !description) {
        return NextResponse.json(
          { success: false, error: 'Tanggal dan keterangan libur wajib diisi' },
          { status: 400 }
        );
      }

      const itemYear = new Date(date).getFullYear() || year;
      const holidayType = type || 'Kantor';

      // If user edited the date (old_date differs from date), remove old date first
      if (old_date && old_date !== date) {
        await pool.query('DELETE FROM Holidays WHERE date = ?', [old_date]);
      }

      // Upsert using PRIMARY KEY (date)
      await pool.query(
        `INSERT INTO Holidays (date, description, type, year)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            description = VALUES(description), 
            type = VALUES(type), 
            year = VALUES(year)`,
        [date, description, holidayType, itemYear]
      );

      return NextResponse.json({
        success: true,
        message: old_date ? 'Perubahan hari libur berhasil disimpan' : 'Hari libur berhasil ditambahkan',
      });
    }

    // Fetch from Online National Holiday APIs and store directly in DB
    if (action === 'fetch_api') {
      let fetchedList = [];
      const apiUrls = [
        `https://api-hari-libur.vercel.app/api?year=${year}`,
        `https://dayoffapi.vercel.app/api?year=${year}`,
        `https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/master/calendar.json`,
      ];

      for (const endpoint of apiUrls) {
        try {
          const res = await fetch(endpoint, { next: { revalidate: 3600 } });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              fetchedList = data;
              break;
            } else if (data && typeof data === 'object') {
              const parsed = [];
              for (const [d, v] of Object.entries(data)) {
                if (d.startsWith(String(year))) {
                  parsed.push({
                    holiday_date: d,
                    holiday_name: typeof v === 'string' ? v : v.summary || v.holiday_name || 'Libur Nasional',
                    is_national_holiday: true,
                  });
                }
              }
              if (parsed.length > 0) {
                fetchedList = parsed;
                break;
              }
            }
          }
        } catch (e) {
          console.warn(`Fetch ${endpoint} failed:`, e.message);
        }
      }

      if (fetchedList.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Tidak dapat mengambil data hari libur nasional tahun ${year} dari web penyedia. Periksa koneksi internet.`,
          },
          { status: 502 }
        );
      }

      // Upsert directly into Holidays table, ensuring no duplicate date (date is primary key)
      let insertedCount = 0;
      for (const item of fetchedList) {
        const dateStr = item.holiday_date || item.date;
        const name = item.holiday_name || item.name || item.summary || 'Hari Libur Nasional';
        const isNational = item.is_national_holiday !== false;
        const type = isNational ? 'Nasional' : 'Cuti Bersama';

        if (dateStr && dateStr.startsWith(String(year))) {
          await pool.query(
            `INSERT INTO Holidays (date, description, type, year)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                description = COALESCE(Holidays.description, VALUES(description)),
                type = COALESCE(Holidays.type, VALUES(type)),
                year = VALUES(year)`,
            [dateStr, name, type, year]
          );
          insertedCount++;
        }
      }

      const [updatedRows] = await pool.query(
        `SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, 
                COALESCE(description, 'Hari Libur') as description, 
                COALESCE(type, 'Nasional') as type, 
                COALESCE(year, YEAR(date)) as year 
         FROM Holidays 
         WHERE (year = ? OR YEAR(date) = ?) 
         ORDER BY date ASC`,
        [year, year]
      );

      return NextResponse.json({
        success: true,
        message: `Berhasil mengambil & menyimpan ${insertedCount} hari libur nasional tahun ${year} ke database`,
        holidays: updatedRows || [],
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (error) {
    console.error('holidays POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
