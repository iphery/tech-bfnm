import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  return handleSimulationData(request);
}

export async function POST(request) {
  return handleSimulationData(request);
}

async function handleSimulationData(request) {
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
        months: url.searchParams.get('months'),
        search: url.searchParams.get('search'),
      };
    }

    // 1. Fetch all master parts with real-time available stock
    const [parts] = await pool.query(`
      SELECT 
        p.id_part,
        p.description,
        p.vendor_code,
        p.unit,
        p.location,
        p.status,
        p.initial_stock,
        COALESCE(qin.qty, 0) as total_in,
        COALESCE(qout.qty, 0) as total_out,
        (p.initial_stock + COALESCE(qin.qty, 0) - COALESCE(qout.qty, 0)) as available_stock
      FROM parts p
      LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockin GROUP BY id_part) qin ON qin.id_part = p.id_part
      LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockout GROUP BY id_part) qout ON qout.id_part = p.id_part
      WHERE p.status = 'Aktif' OR p.status IS NULL OR p.status = ''
      ORDER BY p.description ASC
    `);

    // 2. Lead Time Calculation per Part based on order_main.date and order_main.receive_date
    let leadTimeMap = new Map();
    try {
      const [leadTimeRows] = await pool.query(`
        SELECT 
          od.id_part,
          ROUND(AVG(DATEDIFF(om.receive_date, om.date))) as avg_lead_time_days,
          MIN(DATEDIFF(om.receive_date, om.date)) as min_lead_time_days,
          MAX(DATEDIFF(om.receive_date, om.date)) as max_lead_time_days,
          COUNT(DISTINCT om.id_register) as order_count,
          MAX(om.date) as last_order_date,
          MAX(om.receive_date) as last_receive_date
        FROM order_detail od
        INNER JOIN order_main om ON om.id_register = od.id_register
        WHERE om.date IS NOT NULL 
          AND om.receive_date IS NOT NULL 
          AND om.receive_date >= om.date
          AND od.id_part IS NOT NULL 
          AND od.id_part != ''
        GROUP BY od.id_part
      `);

      (leadTimeRows || []).forEach((row) => {
        leadTimeMap.set(String(row.id_part).trim(), {
          avg_days: Math.max(1, Number(row.avg_lead_time_days || 0)),
          min_days: Number(row.min_lead_time_days || 0),
          max_days: Number(row.max_lead_time_days || 0),
          order_count: Number(row.order_count || 0),
          last_order_date: row.last_order_date,
          last_receive_date: row.last_receive_date,
        });
      });
    } catch (e) {
      console.error('Error fetching lead time per part:', e);
    }

    // Global Average Lead Time across the whole company
    let globalAvgLeadTime = 14; // sensible default
    try {
      const [globalLeadTimeRows] = await pool.query(`
        SELECT ROUND(AVG(DATEDIFF(om.receive_date, om.date))) as global_avg
        FROM order_main om
        WHERE om.date IS NOT NULL 
          AND om.receive_date IS NOT NULL 
          AND om.receive_date >= om.date
      `);
      if (globalLeadTimeRows && globalLeadTimeRows[0]?.global_avg > 0) {
        globalAvgLeadTime = Math.max(1, Math.round(Number(globalLeadTimeRows[0].global_avg)));
      }
    } catch (e) {
      console.error('Error fetching global lead time:', e);
    }

    // 3. Latest Purchase Price & Supplier per Part from order_detail
    let priceMap = new Map();
    try {
      const [priceRows] = await pool.query(`
        SELECT 
          od.id_part,
          od.amount,
          od.quantity,
          ROUND(od.amount / NULLIF(od.quantity, 0)) as unit_price,
          od.seller,
          om.date as order_date
        FROM order_detail od
        INNER JOIN (
          SELECT id_part, MAX(ids) as max_ids
          FROM order_detail
          WHERE amount > 0 AND quantity > 0 AND id_part IS NOT NULL AND id_part != ''
          GROUP BY id_part
        ) latest ON latest.max_ids = od.ids
        LEFT JOIN order_main om ON om.id_register = od.id_register
      `);

      (priceRows || []).forEach((row) => {
        const uPrice = Number(row.unit_price) || (Number(row.amount) / Math.max(1, Number(row.quantity || 1)));
        priceMap.set(String(row.id_part).trim(), {
          unit_price: Math.round(uPrice),
          seller: row.seller || '-',
          order_date: row.order_date,
        });
      });
    } catch (e) {
      console.error('Error fetching price map:', e);
    }

    // 4. Pending / On-Order Quantity (Barang yang sudah dipesan tapi belum datang / receive_date IS NULL)
    let pendingOrderMap = new Map();
    try {
      const [pendingRows] = await pool.query(`
        SELECT 
          od.id_part,
          SUM(od.quantity) as on_order_qty,
          COUNT(DISTINCT om.id_register) as pending_order_count
        FROM order_detail od
        INNER JOIN order_main om ON om.id_register = od.id_register
        WHERE (om.receive_date IS NULL OR om.status = 0)
          AND od.id_part IS NOT NULL 
          AND od.id_part != ''
        GROUP BY od.id_part
      `);

      (pendingRows || []).forEach((row) => {
        pendingOrderMap.set(String(row.id_part).trim(), {
          on_order_qty: Number(row.on_order_qty || 0),
          pending_order_count: Number(row.pending_order_count || 0),
        });
      });
    } catch (e) {
      console.error('Error fetching pending orders:', e);
    }

    // 5. Consumption History per Part (Pemakaian suku cadang bulanan dari stock_summary qty < 0)
    let usageMap = new Map();
    try {
      const [usageRows] = await pool.query(`
        SELECT 
          ss.id_part,
          SUM(CASE WHEN ss.date >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN ss.quantity ELSE 0 END) as qty_last_3m,
          SUM(CASE WHEN ss.date >= DATE_SUB(NOW(), INTERVAL 180 DAY) THEN ss.quantity ELSE 0 END) as qty_last_6m,
          SUM(CASE WHEN ss.date >= DATE_SUB(NOW(), INTERVAL 365 DAY) THEN ss.quantity ELSE 0 END) as qty_last_12m,
          SUM(ss.quantity) as qty_all_time,
          COUNT(DISTINCT DATE_FORMAT(ss.date, '%Y-%m')) as active_months,
          MIN(ss.date) as first_used,
          MAX(ss.date) as last_used
        FROM stock_summary ss
        WHERE ss.qty < 0 AND ss.id_part IS NOT NULL AND ss.id_part != ''
        GROUP BY ss.id_part
      `);

      (usageRows || []).forEach((row) => {
        const qty3m = Number(row.qty_last_3m || 0);
        const qty6m = Number(row.qty_last_6m || 0);
        const qty12m = Number(row.qty_last_12m || 0);
        const qtyAll = Number(row.qty_all_time || 0);
        const activeMonths = Math.max(1, Number(row.active_months || 1));

        // Primary Monthly Consumption Rate (Weighted towards past 6 months if available)
        let monthlyRate = 0;
        if (qty6m > 0) {
          monthlyRate = Number((qty6m / 6).toFixed(1));
        } else if (qty3m > 0) {
          monthlyRate = Number((qty3m / 3).toFixed(1));
        } else if (qty12m > 0) {
          monthlyRate = Number((qty12m / 12).toFixed(1));
        } else if (qtyAll > 0) {
          monthlyRate = Number((qtyAll / activeMonths).toFixed(1));
        }

        usageMap.set(String(row.id_part).trim(), {
          monthly_rate: monthlyRate,
          qty_last_3m: qty3m,
          qty_last_6m: qty6m,
          qty_last_12m: qty12m,
          qty_all_time: qtyAll,
          active_months: activeMonths,
          first_used: row.first_used,
          last_used: row.last_used,
        });
      });
    } catch (e) {
      console.error('Error fetching usage history:', e);
    }

    // 6. Assemble complete simulation catalog for each part
    const simulationCatalog = (parts || []).map((p) => {
      const partId = String(p.id_part).trim();
      const availableStock = Number(p.available_stock || 0);

      // Lead time info
      const ltInfo = leadTimeMap.get(partId);
      const leadTimeDays = ltInfo?.avg_days || globalAvgLeadTime;
      const isHistoricalLeadTime = Boolean(ltInfo?.avg_days);

      // Price info
      const pInfo = priceMap.get(partId);
      const unitPrice = pInfo?.unit_price || 0;
      const seller = pInfo?.seller || '-';

      // Pending on-order info
      const pendingInfo = pendingOrderMap.get(partId);
      const onOrderQty = pendingInfo?.on_order_qty || 0;

      // Usage info
      const uInfo = usageMap.get(partId);
      const monthlyRate = uInfo?.monthly_rate || 0;

      return {
        id_part: p.id_part,
        description: p.description,
        vendor_code: p.vendor_code || '-',
        unit: p.unit || 'pcs',
        location: p.location || '-',
        available_stock: availableStock,
        on_order_qty: onOrderQty,
        monthly_rate: monthlyRate,
        lead_time_days: leadTimeDays,
        is_historical_lead_time: isHistoricalLeadTime,
        lead_time_orders_count: ltInfo?.order_count || 0,
        unit_price: unitPrice,
        seller: seller,
        last_used_date: uInfo?.last_used || null,
        usage_history: {
          last_3m: uInfo?.qty_last_3m || 0,
          last_6m: uInfo?.qty_last_6m || 0,
          last_12m: uInfo?.qty_last_12m || 0,
          all_time: uInfo?.qty_all_time || 0,
        },
      };
    });

    return NextResponse.json({
      status: 'success',
      global_avg_lead_time: globalAvgLeadTime,
      total_parts: simulationCatalog.length,
      parts: simulationCatalog,
    });
  } catch (error) {
    console.error('partssimulation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

