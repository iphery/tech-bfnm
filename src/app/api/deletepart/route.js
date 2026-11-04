import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idPart } = body;

    const [trans] = await pool.query('SELECT COUNT(*) as cnt FROM stock_transaction WHERE id_part = ?', [idPart]);
    if (trans[0]?.cnt > 0) {
      return NextResponse.json({
        error: 1,
        message: 'This part can not be deleted due to transaction exist.',
      });
    }

    await pool.query('DELETE FROM parts WHERE id_part = ?', [idPart]);
    return NextResponse.json({
      error: 0,
      message: 'Selected part has been successfully deleted.',
    });
  } catch (error) {
    console.error('deletepart error:', error);
    return NextResponse.json({ error: 1, message: error.message }, { status: 500 });
  }
}
