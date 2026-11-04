import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRequest, idAsset } = body;

    await pool.query('DELETE FROM Request WHERE ID_Request = ?', [idRequest]);

    const [activeReqs] = await pool.query(
      'SELECT ID_Request FROM Request WHERE ID_Asset = ? AND Step < 7 LIMIT 1',
      [idAsset]
    );

    if (activeReqs.length === 0) {
      await pool.query('UPDATE Assets SET Reserve = 0 WHERE ID_Asset = ?', [idAsset]);
    }

    return NextResponse.json({ error: 0, message: 'Successfull' });
  } catch (error) {
    console.error('deleterequest error:', error);
    return NextResponse.json({ error: 1, message: error.message }, { status: 500 });
  }
}
