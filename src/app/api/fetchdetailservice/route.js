import { NextResponse } from "next/server";
import db from "@/lib/db";
import { calculateWorkingHours } from "@/lib/timeFunction";

export async function POST(req) {
  try {
    const { idRequest } = await req.json();
    if (!idRequest) {
      return NextResponse.json({ response: [] }, { status: 400 });
    }

    const [data] = await db.query(
      `SELECT r.*, u2.Name AS Prod_SPV_Name_From_Approver
       FROM Request r
       LEFT JOIN User u2 ON r.ID_Approver = u2.Uid
       WHERE r.ID_Request = ?`,
      [idRequest]
    );

    let responseTime = 0;
    let repairTime = 0;

    if (data.length > 0) {
      const dt = data[0];
      if (dt.Prod_SPV_Name_From_Approver) {
        dt.Prod_SPV_Name = dt.Prod_SPV_Name_From_Approver;
      }

      const timeRequest = dt.Time_Request;
      const timeResponse = dt.Time_Response;
      const timeCompleted = dt.Time_Repair_Complete;
      const startSparepart = dt.Time_POS;
      const endSparepart = dt.Time_POS_Complete;
      const pos = dt.POS_Required;

      responseTime = calculateWorkingHours(timeRequest, timeResponse, timeRequest);

      let orderTime = 0;
      if (pos === 1) {
        orderTime = calculateWorkingHours(startSparepart, endSparepart, timeRequest);
      }

      const totalRepairTime = calculateWorkingHours(
        timeResponse,
        timeCompleted,
        timeRequest
      );
      repairTime = Math.max(0, totalRepairTime - orderTime);
    }

    // Parts UNION query
    let parts = [];
    try {
      const [partRows] = await db.query(
        `SELECT d.id_part, d.id_register, d.description, d.quantity, d.dpm 
         FROM order_detail d
         LEFT JOIN order_main m ON m.id_register = d.id_register
         WHERE d.stock = 'Non Stock' AND d.id_service = ?
         UNION
         SELECT so.id_part, so.id_register, CONCAT(COALESCE(p.description, ''), ' ', COALESCE(p.vendor_code, '')) AS description, 
                so.quantity, so.id_register AS dpm 
         FROM stock_out so
         LEFT JOIN parts p ON p.id_part = so.id_part
         WHERE so.id_service = ?`,
        [idRequest, idRequest]
      );
      parts = partRows;
    } catch {
      parts = [];
    }

    let servis = [];
    try {
      const [servisRows] = await db.query(
        "SELECT * FROM service_detail WHERE id_request = ?",
        [idRequest]
      );
      servis = servisRows;
    } catch {
      servis = [];
    }

    let galleries = [];
    try {
      const [imgRows] = await db.query(
        "SELECT Image_Name FROM Image WHERE ID_Request = ?",
        [idRequest]
      );
      galleries = imgRows;
    } catch {
      galleries = [];
    }

    return NextResponse.json({
      response: data,
      parts,
      galleries,
      response_time: Number(responseTime.toFixed(2)),
      repair_time: Number(repairTime.toFixed(2)),
      servis,
    });
  } catch (error) {
    console.error("Error in /api/fetchdetailservice:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

