import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister } = body;

    const [order] = await pool.query(
      `SELECT order_main.*, User.Name
       FROM order_main
       LEFT JOIN User ON User.Uid = order_main.created_by
       WHERE order_main.id_register = ?`,
      [idRegister]
    );

    const [order_detail] = await pool.query(
      'SELECT * FROM order_detail WHERE id_register = ?',
      [idRegister]
    );

    return NextResponse.json({ order, detail: order_detail });
  } catch (error) {
    console.error('getorderdetail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
