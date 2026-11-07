import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { idRequest, uid } = body;

    if (!idRequest) {
      return NextResponse.json(
        { error: "idRequest is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
      now.getSeconds()
    )}`;

    const [rows] = await db.query(
      "SELECT Step FROM RequestGenset WHERE ID_Request = ?",
      [idRequest]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    const step = Number(rows[0].Step);

    if (step === 0) {
      await db.query(
        "UPDATE RequestGenset SET ID_Tech = ?, Step = 1, Time_Start = ? WHERE ID_Request = ?",
        [uid, date, idRequest]
      );
    } else if (step === 1) {
      await db.query(
        "UPDATE RequestGenset SET Step = 2, Time_Stop = ? WHERE ID_Request = ?",
        [date, idRequest]
      );
    }

    return NextResponse.json({ result: "OK" });
  } catch (error) {
    console.error("updatepemanasan error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
