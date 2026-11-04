import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json({ response: "NO_UID" });
    }

    const [users] = await db.query("SELECT * FROM User WHERE Uid = ?", [uid]);
    if (users.length === 0) {
      return NextResponse.json({ response: "USER_NOT_FOUND" });
    }

    const user = users[0];
    const divisi = user.divisi;
    const level = Number(user.Level);
    const name = user.Name;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    if (level === 4) {
      let requests = [];
      if (divisi === "Produksi") {
        [requests] = await db.query(
          `SELECT Request.ID_Request, Request.ID_Asset
           FROM Request
           LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset
           WHERE ((Maintenance_Type = 'PM' AND divisi_glob IN ('Produksi A', 'Produksi B') AND Step = 6)
              OR (Maintenance_Type = 'CM' AND ID_Requestor = ? AND Step = 6))`,
          [uid]
        );
      } else {
        [requests] = await db.query(
          `SELECT Request.ID_Request, Request.ID_Asset
           FROM Request
           LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset
           WHERE ((Maintenance_Type = 'PM' AND divisi_glob = ? AND Step = 6)
              OR (Maintenance_Type = 'CM' AND ID_Requestor = ? AND Step = 6))`,
          [divisi, uid]
        );
      }

      for (const ct of requests) {
        await db.query(
          `UPDATE Request 
           SET Step = 7, Rating = 5, ID_Approver = ?, Approver_Name = ?, Prod_SPV = ? 
           WHERE ID_Request = ?`,
          [uid, name, now, ct.ID_Request]
        );

        const [activeRequests] = await db.query(
          "SELECT ID_Request FROM Request WHERE ID_Asset = ? AND Step <= 6",
          [ct.ID_Asset]
        );

        if (activeRequests.length === 0) {
          await db.query(
            "UPDATE Assets SET Available = 1, Reserve = 0, View = 0 WHERE ID_Asset = ?",
            [ct.ID_Asset]
          );
        }
      }
    }

    return NextResponse.json({ response: "OK" });
  } catch (error) {
    console.error("Error in /api/closepending:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

