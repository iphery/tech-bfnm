import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const REPAIR_TARGET_LIST = [
  {
    code: 'RTM',
    name: 'Target Repair Time Mesin (RTM)',
    description: 'Repair Time Mesin',
    unit: 'Jam',
    defaultVal: 7,
  },
  {
    code: 'RTK',
    name: 'Target Repair Time Kendaraan (RTK)',
    description: 'Repair Time Kendaraan',
    unit: 'Jam',
    defaultVal: 15,
  },
];

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const queryYear = String(url.searchParams.get('year') || new Date().getFullYear());

    // Fetch existing records in Budget_Set with code IN ('RTM', 'RTK')
    const [rows] = await pool.query(
      "SELECT id, code, description, value, bulan, tahun FROM Budget_Set WHERE code IN ('RTM', 'RTK') AND tahun = ? ORDER BY code ASC, bulan ASC",
      [queryYear]
    );

    // monthlyMatrix[code][month] = value (1..12 or 0)
    const monthlyMatrix = {};
    const uniformMatrix = {};

    REPAIR_TARGET_LIST.forEach((item) => {
      monthlyMatrix[item.code] = {};
      for (let m = 1; m <= 12; m++) {
        monthlyMatrix[item.code][m] = 0;
      }
      uniformMatrix[item.code] = 0;
    });

    (rows || []).forEach((r) => {
      const c = String(r.code || '').trim().toUpperCase();
      const m = Number(r.bulan) || 0;
      const val = Number(r.value || 0);

      if (!monthlyMatrix[c]) {
        monthlyMatrix[c] = {};
        for (let i = 1; i <= 12; i++) monthlyMatrix[c][i] = 0;
      }

      if (m >= 1 && m <= 12) {
        monthlyMatrix[c][m] = val;
      } else if (m === 0) {
        // If stored with bulan = 0, apply as base uniform value
        uniformMatrix[c] = val;
        for (let i = 1; i <= 12; i++) {
          if (monthlyMatrix[c][i] === 0) monthlyMatrix[c][i] = val;
        }
      }
    });

    // Determine uniform value if not set
    REPAIR_TARGET_LIST.forEach((item) => {
      if (!uniformMatrix[item.code] || uniformMatrix[item.code] === 0) {
        const anyVal = Object.values(monthlyMatrix[item.code]).find((v) => Number(v) > 0);
        uniformMatrix[item.code] = Number(anyVal || item.defaultVal || 0);
      }
    });

    return NextResponse.json({
      success: true,
      year: queryYear,
      targets: REPAIR_TARGET_LIST,
      uniform_matrix: uniformMatrix,
      monthly_matrix: monthlyMatrix,
      items: rows || [],
    });
  } catch (error) {
    console.error('repairtarget GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const queryYear = String(body.year || new Date().getFullYear());
    const monthlyMatrix = body.monthly_matrix;
    const uniformMatrix = body.matrix;

    // Get current max id in Budget_Set
    const [[maxRow]] = await pool.query('SELECT COALESCE(MAX(id), 0) as maxId FROM Budget_Set');
    let nextId = Number(maxRow?.maxId || 0) + 1;

    for (const item of REPAIR_TARGET_LIST) {
      const code = item.code;
      const descToSave = item.description || item.name;

      // 1. Also update/insert the legacy annual/general row (bulan = 0)
      const uniformVal = uniformMatrix && uniformMatrix[code] !== undefined
        ? Number(uniformMatrix[code] || 0)
        : Number(monthlyMatrix?.[code]?.[1] || 0);

      const [existingBulan0] = await pool.query(
        'SELECT id FROM Budget_Set WHERE code = ? AND bulan = 0 AND tahun = ? LIMIT 1',
        [code, queryYear]
      );

      if (existingBulan0.length > 0) {
        await pool.query('UPDATE Budget_Set SET value = ?, description = ? WHERE id = ?', [
          uniformVal,
          descToSave,
          existingBulan0[0].id,
        ]);
      } else {
        await pool.query(
          'INSERT INTO Budget_Set (id, code, description, value, bulan, tahun) VALUES (?, ?, ?, ?, ?, ?)',
          [nextId++, code, descToSave, uniformVal, 0, queryYear]
        );
      }

      // 2. Save per-month (bulan = 1..12)
      for (let m = 1; m <= 12; m++) {
        let val = 0;
        if (monthlyMatrix && monthlyMatrix[code] && monthlyMatrix[code][m] !== undefined) {
          val = Number(monthlyMatrix[code][m] || 0);
        } else if (uniformMatrix && uniformMatrix[code] !== undefined) {
          val = Number(uniformMatrix[code] || 0);
        }

        const [existing] = await pool.query(
          'SELECT id FROM Budget_Set WHERE code = ? AND bulan = ? AND tahun = ? LIMIT 1',
          [code, m, queryYear]
        );

        if (existing.length > 0) {
          await pool.query('UPDATE Budget_Set SET value = ?, description = ? WHERE id = ?', [
            val,
            descToSave,
            existing[0].id,
          ]);
        } else {
          await pool.query(
            'INSERT INTO Budget_Set (id, code, description, value, bulan, tahun) VALUES (?, ?, ?, ?, ?, ?)',
            [nextId++, code, descToSave, val, m, queryYear]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Target Perbaikan (RTK & RTM) tahun ${queryYear} berhasil disimpan ke tabel Budget_Set`,
      year: queryYear,
    });
  } catch (error) {
    console.error('repairtarget POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
