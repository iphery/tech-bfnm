import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, dpm, order: orders, uid } = body;

    const cleanDpm = String(dpm || "").trim();
    if (!date || !cleanDpm || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "Data pengajuan belum lengkap" },
        { status: 400 }
      );
    }

    // Proteksi double submit: cek apakah DPM yang sama baru saja dibuat dalam 30 detik terakhir
    const [existing] = await pool.query(
      `SELECT id_register FROM order_main 
       WHERE dpm = ? AND created_at >= NOW() - INTERVAL 30 SECOND 
       LIMIT 1`,
      [cleanDpm]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { response: "Order pengadaan suku cadang sudah tercatat." },
        { status: 200 }
      );
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const created_at = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const baseId = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const id_register = `P${baseId}`;

    await pool.query(
      `INSERT INTO order_main (id_register, date, dpm, created_by, created_at, status)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [id_register, date, dpm, uid, created_at]
    );

    if (Array.isArray(orders)) {
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const next_id = `PO${baseId}${i}`;

        await pool.query(
          `INSERT INTO order_detail (ids, id_register, id_part, description, quantity, unit, stock, id_service, note, amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            next_id,
            id_register,
            order.id_part,
            order.description,
            order.quantity,
            order.unit,
            order.stock,
            order.id_service,
            order.note || '',
          ]
        );
      }
    }

    return NextResponse.json({ response: 'New order has been recorded.' });
  } catch (error) {
    console.error('transorder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
