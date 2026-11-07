import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { uid, email } = await req.json();

    if (!uid && !email) {
      return NextResponse.json(
        { success: false, message: "UID or Email is required" },
        { status: 400 }
      );
    }

    let rows = [];
    if (uid && email) {
      const [result] = await db.query(
        "SELECT * FROM User WHERE Uid = ? OR (email = ? AND email IS NOT NULL AND email != '') LIMIT 1",
        [uid, email]
      );
      rows = result;
    } else if (uid) {
      const [result] = await db.query("SELECT * FROM User WHERE Uid = ? LIMIT 1", [uid]);
      rows = result;
    } else {
      const [result] = await db.query(
        "SELECT * FROM User WHERE email = ? AND email IS NOT NULL AND email != '' LIMIT 1",
        [email]
      );
      rows = result;
    }

    return NextResponse.json({
      data: rows,
    });
  } catch (error) {
    console.error("Error in /api/fetchuser:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

