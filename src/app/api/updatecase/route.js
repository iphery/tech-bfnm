import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { idRequest, status, solution, uid, receivePart } = await req.json();
    if (!idRequest || !status) {
      return NextResponse.json({ error: 1, response: "Missing parameters" }, { status: 400 });
    }

    const [users] = await db.query("SELECT Name FROM User WHERE Uid = ?", [uid]);
    const username = users[0]?.Name || "Teknisi";

    const [requests] = await db.query(
      "SELECT ID_Asset, Maintenance_Type, Problem, Solution, new_checklist FROM Request WHERE ID_Request = ?",
      [idRequest]
    );

    if (requests.length === 0) {
      return NextResponse.json({ error: 1, response: "Tiket tidak ditemukan" }, { status: 404 });
    }

    const reqData = requests[0];
    const idAsset = reqData.ID_Asset;
    const type = reqData.Maintenance_Type;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    let message = "";
    let error = 0;

    switch (status) {
      case "received": {
        message = "Pekerjaan berhasil diambil. Utamakan keselamatan kerja!";
        await db.query(
          `UPDATE Request 
           SET Time_Response = ?, Technician = ?, ID_Tech = ?, Step = 2 
           WHERE ID_Request = ?`,
          [now, username, uid, idRequest]
        );

        if (type === "CM") {
          await db.query("UPDATE Assets SET Available = 0 WHERE ID_Asset = ?", [idAsset]);
        } else {
          await db.query("UPDATE Assets SET Available = 0, View = 1 WHERE ID_Asset = ?", [idAsset]);
        }
        break;
      }

      case "order_part": {
        message = "Permintaan sparepart berhasil diajukan.";
        await db.query(
          `UPDATE Request 
           SET Time_POS = ?, POS_Required = 1, Step = 3 
           WHERE ID_Request = ?`,
          [now, idRequest]
        );
        break;
      }

      case "receive_part": {
        message = "Sparepart berhasil diterima, silakan lanjutkan perbaikan.";
        const timePart = receivePart || now;
        await db.query(
          `UPDATE Request 
           SET Time_POS_Complete = ?, Step = 4 
           WHERE ID_Request = ?`,
          [timePart, idRequest]
        );
        break;
      }

      case "completed": {
        message = "Pekerjaan perbaikan berhasil diselesaikan.";
        const finalSolution = solution || reqData.Solution || "-";

        await db.query(
          `UPDATE Request 
           SET Time_Repair_Complete = ?, Solution = ?, Step = 5 
           WHERE ID_Request = ?`,
          [now, finalSolution, idRequest]
        );
        break;
      }

      default: {
        message = "Status tidak dikenali.";
        error = 1;
        break;
      }
    }

    return NextResponse.json({ error, response: message });
  } catch (err) {
    console.error("Error in /api/updatecase:", err);
    return NextResponse.json({ error: 1, response: err.message }, { status: 500 });
  }
}
