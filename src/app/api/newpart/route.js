import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body;
    const id = crypto.randomBytes(16).toString('hex');

    await pool.query(
      `INSERT INTO parts (id_part, description, vendor_code, unit, location, remark, status, initial_stock)
       VALUES (?, ?, ?, ?, ?, ?, 'Aktif', 0)`,
      [
        id,
        data.description || '',
        data.vendor_code || '',
        data.unit || '',
        data.location || '',
        data.remark || '',
      ]
    );

    return NextResponse.json({ response: 'Successful' });
  } catch (error) {
    console.error('newpart error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
