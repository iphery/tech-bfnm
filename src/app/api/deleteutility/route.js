import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id_request } = body;

    await pool.query(
      `DELETE FROM RequestOthers WHERE ID_Request = ?`,
      [id_request]
    );

    return NextResponse.json({ response: 'Successfully deleted.' });
  } catch (error) {
    console.error('deleteutility error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
