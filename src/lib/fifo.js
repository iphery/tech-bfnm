import pool from "./db";

/**
 * Ensure FIFO tables and columns exist in MySQL database.
 */
export async function initFifoSchema(connection = pool) {
  // 1. Table for FIFO Inward Batches / Layers
  await connection.query(`
    CREATE TABLE IF NOT EXISTS stock_fifo_batches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      batch_id VARCHAR(100) NOT NULL,
      id_part VARCHAR(100) NOT NULL,
      id_order VARCHAR(100) DEFAULT NULL,
      date_received DATETIME NOT NULL,
      qty_initial DOUBLE NOT NULL DEFAULT 0,
      qty_remaining DOUBLE NOT NULL DEFAULT 0,
      unit_price DOUBLE NOT NULL DEFAULT 0,
      total_amount DOUBLE NOT NULL DEFAULT 0,
      seller VARCHAR(255) DEFAULT NULL,
      source VARCHAR(50) NOT NULL DEFAULT 'PO',
      created_at DATETIME NOT NULL,
      INDEX idx_part_rem (id_part, qty_remaining),
      INDEX idx_date (date_received),
      INDEX idx_order (id_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Table for Detailed FIFO Outflow Allocations
  await connection.query(`
    CREATE TABLE IF NOT EXISTS stock_fifo_out_allocations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_stock_out VARCHAR(100) NOT NULL,
      id_part VARCHAR(100) NOT NULL,
      batch_id INT NOT NULL,
      qty_allocated DOUBLE NOT NULL DEFAULT 0,
      unit_price DOUBLE NOT NULL DEFAULT 0,
      total_cost DOUBLE NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL,
      INDEX idx_stock_out (id_stock_out),
      INDEX idx_part (id_part),
      INDEX idx_batch (batch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 3. Add columns to stock_out if missing
  const [dbRows] = await connection.query("SELECT DATABASE() AS current_db");
  const currentDb = dbRows[0]?.current_db;

  if (currentDb) {
    const [existingCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'stock_out'
    `, [currentDb]);

    const colNames = new Set(existingCols.map((c) => c.COLUMN_NAME.toLowerCase()));

    if (!colNames.has("unit_cost")) {
      try {
        await connection.query(`ALTER TABLE \`stock_out\` ADD COLUMN \`unit_cost\` DOUBLE NOT NULL DEFAULT 0`);
      } catch (e) {
        console.warn("Notice adding unit_cost:", e.message);
      }
    }
    if (!colNames.has("total_cost")) {
      try {
        await connection.query(`ALTER TABLE \`stock_out\` ADD COLUMN \`total_cost\` DOUBLE NOT NULL DEFAULT 0`);
      } catch (e) {
        console.warn("Notice adding total_cost:", e.message);
      }
    }
    if (!colNames.has("cost_status")) {
      try {
        await connection.query(`ALTER TABLE \`stock_out\` ADD COLUMN \`cost_status\` VARCHAR(20) NOT NULL DEFAULT 'ALLOCATED'`);
      } catch (e) {
        console.warn("Notice adding cost_status:", e.message);
      }
    }
  }
}

/**
 * Register a new incoming batch into FIFO (called on goods receipt).
 */
export async function registerFifoIn(connection, {
  batchId,
  idPart,
  idOrder = null,
  dateReceived = new Date(),
  quantity,
  unitPrice = 0,
  totalAmount = 0,
  seller = null,
  source = "PO",
}) {
  await initFifoSchema(connection);

  const cleanDate = dateReceived instanceof Date
    ? dateReceived.toISOString().slice(0, 19).replace('T', ' ')
    : String(dateReceived);

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const cleanUnitPrice = Number(unitPrice) || 0;
  const cleanQty = Number(quantity) || 0;
  const cleanTotal = Number(totalAmount) || (cleanQty * cleanUnitPrice);

  const [res] = await connection.query(`
    INSERT INTO stock_fifo_batches (
      batch_id, id_part, id_order, date_received, qty_initial, qty_remaining,
      unit_price, total_amount, seller, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    batchId,
    idPart,
    idOrder,
    cleanDate,
    cleanQty,
    cleanQty,
    cleanUnitPrice,
    cleanTotal,
    seller,
    source,
    now,
  ]);

  return res.insertId;
}

/**
 * Allocate stock out using FIFO rules for a single transaction (used by /api/transout).
 */
export async function allocateFifoOut(connection, {
  idStockOut,
  idPart,
  quantity,
  date = new Date(),
}) {
  await initFifoSchema(connection);

  const reqQty = Number(quantity) || 0;
  if (reqQty <= 0) {
    return { unitCost: 0, totalCost: 0, allocations: [] };
  }

  // Fetch active batches for this part sorted by date received (oldest first)
  const [batches] = await connection.query(`
    SELECT id, batch_id, qty_remaining, unit_price, seller, date_received
    FROM stock_fifo_batches
    WHERE id_part = ? AND qty_remaining > 0
    ORDER BY date_received ASC, id ASC
  `, [idPart]);

  let remainingToFulfill = reqQty;
  let totalCost = 0;
  const allocations = [];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  for (const batch of batches) {
    if (remainingToFulfill <= 0) break;

    const available = Number(batch.qty_remaining);
    const take = Math.min(available, remainingToFulfill);
    const cost = take * Number(batch.unit_price);

    totalCost += cost;
    remainingToFulfill -= take;

    await connection.query(`
      UPDATE stock_fifo_batches 
      SET qty_remaining = qty_remaining - ? 
      WHERE id = ?
    `, [take, batch.id]);

    await connection.query(`
      INSERT INTO stock_fifo_out_allocations (
        id_stock_out, id_part, batch_id, qty_allocated, unit_price, total_cost, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      idStockOut,
      idPart,
      batch.id,
      take,
      batch.unit_price,
      cost,
      now,
    ]);

    allocations.push({
      batchId: batch.id,
      batchRef: batch.batch_id,
      qty: take,
      unitPrice: batch.unit_price,
      cost,
    });
  }

  // If deficit, use fallback price
  if (remainingToFulfill > 0) {
    let fallbackUnitPrice = 0;
    try {
      const [latestPriceRows] = await connection.query(`
        SELECT od.amount, od.quantity, ROUND(od.amount / NULLIF(od.quantity, 0), 2) as unit_price
        FROM order_detail od
        WHERE od.id_part = ? AND od.amount > 10 AND od.quantity > 0
        ORDER BY od.amount DESC, od.ids DESC
        LIMIT 1
      `, [idPart]);

      if (latestPriceRows && latestPriceRows[0]?.unit_price > 0) {
        fallbackUnitPrice = Number(latestPriceRows[0].unit_price);
      } else if (batches.length > 0) {
        fallbackUnitPrice = Number(batches[batches.length - 1].unit_price);
      }
    } catch (e) {
      console.warn("Fallback price lookup warning:", e.message);
    }

    const deficitCost = remainingToFulfill * fallbackUnitPrice;
    totalCost += deficitCost;

    allocations.push({
      batchId: 0,
      batchRef: "DEFICIT_FALLBACK",
      qty: remainingToFulfill,
      unitPrice: fallbackUnitPrice,
      cost: deficitCost,
    });
  }

  const avgUnitCost = reqQty > 0 ? Math.round((totalCost / reqQty) * 100) / 100 : 0;
  totalCost = Math.round(totalCost);

  await connection.query(`
    UPDATE stock_out 
    SET unit_cost = ?, total_cost = ?, cost_status = 'ALLOCATED'
    WHERE id_register = ?
  `, [avgUnitCost, totalCost, idStockOut]);

  return {
    unitCost: avgUnitCost,
    totalCost,
    allocations,
  };
}

/**
 * High-performance In-Memory Sync & Replay of All Historical FIFO Layers.
 * Uses batch database reads and bulk writes for speed.
 */
export async function syncAllFifoData(connection = pool) {
  await initFifoSchema(connection);

  // 1. Reset FIFO tracking tables
  await connection.query("TRUNCATE TABLE stock_fifo_out_allocations");
  await connection.query("TRUNCATE TABLE stock_fifo_batches");

  // 2. Pre-fetch purchase prices per part for fallback / initial stock valuation
  const [allPrices] = await connection.query(`
    SELECT od.id_part, ROUND(od.amount / NULLIF(od.quantity, 0), 2) as unit_price, od.seller
    FROM order_detail od
    WHERE od.amount > 0 AND od.quantity > 0 AND od.id_part IS NOT NULL AND od.id_part != ''
    ORDER BY od.amount DESC, od.ids DESC
  `);

  const initialPriceMap = new Map();
  (allPrices || []).forEach((row) => {
    const uPrice = Number(row.unit_price) || 0;
    if (uPrice > 10 && !initialPriceMap.has(row.id_part)) {
      initialPriceMap.set(row.id_part, {
        unit_price: uPrice,
        seller: row.seller || "Purchase History",
      });
    }
  });

  // 3. Collect Initial Stock from parts table
  const [initialParts] = await connection.query(`
    SELECT id_part, initial_stock, description 
    FROM parts 
    WHERE initial_stock > 0
  `);

  const initialBatchRows = [];
  for (const part of initialParts) {
    const qty = Number(part.initial_stock || 0);
    if (qty > 0) {
      const priceInfo = initialPriceMap.get(part.id_part);
      const unitPrice = priceInfo?.unit_price || 0;
      const totalAmt = qty * unitPrice;
      initialBatchRows.push([
        `INIT_${part.id_part}`,
        part.id_part,
        'INITIAL',
        '2020-01-01 00:00:00',
        qty,
        qty,
        unitPrice,
        totalAmt,
        priceInfo?.seller || 'Stok Awal',
        'INITIAL_STOCK',
        '2020-01-01 00:00:00',
      ]);
    }
  }

  // Bulk insert initial batches in chunks of 500
  if (initialBatchRows.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < initialBatchRows.length; i += chunkSize) {
      const chunk = initialBatchRows.slice(i, i + chunkSize);
      await connection.query(`
        INSERT INTO stock_fifo_batches (
          batch_id, id_part, id_order, date_received, qty_initial, qty_remaining,
          unit_price, total_amount, seller, source, created_at
        ) VALUES ?
      `, [chunk]);
    }
  }

  // 4. Collect Goods Receipts from stock_in linked to order_detail
  const [stockInRows] = await connection.query(`
    SELECT 
      si.id_register as batch_id,
      si.id_order,
      si.id_part,
      si.quantity,
      si.created_at,
      COALESCE(om.receive_date, om.date, si.created_at) as date_received,
      COALESCE(od.amount, 0) as po_amount,
      COALESCE(od.quantity, si.quantity) as po_qty,
      od.seller,
      CASE 
        WHEN od.quantity > 0 AND od.amount > 0 THEN ROUND(od.amount / od.quantity, 2)
        ELSE 0 
      END as unit_price
    FROM stock_in si
    LEFT JOIN order_main om ON om.id_register = si.id_order
    LEFT JOIN order_detail od ON od.id_register = si.id_order AND od.id_part = si.id_part
    ORDER BY COALESCE(om.receive_date, om.date, si.created_at) ASC, si.id_register ASC
  `);

  const poBatchRows = [];
  for (const row of stockInRows) {
    const qty = Number(row.quantity || 0);
    if (qty <= 0) continue;

    let unitPrice = Number(row.unit_price) || 0;
    if (unitPrice <= 10 && initialPriceMap.has(row.id_part)) {
      unitPrice = initialPriceMap.get(row.id_part).unit_price;
    }

    const totalAmt = qty * unitPrice;
    const dateRec = row.date_received instanceof Date
      ? row.date_received.toISOString().slice(0, 19).replace('T', ' ')
      : String(row.date_received || '2023-01-01 00:00:00');

    const createdRec = row.created_at instanceof Date
      ? row.created_at.toISOString().slice(0, 19).replace('T', ' ')
      : String(row.created_at || dateRec);

    poBatchRows.push([
      row.batch_id,
      row.id_part,
      row.id_order,
      dateRec,
      qty,
      qty,
      unitPrice,
      totalAmt,
      row.seller || 'PO Supplier',
      'PO',
      createdRec,
    ]);
  }

  if (poBatchRows.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < poBatchRows.length; i += chunkSize) {
      const chunk = poBatchRows.slice(i, i + chunkSize);
      await connection.query(`
        INSERT INTO stock_fifo_batches (
          batch_id, id_part, id_order, date_received, qty_initial, qty_remaining,
          unit_price, total_amount, seller, source, created_at
        ) VALUES ?
      `, [chunk]);
    }
  }

  // 5. Load all batches into in-memory queue structured by part
  const [loadedBatches] = await connection.query(`
    SELECT id, batch_id, id_part, qty_remaining, unit_price, date_received
    FROM stock_fifo_batches
    ORDER BY date_received ASC, id ASC
  `);

  const batchMap = new Map();
  for (const b of loadedBatches) {
    if (!batchMap.has(b.id_part)) {
      batchMap.set(b.id_part, []);
    }
    batchMap.get(b.id_part).push({
      id: b.id,
      batch_id: b.batch_id,
      qty_remaining: Number(b.qty_remaining),
      unit_price: Number(b.unit_price),
      date_received: b.date_received,
    });
  }

  // 6. Load all stock_out transactions chronologically
  const [stockOutRows] = await connection.query(`
    SELECT id_register, id_part, quantity, date, created_at
    FROM stock_out
    ORDER BY date ASC, created_at ASC, id_register ASC
  `);

  const allocationsToInsert = [];
  const stockOutUpdates = [];
  const modifiedBatchIds = new Set();
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  for (const so of stockOutRows) {
    const reqQty = Number(so.quantity || 0);
    if (reqQty <= 0) continue;

    const batches = batchMap.get(so.id_part) || [];
    let remaining = reqQty;
    let totalCost = 0;

    for (const b of batches) {
      if (remaining <= 0) break;
      if (b.qty_remaining <= 0) continue;

      const take = Math.min(b.qty_remaining, remaining);
      const cost = take * b.unit_price;

      b.qty_remaining -= take;
      remaining -= take;
      totalCost += cost;
      modifiedBatchIds.add(b.id);

      allocationsToInsert.push([
        so.id_register,
        so.id_part,
        b.id,
        take,
        b.unit_price,
        cost,
        now,
      ]);
    }

    if (remaining > 0) {
      // Deficit price lookup
      const fallbackPrice = initialPriceMap.get(so.id_part)?.unit_price || 0;
      const deficitCost = remaining * fallbackPrice;
      totalCost += deficitCost;

      allocationsToInsert.push([
        so.id_register,
        so.id_part,
        0,
        remaining,
        fallbackPrice,
        deficitCost,
        now,
      ]);
    }

    const avgUnitCost = reqQty > 0 ? Math.round((totalCost / reqQty) * 100) / 100 : 0;
    const roundedTotal = Math.round(totalCost);

    stockOutUpdates.push({
      id_register: so.id_register,
      unit_cost: avgUnitCost,
      total_cost: roundedTotal,
    });
  }

  // 7. Bulk insert allocations in chunks
  if (allocationsToInsert.length > 0) {
    const chunkSize = 1000;
    for (let i = 0; i < allocationsToInsert.length; i += chunkSize) {
      const chunk = allocationsToInsert.slice(i, i + chunkSize);
      await connection.query(`
        INSERT INTO stock_fifo_out_allocations (
          id_stock_out, id_part, batch_id, qty_allocated, unit_price, total_cost, created_at
        ) VALUES ?
      `, [chunk]);
    }
  }

  // 8. Bulk update modified batches remaining qty
  const batchListToUpdate = [];
  for (const list of batchMap.values()) {
    for (const b of list) {
      if (modifiedBatchIds.has(b.id)) {
        batchListToUpdate.push(b);
      }
    }
  }

  if (batchListToUpdate.length > 0) {
    const chunkSize = 200;
    for (let i = 0; i < batchListToUpdate.length; i += chunkSize) {
      const chunk = batchListToUpdate.slice(i, i + chunkSize);
      const ids = chunk.map((b) => b.id);
      const cases = chunk.map((b) => `WHEN ${b.id} THEN ${b.qty_remaining}`).join(" ");
      await connection.query(`
        UPDATE stock_fifo_batches 
        SET qty_remaining = CASE id ${cases} END 
        WHERE id IN (${ids.join(",")})
      `);
    }
  }

  // 9. Bulk update stock_out costs
  if (stockOutUpdates.length > 0) {
    const chunkSize = 200;
    for (let i = 0; i < stockOutUpdates.length; i += chunkSize) {
      const chunk = stockOutUpdates.slice(i, i + chunkSize);
      const ids = chunk.map((c) => `'${c.id_register}'`);
      const unitCases = chunk.map((c) => `WHEN '${c.id_register}' THEN ${c.unit_cost}`).join(" ");
      const totalCases = chunk.map((c) => `WHEN '${c.id_register}' THEN ${c.total_cost}`).join(" ");
      await connection.query(`
        UPDATE stock_out 
        SET unit_cost = CASE id_register ${unitCases} END,
            total_cost = CASE id_register ${totalCases} END,
            cost_status = 'ALLOCATED'
        WHERE id_register IN (${ids.join(",")})
      `);
    }
  }

  const totalValuationOut = stockOutUpdates.reduce((sum, s) => sum + s.total_cost, 0);

  return {
    success: true,
    initialBatchCount: initialBatchRows.length,
    poBatchCount: poBatchRows.length,
    totalBatchesCreated: initialBatchRows.length + poBatchRows.length,
    allocatedOutCount: stockOutUpdates.length,
    totalValuationOut,
  };
}
