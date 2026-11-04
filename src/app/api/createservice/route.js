import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { idAsset, problem, uid } = await req.json();
    if (!idAsset || !problem) {
      return NextResponse.json({ error: 1, message: "ID Aset dan uraian masalah wajib diisi." }, { status: 400 });
    }

    const [users] = await db.query("SELECT Name FROM User WHERE Uid = ?", [uid]);
    const username = users[0]?.Name || "Staff";

    const now = new Date();
    const idRegister = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
    const created = now.toISOString().slice(0, 19).replace("T", " ");

    await db.query(
      `INSERT INTO Request (ID_Request, ID_Asset, Time_Request, Maintenance_Type, Problem, Requestor, Step, ID_Requestor)
       VALUES (?, ?, ?, 'CM', ?, ?, 1, ?)`,
      [idRegister, idAsset, created, problem, username, uid]
    );

    await db.query("UPDATE Assets SET Reserve = 1 WHERE ID_Asset = ?", [idAsset]);

    return NextResponse.json({
      error: 0,
      message: "Laporan perbaikan darurat (CM) berhasil dibuat.",
      idRequest: idRegister,
    });
  } catch (err) {
    console.error("Error in /api/createservice:", err);
    return NextResponse.json({ error: 1, message: err.message }, { status: 500 });
  }
}
