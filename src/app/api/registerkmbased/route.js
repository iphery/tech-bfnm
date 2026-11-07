import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idAsset } = body;

    if (!idAsset) {
      return NextResponse.json(
        { success: false, error: 'ID_Asset wajib disertakan' },
        { status: 400 }
      );
    }

    // Pastikan aset belum ada di KMbasedSchedule
    const [existing] = await pool.query(
      'SELECT ID_Asset FROM KMbasedSchedule WHERE ID_Asset = ? LIMIT 1',
      [idAsset]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Aset sudah terdaftar di KMbasedSchedule',
        inserted: false,
      });
    }

    // Insert row baru ke KMbasedSchedule dengan default values yang sesuai
    await pool.query(
      `INSERT INTO KMbasedSchedule 
       (ID_Asset, Current_KM, Schedule_KM, Flag_KM, Current_Maintenance, Next_Maintenance, Next_KM, Late_KM, Average, Reminder)
       VALUES (?, 0, 0, 0, 'Full Service', 'Minor Service', 0, 0, 0, 0)`,
      [idAsset]
    );

    return NextResponse.json({
      success: true,
      message: `KMbasedSchedule untuk ${idAsset} berhasil didaftarkan`,
      inserted: true,
    });
  } catch (error) {
    console.error('POST /api/registerkmbased error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mendaftarkan KMbasedSchedule' },
      { status: 500 }
    );
  }
}
