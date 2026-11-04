import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister } = body;

    const [result] = await pool.query(
      `SELECT stock_opname.*, User.Name
       FROM stock_opname
       LEFT JOIN User ON User.Uid = stock_opname.created_by
       WHERE stock_opname.id_report = ?`,
      [idRegister]
    );

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error('opnamedetail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
