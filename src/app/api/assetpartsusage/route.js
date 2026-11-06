import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  return handleAssetPartsUsage(request);
}

export async function GET(request) {
  return handleAssetPartsUsage(request);
}

async function handleAssetPartsUsage(request) {
  try {
    let body = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    } else {
      const url = new URL(request.url);
      body = {
        idAsset: url.searchParams.get('idAsset'),
        month: url.searchParams.get('month'),
        year: url.searchParams.get('year'),
      };
    }

    const { idAsset, month, year } = body;

    if (!idAsset) {
      return NextResponse.json({ error: 'idAsset is required' }, { status: 400 });
    }

    // 1. Fetch purchase prices per part from order_detail (global cache by id_part & description)
    let priceMap = new Map();
    let itemNamePriceMap = new Map();
    try {
      const [allOrderPrices] = await pool.query(
        `SELECT od.id_part, 
                od.description, 
                od.amount, 
                od.quantity,
                ROUND(od.amount / NULLIF(od.quantity, 0)) as unit_price,
                od.seller
         FROM order_detail od
         WHERE od.amount > 0 AND od.quantity > 0
         ORDER BY od.amount DESC, od.ids DESC`
      );
      (allOrderPrices || []).forEach((p) => {
        const uPrice = Number(p.unit_price) || (Number(p.amount) / Math.max(1, Number(p.quantity || 1)));
        const seller = p.seller || '';
        const cleanDesc = (p.description || '').trim().toLowerCase();

        if (p.id_part) {
          const curr = priceMap.get(p.id_part);
          // Prefer realistic price (> 10) over dummy nominal numbers (1, 5)
          if (!curr || (curr.unit_price <= 10 && uPrice > 10)) {
            priceMap.set(p.id_part, { unit_price: uPrice, seller });
          }
        }
        if (cleanDesc) {
          const curr = itemNamePriceMap.get(cleanDesc);
          if (!curr || (curr.unit_price <= 10 && uPrice > 10)) {
            itemNamePriceMap.set(cleanDesc, { unit_price: uPrice, seller });
          }
        }
      });
    } catch (e) {
      console.error('Error fetching part prices:', e);
    }

    // 1b. Fetch all orders and specific pricing tied to this machine's tickets (Request.ID_Asset = ?)
    let machineOrders = [];
    let ticketPartCosts = new Map();
    try {
      const [orderRows] = await pool.query(
        `SELECT od.ids, 
                od.id_register, 
                od.id_part, 
                od.description, 
                od.amount, 
                od.seller, 
                od.quantity, 
                od.stock,
                od.id_service,
                od.id_service as request_id,
                COALESCE(p.description, od.description, 'Suku Cadang') as part_name,
                COALESCE(p.vendor_code, od.id_part, '-') as vendor_code,
                COALESCE(p.unit, 'pcs') as unit,
                COALESCE(p.location, '-') as location,
                COALESCE(m.dpm, od.id_register) as dpm,
                COALESCE(r.Time_Request, m.receive_date, m.date, NOW()) as date,
                r.Problem as subject,
                ROUND(od.amount / NULLIF(od.quantity, 0)) as unit_price,
                DATE_FORMAT(COALESCE(r.Time_Request, m.receive_date, m.date, NOW()), '%Y-%m') as month_key,
                DATE_FORMAT(COALESCE(r.Time_Request, m.receive_date, m.date, NOW()), '%M %Y') as month_label,
                DATE_FORMAT(COALESCE(r.Time_Request, m.receive_date, m.date, NOW()), '%Y') as year_val,
                DATE_FORMAT(COALESCE(r.Time_Request, m.receive_date, m.date, NOW()), '%m') as month_val
         FROM order_detail od
         INNER JOIN Request r ON (TRIM(r.ID_Request) = TRIM(od.id_service) OR TRIM(r.ID_Request) = TRIM(od.id_register))
         LEFT JOIN order_main m ON TRIM(m.id_register) = TRIM(od.id_register)
         LEFT JOIN parts p ON (p.id_part = od.id_part OR (od.id_part IS NOT NULL AND od.id_part != '' AND p.id_part = od.id_part) OR p.description = od.description)
         WHERE r.ID_Asset = ?
         ORDER BY od.ids DESC`,
        [idAsset]
      );
      machineOrders = orderRows || [];

      machineOrders.forEach((mo) => {
        const uPrice = Number(mo.unit_price) || (Number(mo.amount) / Math.max(1, Number(mo.quantity || 1)));
        const costObj = {
          ids: mo.ids,
          unit_price: uPrice,
          amount: Number(mo.amount) || 0,
          quantity: Number(mo.quantity) || 1,
          seller: mo.seller || '',
          dpm: mo.dpm || mo.id_register || '',
          stock: mo.stock || '',
          matched: false,
        };

        const reqId = (mo.id_service || '').trim();
        const partId = (mo.id_part || '').trim();
        const descClean = (mo.description || '').trim().toLowerCase();

        if (reqId && partId) {
          ticketPartCosts.set(`${reqId}_${partId}`, costObj);
        }
        if (reqId && descClean) {
          ticketPartCosts.set(`${reqId}_${descClean}`, costObj);
        }

        // Also enrich fallback price map if this machine has order pricing
        if (partId && (!priceMap.has(partId) || priceMap.get(partId).unit_price === 0)) {
          priceMap.set(partId, { unit_price: uPrice, seller: mo.seller || '' });
        }
        if (descClean && (!itemNamePriceMap.has(descClean) || itemNamePriceMap.get(descClean).unit_price === 0)) {
          itemNamePriceMap.set(descClean, { unit_price: uPrice, seller: mo.seller || '' });
        }
      });
    } catch (e) {
      console.error('Error fetching machine orders:', e);
      machineOrders = [];
    }

    // 2. Fetch all spare part usage logs for this specific machine from warehouse (stock_summary)
    let usageLogs = [];
    try {
      let queryParams = [idAsset, idAsset];
      let dateFilter = '';

      if (month && year) {
        const pad = (n) => String(n).padStart(2, '0');
        const startOfMonth = `${year}-${pad(month)}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endOfMonth = `${year}-${pad(month)}-${pad(lastDay)}`;
        dateFilter = 'AND DATE(stock_summary.date) >= ? AND DATE(stock_summary.date) <= ?';
        queryParams.push(startOfMonth, endOfMonth);
      }

      const [summaryRows] = await pool.query(
        `SELECT 
           stock_summary.id_part,
           parts.description,
           parts.description as part_name,
           parts.vendor_code,
           parts.unit,
           parts.location,
           stock_summary.quantity,
           stock_summary.date,
           stock_summary.id_for,
           stock_summary.id_for as request_id,
           stock_summary.subject,
           stock_summary.id_transaction,
           COALESCE(so.unit_cost, 0) as fifo_unit_cost,
           COALESCE(so.total_cost, 0) as fifo_total_cost,
           DATE_FORMAT(stock_summary.date, '%Y-%m') as month_key,
           DATE_FORMAT(stock_summary.date, '%M %Y') as month_label,
           DATE_FORMAT(stock_summary.date, '%Y') as year_val,
           DATE_FORMAT(stock_summary.date, '%m') as month_val
         FROM stock_summary
         INNER JOIN parts ON parts.id_part = stock_summary.id_part
         LEFT JOIN stock_out so ON so.id_register = stock_summary.id_transaction
         WHERE (stock_summary.id_asset = ? OR stock_summary.id_for IN (SELECT ID_Request FROM Request WHERE ID_Asset = ?)) 
           AND stock_summary.qty < 0
         ${dateFilter}
         ORDER BY stock_summary.date DESC`,
        queryParams
      );
      usageLogs = summaryRows || [];
    } catch (e) {
      console.error('Error fetching warehouse usage logs:', e);
      usageLogs = [];
    }

    // 2b. Combine warehouse stock usage with direct repair order procurement
    const allCombinedLogs = [];

    usageLogs.forEach((row) => {
      const qty = Number(row.quantity || 0);
      const reqId = (row.request_id || row.id_for || '').trim();
      const partId = (row.id_part || '').trim();
      const partDesc = (row.description || row.part_name || '').trim().toLowerCase();

      // Look up specific ticket pricing
      let ticketCost = null;
      if (reqId && partId && ticketPartCosts.has(`${reqId}_${partId}`)) {
        ticketCost = ticketPartCosts.get(`${reqId}_${partId}`);
      } else if (reqId && partDesc && ticketPartCosts.has(`${reqId}_${partDesc}`)) {
        ticketCost = ticketPartCosts.get(`${reqId}_${partDesc}`);
      }

      if (ticketCost) {
        ticketCost.matched = true;
      }

      const fallbackPrice = priceMap.get(partId) || itemNamePriceMap.get(partDesc);
      const fifoUnit = Number(row.fifo_unit_cost || 0);
      const fifoTotal = Number(row.fifo_total_cost || 0);

      const unitPrice = fifoUnit > 0
        ? fifoUnit
        : (ticketCost?.unit_price || fallbackPrice?.unit_price || 0);

      const partCost = fifoTotal > 0
        ? fifoTotal
        : Math.round(qty * unitPrice);

      const supplier = ticketCost?.seller || fallbackPrice?.seller || '-';
      const dpm = row.id_transaction || ticketCost?.dpm || '-';

      allCombinedLogs.push({
        id_part: row.id_part,
        description: row.description || row.part_name,
        part_name: row.part_name || row.description,
        vendor_code: row.vendor_code || '',
        unit: row.unit || 'pcs',
        location: row.location || '-',
        qty: qty,
        quantity: qty,
        unit_price: unitPrice,
        total_cost: partCost,
        supplier: supplier,
        dpm: dpm,
        source: 'Gudang (FIFO)',
        date: row.date,
        id_for: reqId || '-',
        request_id: reqId || '-',
        subject: row.subject || '-',
        month_key: row.month_key,
        month_label: row.month_label,
        year_val: row.year_val,
        month_val: row.month_val,
      });
    });

    // Add orders from machineOrders that were NOT already matched to warehouse stockout
    // (e.g. Non-Stock or direct orders for that repair ticket!)
    machineOrders.forEach((mo) => {
      const reqId = (mo.id_service || '').trim();
      const partId = (mo.id_part || '').trim();
      const itemDesc = (mo.description || '').trim().toLowerCase();

      const costObj = (partId && ticketPartCosts.get(`${reqId}_${partId}`)) ||
                      (itemDesc && ticketPartCosts.get(`${reqId}_${itemDesc}`));

      // Non-Stock orders NEVER come from warehouse inventory (stock_summary), so they must ALWAYS be included.
      const isNonStock = (mo.stock || '').toLowerCase().includes('non');
      const alreadyMatched = !isNonStock && costObj && costObj.matched;

      if (!alreadyMatched) {
        // If date filter active, check month and year
        if (month && year) {
          if (parseInt(mo.year_val, 10) !== parseInt(year, 10) || parseInt(mo.month_val, 10) !== parseInt(month, 10)) {
            return;
          }
        }

        const qty = Number(mo.quantity) || 1;
        const uPrice = Number(mo.unit_price) || (Number(mo.amount) / Math.max(1, qty));
        const totalCost = Number(mo.amount) > 0 ? Number(mo.amount) : Math.round(qty * uPrice);

        allCombinedLogs.push({
          id_part: mo.id_part || String(mo.ids),
          description: mo.description || 'Suku Cadang DPM',
          part_name: mo.part_name || mo.description || 'Suku Cadang DPM',
          vendor_code: mo.vendor_code || mo.id_part || '-',
          unit: mo.unit || 'pcs',
          location: mo.location || '-',
          qty: qty,
          quantity: qty,
          unit_price: uPrice,
          total_cost: totalCost,
          supplier: mo.seller || '-',
          dpm: mo.dpm || mo.id_register || '-',
          source: isNonStock ? 'Pengadaan DPM (Non-Stock)' : 'Order Stok',
          date: mo.date,
          id_for: reqId || '-',
          request_id: reqId || '-',
          subject: mo.subject || `Order Pengadaan #${mo.dpm || mo.id_register}`,
          month_key: mo.month_key,
          month_label: mo.month_label,
          year_val: mo.year_val,
          month_val: mo.month_val,
        });

        if (costObj) costObj.matched = true;
      }
    });

    // Sort all combined logs descending by date
    allCombinedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 3. Fetch external services / vendor repairs for this machine
    let externalServices = [];
    try {
      const [serviceRows] = await pool.query(
        `SELECT 
           sd.id_register,
           sd.item,
           sd.amount,
           sd.quantity,
           sd.supplier,
           sd.id_request,
           sd.id_asset,
           COALESCE(s.date_issued, r.Time_Request, NOW()) as date,
           DATE_FORMAT(COALESCE(s.date_issued, r.Time_Request, NOW()), '%Y-%m') as month_key,
           DATE_FORMAT(COALESCE(s.date_issued, r.Time_Request, NOW()), '%M %Y') as month_label,
           DATE_FORMAT(COALESCE(s.date_issued, r.Time_Request, NOW()), '%Y') as year_val,
           DATE_FORMAT(COALESCE(s.date_issued, r.Time_Request, NOW()), '%m') as month_val
         FROM service_detail sd
         LEFT JOIN Request r ON (TRIM(r.ID_Request) = TRIM(sd.id_request) OR TRIM(r.ID_Request) = TRIM(sd.id_register))
         LEFT JOIN service s ON TRIM(s.id_register) = TRIM(sd.id_register)
         WHERE (r.ID_Asset = ? OR sd.id_asset = ?) AND sd.amount > 0
         ORDER BY COALESCE(s.date_issued, r.Time_Request) DESC`,
        [idAsset, idAsset]
      );
      externalServices = serviceRows || [];
    } catch (e) {
      console.error('Error fetching external services:', e);
      externalServices = [];
    }

    // 4. Group usage & costs by Month using allCombinedLogs
    const monthGroupsMap = new Map();

    allCombinedLogs.forEach((row) => {
      const key = row.month_key;
      if (!key) return;

      if (!monthGroupsMap.has(key)) {
        monthGroupsMap.set(key, {
          month_key: key,
          month_label: row.month_label,
          year: parseInt(row.year_val, 10),
          month: parseInt(row.month_val, 10),
          total_qty: 0,
          total_quantity: 0,
          total_items: 0,
          parts_cost: 0,
          service_cost: 0,
          total_cost: 0,
          parts: [],
          services: [],
        });
      }

      const group = monthGroupsMap.get(key);
      const qty = Number(row.qty || row.quantity || 0);
      const partCost = Number(row.total_cost || 0);

      group.total_qty += qty;
      group.total_quantity += qty;
      group.total_items += 1;
      group.parts_cost += partCost;
      group.total_cost += partCost;

      group.parts.push({
        id_part: row.id_part,
        description: row.description || row.part_name,
        part_name: row.part_name || row.description,
        vendor_code: row.vendor_code || '',
        unit: row.unit || 'pcs',
        location: row.location || '-',
        qty: qty,
        quantity: qty,
        unit_price: row.unit_price,
        total_cost: partCost,
        supplier: row.supplier || '-',
        dpm: row.dpm || '-',
        source: row.source || 'Gudang (Stock)',
        date: row.date,
        id_for: row.request_id || row.id_for || '-',
        request_id: row.request_id || row.id_for || '-',
        subject: row.subject || '-',
      });
    });

    // Merge external services into monthly groups
    externalServices.forEach((srv) => {
      const key = srv.month_key;
      if (!key) return;

      const srvAmount = Number(srv.amount || 0);

      if (!monthGroupsMap.has(key)) {
        monthGroupsMap.set(key, {
          month_key: key,
          month_label: srv.month_label,
          year: parseInt(srv.year_val, 10),
          month: parseInt(srv.month_val, 10),
          total_qty: 0,
          total_quantity: 0,
          total_items: 0,
          parts_cost: 0,
          service_cost: 0,
          total_cost: 0,
          parts: [],
          services: [],
        });
      }

      const group = monthGroupsMap.get(key);
      group.service_cost += srvAmount;
      group.total_cost += srvAmount;
      group.services.push({
        id_register: srv.id_register,
        item: srv.item,
        amount: srvAmount,
        quantity: srv.quantity,
        supplier: srv.supplier || '-',
        id_request: srv.id_request,
        date: srv.date,
      });
    });

    // Sort months descending for table/list
    const monthlyBreakdown = Array.from(monthGroupsMap.values()).sort(
      (a, b) => b.month_key.localeCompare(a.month_key)
    );

    // Cost trend chronologically sorted (ascending) for charts
    const costTrend = [...monthlyBreakdown]
      .sort((a, b) => a.month_key.localeCompare(b.month_key))
      .slice(-12) // Last 12 months for chart
      .map((m) => ({
        month_key: m.month_key,
        month_label: m.month_label,
        parts_cost: m.parts_cost,
        service_cost: m.service_cost,
        total_cost: m.total_cost,
        total_qty: m.total_qty,
      }));

    // 5. Fetch available stock in warehouse only for the parts relevant to this machine
    const availableStockMap = new Map();
    const relevantPartIds = Array.from(
      new Set(
        allCombinedLogs
          .map((l) => l.id_part)
          .filter((id) => id && id !== '-' && !String(id).startsWith('MO'))
      )
    );

    if (relevantPartIds.length > 0) {
      try {
        const [warehouseStocks] = await pool.query(
          `SELECT parts.id_part, parts.description, parts.vendor_code, parts.unit, parts.location,
                  (parts.initial_stock 
                   + COALESCE((SELECT SUM(qty) FROM stockin WHERE stockin.id_part = parts.id_part), 0)
                   - COALESCE((SELECT SUM(qty) FROM stockout WHERE stockout.id_part = parts.id_part), 0)
                  ) as available
           FROM parts
           WHERE parts.id_part IN (?)`,
          [relevantPartIds]
        );
        (warehouseStocks || []).forEach((ws) => {
          const avail = Number(ws.available || 0);
          if (ws.id_part) availableStockMap.set(String(ws.id_part).trim(), avail);
          const cleanDesc = (ws.description || '').trim().toLowerCase();
          if (cleanDesc) availableStockMap.set(cleanDesc, avail);
        });
      } catch (e) {
        console.error('Error fetching warehouse stocks for routine needs:', e);
      }
    }

    // 6. Calculate Routine Machine Needs (Perkiraan Kebutuhan Rutin Mesin Ini)
    // Aggregating from all combined logs to include both warehouse stock and ticket purchase orders
    const routineMap = new Map();
    allCombinedLogs.forEach((log) => {
      const partKey = (log.id_part && log.id_part !== '-' && !log.id_part.startsWith('MO')) 
        ? String(log.id_part).trim() 
        : (log.description || log.part_name || '').trim().toLowerCase();

      if (!partKey) return;

      if (!routineMap.has(partKey)) {
        const cleanDesc = (log.description || log.part_name || '').trim().toLowerCase();
        const avail = availableStockMap.get(String(log.id_part).trim()) ?? 
                      availableStockMap.get(cleanDesc) ?? 0;

        routineMap.set(partKey, {
          id_part: log.id_part || '-',
          description: log.description || log.part_name || 'Suku Cadang',
          part_name: log.part_name || log.description || 'Suku Cadang',
          vendor_code: log.vendor_code || '-',
          unit: log.unit || 'pcs',
          location: log.location || '-',
          available: avail,
          total_quantity_used: 0,
          total_qty: 0,
          replacement_count: 0,
          times_used: 0,
          dates: [],
          unit_price: log.unit_price || 0,
          supplier: log.supplier || '-',
          last_used: log.date,
        });
      }

      const item = routineMap.get(partKey);
      const qty = Number(log.qty || log.quantity || 0);
      item.total_quantity_used += qty;
      item.total_qty += qty;
      item.replacement_count += 1;
      item.times_used += 1;
      if (log.date) {
        item.dates.push(new Date(log.date));
        if (!item.last_used || new Date(log.date) > new Date(item.last_used)) {
          item.last_used = log.date;
        }
      }
      if (!item.unit_price && log.unit_price) item.unit_price = log.unit_price;
      if ((!item.supplier || item.supplier === '-') && log.supplier && log.supplier !== '-') {
        item.supplier = log.supplier;
      }
    });

    const routineNeeds = Array.from(routineMap.values()).map((row) => {
      const totalQty = row.total_quantity_used;
      const count = row.replacement_count;
      
      let monthSpan = 1;
      let replacementFrequencyText = 'Pernah 1x ganti';

      if (row.dates.length > 1) {
        row.dates.sort((a, b) => a - b);
        const firstDate = row.dates[0];
        const lastDate = row.dates[row.dates.length - 1];
        const diffMs = lastDate - firstDate;
        const daysBetween = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        monthSpan = Math.max(1, Math.round(daysBetween / 30));

        const avgDays = Math.round(daysBetween / Math.max(1, count - 1));
        if (avgDays < 30) {
          replacementFrequencyText = `Rutin tiap ~${avgDays} hari`;
        } else {
          const avgMonths = (avgDays / 30).toFixed(1);
          replacementFrequencyText = `Rutin tiap ~${avgMonths} bln`;
        }
      }

      const monthlyRate = Number((totalQty / monthSpan).toFixed(1));
      const recommendedStockForMachine = Math.max(1, Math.ceil(monthlyRate));

      const cleanDesc = (row.description || '').trim().toLowerCase();
      const pInfo = priceMap.get(row.id_part) || itemNamePriceMap.get(cleanDesc);
      const unitPrice = row.unit_price || pInfo?.unit_price || 0;
      const supplier = row.supplier !== '-' ? row.supplier : (pInfo?.seller || '-');

      return {
        id_part: row.id_part,
        description: row.description,
        part_name: row.description,
        vendor_code: row.vendor_code || '',
        unit: row.unit || 'pcs',
        location: row.location || '-',
        available: Number(row.available || 0),
        total_qty: totalQty,
        total_quantity_used: totalQty,
        times_used: count,
        replacement_count: count,
        monthly_rate: monthlyRate,
        recommended_monthly_stock: recommendedStockForMachine,
        recommended_monthly_need: recommendedStockForMachine,
        unit_price: unitPrice,
        est_monthly_cost: Math.round(monthlyRate * unitPrice),
        supplier: supplier,
        frequency_label: replacementFrequencyText,
        frequency_note: replacementFrequencyText,
        last_used: row.last_used,
      };
    }).sort((a, b) => b.total_quantity_used - a.total_quantity_used);

    const totalAllPartsQuantity = allCombinedLogs.reduce((acc, row) => acc + Number(row.qty || row.quantity || 0), 0);
    const grandPartsCost = monthlyBreakdown.reduce((acc, m) => acc + (m.parts_cost || 0), 0);
    const grandServiceCost = monthlyBreakdown.reduce((acc, m) => acc + (m.service_cost || 0), 0);
    const grandTotalCost = grandPartsCost + grandServiceCost;
    const activeMonthsCount = Math.max(1, monthlyBreakdown.length);

    return NextResponse.json({
      id_asset: idAsset,
      total_parts_quantity: totalAllPartsQuantity,
      total_records: allCombinedLogs.length,
      monthly_breakdown: monthlyBreakdown,
      cost_trend: costTrend,
      routine_needs: routineNeeds,
      summary: {
        total_parts_replaced: totalAllPartsQuantity,
        distinct_parts_count: routineNeeds.length,
        most_used_part: routineNeeds[0] || null,
        grand_total_cost: grandTotalCost,
        grand_parts_cost: grandPartsCost,
        grand_service_cost: grandServiceCost,
        average_monthly_cost: Math.round(grandTotalCost / activeMonthsCount),
      },
    });
  } catch (error) {
    console.error('assetpartsusage error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
