import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const page = Math.max(1, Number(body.page) || 1);
    const perPage = Math.max(1, Math.min(100, Number(body.per_page) || 15));
    const isAll = body.isAll === 1 || body.isAll === true || body.isAll === "1";
    const search = (body.search || "").trim();
    const typeParam = body.type;

    let types = [];
    if (!isAll && typeParam) {
      if (Array.isArray(typeParam)) {
        types = typeParam;
      } else if (typeof typeParam === "string") {
        try {
          const parsed = JSON.parse(typeParam);
          if (Array.isArray(parsed)) types = parsed;
          else types = [typeParam];
        } catch {
          types = [typeParam];
        }
      }
    }

    const conditions = ["nonactive = 0"];
    const params = [];

    // Filter by type if not isAll
    if (!isAll) {
      if (types.length === 0) {
        return NextResponse.json({
          success: true,
          response: [],
          items: [],
          pagination: {
            page,
            per_page: perPage,
            total: 0,
            total_pages: 1,
            has_more: false,
          },
        });
      }
      const placeholders = types.map(() => "?").join(",");
      conditions.push(`Type IN (${placeholders})`);
      params.push(...types);
    }

    // Search query
    if (search) {
      conditions.push(`(
        ID_Asset LIKE ? OR 
        Description LIKE ? OR 
        Manufacture LIKE ? OR 
        Model LIKE ? OR 
        No LIKE ? OR 
        User LIKE ? OR 
        Class LIKE ?
      )`);
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count Total
    const countSql = `SELECT COUNT(*) AS total FROM Assets ${whereClause}`;
    const [[[countResult]]] = await Promise.all([
      db.query(countSql, params),
    ]);
    const total = countResult?.total || 0;

    // Fetch Paginated Items
    const offset = (page - 1) * perPage;
    const dataSql = `
      SELECT ID_Asset, Description, Manufacture, Model, No, Type, Class, User, 
             Location, Image, Reserve, Available
      FROM Assets
      ${whereClause}
      ORDER BY Reserve DESC, ID_Asset ASC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, perPage, offset];
    const [items] = await db.query(dataSql, dataParams);

    const hasMore = offset + items.length < total;

    return NextResponse.json({
      success: true,
      response: items, // keep backwards compatibility for legacy callers
      items,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 1,
        has_more: hasMore,
      },
    });
  } catch (error) {
    console.error("Error in /api/getallasset:", error);
    return NextResponse.json(
      { success: false, error: error.message, response: [], items: [] },
      { status: 500 }
    );
  }
}

