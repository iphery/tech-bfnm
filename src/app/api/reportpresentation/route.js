import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { calculateWorkingHours } from '@/lib/timeFunction';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const currentYear = new Date().getFullYear();
    const queryYear = Number(url.searchParams.get('year')) || currentYear;
    const yearStr = String(queryYear);

    const yearStart = `${queryYear}-01-01 00:00:00`;
    const yearEnd = `${queryYear}-12-31 23:59:59`;

    // 1. Fetch Target Values from Budget_Set
    const [budgetSetRows] = await pool.query(
      'SELECT id, code, description, value, bulan, tahun FROM Budget_Set WHERE tahun = ?',
      [yearStr]
    );

    // Helpers to get total target & monthly targets for budget pos
    const getBudgetPosTargetTotal = (posCode) => {
      const norm = String(posCode || '').toUpperCase();
      let sum = 0;
      for (const row of budgetSetRows || []) {
        const c = String(row.code || '').trim().toUpperCase();
        let matchCode = c;
        if (c === 'ME1') matchCode = 'ME01';
        else if (c === 'ME2') matchCode = 'ME03';
        else if (c === 'ME3') matchCode = 'ME02';
        else if (c === 'ME4') matchCode = 'ME04';
        else if (c === 'ME5') matchCode = 'ME05';

        if (matchCode === norm) {
          sum += Number(row.value || 0);
        }
      }
      return sum;
    };

    const getBudgetPosTargetMonthly = (posCode) => {
      const norm = String(posCode || '').toUpperCase();
      const monthly = Array(12).fill(0);
      for (const row of budgetSetRows || []) {
        const c = String(row.code || '').trim().toUpperCase();
        let matchCode = c;
        if (c === 'ME1') matchCode = 'ME01';
        else if (c === 'ME2') matchCode = 'ME03';
        else if (c === 'ME3') matchCode = 'ME02';
        else if (c === 'ME4') matchCode = 'ME04';
        else if (c === 'ME5') matchCode = 'ME05';

        if (matchCode === norm) {
          const m = Number(row.bulan);
          if (m >= 1 && m <= 12) {
            monthly[m - 1] = Number(row.value || 0);
          }
        }
      }
      return monthly;
    };

    // Helpers to get repair targets (general & monthly)
    const getRepairTargetMonthly = (codeStr, defaultVal) => {
      const norm = String(codeStr || '').toUpperCase();
      let genVal = null;
      for (const row of budgetSetRows || []) {
        if (String(row.code || '').toUpperCase() === norm && Number(row.bulan) === 0) {
          genVal = Number(row.value || 0);
          break;
        }
      }
      const monthly = Array(12).fill(genVal !== null && genVal > 0 ? genVal : defaultVal);

      // Check if specific month targets are configured
      for (const row of budgetSetRows || []) {
        if (String(row.code || '').toUpperCase() === norm) {
          const m = Number(row.bulan);
          if (m >= 1 && m <= 12 && Number(row.value) > 0) {
            monthly[m - 1] = Number(row.value);
          }
        }
      }
      return {
        general: genVal !== null && genVal > 0 ? genVal : defaultVal,
        monthly,
      };
    };

    const targetRtmConfig = getRepairTargetMonthly('RTM', 7); // Default 7 Jam
    const targetRtkConfig = getRepairTargetMonthly('RTK', 15); // Default 15 Jam

    // 2. Fetch Repair Tickets for MP and K
    const [repairRequests] = await pool.query(
      `SELECT r.ID_Request, r.ID_Asset, r.Time_Request, 
              r.Time_Response, r.Time_Repair_Complete, 
              r.Time_POS, r.Time_POS_Complete, r.POS_Required,
              r.Problem, r.Step,
              COALESCE(u.Name, '-') as technician_name,
              a.Description as asset_name, a.Manufacture as manufacture, a.Model as model, a.Type as asset_type
       FROM Request r
       LEFT JOIN Assets a ON a.ID_Asset = r.ID_Asset
       LEFT JOIN User u ON u.Uid = r.Technician
       WHERE (a.Type = 'MP' OR a.Type = 'K')
         AND r.Maintenance_Type = 'CM'
         AND r.Time_Request >= ? AND r.Time_Request <= ?
         AND r.Time_Repair_Complete IS NOT NULL
       ORDER BY r.Time_Request DESC`,
      [yearStart, yearEnd]
    );

    const mpTickets = [];
    const kTickets = [];
    let totalMpHours = 0;
    let totalKHours = 0;

    // Monthly aggregates for MP & K (12 months: 0..11)
    const mpMonthlySum = Array(12).fill(0);
    const mpMonthlyCount = Array(12).fill(0);
    const kMonthlySum = Array(12).fill(0);
    const kMonthlyCount = Array(12).fill(0);

    for (const row of repairRequests) {
      const orderTime =
        row.POS_Required === 1
          ? calculateWorkingHours(row.Time_POS, row.Time_POS_Complete, row.Time_Request)
          : 0;
      const totalRepair = calculateWorkingHours(
        row.Time_Response,
        row.Time_Repair_Complete,
        row.Time_Request
      );
      const repairHours = Math.max(0, Number((totalRepair - orderTime).toFixed(2)));

      const reqDate = new Date(row.Time_Request);
      const mIdx = !isNaN(reqDate.getTime()) ? reqDate.getMonth() : -1;

      const ticketItem = {
        id_request: row.ID_Request,
        id_asset: row.ID_Asset,
        asset_name: row.asset_name || 'Tanpa Nama Mesin',
        manufacture: row.manufacture || '-',
        model: row.model || '',
        problem: row.Problem || '-',
        technician: row.technician_name,
        time_request: row.Time_Request,
        time_repair_complete: row.Time_Repair_Complete,
        repair_hours: repairHours,
        asset_type: row.asset_type,
      };

      if (row.asset_type === 'MP') {
        mpTickets.push(ticketItem);
        totalMpHours += repairHours;
        if (mIdx >= 0 && mIdx < 12) {
          mpMonthlySum[mIdx] += repairHours;
          mpMonthlyCount[mIdx] += 1;
        }
      } else if (row.asset_type === 'K') {
        kTickets.push(ticketItem);
        totalKHours += repairHours;
        if (mIdx >= 0 && mIdx < 12) {
          kMonthlySum[mIdx] += repairHours;
          kMonthlyCount[mIdx] += 1;
        }
      }
    }

    const avgMpHours = mpTickets.length > 0 ? Number((totalMpHours / mpTickets.length).toFixed(2)) : 0;
    const avgKHours = kTickets.length > 0 ? Number((totalKHours / kTickets.length).toFixed(2)) : 0;

    const mpMonthlyActual = mpMonthlySum.map((sum, i) =>
      mpMonthlyCount[i] > 0 ? Number((sum / mpMonthlyCount[i]).toFixed(2)) : 0
    );
    const kMonthlyActual = kMonthlySum.map((sum, i) =>
      kMonthlyCount[i] > 0 ? Number((sum / kMonthlyCount[i]).toFixed(2)) : 0
    );

    // 3. Fetch Realization for Budget Pos
    // 3a. Order Details (DPM / PO)
    const [orderRows] = await pool.query(
      `SELECT 
         od.ids as id, od.id_register, od.description as item, od.unit, od.quantity, 
         od.amount, od.seller as supplier, od.budget_pos,
         COALESCE(om.date, om.created_at, NOW()) as transaction_date
       FROM order_detail od
       LEFT JOIN order_main om ON om.id_register = od.id_register
       WHERE od.budget_pos IS NOT NULL 
         AND od.budget_pos != ''
         AND od.amount > 0
         AND YEAR(COALESCE(om.date, om.created_at, NOW())) = ?
       ORDER BY transaction_date DESC`,
      [queryYear]
    );

    // 3b. Service Details (DPS / Jasa)
    const [serviceRows] = await pool.query(
      `SELECT 
         sd.ids as id, sd.id_register, sd.item, sd.unit, sd.quantity, 
         sd.amount, sd.supplier, sd.budget_pos,
         COALESCE(sm.date_issued, sm.created_at, sd.required_date, NOW()) as transaction_date
       FROM service_detail sd
       LEFT JOIN service sm ON sm.id_register = sd.id_register
       WHERE sd.budget_pos IS NOT NULL 
         AND sd.budget_pos != ''
         AND sd.amount > 0
         AND YEAR(COALESCE(sm.date_issued, sm.created_at, sd.required_date, NOW())) = ?
       ORDER BY transaction_date DESC`,
      [queryYear]
    );

    // Map Pos definitions
    const BUDGET_POS_CONFIG = [
      {
        code: 'ME01',
        kpiNumber: 3,
        name: 'Budget Pelumasan',
        category: 'Oil & Lubricant',
        iconType: 'oil',
      },
      {
        code: 'ME02',
        kpiNumber: 4,
        name: 'Budget Servis Kendaraan',
        category: 'Vehicle Service',
        iconType: 'truck-service',
      },
      {
        code: 'ME03',
        kpiNumber: 5,
        name: 'Budget Servis Mesin Produksi',
        category: 'Production Service',
        iconType: 'factory-service',
      },
      {
        code: 'ME04',
        kpiNumber: 6,
        name: 'Budget Spare Part Kendaraan',
        category: 'Vehicle Parts',
        iconType: 'truck-part',
      },
      {
        code: 'ME05',
        kpiNumber: 7,
        name: 'Budget Spare Part Mesin Produksi',
        category: 'Production Parts',
        iconType: 'factory-part',
      },
    ];

    const budgetKpis = BUDGET_POS_CONFIG.map((pos) => {
      const target = getBudgetPosTargetTotal(pos.code);
      const monthlyTarget = getBudgetPosTargetMonthly(pos.code);

      // Monthly actual array (12 months)
      const monthlyActual = Array(12).fill(0);

      // Filter supporting transactions
      const posOrders = (orderRows || [])
        .filter((r) => String(r.budget_pos).trim().toUpperCase() === pos.code)
        .map((r) => {
          const tDate = new Date(r.transaction_date);
          const mIdx = !isNaN(tDate.getTime()) ? tDate.getMonth() : -1;
          if (mIdx >= 0 && mIdx < 12) {
            monthlyActual[mIdx] += Number(r.amount || 0);
          }
          return {
            ...r,
            source_type: 'Pembelian (PO / DPM)',
            source_tag: 'PO',
          };
        });

      const posServices = (serviceRows || [])
        .filter((r) => String(r.budget_pos).trim().toUpperCase() === pos.code)
        .map((r) => {
          const tDate = new Date(r.transaction_date);
          const mIdx = !isNaN(tDate.getTime()) ? tDate.getMonth() : -1;
          if (mIdx >= 0 && mIdx < 12) {
            monthlyActual[mIdx] += Number(r.amount || 0);
          }
          return {
            ...r,
            source_type: 'Jasa Luar (DPS)',
            source_tag: 'DPS',
          };
        });

      const orderSum = posOrders.reduce((acc, o) => acc + Number(o.amount || 0), 0);
      const serviceSum = posServices.reduce((acc, s) => acc + Number(s.amount || 0), 0);
      const totalActual = orderSum + serviceSum;
      const remaining = Math.max(0, target - totalActual);
      const percentage = target > 0 ? Number(((totalActual / target) * 100).toFixed(1)) : 0;
      const isOver = target > 0 && totalActual > target;

      return {
        kpi_number: pos.kpiNumber,
        code: pos.code,
        name: pos.name,
        category: pos.category,
        icon_type: pos.iconType,
        target,
        monthly_target: monthlyTarget,
        monthly_actual: monthlyActual,
        actual_order: orderSum,
        actual_service: serviceSum,
        actual_total: totalActual,
        remaining,
        percentage,
        is_overbudget: isOver,
        status: isOver ? 'overbudget' : target > 0 ? 'achieved' : 'no_target',
        supporting_transactions: [...posOrders, ...posServices],
      };
    });

    const kpiSummary = {
      year: queryYear,
      kpi_1_mp: {
        kpi_number: 1,
        code: 'RTM',
        name: 'Rata-rata Kecepatan Perbaikan Mesin Produksi',
        unit: 'Jam',
        actual: avgMpHours,
        target: targetRtmConfig.general,
        monthly_target: targetRtmConfig.monthly,
        monthly_actual: mpMonthlyActual,
        count: mpTickets.length,
        total_hours: Number(totalMpHours.toFixed(2)),
        is_achieved: avgMpHours <= targetRtmConfig.general,
        supporting_tickets: mpTickets,
      },
      kpi_2_k: {
        kpi_number: 2,
        code: 'RTK',
        name: 'Rata-rata Kecepatan Perbaikan Kendaraan',
        unit: 'Jam',
        actual: avgKHours,
        target: targetRtkConfig.general,
        monthly_target: targetRtkConfig.monthly,
        monthly_actual: kMonthlyActual,
        count: kTickets.length,
        total_hours: Number(totalKHours.toFixed(2)),
        is_achieved: avgKHours <= targetRtkConfig.general,
        supporting_tickets: kTickets,
      },
      budget_kpis: budgetKpis,
    };

    return NextResponse.json({
      success: true,
      data: kpiSummary,
    });
  } catch (error) {
    console.error('reportpresentation GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
