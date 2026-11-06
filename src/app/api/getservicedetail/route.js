import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureServiceSchema } from '@/lib/serviceSchema';

export async function POST(request) {
  try {
    await ensureServiceSchema(pool);

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
      `SELECT service_detail.*, 
              Request.Problem, 
              Request.ID_Asset as request_asset,
              COALESCE(service_detail.id_asset, Request.ID_Asset) as ID_Asset,
              COALESCE(direct_asset.Description, req_asset.Description) as asset_name,
              parts.description as part_name,
              parts.vendor_code as part_code
       FROM service_detail
       LEFT JOIN Request ON Request.ID_Request = service_detail.id_request
       LEFT JOIN Assets req_asset ON req_asset.ID_Asset = Request.ID_Asset
       LEFT JOIN Assets direct_asset ON direct_asset.ID_Asset = service_detail.id_asset
       LEFT JOIN parts ON parts.id_part = service_detail.id_part
       WHERE service_detail.id_register = ?`,
      [idRegister]
    );

    return NextResponse.json({ order, detail: order_detail });
  } catch (error) {
    console.error('getservicedetail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
