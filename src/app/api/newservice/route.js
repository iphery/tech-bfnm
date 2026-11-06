import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureServiceSchema } from "@/lib/serviceSchema";

export async function POST(request) {
  try {
    await ensureServiceSchema(pool);

    const body = await request.json();
    const { date, list, uid } = body;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    const ss = pad(now.getSeconds());

    const created_at = `${now.getFullYear()}-${mm}-${dd} ${hh}:${min}:${ss}`;
    const id_register = `DPS${yy}${mm}${dd}${hh}${min}${ss}`;

    await pool.query(
      `INSERT INTO service (id_register, date_issued, status, created_by, created_at)
       VALUES (?, ?, 0, ?, ?)`,
      [id_register, date || `${now.getFullYear()}-${mm}-${dd}`, uid, created_at]
    );

    if (Array.isArray(list)) {
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const ids = `SD${yy}${mm}${dd}${hh}${min}${ss}${i}`;

        // Ensure target allocation is mutually exclusive
        let finalIdRequest = null;
        let finalIdAsset = null;
        let finalIdPart = null;

        if (item.idPart) {
          finalIdPart = item.idPart;
        } else if (item.idRequest) {
          finalIdRequest = item.idRequest;
        } else if (item.idAsset) {
          finalIdAsset = item.idAsset;
        }

        await pool.query(
          `INSERT INTO service_detail (ids, id_register, item, unit, quantity, required_date, remark, id_request, id_asset, id_part)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ids,
            id_register,
            item.item || "",
            item.unit || "",
            Number(item.quantity) || 0,
            item.date || null,
            item.remark || "",
            finalIdRequest,
            finalIdAsset,
            finalIdPart,
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      id_register: id_register,
      response: "Order service (DPS) berhasil dibuat.",
    });
  } catch (error) {
    console.error("newservice error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
