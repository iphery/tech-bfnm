import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, receiver, serviceId: id_service, assetId: id_asset, category, order: orders, uid } = body;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const created = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const baseId = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    if (Array.isArray(orders)) {
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const id_register = `SO${baseId}${i}`;

        await pool.query(
          `INSERT INTO stock_out (id_register, date, id_part, quantity, receiver, id_service, id_asset, category, id_user, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id_register,
            date,
            order.id_part,
            order.quantity,
            receiver,
            id_service,
            id_asset,
            category,
            uid,
            created,
          ]
        );

        await pool.query(
          `INSERT INTO stock_transaction (id_transaction, id_part, quantity, type, created_at, id_register, created_by, date)
           VALUES (?, ?, ?, 'out', ?, '', ?, ?)`,
          [id_register, order.id_part, order.quantity, created, uid, date]
        );
      }
    }

    return NextResponse.json({ response: 'Selected part has been sent out.' });
  } catch (error) {
    console.error('transout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
