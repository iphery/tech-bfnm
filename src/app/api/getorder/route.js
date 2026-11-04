import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function handleGetOrder(request) {
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
      whereClause = `
        WHERE (order_main.id_register LIKE ? 
           OR order_main.dpm LIKE ? 
           OR q1.Name LIKE ? 
           OR q2.Name LIKE ?)
      `;
      const pattern = `%${trimmedSearch}%`;
      queryParams.push(pattern, pattern, pattern, pattern);
      countParams.push(pattern, pattern, pattern, pattern);
    }

    let total = 0;
    if (shouldPaginate) {
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total 
         FROM order_main
         LEFT JOIN User q1 ON q1.Uid = order_main.created_by
         LEFT JOIN User q2 ON q2.Uid = order_main.receiver
         ${whereClause}`,
        countParams
      );
      total = countResult[0]?.total ? Number(countResult[0].total) : 0;
    }

    let queryStr = `
      SELECT order_main.id_register, order_main.date, order_main.dpm, 
             q1.Name as requestor, q2.Name as receiver, 
             order_main.status, 
             IF(order_main.status = 0, 'OPEN', 'CLOSE') as status_def, 
             order_main.created_at 
      FROM order_main
      LEFT JOIN User q1 ON q1.Uid = order_main.created_by
      LEFT JOIN User q2 ON q2.Uid = order_main.receiver
      ${whereClause}
      ORDER BY order_main.date DESC, order_main.created_at DESC
    `;

    if (shouldPaginate) {
      queryStr += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
    }

    const [orders] = await pool.query(queryStr, queryParams);

    const payload = {
      response: orders,
    };

    if (shouldPaginate) {
      payload.pagination = {
        page: currentPage,
        per_page: limit,
        total: total,
        total_pages: Math.ceil(total / limit) || 1,
        has_more: offset + orders.length < total,
      };
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('getorder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  return handleGetOrder(request);
}

export async function GET(request) {
  return handleGetOrder(request);
}
