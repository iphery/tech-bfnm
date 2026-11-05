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
        WHERE (s.id_register LIKE ? 
           OR u.Name LIKE ?)
      `;
      const pattern = `%${trimmedSearch}%`;
      queryParams.push(pattern, pattern);
      countParams.push(pattern, pattern);
    }

    let total = 0;
    if (shouldPaginate) {
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total 
         FROM service s
         LEFT JOIN User u ON u.Uid = s.created_by
         ${whereClause}`,
        countParams
      );
      total = countResult[0]?.total ? Number(countResult[0].total) : 0;
    }

    let queryStr = `
      SELECT s.*,
             s.id_register, 
             s.date_issued as date, 
             s.date_issued, 
             u.Name as requestor, 
             u.Name as Name, 
             s.status, 
             IF(s.status = 0, 'OPEN', 'CLOSE') as status_def, 
             s.created_at 
      FROM service s
      LEFT JOIN User u ON u.Uid = s.created_by
      ${whereClause}
      ORDER BY s.date_issued DESC, s.created_at DESC, s.id_register DESC
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
