import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { registerFifoIn } from '@/lib/fifo';
import { ensureServiceSchema } from '@/lib/serviceSchema';

export async function POST(request) {
  try {
    await ensureServiceSchema(pool);

    const body = await request.json();
    const { idRegister, date: receive_date, uid: receiver, list: lists } = body;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const created = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    if (Array.isArray(lists)) {
      for (const s of lists) {
        await pool.query(
          `UPDATE service_detail 
           SET amount = ?, budget_pos = ?, supplier = ?
           WHERE id_register = ? AND ids = ?`,
          [s.amount, s.budget, s.seller, idRegister, s.id]
        );

        // Fetch detail to see if this item is for warehouse stock (id_part is present)
        const [sdRows] = await pool.query(
          `SELECT * FROM service_detail WHERE id_register = ? AND ids = ?`,
          [idRegister, s.id]
        );

        if (sdRows.length > 0 && sdRows[0].id_part) {
          const sd = sdRows[0];
          const qty = Number(sd.quantity) || 1;
          const totalAmt = Number(s.amount) || Number(sd.amount) || 0;
          const unitPrice = qty > 0 ? (totalAmt / qty) : 0;
          const id_stockin = `DPS${Date.now()}${Math.floor(Math.random() * 1000)}`;

          // 1. Insert into stockin
          await pool.query(
            `INSERT INTO stockin (id_register, id_order, id_part, quantity, id_user, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id_stockin, idRegister, sd.id_part, qty, receiver, created]
          );

          // 2. Insert into stock_transaction
          await pool.query(
            `INSERT INTO stock_transaction (id_part, id_transaction, quantity, type, created_at, id_register, created_by, date)
             VALUES (?, ?, ?, 'in', ?, ?, ?, ?)`,
            [sd.id_part, id_stockin, qty, created, idRegister, receiver, receive_date || created]
          );

          // 3. Register new FIFO batch layer
          try {
            await registerFifoIn(pool, {
              batchId: id_stockin,
              idPart: sd.id_part,
              idOrder: idRegister,
              dateReceived: receive_date || created,
              quantity: qty,
              unitPrice: unitPrice,
              totalAmount: totalAmt,
              seller: s.seller || sd.supplier || 'Bengkel Luar',
              source: 'DPS',
            });
          } catch (fifoErr) {
            console.error('FIFO register error on DPS receive:', fifoErr);
          }
        }
      }
    }

    await pool.query(
      `UPDATE service SET date_received = ?, status = 1 WHERE id_register = ?`,
      [receive_date || created, idRegister]
    );

    return NextResponse.json({
      success: true,
      response: 'Penerimaan servis berhasil dikonfirmasi dan stok gudang telah diperbarui.',
    });
  } catch (error) {
    console.error('getservicereceived error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
