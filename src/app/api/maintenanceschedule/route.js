import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    const year = Number(url.searchParams.get('year')) || currentYear;
    const month = Number(url.searchParams.get('month')) || currentMonth;

    const monthStr = String(month).padStart(2, '0');
    const cutOffDate = `${year}-${monthStr}-01 00:00:00`;
    const startOfMonth = `${year}-${monthStr}-01 00:00:00`;

    // Days in specified month
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const endOfMonth = `${year}-${monthStr}-${String(totalDaysInMonth).padStart(2, '0')} 23:59:59`;

    // 1. Kueri SQL: Ambil aset aktif beserta ID_Request PM terakhir yang HANYA terjadi SEBELUM bulan ini
    // Diurutkan by ID_Asset ASC agar urutannya konsisten/deterministik
    const sqlAssets = `
      SELECT 
        a.ID_Asset,
        a.Description,
        a.Manufacture,
        a.Model,
        a.Type,
        a.PM_Category,
        a.Location,
        a.factory,
        COALESCE(a.User, '') AS user_name,
        COALESCE(r.ID_Request, 'tidak ada history') AS ID_Request,
        r.Time_Request
      FROM Assets a
      LEFT JOIN (
        SELECT 
          r1.ID_Asset, 
          r1.ID_Request,
          r1.Time_Request
        FROM Request r1
        INNER JOIN (
          SELECT 
            ID_Asset, 
            MAX(ID_Request) AS Max_ID_Request
          FROM Request
          WHERE Maintenance_Type = 'PM' 
            AND Time_Request < ?
          GROUP BY ID_Asset
        ) r2 ON r1.ID_Asset = r2.ID_Asset AND r1.ID_Request = r2.Max_ID_Request
      ) r ON a.ID_Asset = r.ID_Asset
      WHERE a.nonactive = 0
      ORDER BY a.ID_Asset ASC
    `;

    const [rawAssets] = await pool.query(sqlAssets, [cutOffDate]);

    // 2. Query batch: Aset yang SUDAH diservis (ada history PM) pada bulan yang dipilih
    const [servicedRows] = await pool.query(
      `SELECT DISTINCT ID_Asset 
       FROM Request 
       WHERE Maintenance_Type = 'PM' 
         AND Time_Request BETWEEN ? AND ?`,
      [startOfMonth, endOfMonth]
    );

    const servicedSet = new Set(servicedRows.map((r) => String(r.ID_Asset).trim()));

    // 3. Deklarasi kriteria interval per jenis Type Aset (satuan bulan)
    const typeIntervals = {
      AP: 1,
      BH: 1,
      HY: 1,
      MP: 1,
      AC: 3,
    };

    const groupedAssets = {
      AP: [],
      BH: [],
      HY: [],
      MP: [],
      AC: [],
    };

    for (const row of rawAssets) {
      const type = String(row.Type || '').trim();
      if (!typeIntervals[type]) continue;
      if (!row.Time_Request || row.ID_Request === 'tidak ada history') continue;

      const lastTime = new Date(row.Time_Request);
      const lastYear = lastTime.getFullYear();
      const lastMonth = lastTime.getMonth() + 1;

      // Selisih bulan dihitung terhadap acuan bulan yang dipilih
      const diffMonths = (year - lastYear) * 12 + (month - lastMonth);
      if (diffMonths <= 0) continue;

      const requiredInterval = typeIntervals[type];
      if (diffMonths === requiredInterval) {
        groupedAssets[type].push(row);
      }
    }

    // 4. Hitung Hari Kerja (Senin - Jumat) di Bulan Ini
    const workdays = [];
    const summaryByDate = {};

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0 (Minggu) .. 6 (Sabtu)

      // Senin = 1 s/d Jumat = 5
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workdays.push(dateStr);
        summaryByDate[dateStr] = 0;
      }
    }

    const totalWorkdays = workdays.length;
    const finalData = [];
    const summaryByType = {};
    const schedulesMappedByDate = {};

    // 5. Distribusi Jadwal Merata Berdasarkan Hari Kerja per Type (Round-Robin)
    for (const [type, assets] of Object.entries(groupedAssets)) {
      const totalAssets = assets.length;
      summaryByType[type] = totalAssets;

      if (totalAssets === 0 || totalWorkdays === 0) continue;

      assets.forEach((asset, index) => {
        const workdayIndex = index % totalWorkdays;
        const assignedDate = workdays[workdayIndex];

        let timePart = '08:00:00';
        if (asset.Time_Request) {
          const t = new Date(asset.Time_Request);
          if (!isNaN(t.getTime())) {
            timePart = t.toTimeString().split(' ')[0] || '08:00:00';
          }
        }

        const isServiced = servicedSet.has(String(asset.ID_Asset).trim());

        const scheduleItem = {
          ...asset,
          factory: asset.factory || '',
          new_schedule: `${assignedDate} ${timePart}`,
          is_serviced: isServiced,
        };

        finalData.push(scheduleItem);

        if (!schedulesMappedByDate[assignedDate]) {
          schedulesMappedByDate[assignedDate] = [];
        }
        schedulesMappedByDate[assignedDate].push(scheduleItem);
        summaryByDate[assignedDate] = (summaryByDate[assignedDate] || 0) + 1;
      });
    }

    // Index pencarian live
    const assetSearchIndex = [];
    for (const [dateStr, items] of Object.entries(schedulesMappedByDate)) {
      for (const item of items) {
        assetSearchIndex.push({
          id_asset: item.ID_Asset,
          description: item.Description,
          type: item.Type,
          date: dateStr,
          user_name: item.user_name || '',
          model: item.Model,
          manufacture: item.Manufacture,
          location: item.Location,
          pm_category: item.PM_Category,
          is_serviced: item.is_serviced,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        total_days_in_month: totalDaysInMonth,
        total_workdays: totalWorkdays,
        total_assets: finalData.length,
        summary_by_type: summaryByType,
        summary_by_date: summaryByDate,
        schedules_mapped_by_date: schedulesMappedByDate,
        asset_search_index: assetSearchIndex,
      },
    });
  } catch (error) {
    console.error('API /api/maintenanceschedule error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
