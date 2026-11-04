import { NextResponse } from "next/server";
import db from "@/lib/db";
import { calculateWorkingHours } from "@/lib/timeFunction";

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    const [inyearRows] = await db.query(
      `SELECT ID_Request FROM Request 
       LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset 
       WHERE (Assets.Type = 'MP' OR Assets.Type = 'K') 
         AND YEAR(Time_Request) = ? 
         AND Maintenance_Type = 'CM'`,
      [year]
    );
    const totalInYear = inyearRows.length;

    const [inmonthRows] = await db.query(
      `SELECT ID_Request FROM Request 
       LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset 
       WHERE (Assets.Type = 'MP' OR Assets.Type = 'K') 
         AND YEAR(Time_Request) = ? 
         AND Maintenance_Type = 'CM' 
         AND MONTH(Time_Request) = ?`,
      [year, thisMonth]
    );
    const totalInMonth = inmonthRows.length;

    // Fetch MP & K requests for the entire year in 1 query to optimize performance
    const [allYearRequests] = await db.query(
      `SELECT Request.ID_Request, Request.ID_Asset, Request.Time_Request, 
              Request.Time_Response, Request.Time_Repair_Complete, 
              Request.Time_POS, Request.Time_POS_Complete, Request.POS_Required,
              MONTH(Time_Request) AS req_month, Assets.Type
       FROM Request 
       LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset 
       WHERE (Assets.Type = 'MP' OR Assets.Type = 'K') 
         AND Maintenance_Type = 'CM' 
         AND YEAR(Time_Request) = ?`,
      [year]
    );

    const serviceMesin = [];
    const serviceKendaraan = [];

    for (const m of months) {
      // Mesin Produksi (MP)
      const listMP = allYearRequests.filter(
        (r) => r.Type === "MP" && r.req_month === m
      );
      let serviceTimeMP = 0;
      let countMP = 0;

      for (const dt of listMP) {
        const orderTime =
          dt.POS_Required === 1
            ? calculateWorkingHours(dt.Time_POS, dt.Time_POS_Complete, dt.Time_Request)
            : 0;
        const totalRepairTime = calculateWorkingHours(
          dt.Time_Response,
          dt.Time_Repair_Complete,
          dt.Time_Request
        );
        const repairTime = totalRepairTime - orderTime;
        serviceTimeMP += repairTime;
        countMP++;
      }
      serviceMesin.push(countMP !== 0 ? Number((serviceTimeMP / countMP).toFixed(2)) : 0);

      // Kendaraan (K)
      const listK = allYearRequests.filter(
        (r) => r.Type === "K" && r.req_month === m
      );
      let serviceTimeK = 0;
      let countK = 0;

      for (const dt of listK) {
        const orderTime =
          dt.POS_Required === 1
            ? calculateWorkingHours(dt.Time_POS, dt.Time_POS_Complete, dt.Time_Request)
            : 0;
        const totalRepairTime = calculateWorkingHours(
          dt.Time_Response,
          dt.Time_Repair_Complete,
          dt.Time_Request
        );
        const repairTime = totalRepairTime - orderTime;
        serviceTimeK += repairTime;
        countK++;
      }
      serviceKendaraan.push(countK !== 0 ? Number((serviceTimeK / countK).toFixed(2)) : 0);
    }

    const sumData = [
      { name: "Mesin Produksi", data: serviceMesin },
      { name: "Kendaraan", data: serviceKendaraan },
    ];

    const [waitingPartRows] = await db.query(
      `SELECT ID_Request FROM Request 
       LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset 
       WHERE Step = 3 AND (Assets.Type = 'MP' OR Assets.Type = 'K')`
    );
    const waitingPart = waitingPartRows.length;

    let openOrder = 0;
    try {
      const [[orderRow]] = await db.query(
        "SELECT COUNT(*) AS total FROM order_main WHERE status = 0"
      );
      openOrder = orderRow?.total || 0;
    } catch {
      // If table doesn't exist yet, fallback to 0
      openOrder = 0;
    }

    return NextResponse.json({
      data: sumData,
      inyear: totalInYear,
      inmonth: totalInMonth,
      waiting_part: waitingPart,
      open_order: openOrder,
    });
  } catch (error) {
    console.error("Error in /api/datadashboard:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

