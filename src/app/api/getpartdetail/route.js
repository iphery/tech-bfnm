import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idPart } = body;

    const [part] = await pool.query(
      `SELECT parts.*, (initial_stock + COALESCE(qin.qty, 0) - COALESCE(qout.qty, 0)) as available 
       FROM parts 
       LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockin GROUP BY id_part) qin ON qin.id_part = parts.id_part 
       LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockout GROUP BY id_part) qout ON qout.id_part = parts.id_part
       WHERE parts.id_part = ?`,
      [idPart]
    );

    return NextResponse.json({ response: part });
  } catch (error) {
    console.error('getpartdetail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
