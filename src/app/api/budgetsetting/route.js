import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const DEFAULT_POS_LIST = [
  { code: 'ME01', legacyCode: 'ME1', name: 'Pelumasan', description: 'Budget Pelumas', category: 'Oil & Lubricant' },
  { code: 'ME02', legacyCode: 'ME3', name: 'Servis Kendaraan', description: 'Budget Service Kendaraan', category: 'Vehicle Service' },
  { code: 'ME03', legacyCode: 'ME2', name: 'Servis Mesin Produksi', description: 'Budget Service Mesin', category: 'Production Service' },
  { code: 'ME04', legacyCode: 'ME4', name: 'Spare Part Kendaraan', description: 'Budget Spare Part Kendaraan', category: 'Vehicle Parts' },
  { code: 'ME05', legacyCode: 'ME5', name: 'Spare Part Mesin Produksi', description: 'Budget Spare Part Mesin', category: 'Production Parts' },
];

function normalizePos(codeStr) {
  const c = String(codeStr || '').trim().toUpperCase();
  if (c === 'ME1' || c === 'ME01') return 'ME01';
  if (c === 'ME2' || c === 'ME03') return 'ME03'; // In sample: ME2 is Budget Service Mesin -> ME03
  if (c === 'ME3' || c === 'ME02') return 'ME02'; // In sample: ME3 is Budget Service Kendaraan -> ME02
  if (c === 'ME4' || c === 'ME04') return 'ME04';
  if (c === 'ME5' || c === 'ME05') return 'ME05';
  return c;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const queryYear = String(url.searchParams.get('year') || new Date().getFullYear());

    // Query existing records in Budget_Set table
    const [rows] = await pool.query(
      'SELECT id, code, description, value, bulan, tahun FROM Budget_Set WHERE tahun = ? ORDER BY id ASC, bulan ASC',
      [queryYear]
    );

    // monthlyMatrix[code][month] = value
    const monthlyMatrix = {};
    const annualMatrix = {};

    DEFAULT_POS_LIST.forEach((p) => {
      monthlyMatrix[p.code] = {};
      for (let m = 1; m <= 12; m++) {
        monthlyMatrix[p.code][m] = 0;
      }
      annualMatrix[p.code] = 0;
    });

    (rows || []).forEach((r) => {
      const normCode = normalizePos(r.code);
      const m = Number(r.bulan) || 1;
      const val = Number(r.value || 0);

      if (!monthlyMatrix[normCode]) {
        monthlyMatrix[normCode] = {};
        for (let i = 1; i <= 12; i++) monthlyMatrix[normCode][i] = 0;
      }
      monthlyMatrix[normCode][m] = val;
    });

    // Calculate annual sum per pos
    Object.keys(monthlyMatrix).forEach((code) => {
      let sum = 0;
      for (let m = 1; m <= 12; m++) {
        sum += Number(monthlyMatrix[code][m] || 0);
      }
      annualMatrix[code] = sum;
    });

    return NextResponse.json({
      success: true,
      year: queryYear,
      default_pos: DEFAULT_POS_LIST,
      monthly_matrix: monthlyMatrix,
      annual_matrix: annualMatrix,
      items: rows || [],
    });
  } catch (error) {
    console.error('budgetsetting GET error:', error);
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

    for (const posItem of DEFAULT_POS_LIST) {
      const code = posItem.code;
      const dbCodeToSave = posItem.legacyCode || posItem.code; // e.g. ME1, ME2, ME3, ME4, ME5
      const descToSave = posItem.description || posItem.name;

      for (let m = 1; m <= 12; m++) {
        let val = 0;
        if (monthlyMatrix && monthlyMatrix[code] && monthlyMatrix[code][m] !== undefined) {
          val = Number(monthlyMatrix[code][m] || 0);
        } else if (uniformMatrix && uniformMatrix[code] !== undefined) {
          val = Number(uniformMatrix[code] || 0);
        }

        // Check if row already exists for this (code, bulan, tahun)
        // Check both ME01 and ME1 for backward-compatibility
        const [existing] = await pool.query(
          'SELECT id FROM Budget_Set WHERE (code = ? OR code = ?) AND bulan = ? AND tahun = ? LIMIT 1',
          [posItem.code, posItem.legacyCode, m, queryYear]
        );

        if (existing.length > 0) {
          // Update existing row
          await pool.query(
            'UPDATE Budget_Set SET value = ?, description = ? WHERE id = ?',
            [val, descToSave, existing[0].id]
          );
        } else {
          // Insert new row with exact schema (id, code, description, value, bulan, tahun)
          await pool.query(
            'INSERT INTO Budget_Set (id, code, description, value, bulan, tahun) VALUES (?, ?, ?, ?, ?, ?)',
            [nextId++, dbCodeToSave, descToSave, val, m, queryYear]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Target budget tahun ${queryYear} berhasil disimpan ke tabel Budget_Set untuk tiap bulan (Jan - Des)`,
      year: queryYear,
    });
  } catch (error) {
    console.error('budgetsetting POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
