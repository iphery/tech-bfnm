import { NextResponse } from "next/server";
import db from "@/lib/db";
import { calculateWorkingHours } from "@/lib/timeFunction";

export async function POST(req) {
  try {
    const { idAsset, keyword } = await req.json();
    if (!idAsset) {
      return NextResponse.json({ service: [], mttr: 0 }, { status: 400 });
    }

    // 1. Fetch all tickets for this asset to calculate accurate MTTR
    const [allRows] = await db.query(
      `SELECT r.ID_Request, r.Time_Request, r.Time_Response, r.Time_Repair_Complete,
              r.Time_POS, r.Time_POS_Complete, r.POS_Required, r.Maintenance_Type, r.Step
       FROM Request r
       WHERE r.ID_Asset = ?`,
      [idAsset]
    );

    let totalRepairHours = 0;
    let completedRepairsCount = 0;
    const ticketRepairHoursMap = new Map();

    for (const r of allRows || []) {
      if (r.Time_Response && r.Time_Repair_Complete) {
        const orderHours =
          r.POS_Required === 1 && r.Time_POS && r.Time_POS_Complete
            ? calculateWorkingHours(r.Time_POS, r.Time_POS_Complete, r.Time_Request)
            : 0;
        const totalRepair = calculateWorkingHours(
          r.Time_Response,
          r.Time_Repair_Complete,
          r.Time_Request
        );
        const netRepair = Math.max(0, totalRepair - orderHours);
        ticketRepairHoursMap.set(r.ID_Request, Number(netRepair.toFixed(2)));

        // Include corrective/breakdown repairs in MTTR
        if (r.Maintenance_Type !== "PM") {
          totalRepairHours += netRepair;
          completedRepairsCount++;
        }
      }
    }

    const mttr =
      completedRepairsCount > 0
        ? Number((totalRepairHours / completedRepairsCount).toFixed(2))
        : 0;

    // 2. Fetch filtered rows for list display
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
      repair_hours: ticketRepairHoursMap.has(item.ID_Request)
        ? ticketRepairHoursMap.get(item.ID_Request)
        : null,
      Prod_SPV_Name: item.Prod_SPV_Name_From_Approver || item.Prod_SPV_Name || "-",
    }));

    return NextResponse.json({
      service: formatted,
      mttr: mttr,
      total_repair_hours: Number(totalRepairHours.toFixed(2)),
      completed_repairs_count: completedRepairsCount,
    });
  } catch (error) {
    console.error("Error in /api/fetchassetservice:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

