import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id_request, uid, solution } = body;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const created = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    await pool.query(
      `UPDATE RequestOthers 
       SET Time_Complete = ?, Step = 5, Solution = ?, ID_Tech = ?
       WHERE ID_Request = ?`,
      [created, solution || '', uid, id_request]
    );

    return NextResponse.json({ response: 'Thank you for your action.' });
  } catch (error) {
    console.error('closeutility error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
