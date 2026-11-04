import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idOrder } = body;

    await pool.query('DELETE FROM order_main WHERE id_register = ?', [idOrder]);
    await pool.query('DELETE FROM order_detail WHERE id_register = ?', [idOrder]);

    return NextResponse.json({ response: 'Order successfully deleted.' });
  } catch (error) {
    console.error('deleteorder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
