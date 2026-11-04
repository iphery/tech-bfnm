import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRequest } = body;

    const [rows] = await pool.query(
      `SELECT * FROM Request WHERE ID_Request = ? LIMIT 1`,
      [idRequest]
    );

    return NextResponse.json({ response: rows || [] });
  } catch (error) {
    console.error('getdatetimerequest error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
