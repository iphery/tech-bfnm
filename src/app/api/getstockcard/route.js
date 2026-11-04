import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idPart, startDate, endDate } = body;

    const [response] = await pool.query(
      `SELECT * FROM stock_summary
       WHERE id_part = ? AND DATE(date) >= ? AND DATE(date) <= ?
       ORDER BY date ASC`,
      [idPart, startDate, endDate]
    );

    const [beforeResult] = await pool.query(
      `SELECT SUM(qty) as total_qty FROM stock_summary
       WHERE id_part = ? AND DATE(date) < ?`,
      [idPart, startDate]
    );
    const beforeDateQty = beforeResult[0]?.total_qty ? Number(beforeResult[0].total_qty) : 0;

    const [partResult] = await pool.query('SELECT initial_stock FROM parts WHERE id_part = ?', [idPart]);
    const initStock = partResult[0]?.initial_stock ? Number(partResult[0].initial_stock) : 0;

    const beforeDate = beforeDateQty + initStock;
    const stock = [
      {
        date: '',
        in: 0,
        out: 0,
        balance: beforeDate,
        subject: '',
        asset: '',
        request: '',
      },
    ];

    let balance = beforeDate;
    for (const r of response) {
      balance += Number(r.qty);
      if (Number(r.qty) > 0) {
        stock.push({
          date: r.date,
          in: r.quantity,
          out: 0,
          balance: balance,
          subject: r.subject,
          asset: '',
          request: r.id_for,
        });
      } else {
        stock.push({
          date: r.date,
          in: 0,
          out: r.quantity,
          balance: balance,
          subject: r.subject,
          asset: r.id_asset,
          request: r.id_for,
        });
      }
    }

    return NextResponse.json({ response: stock });
  } catch (error) {
    console.error('getstockcard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
