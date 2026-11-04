import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function handleGetService(request) {
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
        WHERE (service_main.id_register LIKE ? 
           OR service_main.dpm LIKE ? 
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
         FROM service_main
         LEFT JOIN User q1 ON q1.Uid = service_main.created_by
         LEFT JOIN User q2 ON q2.Uid = service_main.receiver
         ${whereClause}`,
        countParams
      );
      total = countResult[0]?.total ? Number(countResult[0].total) : 0;
    }

    let queryStr = `
      SELECT service_main.id_register, service_main.date, service_main.dpm, 
             q1.Name as requestor, q2.Name as receiver, 
             service_main.status, 
             IF(service_main.status = 0, 'OPEN', 'CLOSE') as status_def, 
             service_main.created_at 
      FROM service_main
      LEFT JOIN User q1 ON q1.Uid = service_main.created_by
      LEFT JOIN User q2 ON q2.Uid = service_main.receiver
      ${whereClause}
      ORDER BY service_main.date DESC, service_main.created_at DESC
    `;

    if (shouldPaginate) {
      queryStr += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
    }

    const [services] = await pool.query(queryStr, queryParams);

    const payload = {
      response: services,
    };

    if (shouldPaginate) {
      payload.pagination = {
        page: currentPage,
        per_page: limit,
        total: total,
        total_pages: Math.ceil(total / limit) || 1,
        has_more: offset + services.length < total,
      };
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('getservice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  return handleGetService(request);
}

export async function GET(request) {
  return handleGetService(request);
}
