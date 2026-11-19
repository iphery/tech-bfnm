import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { start: start_date, end: end_date, uid: created_by } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Tanggal mulai dan tanggal akhir wajib diisi' },
        { status: 400 }
      );
    }

    // Check system setting for part status visibility
    let activeStatusFilter = 'aktif';
    try {
      const [settingRow] = await pool.query(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'part_status_filter' LIMIT 1"
      );
      activeStatusFilter = settingRow[0]?.setting_value || 'aktif';
    } catch {
      activeStatusFilter = 'aktif';
    }

    const whereClause =
      activeStatusFilter === 'all' ? '' : "WHERE p.status = 'Aktif'";

    // Bulk Query: Fetch parts and stock balance in a single optimized query
    const [rows] = await pool.query(
      `
      SELECT 
        p.id_part,
        p.description,
        p.vendor_code,
        p.location,
        p.unit,
        p.remark,
        COALESCE(p.initial_stock, 0) as init_stock,
        COALESCE(ss_before.before_qty, 0) as before_qty,
        COALESCE(ss_in.in_qty, 0) as in_qty,
        COALESCE(ss_out.out_qty, 0) as out_qty
      FROM parts p
      LEFT JOIN (
        SELECT id_part, SUM(qty) as before_qty
        FROM stock_summary
        WHERE DATE(date) < ?
        GROUP BY id_part
      ) ss_before ON ss_before.id_part = p.id_part
      LEFT JOIN (
        SELECT id_part, SUM(quantity) as in_qty
        FROM stock_summary
        WHERE DATE(date) >= ? AND DATE(date) <= ? AND type = 'in'
        GROUP BY id_part
      ) ss_in ON ss_in.id_part = p.id_part
      LEFT JOIN (
        SELECT id_part, SUM(quantity) as out_qty
        FROM stock_summary
        WHERE DATE(date) >= ? AND DATE(date) <= ? AND type = 'out'
        GROUP BY id_part
      ) ss_out ON ss_out.id_part = p.id_part
      ${whereClause}
      ORDER BY p.description ASC
    `,
      [start_date, start_date, end_date, start_date, end_date]
    );

    const result = rows.map((r) => {
      const before_date = Number(r.before_qty || 0) + Number(r.init_stock || 0);
      const stock_in_qty = Number(r.in_qty || 0);
      const stock_out_qty = Number(r.out_qty || 0);
      const balance = before_date + stock_in_qty - stock_out_qty;
      const diff = balance > 0 ? -1 * balance : 0;

      return {
        initial: before_date,
        in: stock_in_qty,
        out: stock_out_qty,
        balance: balance,
        actual: 0,
        checked_by: '',
        checked_at: '',
        description: r.description || '',
        vendor_code: r.vendor_code || '',
        location: r.location || '',
        unit: r.unit || '',
        remark: r.remark || '',
        id_part: r.id_part,
        diff: diff,
        checked_id: '',
      };
    });

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const id_report = `OP${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const created_at = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    await pool.query(
      `INSERT INTO stock_opname (id_report, start_date, end_date, result, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_report,
        start_date,
        end_date,
        JSON.stringify(result),
        created_by || '',
        created_at,
      ]
    );

    return NextResponse.json({
      response: 'Laporan Stock Opname berhasil digenerate',
      id_report,
    });
  } catch (error) {
    console.error('generateopname error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
