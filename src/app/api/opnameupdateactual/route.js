import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister, data } = body;

    await pool.query(
      'UPDATE stock_opname SET result = ? WHERE id_report = ?',
      [typeof data === 'string' ? data : JSON.stringify(data), idRegister]
    );

    return NextResponse.json({ response: 'OK' });
  } catch (error) {
    console.error('opnameupdateactual error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
