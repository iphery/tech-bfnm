import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const [data] = await pool.query(`
      SELECT stock_summary.*, parts.description, parts.vendor_code, parts.unit
      FROM stock_summary
      LEFT JOIN parts ON parts.id_part = stock_summary.id_part
      ORDER BY stock_summary.date DESC
    `);

    return NextResponse.json({ response: data });
  } catch (error) {
    console.error('gettransaction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
