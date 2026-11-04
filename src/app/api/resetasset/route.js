import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idAsset } = body;

    await pool.query(
      'UPDATE Assets SET Available = 1, Reserve = 0, View = 0 WHERE ID_Asset = ?',
      [idAsset]
    );

    return NextResponse.json({ error: 0, message: 'Successfull' });
  } catch (error) {
    console.error('resetasset error:', error);
    return NextResponse.json({ error: 1, message: error.message }, { status: 500 });
  }
}
