import { NextResponse } from "next/server";
import pool from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { imageName, idRequest } = await request.json();

    if (!imageName) {
      return NextResponse.json(
        { success: false, message: "imageName wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Delete from MySQL table Image
    await pool.query("DELETE FROM Image WHERE Image_Name = ?", [imageName]);

    // 2. Try delete from local directories if file exists
    const localDirs = [
      path.join(process.cwd(), "public", "images", "cases"),
      "/home/balifoam/public_html/mita/mobile/flutter/image_case",
      "/home/public_html/mita/mobile/flutter/image_case",
    ];

    for (const dir of localDirs) {
      try {
        const filePath = path.join(dir, imageName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {}
    }

    return NextResponse.json({
      success: true,
      message: "Foto berhasil dihapus",
    });
  } catch (error) {
    console.error("deletecaseimage error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
