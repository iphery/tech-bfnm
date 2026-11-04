import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRequest, solution } = body;

    await pool.query('UPDATE Request SET Solution = ? WHERE ID_Request = ?', [solution, idRequest]);
    return NextResponse.json({ response: 'Solution updated.' });
  } catch (error) {
    console.error('updatesolution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
