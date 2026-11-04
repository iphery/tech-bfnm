import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, a.Description, a.Class, a.Type, a.Manufacture, a.Model, a.No, a.Location
       FROM Request r
       LEFT JOIN Assets a ON a.ID_Asset = r.ID_Asset
       WHERE r.Step <= 6 AND a.Type = 'PC'
       ORDER BY r.Time_Request DESC`
    );

    return NextResponse.json({ it: rows || [] });
  } catch (error) {
    console.error('webit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
