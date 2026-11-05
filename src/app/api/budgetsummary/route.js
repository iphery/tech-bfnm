import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  return handleBudgetSummary(request);
}

export async function POST(request) {
  return handleBudgetSummary(request);
}

async function handleBudgetSummary(request) {
  try {
    const url = new URL(request.url);
    const currentYear = new Date().getFullYear();
    const queryYear = Number(url.searchParams.get('year')) || currentYear;

    // Standard pos anggaran master
    const defaultPos = [
      { code: 'ME01', name: 'Pelumasan', category: 'Oil & Lubricant' },
      { code: 'ME02', name: 'Servis Kendaraan', category: 'Vehicle Service' },
      { code: 'ME03', name: 'Servis Mesin Produksi', category: 'Production Service' },
      { code: 'ME04', name: 'Spare Part Kendaraan', category: 'Vehicle Parts' },
      { code: 'ME05', name: 'Spare Part Mesin Produksi', category: 'Production Parts' },
    ];

    // 1. Fetch Target from Budget_Set table
    let budgetSetRows = [];
    try {
      const [rows] = await pool.query('SELECT * FROM Budget_Set');
      budgetSetRows = rows || [];
    } catch (err) {
      console.warn('Budget_Set query warning:', err.message);
    }

    // 2. Fetch Actual Realization from order_detail (DPM / PO)
    let orderRealization = [];
    try {
      const [oRows] = await pool.query(
        `SELECT 
           od.budget_pos,
           SUM(COALESCE(od.amount, 0)) as total_order_amount,
           COUNT(*) as item_count
         FROM order_detail od
         LEFT JOIN order_main om ON om.id_register = od.id_register
         WHERE od.budget_pos IS NOT NULL 
           AND od.budget_pos != ''
           AND od.amount > 0
           AND YEAR(COALESCE(om.date, om.created_at, NOW())) = ?
         GROUP BY od.budget_pos`,
        [queryYear]
      );
      orderRealization = oRows || [];
    } catch (err) {
      console.error('Error fetching order realization:', err);
    }

    // 3. Fetch Actual Realization from service_detail (Jasa Servis)
    let serviceRealization = [];
    try {
      const [sRows] = await pool.query(
        `SELECT 
           sd.budget_pos,
           SUM(COALESCE(sd.amount, 0)) as total_service_amount,
           COUNT(*) as item_count
         FROM service_detail sd
         LEFT JOIN service sm ON sm.id_register = sd.id_register
         WHERE sd.budget_pos IS NOT NULL 
           AND sd.budget_pos != ''
           AND sd.amount > 0
           AND YEAR(COALESCE(sm.date_issued, sm.created_at, sd.required_date, NOW())) = ?
         GROUP BY sd.budget_pos`,
        [queryYear]
      );
      serviceRealization = sRows || [];
    } catch (err) {
      console.error('Error fetching service realization:', err);
    }

    // Combine realizations by pos
    const realizationMap = new Map();
    orderRealization.forEach((r) => {
      const code = String(r.budget_pos).trim().toUpperCase();
      const current = realizationMap.get(code) || { order_amount: 0, service_amount: 0 };
      current.order_amount += Number(r.total_order_amount || 0);
      realizationMap.set(code, current);
    });

    serviceRealization.forEach((r) => {
      const code = String(r.budget_pos).trim().toUpperCase();
      const current = realizationMap.get(code) || { order_amount: 0, service_amount: 0 };
      current.service_amount += Number(r.total_service_amount || 0);
      realizationMap.set(code, current);
    });

    // Helper to find target budget for a pos code
    const getTargetAmount = (code) => {
      if (!budgetSetRows || budgetSetRows.length === 0) return 0;
      
      // Look for a row that has pos matching code and year matching queryYear
      for (const row of budgetSetRows) {
        // Case 1: Row has fields like pos/code/pos_anggaran/budget_pos
        const rowPos = row.pos || row.code || row.budget_pos || row.budget_code || row.id_pos || '';
        const rowYear = row.year || row.Year || row.tahun || row.periode || row.period || queryYear;

        if (String(rowPos).toUpperCase() === code && Number(rowYear) === queryYear) {
          return Number(row.amount || row.target || row.budget || row.nominal || row.value || 0);
        }

        // Case 2: Column name is ME01, ME02, etc.
        if (row[code] !== undefined) {
          const rowY = row.year || row.Year || row.tahun || queryYear;
          if (Number(rowY) === queryYear) {
            return Number(row[code] || 0);
          }
        }
      }

      // Fallback matching without strict year if only 1 set exists
      for (const row of budgetSetRows) {
        const rowPos = row.pos || row.code || row.budget_pos || row.budget_code || row.id_pos || '';
        if (String(rowPos).toUpperCase() === code) {
          return Number(row.amount || row.target || row.budget || row.nominal || row.value || 0);
        }
        if (row[code] !== undefined) {
          return Number(row[code] || 0);
        }
      }

      return 0;
    };

    // Construct detailed summary per pos
    const posSummary = defaultPos.map((pos) => {
      const rel = realizationMap.get(pos.code) || { order_amount: 0, service_amount: 0 };
      const actualOrder = rel.order_amount;
      const actualService = rel.service_amount;
      const totalActual = actualOrder + actualService;
      const target = getTargetAmount(pos.code);
      const remaining = Math.max(0, target - totalActual);
      const percentage = target > 0 ? Number(((totalActual / target) * 100).toFixed(1)) : 0;

      return {
        code: pos.code,
        name: pos.name,
        category: pos.category,
        target_budget: target,
        actual_order: actualOrder,
        actual_service: actualService,
        actual_total: totalActual,
        remaining_budget: remaining,
        percentage_used: percentage,
        is_overbudget: target > 0 && totalActual > target,
      };
    });

    const grandTarget = posSummary.reduce((acc, p) => acc + p.target_budget, 0);
    const grandActual = posSummary.reduce((acc, p) => acc + p.actual_total, 0);
    const grandRemaining = Math.max(0, grandTarget - grandActual);
    const grandPercentage = grandTarget > 0 ? Number(((grandActual / grandTarget) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      year: queryYear,
      pos_summary: posSummary,
      summary: {
        grand_target: grandTarget,
        grand_actual: grandActual,
        grand_remaining: grandRemaining,
        grand_percentage: grandPercentage,
      },
      raw_budget_set: budgetSetRows,
    });
  } catch (error) {
    console.error('budgetsummary error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

