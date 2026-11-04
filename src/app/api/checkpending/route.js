import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json({ response: 0 });
    }

    const [users] = await db.query("SELECT * FROM User WHERE Uid = ?", [uid]);
    if (users.length === 0) {
      return NextResponse.json({ response: 0 });
    }

    const user = users[0];
    const divisi = user.divisi;
    const level = Number(user.Level);
    let count = 0;

    if (level === 4) {
      if (divisi === "Produksi") {
        const [[row]] = await db.query(
          `SELECT COUNT(*) AS total
           FROM Request
           LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset
           WHERE ((Maintenance_Type = 'PM' AND divisi_glob IN ('Produksi A', 'Produksi B') AND Step = 6)
              OR (Maintenance_Type = 'CM' AND ID_Requestor = ? AND Step = 6))`,
          [uid]
        );
        count = row?.total || 0;
      } else {
        const [[row]] = await db.query(
          `SELECT COUNT(*) AS total
           FROM Request
           LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset
           WHERE ((Maintenance_Type = 'PM' AND divisi_glob = ? AND Step = 6)
              OR (Maintenance_Type = 'CM' AND ID_Requestor = ? AND Step = 6))`,
          [divisi, uid]
        );
        count = row?.total || 0;
      }
    } else if (level <= 2) {
      const [[row]] = await db.query(
        `SELECT COUNT(*) AS total
         FROM Request
         LEFT JOIN Assets ON Assets.ID_Asset = Request.ID_Asset
         WHERE Technician = ? AND Step <= 5`,
        [uid]
      );
      count = row?.total || 0;
    }

    return NextResponse.json({ response: count });
  } catch (error) {
    console.error("Error in /api/checkpending:", error);
    return NextResponse.json({ response: 0 });
  }
}

