import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Indexes to ensure optimal performance across the application
const REQUIRED_INDEXES = [
  // 1. stock_summary (Crucial for inventory movements, stock card, usage history, charts)
  {
    table: "stock_summary",
    name: "idx_ss_part_qty_date",
    columns: ["id_part", "qty", "date"],
  },
  {
    table: "stock_summary",
    name: "idx_ss_qty_date",
    columns: ["qty", "date"],
  },
  {
    table: "stock_summary",
    name: "idx_ss_asset",
    columns: ["id_asset"],
  },
  {
    table: "stock_summary",
    name: "idx_ss_idfor",
    columns: ["id_for"],
  },
  {
    table: "stock_summary",
    name: "idx_ss_date",
    columns: ["date"],
  },

  // 2. stockin & stockout (Crucial for real-time warehouse available stock calculation)
  {
    table: "stockin",
    name: "idx_stockin_part_qty",
    columns: ["id_part", "qty"],
  },
  {
    table: "stockout",
    name: "idx_stockout_part_qty",
    columns: ["id_part", "qty"],
  },

  // 3. parts (Crucial for active parts lookup, search, and sorting)
  {
    table: "parts",
    name: "idx_parts_status",
    columns: ["status"],
  },
  {
    table: "parts",
    name: "idx_parts_vendor",
    columns: ["vendor_code"],
  },

  // 4. order_detail & order_main (Crucial for DPM/PO lookup, lead time, purchase price, budget)
  {
    table: "order_detail",
    name: "idx_od_register",
    columns: ["id_register"],
  },
  {
    table: "order_detail",
    name: "idx_od_part",
    columns: ["id_part"],
  },
  {
    table: "order_detail",
    name: "idx_od_service",
    columns: ["id_service"],
  },
  {
    table: "order_detail",
    name: "idx_od_budget",
    columns: ["budget_pos"],
  },
  {
    table: "order_main",
    name: "idx_om_dates",
    columns: ["date", "receive_date"],
  },
  {
    table: "order_main",
    name: "idx_om_status",
    columns: ["status"],
  },

  // 5. Request (Crucial for maintenance dashboard, outstanding tickets, CM/PM metrics)
  {
    table: "Request",
    name: "idx_req_asset_step",
    columns: ["ID_Asset", "Step"],
  },
  {
    table: "Request",
    name: "idx_req_step_type",
    columns: ["Step", "Maintenance_Type"],
  },
  {
    table: "Request",
    name: "idx_req_time",
    columns: ["Time_Request"],
  },

  // 6. service_detail & service (Crucial for external repairs and budget summary)
  {
    table: "service_detail",
    name: "idx_sd_register",
    columns: ["id_register"],
  },
  {
    table: "service_detail",
    name: "idx_sd_request",
    columns: ["id_request"],
  },
  {
    table: "service_detail",
    name: "idx_sd_budget",
    columns: ["budget_pos"],
  },

  // 7. Assets (Asset type filtering)
  {
    table: "Assets",
    name: "idx_assets_type",
    columns: ["Type"],
  },

  // 8. FIFO Inventory Valuation (Crucial for stock_fifo_batches and stock_fifo_out_allocations)
  {
    table: "stock_fifo_batches",
    name: "idx_fifo_part_rem",
    columns: ["id_part", "qty_remaining"],
  },
  {
    table: "stock_fifo_batches",
    name: "idx_fifo_date_rec",
    columns: ["date_received"],
  },
  {
    table: "stock_fifo_out_allocations",
    name: "idx_fifo_alloc_stockout",
    columns: ["id_stock_out"],
  },
  {
    table: "stock_out",
    name: "idx_stockout_costs",
    columns: ["id_part", "total_cost"],
  },
];

export async function GET() {
  return handleOptimizeDatabase();
}

export async function POST() {
  return handleOptimizeDatabase();
}

async function handleOptimizeDatabase() {
  const startTime = Date.now();
  const results = {
    added: [],
    existing: [],
    skipped: [],
    analyzed_tables: [],
    errors: [],
  };

  try {
    // 1. Get database name
    const [dbRows] = await pool.query("SELECT DATABASE() AS current_db");
    const currentDb = dbRows[0]?.current_db;

    if (!currentDb) {
      return NextResponse.json(
        { success: false, error: "Database name not found" },
        { status: 500 }
      );
    }

    // 2. Fetch all existing indexes in current database
    const [existingIndexes] = await pool.query(
      `SELECT TABLE_NAME, INDEX_NAME 
       FROM information_schema.statistics 
       WHERE TABLE_SCHEMA = ?`,
      [currentDb]
    );

    const indexLookup = new Set(
      existingIndexes.map(
        (row) => `${row.TABLE_NAME.toLowerCase()}.${row.INDEX_NAME.toLowerCase()}`
      )
    );

    // 3. Fetch existing tables
    const [existingTablesRows] = await pool.query(
      `SELECT TABLE_NAME 
       FROM information_schema.tables 
       WHERE TABLE_SCHEMA = ?`,
      [currentDb]
    );
    const tableLookup = new Set(
      existingTablesRows.map((r) => r.TABLE_NAME.toLowerCase())
    );

    // 4. Iterate over required indexes and create if missing
    for (const item of REQUIRED_INDEXES) {
      const tableLower = item.table.toLowerCase();
      const indexLower = item.name.toLowerCase();

      // Check if table exists
      if (!tableLookup.has(tableLower)) {
        results.skipped.push({
          table: item.table,
          index: item.name,
          reason: "Tabel tidak ditemukan di database",
        });
        continue;
      }

      // Check if index already exists
      const key = `${tableLower}.${indexLower}`;
      if (indexLookup.has(key)) {
        results.existing.push({
          table: item.table,
          index: item.name,
          columns: item.columns,
        });
        continue;
      }

      // Create index safely
      try {
        const colList = item.columns.map((c) => `\`${c}\``).join(", ");
        const sql = `CREATE INDEX \`${item.name}\` ON \`${item.table}\` (${colList})`;
        await pool.query(sql);
        results.added.push({
          table: item.table,
          index: item.name,
          columns: item.columns,
        });
        indexLookup.add(key);
      } catch (err) {
        console.error(`Error creating index ${item.name} on ${item.table}:`, err);
        results.errors.push({
          table: item.table,
          index: item.name,
          error: err.message,
        });
      }
    }

    // 5. Run ANALYZE TABLE to optimize query planner statistics
    const tablesToAnalyze = [
      ...new Set(
        REQUIRED_INDEXES.filter((i) =>
          tableLookup.has(i.table.toLowerCase())
        ).map((i) => i.table)
      ),
    ];

    for (const t of tablesToAnalyze) {
      try {
        await pool.query(`ANALYZE TABLE \`${t}\``);
        results.analyzed_tables.push(t);
      } catch (e) {
        console.warn(`Analyze table ${t} warning:`, e.message);
      }
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Optimasi database berhasil diselesaikan dalam ${durationMs}ms`,
      duration_ms: durationMs,
      summary: {
        total_indexes_checked: REQUIRED_INDEXES.length,
        new_indexes_created: results.added.length,
        already_existing_indexes: results.existing.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
      details: results,
    });
  } catch (err) {
    console.error("Database optimization error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}

