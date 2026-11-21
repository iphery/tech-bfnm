import { NextResponse } from "next/server";
import pool from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRequest, images, uid } = body;

    if (!idRequest) {
      return NextResponse.json(
        { success: false, message: "idRequest is required" },
        { status: 400 }
      );
    }

    const imageList = Array.isArray(images)
      ? images.filter(Boolean)
      : images
      ? [images]
      : [];

    if (imageList.length === 0) {
      return NextResponse.json(
        { success: false, message: "No images provided" },
        { status: 400 }
      );
    }

    const cleanIdRequest = String(idRequest).replace(/[^a-zA-Z0-9_-]/g, "");
    const uploader = String(uid || "system").trim();

    // Potential destination directories
    const targetDirs = [
      "/home/balifoam/public_html/mita/mobile/flutter/image_case",
      path.join(process.cwd(), "..", "mobile", "flutter", "image_case"),
      path.join(process.cwd(), "public", "images", "cases"),
    ];

    // Ensure local public cases directory exists
    const localCasesDir = path.join(process.cwd(), "public", "images", "cases");
    if (!fs.existsSync(localCasesDir)) {
      try {
        fs.mkdirSync(localCasesDir, { recursive: true });
      } catch (err) {
        console.error("Failed to create local cases directory:", err);
      }
    }

    const savedRecords = [];
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const baseTimeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    for (let i = 0; i < imageList.length; i++) {
      const rawImg = imageList[i];
      let cleanBase64 = rawImg;
      let ext = "jpg";

      if (typeof rawImg === "string") {
        if (rawImg.startsWith("data:image/")) {
          const match = rawImg.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
          if (match && match[1]) {
            ext = match[1] === "jpeg" ? "jpg" : match[1];
          }
          cleanBase64 = rawImg.replace(/^data:image\/\w+;base64,/, "");
        }
      }

      const buffer = Buffer.from(cleanBase64, "base64");
      // Format matches existing naming convention: ID_Request + Timestamp + index + ext
      const filename = `${cleanIdRequest}${baseTimeStr}${i + 1}.${ext}`;

      // Write to available target directories
      for (const dir of targetDirs) {
        try {
          if (fs.existsSync(dir)) {
            const filepath = path.join(dir, filename);
            fs.writeFileSync(filepath, buffer);
          }
        } catch (err) {
          console.error(`Error saving to directory ${dir}:`, err.message);
        }
      }

      // Insert record to table Image
      try {
        await pool.query(
          "INSERT INTO Image (ID_Request, Image_Name, Uploader, Time_Upload) VALUES (?, ?, ?, NOW())",
          [idRequest, filename, uploader]
        );
        savedRecords.push(filename);
      } catch (dbErr) {
        console.error("Database insert Image error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menyimpan ${savedRecords.length} foto`,
      count: savedRecords.length,
      files: savedRecords,
    });
  } catch (error) {
    console.error("uploadcaseimage error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
