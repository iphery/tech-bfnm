import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { idAsset } = await req.json();
    if (!idAsset) {
      return NextResponse.json({ detail: [], error: "idAsset required" }, { status: 400 });
    }

    const [assets] = await db.query("SELECT * FROM Assets WHERE ID_Asset = ?", [idAsset]);
    if (assets.length === 0) {
      return NextResponse.json({
        detail: [],
        open_service: 0,
        open_maintenance: 0,
        last_seen: 0,
        ratio: 0,
        next_service: null,
      });
    }

    const asset = assets[0];
    const assetType = asset.Type;
    const assetBased = asset.Based;

    let lastSeenFuel = 0;
    let ratio = 0;
    let nextService = null;

    if (assetType === "K" && assetBased === "KM") {
      try {
        const [[kmRow]] = await db.query(
          "SELECT Next_KM FROM KMbasedSchedule WHERE ID_Asset = ? LIMIT 1",
          [idAsset]
        );
        nextService = kmRow?.Next_KM || null;

        const [fuelRows] = await db.query(
          "SELECT KM_2, Ratio FROM Fuel WHERE ID_Asset = ? ORDER BY Time DESC LIMIT 1",
          [idAsset]
        );
        if (fuelRows.length > 0) {
          lastSeenFuel = fuelRows[0].KM_2 || 0;
          ratio = fuelRows[0].Ratio || 0;
        }
      } catch (err) {
        console.error("KM / Fuel query error:", err);
      }
    } else {
      try {
        const [[timeRow]] = await db.query(
          "SELECT Next_Service FROM TimebasedSchedule WHERE ID_Asset = ? LIMIT 1",
          [idAsset]
        );
        nextService = timeRow?.Next_Service || null;
      } catch (err) {
        console.error("TimebasedSchedule query error:", err);
      }
    }

    // Check open CM service (Step < 7)
    const [cmRows] = await db.query(
      "SELECT ID_Request, Step, Problem, Time_Request, Time_Response, Technician FROM Request WHERE ID_Asset = ? AND Maintenance_Type = 'CM' AND Step < 7 ORDER BY Time_Request DESC LIMIT 1",
      [idAsset]
    );
    const activeCM = cmRows.length > 0 ? cmRows[0] : null;
    const openService = activeCM ? 1 : 0;

    // Check open PM service (Step < 7)
    const [pmRows] = await db.query(
      "SELECT ID_Request, Step, Problem, Time_Request, Time_Response, Technician FROM Request WHERE ID_Asset = ? AND Maintenance_Type = 'PM' AND Step < 7 ORDER BY Time_Request DESC LIMIT 1",
      [idAsset]
    );
    const activePM = pmRows.length > 0 ? pmRows[0] : null;
    const openMaintenance = activePM ? 1 : 0;

    return NextResponse.json({
      detail: assets,
      open_service: openService,
      open_maintenance: openMaintenance,
      active_cm: activeCM,
      active_pm: activePM,
      last_seen: lastSeenFuel,
      ratio: ratio,
      next_service: nextService,
    });
  } catch (error) {
    console.error("Error in /api/fetchassetdetail:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

