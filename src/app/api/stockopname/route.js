import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const [data] = await pool.query(`
      SELECT stock_opname.*, User.Name
      FROM stock_opname
      LEFT JOIN User ON User.Uid = stock_opname.created_by
      ORDER BY stock_opname.created_at DESC
    `);

    return NextResponse.json({ response: data });
  } catch (error) {
    console.error('stockopname error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
