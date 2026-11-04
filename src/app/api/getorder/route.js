import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const [orders] = await pool.query(`
      SELECT order_main.id_register, order_main.date, order_main.dpm, 
             q1.Name as requestor, q2.Name as receiver, 
             order_main.status, 
             IF(order_main.status = 0, 'OPEN', 'CLOSE') as status_def, 
             order_main.created_at 
      FROM order_main
      LEFT JOIN User q1 ON q1.Uid = order_main.created_by
      LEFT JOIN User q2 ON q2.Uid = order_main.receiver
      ORDER BY order_main.date DESC
    `);

    return NextResponse.json({ response: orders });
  } catch (error) {
    console.error('getorder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
