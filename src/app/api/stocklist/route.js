import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function handleStockList(request) {
  try {
    let body = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    } else {
      const url = new URL(request.url);
      body = {
        page: url.searchParams.get('page'),
        per_page: url.searchParams.get('per_page'),
        search: url.searchParams.get('search'),
        paginate: url.searchParams.get('paginate'),
      };
    }

    const { page, per_page = 15, search = '', paginate = false, status_filter } = body;
    const shouldPaginate = Boolean(paginate || page);
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const limit = Math.max(1, parseInt(per_page, 10) || 15);
    const offset = (currentPage - 1) * limit;

    // Check system setting for part status visibility
    let activeStatusFilter = status_filter;
    if (!activeStatusFilter) {
      try {
        const [settingRow] = await pool.query(
          "SELECT setting_value FROM system_settings WHERE setting_key = 'part_status_filter' LIMIT 1"
        );
        activeStatusFilter = settingRow[0]?.setting_value || 'aktif';
      } catch {
        activeStatusFilter = 'aktif';
      }
    }

    let whereClause = activeStatusFilter === 'all' ? "WHERE 1=1" : "WHERE status = 'Aktif'";
    const queryParams = [];
    const countParams = [];

    const trimmedSearch = (search || '').trim();
    if (trimmedSearch) {
      whereClause += " AND (parts.description LIKE ? OR parts.vendor_code LIKE ? OR parts.location LIKE ? OR parts.remark LIKE ?)";
      const pattern = `%${trimmedSearch}%`;
      queryParams.push(pattern, pattern, pattern, pattern);
      countParams.push(pattern, pattern, pattern, pattern);
    }

    let total = 0;
    if (shouldPaginate) {
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM parts ${whereClause}`,
        countParams
      );
      total = countResult[0]?.total ? Number(countResult[0].total) : 0;
    }

    let queryStr = ``;
    if (shouldPaginate) {
      // Fast path for pagination: Only calculate warehouse sums for the requested page items
      queryStr = `
        SELECT parts.*, 
          (parts.initial_stock 
           + COALESCE((SELECT SUM(qty) FROM stockin WHERE stockin.id_part = parts.id_part), 0)
           - COALESCE((SELECT SUM(qty) FROM stockout WHERE stockout.id_part = parts.id_part), 0)
          ) as available 
        FROM parts 
        ${whereClause}
        ORDER BY parts.description ASC
        LIMIT ? OFFSET ?
      `;
      queryParams.push(limit, offset);
    } else {
      queryStr = `
        SELECT parts.*, (initial_stock + COALESCE(qin.qty, 0) - COALESCE(qout.qty, 0)) as available 
        FROM parts 
        LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockin GROUP BY id_part) qin ON qin.id_part = parts.id_part 
        LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockout GROUP BY id_part) qout ON qout.id_part = parts.id_part 
        ${whereClause}
        ORDER BY parts.description ASC
      `;
    }

    const [lists] = await pool.query(queryStr, queryParams);

    const data = lists.map((list) => ({
      id_part: list.id_part,
      description: list.description,
      available_quantity: Number(list.available || 0),
      unit: list.unit,
      vendor_code: list.vendor_code,
      location: list.location,
      remark: list.remark,
      quantity: Number(list.available || 0),
    }));

    // If paginate is requested, we don't need heavy assets/pending queries if caller only wants parts list,
    // but we can include them on page 1 for compatibility.
    let data_asset = [];
    let pending = [];
    if (!shouldPaginate || currentPage === 1) {
      const [assets] = await pool.query('SELECT ID_Asset, Description, Manufacture, Model, No, User, Type FROM Assets');
      data_asset = assets.map((asset) => ({
        id_asset: asset.ID_Asset,
        description: asset.Description,
        manufacture: asset.Manufacture,
        model: asset.Model,
        no: asset.No,
        user: asset.User,
        type: asset.Type,
      }));

      const [pendingResult] = await pool.query(`
        SELECT Request.ID_Request, Request.ID_Asset, Assets.Description, Assets.Manufacture, Assets.Model, Assets.No
        FROM Request
        LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset
        WHERE Request.Step >= 3 AND Request.Step <= 4
      `);
      pending = pendingResult;
    }

    const responsePayload = {
      response: data,
      asset: data_asset,
      pending: pending,
    };

    if (shouldPaginate) {
      responsePayload.pagination = {
        page: currentPage,
        per_page: limit,
        total: total,
        total_pages: Math.ceil(total / limit) || 1,
        has_more: offset + data.length < total,
      };
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('stocklist error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  return handleStockList(request);
}

export async function GET(request) {
  return handleStockList(request);
}
