import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const [lists] = await pool.query(`
      SELECT parts.*, (initial_stock + COALESCE(qin.qty, 0) - COALESCE(qout.qty, 0)) as available 
      FROM parts 
      LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockin GROUP BY id_part) qin ON qin.id_part = parts.id_part 
      LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockout GROUP BY id_part) qout ON qout.id_part = parts.id_part 
      WHERE status = 'Aktif'
    `);

    const data = lists.map((list) => ({
      id_part: list.id_part,
      description: list.description,
      available_quantity: list.available,
      unit: list.unit,
      vendor_code: list.vendor_code,
      location: list.location,
      remark: list.remark,
      quantity: list.available || 0,
    }));

    const [assets] = await pool.query('SELECT ID_Asset, Description, Manufacture, Model, No, User, Type FROM Assets');
    const data_asset = assets.map((asset) => ({
      id_asset: asset.ID_Asset,
      description: asset.Description,
      manufacture: asset.Manufacture,
      model: asset.Model,
      no: asset.No,
      user: asset.User,
      type: asset.Type,
    }));

    const [pending] = await pool.query(`
      SELECT Request.ID_Request, Request.ID_Asset, Assets.Description, Assets.Manufacture, Assets.Model, Assets.No
      FROM Request
      LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset
      WHERE Request.Step >= 3 AND Request.Step <= 4
    `);

    return NextResponse.json({
      response: data,
      asset: data_asset,
      pending: pending,
    });
  } catch (error) {
    console.error('stocklist error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
