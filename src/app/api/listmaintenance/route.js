import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const perPage = Math.max(1, Math.min(50, Number(searchParams.get("per_page")) || 15));
    const status = searchParams.get("status") || "all";
    const offset = (page - 1) * perPage;

    // Base condition for PM
    let stepCondition = "Request.Step > 0 AND Request.Step <= 5";
    if (status === "issued") {
      stepCondition = "Request.Step = 1";
    } else if (status === "onprogress") {
      stepCondition = "Request.Step >= 2 AND Request.Step < 5";
    } else if (status === "completed") {
      stepCondition = "Request.Step = 5";
    }

    const typeCondition = `
      (Request.Maintenance_Type = 'PM' OR (Request.Maintenance_Type = 'PM' AND A.Type = 'K'))
      AND (A.Type <> 'PC' OR A.Type IS NULL)
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM Request
      LEFT JOIN Assets AS A ON A.ID_Asset = Request.ID_Asset
      WHERE ${stepCondition} AND ${typeCondition}
    `;

    const dataSql = `
      SELECT Request.ID_Request, Request.ID_Asset, Request.Step, Request.Time_Request, 
             Request.Problem, Request.Maintenance_Type,
             User.Name, A.Description, A.Manufacture, A.Model, A.No, A.Type, A.Image
      FROM Request
      LEFT JOIN Assets AS A ON A.ID_Asset = Request.ID_Asset
      LEFT JOIN User ON User.Uid = Request.ID_Requestor
      WHERE ${stepCondition} AND ${typeCondition}
      ORDER BY Request.Time_Request DESC
      LIMIT ? OFFSET ?
    `;

    const tabCountsSql = `
      SELECT 
        SUM(CASE WHEN Request.Step = 1 THEN 1 ELSE 0 END) AS issued_count,
        SUM(CASE WHEN Request.Step >= 2 AND Request.Step < 5 THEN 1 ELSE 0 END) AS progress_count,
        SUM(CASE WHEN Request.Step = 5 THEN 1 ELSE 0 END) AS completed_count
      FROM Request
      LEFT JOIN Assets AS A ON A.ID_Asset = Request.ID_Asset
      WHERE Request.Step > 0 AND Request.Step <= 5 AND ${typeCondition}
    `;

    const [
      [[countRow]],
      [items],
      [[tabCounts]],
    ] = await Promise.all([
      db.query(countSql),
      db.query(dataSql, [perPage, offset]),
      db.query(tabCountsSql),
    ]);

    const total = countRow?.total || 0;
    const hasMore = offset + items.length < total;

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 1,
        has_more: hasMore,
      },
      counts: {
        issued: Number(tabCounts?.issued_count || 0),
        onprogress: Number(tabCounts?.progress_count || 0),
        completed: Number(tabCounts?.completed_count || 0),
        all: total,
      },
    });
  } catch (error) {
    console.error("Error in /api/listmaintenance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

