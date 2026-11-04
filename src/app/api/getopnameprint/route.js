import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister } = body;

    const [data] = await pool.query(
      'SELECT * FROM stock_opname WHERE id_report = ?',
      [idRegister]
    );

    return NextResponse.json({ response: data });
  } catch (error) {
    console.error('getopnameprint error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
