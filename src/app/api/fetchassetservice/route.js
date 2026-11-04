import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { idAsset, keyword } = await req.json();
    if (!idAsset) {
      return NextResponse.json({ service: [] }, { status: 400 });
    }

    const kw = (keyword || "").trim();
    let sql = `
      SELECT r.*, u.Name AS Prod_SPV_Name_From_Approver
      FROM Request r
      LEFT JOIN User u ON u.Uid = r.ID_Approver
      WHERE r.ID_Asset = ?
    `;
    const params = [idAsset];

    if (kw) {
      sql += " AND r.Problem LIKE ?";
      params.push(`%${kw}%`);
    }

    sql += " ORDER BY r.Time_Request DESC";

    const [rows] = await db.query(sql, params);

    const formatted = rows.map((item) => ({
      ...item,
      Prod_SPV_Name: item.Prod_SPV_Name_From_Approver || item.Prod_SPV_Name || "-",
    }));

    return NextResponse.json({
      service: formatted,
    });
  } catch (error) {
    console.error("Error in /api/fetchassetservice:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

