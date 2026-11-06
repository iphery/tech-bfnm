import pool from "@/lib/db";

/**
 * Ensure service_detail table has id_asset and id_part columns.
 */
export async function ensureServiceSchema(connection = pool) {
  try {
    const [dbRows] = await connection.query("SELECT DATABASE() AS current_db");
    const currentDb = dbRows[0]?.current_db;
    if (!currentDb) return;

    const [existingCols] = await connection.query(
      `SELECT COLUMN_NAME 
       FROM information_schema.columns 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'service_detail'`,
      [currentDb]
    );

    const colNames = new Set(
      existingCols.map((c) => c.COLUMN_NAME.toLowerCase())
    );

    if (!colNames.has("id_asset")) {
      try {
        await connection.query(
          "ALTER TABLE `service_detail` ADD COLUMN `id_asset` VARCHAR(50) NULL AFTER `id_request`"
        );
      } catch (e) {
        console.error("Failed to add id_asset column:", e.message);
      }
    }

    if (!colNames.has("id_part")) {
      try {
        await connection.query(
          "ALTER TABLE `service_detail` ADD COLUMN `id_part` VARCHAR(50) NULL AFTER `id_asset`"
        );
      } catch (e) {
        console.error("Failed to add id_part column:", e.message);
      }
    }
  } catch (err) {
    console.error("ensureServiceSchema error:", err);
  }
}

