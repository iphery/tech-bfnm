import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS connection_test");
    return NextResponse.json({
      success: true,
      message: "Koneksi ke Remote MySQL Berhasil!",
      result: rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
