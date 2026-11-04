import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRegister } = body;

    const [order] = await pool.query(
      `SELECT service.*, User.Name
       FROM service
       LEFT JOIN User ON User.Uid = service.created_by
       WHERE service.id_register = ?`,
      [idRegister]
    );

    const [order_detail] = await pool.query(
      `SELECT service_detail.*, Request.Problem, Request.ID_Asset
       FROM service_detail
       LEFT JOIN Request ON Request.ID_Request = service_detail.id_request
       WHERE service_detail.id_register = ?`,
      [idRegister]
    );

    return NextResponse.json({ order, detail: order_detail });
  } catch (error) {
    console.error('getservicedetail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
