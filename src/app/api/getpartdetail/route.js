import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idPart } = body;

    if (!idPart) {
      return NextResponse.json({ error: 'idPart is required' }, { status: 400 });
    }

    // 1. Fetch Part info & current warehouse stock (optimized correlated subquery for this single part)
    const [part] = await pool.query(
      `SELECT parts.*, 
        (parts.initial_stock 
         + COALESCE((SELECT SUM(qty) FROM stockin WHERE stockin.id_part = parts.id_part), 0)
         - COALESCE((SELECT SUM(qty) FROM stockout WHERE stockout.id_part = parts.id_part), 0)
        ) as available 
       FROM parts 
       WHERE parts.id_part = ?`,
      [idPart]
    );

    if (part.length === 0) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    const availableStock = Number(part[0].available || 0);

    // 2. Fetch past 6 months timeline for monthly consumption trend
    const now = new Date();
    const pastMonths = [];
    const pad = (n) => String(n).padStart(2, '0');

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const mLabel = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(d);
      pastMonths.push({
        month_key: mKey,
        month_label: mLabel,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        consumed: 0,
        tx_count: 0,
      });
    }

    const sixMonthsAgo = `${pastMonths[0].year}-${pad(pastMonths[0].month)}-01 00:00:00`;

    const [monthlyQuery] = await pool.query(
      `SELECT 
         DATE_FORMAT(date, '%Y-%m') as month_key,
         SUM(quantity) as total_qty,
         COUNT(*) as tx_count
       FROM stock_summary
       WHERE id_part = ? AND qty < 0 AND date >= ?
       GROUP BY DATE_FORMAT(date, '%Y-%m')
       ORDER BY month_key ASC`,
      [idPart, sixMonthsAgo]
    );

    const monthlyMap = new Map();
    monthlyQuery.forEach((row) => {
      monthlyMap.set(row.month_key, {
        total_qty: Number(row.total_qty || 0),
        tx_count: Number(row.tx_count || 0),
      });
    });

    const monthlyTrend = pastMonths.map((m) => {
      const match = monthlyMap.get(m.month_key);
      return {
        ...m,
        consumed: match ? match.total_qty : 0,
        tx_count: match ? match.tx_count : 0,
      };
    });

    // Current Month & AMC (Average Monthly Consumption over past 3 months)
    const currentMonthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const currentMonthData = monthlyMap.get(currentMonthKey) || { total_qty: 0, tx_count: 0 };
    const currentMonthUsage = currentMonthData.total_qty;

    // Past 3 months usage for AMC
    const last3Months = monthlyTrend.slice(-3);
    const sumLast3Months = last3Months.reduce((acc, curr) => acc + curr.consumed, 0);
    const amc = Number((sumLast3Months / 3).toFixed(1));

    // Decision metrics
    const recommendedMonthlyNeed = Math.max(Math.ceil(amc), currentMonthUsage);
    let suggestedReorder = 0;
    let status = 'AMAN';

    if (availableStock <= 0 && recommendedMonthlyNeed > 0) {
      status = 'KRITIS';
      suggestedReorder = Math.max(recommendedMonthlyNeed, 1);
    } else if (availableStock < recommendedMonthlyNeed) {
      status = 'DEFISIT';
      suggestedReorder = recommendedMonthlyNeed - availableStock;
    } else {
      status = 'AMAN';
      suggestedReorder = 0;
    }

    // Import Lead Time Projections (3 & 6 Months)
    const isImport = Boolean(Number(part[0].is_import || 0) === 1);
    const need3Months = Math.ceil(amc * 3);
    const need6Months = Math.ceil(amc * 6);
    const suggestedReorder3Months = Math.max(0, need3Months - availableStock);
    const suggestedReorder6Months = Math.max(0, need6Months - availableStock);

    // 3. Machines / Assets that used this part
    const [machinesUsed] = await pool.query(
      `SELECT 
         stock_summary.id_asset,
         COALESCE(Assets.Description, stock_summary.id_asset, 'Non-Mesin / Umum') as asset_name,
         COALESCE(Assets.No, '-') as asset_no,
         COALESCE(Assets.Model, '-') as asset_model,
         SUM(stock_summary.quantity) as total_qty,
         COUNT(*) as times_used,
         MAX(stock_summary.date) as last_used_date
       FROM stock_summary
       LEFT JOIN Assets ON Assets.ID_Asset = stock_summary.id_asset
       WHERE stock_summary.id_part = ? AND stock_summary.qty < 0
       GROUP BY stock_summary.id_asset, Assets.Description, Assets.No, Assets.Model
       ORDER BY total_qty DESC`,
      [idPart]
    );

    return NextResponse.json({
      response: part,
      analytics: {
        current_month_usage: currentMonthUsage,
        amc: amc, // Average Monthly Consumption (pcs/month)
        recommended_monthly_need: recommendedMonthlyNeed,
        suggested_reorder: suggestedReorder,
        status: status,
        is_import: isImport,
        import_projection: {
          is_import: isImport,
          need_3_months: need3Months,
          suggested_reorder_3_months: suggestedReorder3Months,
          need_6_months: need6Months,
          suggested_reorder_6_months: suggestedReorder6Months,
        },
        monthly_trend: monthlyTrend,
        machines_used: machinesUsed.map((m) => ({
          id_asset: m.id_asset || 'UMUM',
          asset_name: m.asset_name,
          asset_no: m.asset_no,
          asset_model: m.asset_model,
          total_qty: Number(m.total_qty || 0),
          times_used: Number(m.times_used || 0),
          last_used_date: m.last_used_date,
        })),
      },
    });
  } catch (error) {
    console.error('getpartdetail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
