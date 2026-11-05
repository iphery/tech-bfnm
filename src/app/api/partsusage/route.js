import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  return handlePartsUsage(request);
}

export async function GET(request) {
  return handlePartsUsage(request);
}

async function handlePartsUsage(request) {
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
        month: url.searchParams.get('month'),
        year: url.searchParams.get('year'),
        search: url.searchParams.get('search'),
        page: url.searchParams.get('page'),
        per_page: url.searchParams.get('per_page'),
        status_filter: url.searchParams.get('status_filter'),
        id_part: url.searchParams.get('id_part'),
      };
    }

    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    const currentYearNum = now.getFullYear();

    const selectedMonth = parseInt(body.month, 10) || currentMonthNum;
    const selectedYear = parseInt(body.year, 10) || currentYearNum;
    const search = (body.search || '').trim();
    const statusFilter = (body.status_filter || 'ALL').toUpperCase();
    const idPartFilter = body.id_part || null;

    const page = Math.max(1, parseInt(body.page, 10) || 1);
    const perPage = Math.max(1, parseInt(body.per_page, 10) || 15);
    const offset = (page - 1) * perPage;

    // Date calculations with timestamp bounds for index-friendly range scans
    const pad = (n) => String(n).padStart(2, '0');
    const startOfMonth = `${selectedYear}-${pad(selectedMonth)}-01 00:00:00`;
    // Last day of month
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const endOfMonth = `${selectedYear}-${pad(selectedMonth)}-${pad(lastDay)} 23:59:59`;

    // 3 Months range for AMC (Average Monthly Consumption)
    // E.g. 2 months prior + selected month = 3 months
    const threeMonthsAgoDate = new Date(selectedYear, selectedMonth - 3, 1);
    const startOf3Months = `${threeMonthsAgoDate.getFullYear()}-${pad(threeMonthsAgoDate.getMonth() + 1)}-01 00:00:00`;

    // Check system setting for part status visibility
    let activeStatusFilter = 'aktif';
    try {
      const [settingRow] = await pool.query(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'part_status_filter' LIMIT 1"
      );
      activeStatusFilter = settingRow[0]?.setting_value || 'aktif';
    } catch {
      activeStatusFilter = 'aktif';
    }

    const statusWhere = activeStatusFilter === 'all' ? '' : "WHERE parts.status = 'Aktif'";

    // 1. Fetch parts with available warehouse stock
    const [partsList] = await pool.query(`
      SELECT parts.id_part, parts.description, parts.vendor_code, parts.unit, parts.location, parts.remark, parts.status,
             (parts.initial_stock + COALESCE(qin.qty, 0) - COALESCE(qout.qty, 0)) as available_stock
      FROM parts
      LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockin GROUP BY id_part) qin ON qin.id_part = parts.id_part 
      LEFT JOIN (SELECT id_part, SUM(qty) as qty FROM stockout GROUP BY id_part) qout ON qout.id_part = parts.id_part 
      ${statusWhere}
    `);

    // 2. Fetch monthly consumption for the selected month (qty < 0 in stock_summary)
    const [monthUsageResult] = await pool.query(`
      SELECT stock_summary.id_part, SUM(stock_summary.quantity) as total_qty, COUNT(*) as tx_count
      FROM stock_summary
      WHERE stock_summary.qty < 0
        AND stock_summary.date >= ? AND stock_summary.date <= ?
      GROUP BY stock_summary.id_part
    `, [startOfMonth, endOfMonth]);

    const monthUsageMap = new Map();
    monthUsageResult.forEach((row) => {
      monthUsageMap.set(row.id_part, {
        total_qty: Number(row.total_qty || 0),
        tx_count: Number(row.tx_count || 0),
      });
    });

    // 3. Fetch past 3 months consumption for AMC
    const [threeMonthResult] = await pool.query(`
      SELECT stock_summary.id_part, SUM(stock_summary.quantity) as total_qty
      FROM stock_summary
      WHERE stock_summary.qty < 0
        AND stock_summary.date >= ? AND stock_summary.date <= ?
      GROUP BY stock_summary.id_part
    `, [startOf3Months, endOfMonth]);

    const threeMonthMap = new Map();
    threeMonthResult.forEach((row) => {
      threeMonthMap.set(row.id_part, Number(row.total_qty || 0));
    });

    // 4. Fetch machine / asset breakdown for the selected month
    const [machineUsageResult] = await pool.query(`
      SELECT stock_summary.id_part, stock_summary.id_asset, stock_summary.quantity, stock_summary.date, 
             stock_summary.id_for as request_id, stock_summary.subject,
             COALESCE(Assets.Description, stock_summary.id_asset, 'Non-Mesin / Umum') as asset_name,
             COALESCE(Assets.No, '-') as asset_no,
             COALESCE(Assets.Model, '-') as asset_model
      FROM stock_summary
      LEFT JOIN Assets ON Assets.ID_Asset = stock_summary.id_asset
      WHERE stock_summary.qty < 0
        AND stock_summary.date >= ? AND stock_summary.date <= ?
      ORDER BY stock_summary.date DESC
    `, [startOfMonth, endOfMonth]);

    // Group machine breakdown per part
    const machineBreakdownMap = new Map();
    machineUsageResult.forEach((row) => {
      if (!machineBreakdownMap.has(row.id_part)) {
        machineBreakdownMap.set(row.id_part, []);
      }
      machineBreakdownMap.get(row.id_part).push({
        id_asset: row.id_asset || 'UMUM',
        asset_name: row.asset_name,
        asset_no: row.asset_no,
        asset_model: row.asset_model,
        quantity: Number(row.quantity || 0),
        date: row.date,
        request_id: row.request_id || '-',
        subject: row.subject || '-',
      });
    });

    // Group machines summarized by asset for each part
    const machineSummaryMap = new Map();
    for (const [partId, logs] of machineBreakdownMap.entries()) {
      const summaryByAsset = {};
      logs.forEach((log) => {
        const key = log.id_asset;
        if (!summaryByAsset[key]) {
          summaryByAsset[key] = {
            id_asset: log.id_asset,
            asset_name: log.asset_name,
            asset_no: log.asset_no,
            total_qty: 0,
            count: 0,
          };
        }
        summaryByAsset[key].total_qty += log.quantity;
        summaryByAsset[key].count += 1;
      });
      machineSummaryMap.set(partId, Object.values(summaryByAsset));
    }

    // 5. Build enriched parts array with Decision Logic
    let allCalculatedParts = partsList.map((part) => {
      const monthData = monthUsageMap.get(part.id_part) || { total_qty: 0, tx_count: 0 };
      const currentMonthUsage = monthData.total_qty;
      const past3mUsage = threeMonthMap.get(part.id_part) || currentMonthUsage;
      
      // AMC (Average Monthly Consumption)
      const amc = Number((past3mUsage / 3).toFixed(1));
      const availableStock = Number(part.available_stock || 0);

      // Decision logic:
      // Recommended monthly need: at least ceil(amc), or if current month usage is higher, consider current month
      const recommendedNeed = Math.max(Math.ceil(amc), currentMonthUsage);
      
      // Recommended purchase order if stock is lower than recommended monthly need
      let suggestedPurchase = 0;
      let status = 'AMAN'; // 'AMAN', 'DEFISIT', 'KRITIS'

      if (availableStock <= 0 && (recommendedNeed > 0 || amc > 0)) {
        status = 'KRITIS';
        suggestedPurchase = Math.max(recommendedNeed, 1);
      } else if (availableStock < recommendedNeed) {
        status = 'DEFISIT';
        suggestedPurchase = recommendedNeed - availableStock;
      } else {
        status = 'AMAN';
        suggestedPurchase = 0;
      }

      return {
        id_part: part.id_part,
        description: part.description,
        vendor_code: part.vendor_code || '',
        unit: part.unit || 'pcs',
        location: part.location || '-',
        remark: part.remark || '',
        available_stock: availableStock,
        month_usage: currentMonthUsage,
        tx_count: monthData.tx_count,
        past_3m_usage: past3mUsage,
        amc: amc, // Average Monthly Consumption
        recommended_monthly_need: recommendedNeed, // Kebutuhan 1 Bulan
        suggested_purchase: suggestedPurchase, // Saran Beli
        status: status,
        machines: machineSummaryMap.get(part.id_part) || [],
        usage_logs: machineBreakdownMap.get(part.id_part) || [],
      };
    });

    // 6. Calculate Overall KPIs across entire inventory for that month
    const totalPartsConsumed = allCalculatedParts.reduce((acc, p) => acc + p.month_usage, 0);
    const activeConsumedPartsCount = allCalculatedParts.filter((p) => p.month_usage > 0).length;
    const deficitCount = allCalculatedParts.filter((p) => p.status === 'DEFISIT').length;
    const criticalCount = allCalculatedParts.filter((p) => p.status === 'KRITIS').length;
    const safeCount = allCalculatedParts.filter((p) => p.status === 'AMAN').length;

    // Top consumed part
    const sortedByUsage = [...allCalculatedParts].sort((a, b) => b.month_usage - a.month_usage);
    const topConsumedPart = sortedByUsage.length > 0 && sortedByUsage[0].month_usage > 0 ? sortedByUsage[0] : null;

    // 7. Filtering (Search, Status, specific Part ID)
    if (idPartFilter) {
      allCalculatedParts = allCalculatedParts.filter((p) => p.id_part === idPartFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      allCalculatedParts = allCalculatedParts.filter(
        (p) =>
          p.description.toLowerCase().includes(q) ||
          p.vendor_code.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.machines.some((m) => m.asset_name.toLowerCase().includes(q) || m.id_asset.toLowerCase().includes(q))
      );
    }

    if (statusFilter === 'DEFISIT') {
      allCalculatedParts = allCalculatedParts.filter((p) => p.status === 'DEFISIT' || p.status === 'KRITIS');
    } else if (statusFilter === 'AMAN') {
      allCalculatedParts = allCalculatedParts.filter((p) => p.status === 'AMAN');
    } else if (statusFilter === 'USED') {
      allCalculatedParts = allCalculatedParts.filter((p) => p.month_usage > 0);
    }

    // Sort: Priority to parts used this month or needing purchase
    allCalculatedParts.sort((a, b) => {
      // 1. Used this month first
      if (b.month_usage !== a.month_usage) {
        return b.month_usage - a.month_usage;
      }
      // 2. Critical or Deficit first
      if (b.suggested_purchase !== a.suggested_purchase) {
        return b.suggested_purchase - a.suggested_purchase;
      }
      return a.description.localeCompare(b.description);
    });

    const totalFiltered = allCalculatedParts.length;
    const paginatedItems = allCalculatedParts.slice(offset, offset + perPage);

    return NextResponse.json({
      period: {
        month: selectedMonth,
        year: selectedYear,
        start_date: startOfMonth,
        end_date: endOfMonth,
        month_name: new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(selectedYear, selectedMonth - 1, 1)),
      },
      kpi: {
        total_parts_consumed: totalPartsConsumed,
        active_consumed_parts_count: activeConsumedPartsCount,
        deficit_count: deficitCount + criticalCount,
        critical_count: criticalCount,
        safe_count: safeCount,
        total_parts_catalog: partsList.length,
        top_consumed_part: topConsumedPart
          ? {
              id_part: topConsumedPart.id_part,
              description: topConsumedPart.description,
              vendor_code: topConsumedPart.vendor_code,
              qty: topConsumedPart.month_usage,
              unit: topConsumedPart.unit,
            }
          : null,
      },
      response: paginatedItems,
      pagination: {
        page: page,
        per_page: perPage,
        total: totalFiltered,
        total_pages: Math.ceil(totalFiltered / perPage) || 1,
        has_more: offset + paginatedItems.length < totalFiltered,
      },
    });
  } catch (error) {
    console.error('partsusage error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

