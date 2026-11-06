import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureServiceSchema } from "@/lib/serviceSchema";

export async function POST(request) {
  try {
    await ensureServiceSchema(pool);

    const body = await request.json();
    const { idRegister, date, list } = body;

    if (!idRegister) {
      return NextResponse.json(
        { error: "idRegister is required" },
        { status: 400 }
      );
    }

    if (date) {
      await pool.query(
        "UPDATE service SET date_issued = ? WHERE id_register = ?",
        [date, idRegister]
      );
    }

    if (Array.isArray(list) && list.length > 0) {
      // 1. Fetch current items to keep amount, budget_pos, supplier if already inputted
      const [existingRows] = await pool.query(
        "SELECT * FROM service_detail WHERE id_register = ?",
        [idRegister]
      );
      const existingMap = new Map();
      existingRows.forEach((r) => existingMap.set(r.ids, r));

      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const yy = String(now.getFullYear()).slice(-2);
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = pad(now.getHours());
      const min = pad(now.getMinutes());
      const ss = pad(now.getSeconds());

      const updatedIds = new Set();

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        let ids = item.ids || item.id;

        // Ensure allocation target is mutually exclusive
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

        if (ids && existingMap.has(ids)) {
          // Update existing item
          const existing = existingMap.get(ids);
          await pool.query(
            `UPDATE service_detail 
             SET item = ?, unit = ?, quantity = ?, required_date = ?, remark = ?,
                 id_request = ?, id_asset = ?, id_part = ?,
                 amount = ?, budget_pos = ?, supplier = ?
             WHERE ids = ? AND id_register = ?`,
            [
              item.item || "",
              item.unit || "",
              Number(item.quantity) || 0,
              item.date || null,
              item.remark || "",
              finalIdRequest,
              finalIdAsset,
              finalIdPart,
              item.amount !== undefined ? Number(item.amount) : existing.amount,
              item.budget_pos || item.budget || existing.budget_pos || null,
              item.supplier || item.seller || existing.supplier || null,
              ids,
              idRegister,
            ]
          );
          updatedIds.add(ids);
        } else {
          // Insert new row added during edit
          ids = `SD${yy}${mm}${dd}${hh}${min}${ss}${i}`;
          await pool.query(
            `INSERT INTO service_detail (ids, id_register, item, unit, quantity, required_date, remark, id_request, id_asset, id_part, amount, budget_pos, supplier)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ids,
              idRegister,
              item.item || "",
              item.unit || "",
              Number(item.quantity) || 0,
              item.date || null,
              item.remark || "",
              finalIdRequest,
              finalIdAsset,
              finalIdPart,
              Number(item.amount || 0),
              item.budget_pos || item.budget || null,
              item.supplier || item.seller || null,
            ]
          );
          updatedIds.add(ids);
        }
      }

      // Delete items removed during edit
      for (const oldRow of existingRows) {
        if (!updatedIds.has(oldRow.ids)) {
          await pool.query("DELETE FROM service_detail WHERE ids = ?", [
            oldRow.ids,
          ]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      response: "Perubahan form DPS berhasil disimpan.",
    });
  } catch (error) {
    console.error("updateservice error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

