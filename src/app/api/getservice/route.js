import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const [data] = await pool.query(`
      SELECT service.*, User.Name as requestor
      FROM service
      LEFT JOIN User ON User.Uid = service.created_by
      ORDER BY service.date DESC
    `);

    return NextResponse.json({ response: data });
  } catch (error) {
    console.error('getservice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
