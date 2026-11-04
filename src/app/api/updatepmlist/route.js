import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRequest, pmList } = body;

    await pool.query('UPDATE Request SET new_checklist = ? WHERE ID_Request = ?', [pmList, idRequest]);
    return NextResponse.json({ response: 'OK' });
  } catch (error) {
    console.error('updatepmlist error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
