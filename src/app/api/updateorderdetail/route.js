import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister, id, amount, seller, budget_pos, list } = body;

    if (!idRegister) {
      return NextResponse.json({ error: 'idRegister is required' }, { status: 400 });
    }

    if (Array.isArray(list) && list.length > 0) {
      for (const item of list) {
        await pool.query(
          `UPDATE order_detail 
           SET amount = ?, seller = ?, budget_pos = COALESCE(?, budget_pos)
           WHERE id_register = ? AND ids = ?`,
          [Number(item.amount || 0), item.seller || '', item.budget || item.budget_pos || null, idRegister, item.id || item.ids]
        );
      }
      return NextResponse.json({ success: true, message: 'Data harga dan supplier berhasil diperbarui' });
    }

    if (id !== undefined) {
      await pool.query(
        `UPDATE order_detail 
         SET amount = ?, seller = ?, budget_pos = COALESCE(?, budget_pos)
         WHERE id_register = ? AND ids = ?`,
        [Number(amount || 0), seller || '', budget_pos || null, idRegister, id]
      );
      return NextResponse.json({ success: true, message: 'Data item berhasil diperbarui' });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    console.error('updateorderdetail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

