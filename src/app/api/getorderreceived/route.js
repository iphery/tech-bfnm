import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { registerFifoIn } from '@/lib/fifo';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister, date: receive_date, uid: receiver, list: lists } = body;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const created = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    if (Array.isArray(lists)) {
      for (const item of lists) {
        const id = item.id;
        const type = item.stock;

        await pool.query(
          `UPDATE order_detail 
           SET amount = ?, budget_pos = ?, seller = ?
           WHERE id_register = ? AND ids = ?`,
          [item.amount, item.budget, item.seller, idRegister, id]
        );

        if (type === 'Stock') {
          const [orderRows] = await pool.query(
            `SELECT * FROM order_detail WHERE id_register = ? AND ids = ? AND stock = 'Stock'`,
            [idRegister, id]
          );

          for (const od of orderRows) {
            const id_stockin = `PO${Date.now()}${Math.floor(Math.random() * 1000)}`;

            await pool.query(
              `INSERT INTO stock_in (id_register, id_order, id_part, quantity, id_user, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [id_stockin, idRegister, od.id_part, od.quantity, receiver, created]
            );

            await pool.query(
              `INSERT INTO stock_transaction (id_part, id_transaction, quantity, type, created_at, id_register, created_by, date)
               VALUES (?, ?, ?, 'in', ?, ?, ?, ?)`,
              [od.id_part, id_stockin, od.quantity, created, idRegister, receiver, receive_date]
            );

            // Register new FIFO batch layer
            const unitPrice = Number(od.quantity) > 0 ? (Number(od.amount) / Number(od.quantity)) : 0;
            try {
              await registerFifoIn(pool, {
                batchId: id_stockin,
                idPart: od.id_part,
                idOrder: idRegister,
                dateReceived: receive_date || created,
                quantity: od.quantity,
                unitPrice,
                totalAmount: od.amount,
                seller: item.seller || od.seller,
                source: 'PO',
              });
            } catch (errFifo) {
              console.error(`Error registering FIFO batch ${id_stockin}:`, errFifo);
            }
          }
        }
      }
    }

    await pool.query(
      `UPDATE order_main SET receive_date = ?, receiver = ?, status = 1 WHERE id_register = ?`,
      [receive_date, receiver, idRegister]
    );

    return NextResponse.json({ response: 'Yey.. your order has been received.' });
  } catch (error) {
    console.error('getorderreceived error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
