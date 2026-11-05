import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister } = body;

    const [order] = await pool.query(
      `SELECT order_main.*, 
              u_creator.Name as creator_name,
              COALESCE(u_creator.Name, order_main.created_by) as Name,
              COALESCE(u_receiver.Name, order_main.receiver) as receiver,
              u_receiver.Name as receiver_name
       FROM order_main
       LEFT JOIN User u_creator ON u_creator.Uid = order_main.created_by
       LEFT JOIN User u_receiver ON u_receiver.Uid = order_main.receiver
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
