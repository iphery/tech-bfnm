import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function handleStockOpname(request) {
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

    const { page, per_page = 15, search = '', paginate = false } = body;
    const shouldPaginate = Boolean(paginate || page);
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const limit = Math.max(1, parseInt(per_page, 10) || 15);
    const offset = (currentPage - 1) * limit;

    let whereClause = "";
    const queryParams = [];
    const countParams = [];

    const trimmedSearch = (search || '').trim();
    if (trimmedSearch) {
      whereClause = "WHERE (stock_opname.id_register LIKE ? OR User.Name LIKE ?)";
      const pattern = `%${trimmedSearch}%`;
      queryParams.push(pattern, pattern);
      countParams.push(pattern, pattern);
    }

    let total = 0;
    if (shouldPaginate) {
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total 
         FROM stock_opname
         LEFT JOIN User ON User.Uid = stock_opname.created_by
         ${whereClause}`,
        countParams
      );
      total = countResult[0]?.total ? Number(countResult[0].total) : 0;
    }

    let queryStr = `
      SELECT stock_opname.*, User.Name
      FROM stock_opname
      LEFT JOIN User ON User.Uid = stock_opname.created_by
      ${whereClause}
      ORDER BY stock_opname.created_at DESC
    `;

    if (shouldPaginate) {
      queryStr += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
    }

    const [data] = await pool.query(queryStr, queryParams);

    const payload = {
      response: data,
    };

    if (shouldPaginate) {
      payload.pagination = {
        page: currentPage,
        per_page: limit,
        total: total,
        total_pages: Math.ceil(total / limit) || 1,
        has_more: offset + data.length < total,
      };
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('stockopname error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  return handleStockOpname(request);
}

export async function GET(request) {
  return handleStockOpname(request);
}
