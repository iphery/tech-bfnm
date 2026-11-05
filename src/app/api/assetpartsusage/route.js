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

    // 1. Fetch latest purchase price per part from order_detail
    let priceMap = new Map();
    try {
      const [prices] = await pool.query(
        `SELECT od.id_part, 
                od.amount, 
                od.quantity,
                ROUND(od.amount / NULLIF(od.quantity, 0)) as unit_price,
                od.seller
         FROM order_detail od
         INNER JOIN (
           SELECT id_part, MAX(ids) as max_id
           FROM order_detail
           WHERE amount > 0 AND quantity > 0
           GROUP BY id_part
         ) latest ON latest.id_part = od.id_part AND latest.max_id = od.ids`
      );
      prices.forEach((p) => {
        priceMap.set(p.id_part, {
          unit_price: Number(p.unit_price) || 0,
          seller: p.seller || '',
        });
      });
    } catch (e) {
      console.error('Error fetching part prices:', e);
    }

    // 1b. Fetch specific order_detail amounts directly assigned to this machine's tickets
    let specificTicketPartCosts = new Map();
    try {
      const [ticketParts] = await pool.query(
        `SELECT od.id_part, od.id_service, od.amount, od.seller, od.quantity,
                ROUND(od.amount / NULLIF(od.quantity, 0)) as unit_price
         FROM order_detail od
         INNER JOIN Request r ON r.ID_Request = od.id_service
         WHERE r.ID_Asset = ? AND od.amount > 0`,
        [idAsset]
      );
      ticketParts.forEach((tp) => {
        const key = `${tp.id_service}_${tp.id_part}`;
        specificTicketPartCosts.set(key, {
          unit_price: Number(tp.unit_price) || (Number(tp.amount) / Math.max(1, Number(tp.quantity || 1))),
          amount: Number(tp.amount) || 0,
          seller: tp.seller || '',
        });
      });
    } catch (e) {
      console.error('Error fetching specific ticket parts:', e);
    }

    // 2. Fetch all spare part usage logs for this specific machine
    let queryParams = [idAsset];
    let dateFilter = '';

    if (month && year) {
      const pad = (n) => String(n).padStart(2, '0');
      const startOfMonth = `${year}-${pad(month)}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endOfMonth = `${year}-${pad(month)}-${pad(lastDay)}`;
      dateFilter = 'AND DATE(stock_summary.date) >= ? AND DATE(stock_summary.date) <= ?';
      queryParams.push(startOfMonth, endOfMonth);
    }

    const [usageLogs] = await pool.query(
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
         DATE_FORMAT(stock_summary.date, '%Y-%m') as month_key,
         DATE_FORMAT(stock_summary.date, '%M %Y') as month_label,
         DATE_FORMAT(stock_summary.date, '%Y') as year_val,
         DATE_FORMAT(stock_summary.date, '%m') as month_val
       FROM stock_summary
       INNER JOIN parts ON parts.id_part = stock_summary.id_part
       WHERE stock_summary.id_asset = ? AND stock_summary.qty < 0
       ${dateFilter}
       ORDER BY stock_summary.date DESC`,
      queryParams
    );

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
           COALESCE(r.Time_Request, NOW()) as date,
           DATE_FORMAT(COALESCE(r.Time_Request, NOW()), '%Y-%m') as month_key,
           DATE_FORMAT(COALESCE(r.Time_Request, NOW()), '%M %Y') as month_label,
           DATE_FORMAT(COALESCE(r.Time_Request, NOW()), '%Y') as year_val,
           DATE_FORMAT(COALESCE(r.Time_Request, NOW()), '%m') as month_val
         FROM service_detail sd
         INNER JOIN Request r ON r.ID_Request = sd.id_request
         WHERE r.ID_Asset = ? AND sd.amount > 0
         ORDER BY r.Time_Request DESC`,
        [idAsset]
      );
      externalServices = serviceRows || [];
    } catch (e) {
      console.error('Error fetching external services:', e);
    }

    // 4. Group usage & costs by Month
    const monthGroupsMap = new Map();

    usageLogs.forEach((row) => {
      const key = row.month_key;
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
      const qty = Number(row.quantity || 0);

      // Determine unit price and total cost
      const ticketKey = `${row.request_id}_${row.id_part}`;
      const ticketCost = specificTicketPartCosts.get(ticketKey);
      const fallbackPrice = priceMap.get(row.id_part);

      const unitPrice = ticketCost?.unit_price || fallbackPrice?.unit_price || 0;
      const partCost = Math.round(qty * unitPrice);
      const supplier = ticketCost?.seller || fallbackPrice?.seller || '-';

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
        unit_price: unitPrice,
        total_cost: partCost,
        supplier: supplier,
        date: row.date,
        id_for: row.request_id || row.id_for || '-',
        request_id: row.request_id || row.id_for || '-',
        subject: row.subject || '-',
      });
    });

    // Merge external services into monthly groups
    externalServices.forEach((srv) => {
      const key = srv.month_key;
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

    // 5. Calculate Routine Machine Needs (Perkiraan Kebutuhan Rutin Mesin Ini)
    const [partFrequencyQuery] = await pool.query(
      `SELECT 
         stock_summary.id_part,
         parts.description,
         parts.vendor_code,
         parts.unit,
         parts.location,
         (parts.initial_stock + COALESCE(qin.qty, 0) - COALESCE(qout.qty, 0)) as available,
         SUM(stock_summary.quantity) as total_quantity_used,
         COUNT(*) as replacement_count,
         MIN(stock_summary.date) as first_used,
         MAX(stock_summary.date) as last_used,
         TIMESTAMPDIFF(MONTH, MIN(stock_summary.date), MAX(stock_summary.date)) as active_month_span
       FROM stock_summary
       INNER JOIN parts ON parts.id_part = stock_summary.id_part
       LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockin GROUP BY id_part) qin ON qin.id_part = parts.id_part 
       LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockout GROUP BY id_part) qout ON qout.id_part = parts.id_part
       WHERE stock_summary.id_asset = ? AND stock_summary.qty < 0
       GROUP BY stock_summary.id_part, parts.description, parts.vendor_code, parts.unit, parts.location, parts.initial_stock, qin.qty, qout.qty
       ORDER BY total_quantity_used DESC`,
      [idAsset]
    );

    const routineNeeds = partFrequencyQuery.map((row) => {
      const totalQty = Number(row.total_quantity_used || 0);
      const replacementCount = Number(row.replacement_count || 0);
      const monthSpan = Math.max(1, Number(row.active_month_span || 1));
      
      const monthlyRate = Number((totalQty / monthSpan).toFixed(1));
      const recommendedStockForMachine = Math.max(1, Math.ceil(monthlyRate));

      let replacementFrequencyText = '';
      if (replacementCount > 1 && row.first_used !== row.last_used) {
        const daysBetween = Math.max(1, Math.round((new Date(row.last_used) - new Date(row.first_used)) / (1000 * 60 * 60 * 24)));
        const avgDaysBetween = Math.round(daysBetween / (replacementCount - 1));
        if (avgDaysBetween < 30) {
          replacementFrequencyText = `Rutin tiap ~${avgDaysBetween} hari`;
        } else {
          const avgMonths = (avgDaysBetween / 30).toFixed(1);
          replacementFrequencyText = `Rutin tiap ~${avgMonths} bln`;
        }
      } else {
        replacementFrequencyText = 'Pernah 1x ganti';
      }

      const pInfo = priceMap.get(row.id_part);
      const unitPrice = pInfo?.unit_price || 0;

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
        times_used: replacementCount,
        replacement_count: replacementCount,
        monthly_rate: monthlyRate,
        recommended_monthly_stock: recommendedStockForMachine,
        recommended_monthly_need: recommendedStockForMachine,
        unit_price: unitPrice,
        est_monthly_cost: Math.round(monthlyRate * unitPrice),
        frequency_label: replacementFrequencyText,
        frequency_note: replacementFrequencyText,
        last_used: row.last_used,
      };
    });

    const totalAllPartsQuantity = usageLogs.reduce((acc, row) => acc + Number(row.quantity || 0), 0);
    const grandPartsCost = monthlyBreakdown.reduce((acc, m) => acc + (m.parts_cost || 0), 0);
    const grandServiceCost = monthlyBreakdown.reduce((acc, m) => acc + (m.service_cost || 0), 0);
    const grandTotalCost = grandPartsCost + grandServiceCost;
    const activeMonthsCount = Math.max(1, monthlyBreakdown.length);

    return NextResponse.json({
      id_asset: idAsset,
      total_parts_quantity: totalAllPartsQuantity,
      total_records: usageLogs.length,
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
