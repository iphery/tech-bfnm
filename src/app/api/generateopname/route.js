import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function get_transaction_for_part(pool, id_part, start_date, end_date) {
  const [infos] = await pool.query('SELECT description, vendor_code, location, unit, remark, initial_stock FROM parts WHERE id_part = ?', [id_part]);
  const info = infos[0] || {};
  const description = info.description || '';
  const vendor_code = info.vendor_code || '';
  const location = info.location || '';
  const unit = info.unit || '';
  const remark = info.remark || '';
  const init_stock = Number(info.initial_stock || 0);

  const [beforeResult] = await pool.query(
    'SELECT SUM(qty) as total_qty FROM stock_summary WHERE id_part = ? AND DATE(date) < ?',
    [id_part, start_date]
  );
  const before_date_qty = beforeResult[0]?.total_qty ? Number(beforeResult[0].total_qty) : 0;
  const before_date = before_date_qty + init_stock;

  const [inResult] = await pool.query(
    `SELECT SUM(quantity) as total_in FROM stock_summary 
     WHERE id_part = ? AND DATE(date) >= ? AND DATE(date) <= ? AND type = 'in'`,
    [id_part, start_date, end_date]
  );
  const stock_in_qty = inResult[0]?.total_in ? Number(inResult[0].total_in) : 0;

  const [outResult] = await pool.query(
    `SELECT SUM(quantity) as total_out FROM stock_summary 
     WHERE id_part = ? AND DATE(date) >= ? AND DATE(date) <= ? AND type = 'out'`,
    [id_part, start_date, end_date]
  );
  const stock_out_qty = outResult[0]?.total_out ? Number(outResult[0].total_out) : 0;

  const balance = (before_date + stock_in_qty) - stock_out_qty;
  const diff = balance > 0 ? -1 * balance : 0;

  return {
    initial: before_date,
    in: stock_in_qty,
    out: stock_out_qty,
    balance: balance,
    actual: 0,
    checked_by: '',
    checked_at: '',
    description: description,
    vendor_code: vendor_code,
    location: location,
    unit: unit,
    remark: remark,
    id_part: id_part,
    diff: diff,
    checked_id: '',
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { start: start_date, end: end_date, uid: created_by } = body;

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

    const statusQuery = activeStatusFilter === 'all' ? "SELECT id_part FROM parts" : "SELECT id_part FROM parts WHERE status = 'Aktif'";
    const [parts] = await pool.query(statusQuery);

    const result = [];
    for (const part of parts) {
      const data = await get_transaction_for_part(pool, part.id_part, start_date, end_date);
      result.push(data);
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const id_report = `OP${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const created_at = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    await pool.query(
      `INSERT INTO stock_opname (id_report, start_date, end_date, result, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_report, start_date, end_date, JSON.stringify(result), created_by, created_at]
    );

    return NextResponse.json({ response: 'Successfull' });
  } catch (error) {
    console.error('generateopname error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
