import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id_report } = body;

    if (!id_report) {
      return NextResponse.json({ error: 'id_report is required' }, { status: 400 });
    }

    const [result] = await pool.query('DELETE FROM stock_opname WHERE id_report = ?', [id_report]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Data laporan opname tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan Stock Opname berhasil dihapus',
    });
  } catch (error) {
    console.error('deleteopname error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
