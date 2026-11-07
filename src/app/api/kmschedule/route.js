import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";
//for
function getMaintenanceByFlag(flag) {
  const f = Number(flag);
  switch (f) {
    case 0:
      return { current: "Minor Service", next: "Intermediate Service" };
    case 1:
      return { current: "Intermediate Service", next: "Minor Service" };
    case 2:
      return { current: "Minor Service", next: "Full Service" };
    case 3:
      return { current: "Full Service", next: "Minor Service" };
    default:
      return { current: "Minor Service", next: "Intermediate Service" };
  }
}

// GET: ambil list data KMbasedSchedule beserta info asetnya
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";

    let sql = `
      SELECT 
        k.ID_Asset,
        k.Current_KM,
        k.Schedule_KM,
        k.Flag_KM,
        k.Current_Maintenance,
        k.Next_Maintenance,
        k.Next_KM,
        k.Late_KM,
        k.Average,
        k.Last_Service,
        k.Next_Service,
        k.Reminder,
        COALESCE(a.Description, '-') AS Description,
        COALESCE(a.No, '-') AS No,
        COALESCE(a.Model, '-') AS Model,
        COALESCE(a.Manufacture, '-') AS Manufacture,
        COALESCE(a.Type, 'K') AS Type,
        COALESCE(a.User, '-') AS User
      FROM KMbasedSchedule k
      LEFT JOIN Assets a ON a.ID_Asset = k.ID_Asset
    `;

    const params = [];
    if (search.trim()) {
      sql += ` WHERE k.ID_Asset LIKE ? OR a.Description LIKE ? OR a.No LIKE ? OR a.Model LIKE ?`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY k.ID_Asset ASC`;

    const [rows] = await pool.query(sql, params);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET /api/kmschedule error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal memuat matrix KMbasedSchedule",
      },
      { status: 500 },
    );
  }
}

// POST: update record KMbasedSchedule (Flag_KM, Current_KM, Schedule_KM)
export async function POST(request) {
  try {
    const body = await request.json();
    const { idAsset, flagKm, currentKm, scheduleKm } = body;

    if (!idAsset) {
      return NextResponse.json(
        { success: false, error: "ID_Asset wajib disertakan" },
        { status: 400 },
      );
    }

    // Ambil data lama
    const [existing] = await pool.query(
      "SELECT * FROM KMbasedSchedule WHERE ID_Asset = ? LIMIT 1",
      [idAsset],
    );

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Record KMbasedSchedule untuk aset ${idAsset} tidak ditemukan`,
        },
        { status: 404 },
      );
    }

    const currentRecord = existing[0];

    // Nilai baru atau fallback lama
    const newFlag =
      flagKm !== undefined && flagKm !== null
        ? Number(flagKm)
        : currentRecord.Flag_KM;
    const newCurrentKm =
      currentKm !== undefined && currentKm !== null
        ? Number(currentKm)
        : currentRecord.Current_KM;
    const newScheduleKm =
      scheduleKm !== undefined && scheduleKm !== null
        ? Number(scheduleKm)
        : currentRecord.Schedule_KM;

    // Kalkulasi maintenance otomatis berdasarkan Flag_KM
    const { current: curMaint, next: nextMaint } =
      getMaintenanceByFlag(newFlag);

    // Hitung Late_KM (jika current > schedule)
    const lateKm = Number(newCurrentKm) - Number(newScheduleKm);

    await pool.query(
      `UPDATE KMbasedSchedule 
       SET Flag_KM = ?, 
           Current_KM = ?, 
           Schedule_KM = ?, 
           Current_Maintenance = ?, 
           Next_Maintenance = ?,
           Late_KM = ?
       WHERE ID_Asset = ?`,
      [
        newFlag,
        newCurrentKm,
        newScheduleKm,
        curMaint,
        nextMaint,
        lateKm,
        idAsset,
      ],
    );

    return NextResponse.json({
      success: true,
      message: `Matrix KM untuk aset ${idAsset} berhasil diperbarui.`,
      updated: {
        idAsset,
        flagKm: newFlag,
        currentKm: newCurrentKm,
        scheduleKm: newScheduleKm,
        currentMaintenance: curMaint,
        nextMaintenance: nextMaint,
        lateKm,
      },
    });
  } catch (error) {
    console.error("POST /api/kmschedule error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui matrix KM" },
      { status: 500 },
    );
  }
}
