import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "UID is required" },
        { status: 400 }
      );
    }

    const [rows] = await db.query("SELECT * FROM User WHERE Uid = ?", [uid]);

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

