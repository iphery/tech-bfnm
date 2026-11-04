import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idOrder } = body;

    await pool.query('DELETE FROM service WHERE id_register = ?', [idOrder]);
    await pool.query('DELETE FROM service_detail WHERE id_register = ?', [idOrder]);

    return NextResponse.json({ response: 'Service request successfully deleted.' });
  } catch (error) {
    console.error('deleteservice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
