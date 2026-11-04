import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister, date: receive_date, uid: receiver, list: lists } = body;

    if (Array.isArray(lists)) {
      for (const s of lists) {
        await pool.query(
          `UPDATE service_detail 
           SET amount = ?, budget_pos = ?, supplier = ?
           WHERE id_register = ? AND ids = ?`,
          [s.amount, s.budget, s.seller, idRegister, s.id]
        );
      }
    }

    await pool.query(
      `UPDATE service SET date_received = ?, status = 1 WHERE id_register = ?`,
      [receive_date, idRegister]
    );

    return NextResponse.json({ response: 'Yey.. your part has return.' });
  } catch (error) {
    console.error('getservicereceived error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
