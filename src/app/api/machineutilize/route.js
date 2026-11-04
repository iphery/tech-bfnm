import { NextResponse } from "next/server";
import db from "@/lib/db";

const holidays = [
  "2025-01-01", "2025-01-17", "2025-02-17", "2025-03-18", "2025-03-19",
  "2025-03-20", "2025-03-21", "2025-04-03", "2025-05-02", "2025-05-14",
  "2025-05-27", "2025-06-01", "2025-06-15", "2025-06-16", "2025-06-17",
  "2025-06-18", "2025-06-26", "2025-06-27", "2025-08-17", "2025-08-25",
  "2026-01-01", "2026-01-17", "2026-02-17", "2026-03-18", "2026-03-19",
  "2026-03-20", "2026-03-21", "2026-04-03", "2026-05-02", "2026-05-14",
  "2026-05-27", "2026-06-01", "2026-06-15", "2026-06-16", "2026-06-17",
  "2026-06-18", "2026-06-26", "2026-06-27", "2026-08-17", "2026-08-25",
];

function getWorkDays(year, month) {
  const workDays = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (dayOfWeek !== 0 && !holidays.includes(dateStr)) {
      workDays.push(dateStr);
    }
  }

  return workDays;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const perPage = Number(searchParams.get("per_page")) || 15;
    const page = Number(searchParams.get("page")) || 1;

    if (!bulan || !tahun) {
      return NextResponse.json(
        { status: "error", message: "Parameter bulan dan tahun wajib diisi!" },
        { status: 400 }
      );
    }

    const m = Number(bulan);
    const y = Number(tahun);
    const workDays = getWorkDays(y, m);
    const jamKerja = workDays.length * 8;

    // Fetch active production machines (MP)
    const [assets] = await db.query(
      "SELECT * FROM Assets WHERE Type = 'MP' AND nonactive = 0 ORDER BY ID_Asset ASC"
    );

    // Fetch downtime sums for all assets in this month in 1 grouped query for speed
    const [downtimeRows] = await db.query(
      `SELECT ID_Asset, SUM(TIMESTAMPDIFF(MINUTE, Time_Response, Time_Repair_Complete)) AS total_minutes
       FROM Request
       WHERE Maintenance_Type = 'CM'
         AND YEAR(Time_Request) = ?
         AND MONTH(Time_Request) = ?
         AND Time_Repair_Complete IS NOT NULL
         AND Time_Response IS NOT NULL
       GROUP BY ID_Asset`,
      [y, m]
    );

    const downtimeMap = new Map();
    for (const row of downtimeRows) {
      downtimeMap.set(row.ID_Asset, Number(row.total_minutes || 0));
    }

    // Fetch last PM requests for these assets
    const [lastPMRows] = await db.query(
      `SELECT r.ID_Asset, r.ID_Request, r.Time_Request, r.Step
       FROM Request r
       INNER JOIN (
         SELECT ID_Asset, MAX(Time_Request) AS max_time
         FROM Request
         WHERE Maintenance_Type = 'PM'
         GROUP BY ID_Asset
       ) latest ON r.ID_Asset = latest.ID_Asset AND r.Time_Request = latest.max_time`
    );

    const lastPMMap = new Map();
    for (const pm of lastPMRows) {
      lastPMMap.set(pm.ID_Asset, pm);
    }

    const result = [];
    let totalOk = 0;
    let totalNok = 0;
    let totalDowntime = 0;
    let maxDowntime = 0;

    for (const asset of assets) {
      const id = asset.ID_Asset;
      const minutes = downtimeMap.get(id) || 0;
      const downtimeHours = Number((minutes / 60).toFixed(2));
      const status = downtimeHours > jamKerja ? "NOK" : "OK";

      if (downtimeHours > maxDowntime) {
        maxDowntime = downtimeHours;
      }
      if (status === "OK") {
        totalOk++;
      } else {
        totalNok++;
      }
      totalDowntime += downtimeHours;

      const lastPM = lastPMMap.get(id);
      const lastPMDate = lastPM?.Time_Request
        ? new Date(lastPM.Time_Request).toISOString().slice(0, 10)
        : "-";

      result.push({
        ID_Asset: id,
        Description: asset.Description || "-",
        Manufacture: asset.Manufacture || "-",
        Model: asset.Model || "-",
        Class: asset.Class || "-",
        User: asset.User || "-",
        Downtime: downtimeHours,
        Status: status,
        Last_Maintenance: lastPMDate,
        Step: lastPM ? (lastPM.Step ?? 7) : 0,
        ID_Request: lastPM ? lastPM.ID_Request : "",
      });
    }

    // Pagination
    const total = result.length;
    const offset = (page - 1) * perPage;
    const paginatedItems = result.slice(offset, offset + perPage);
    const lastPage = Math.ceil(total / perPage) || 1;

    return NextResponse.json({
      status: "success",
      data: {
        periode: {
          bulan: m,
          tahun: y,
          hari_kerja: workDays.length,
          jam_kerja: jamKerja,
          work_days: workDays,
        },
        summary: {
          total_asset: total,
          ok: totalOk,
          nok: totalNok,
          total_downtime: Number(totalDowntime.toFixed(2)),
          max_downtime: maxDowntime,
        },
        assets: paginatedItems,
        pagination: {
          current_page: page,
          per_page: perPage,
          total: total,
          last_page: lastPage,
          from: total === 0 ? 0 : offset + 1,
          to: Math.min(offset + perPage, total),
        },
      },
    });
  } catch (error) {
    console.error("Error in /api/machineutilize:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

