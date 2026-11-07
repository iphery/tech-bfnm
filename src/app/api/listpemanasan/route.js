import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const perPage = Math.max(1, Number(searchParams.get("per_page")) || 10);
    const offset = (page - 1) * perPage;

    const [totalRows] = await db.query(
      "SELECT COUNT(*) as count FROM RequestGenset"
    );
    const total = totalRows[0]?.count || 0;
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    const [data] = await db.query(
      `SELECT RequestGenset.*, User.Name 
       FROM RequestGenset 
       LEFT JOIN User ON User.Uid = RequestGenset.ID_Tech 
       ORDER BY Time_Request DESC 
       LIMIT ? OFFSET ?`,
      [perPage, offset]
    );

    return NextResponse.json({
      data: {
        current_page: page,
        data: data,
        last_page: lastPage,
        per_page: perPage,
        total: total,
      },
    });
  } catch (error) {
    console.error("listpemanasan error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
