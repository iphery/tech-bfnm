import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const q1 = `
      SELECT Request.*, A.*
      FROM Request
      LEFT JOIN Assets AS A ON A.ID_Asset = Request.ID_Asset
      WHERE Request.Step > 0 AND Request.Step < 6
        AND (Request.Maintenance_Type = 'CM' OR (Request.Maintenance_Type = 'PM' AND A.Type = 'K'))
        AND (A.Type <> 'PC' OR A.Type IS NULL)
      LIMIT 5
    `;

    const q1Count = `
      SELECT COUNT(*) AS total
      FROM Request
      LEFT JOIN Assets AS A ON A.ID_Asset = Request.ID_Asset
      WHERE Request.Step > 0 AND Request.Step < 6
        AND (Request.Maintenance_Type = 'CM' OR (Request.Maintenance_Type = 'PM' AND A.Type = 'K'))
        AND (A.Type <> 'PC' OR A.Type IS NULL)
    `;

    const q2 = `
      SELECT Request.*, A.*
      FROM Request
      LEFT JOIN Assets AS A ON A.ID_Asset = Request.ID_Asset
      WHERE Request.Step > 0 AND Request.Step < 6
        AND (Request.Maintenance_Type = 'PM' OR (Request.Maintenance_Type = 'PM' AND A.Type = 'K'))
        AND (A.Type <> 'PC' OR A.Type IS NULL)
      LIMIT 5
    `;

    const q2Count = `
      SELECT COUNT(*) AS total
      FROM Request
      LEFT JOIN Assets AS A ON A.ID_Asset = Request.ID_Asset
      WHERE Request.Step > 0 AND Request.Step < 6
        AND (Request.Maintenance_Type = 'PM' OR (Request.Maintenance_Type = 'PM' AND A.Type = 'K'))
        AND (A.Type <> 'PC' OR A.Type IS NULL)
    `;

    const [
      [result1],
      [[count1]],
      [result2],
      [[count2]],
    ] = await Promise.all([
      db.query(q1),
      db.query(q1Count),
      db.query(q2),
      db.query(q2Count),
    ]);

    return NextResponse.json({
      outstanding: result1,
      maintenance: result2,
      outstanding_count: count1?.total || 0,
      maintenance_count: count2?.total || 0,
    });
  } catch (error) {
    console.error("Error in /api/listoutstandingoverview:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

