import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function ensureSettingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Insert default setting if not exists
    await pool.query(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value)
      VALUES ('part_status_filter', 'aktif');
    `);
  } catch (err) {
    console.error('ensureSettingsTable error:', err);
  }
}

export async function GET() {
  try {
    await ensureSettingsTable();
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM system_settings');
    const settings = {
      part_status_filter: 'aktif',
    };

    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('systemsettings GET error:', error);
    return NextResponse.json({ settings: { part_status_filter: 'aktif' } });
  }
}

export async function POST(request) {
  try {
    await ensureSettingsTable();
    const body = await request.json();
    const { part_status_filter } = body;

    if (part_status_filter !== undefined) {
      const val = part_status_filter === 'all' ? 'all' : 'aktif';
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES ('part_status_filter', ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [val, val]
      );
    }

    const [rows] = await pool.query('SELECT setting_key, setting_value FROM system_settings');
    const settings = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });

    return NextResponse.json({
      message: 'Pengaturan sistem berhasil disimpan',
      settings,
    });
  } catch (error) {
    console.error('systemsettings POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

