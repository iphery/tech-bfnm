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

    // 1. Fetch all spare part usage logs for this specific machine
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
         stock_summary.id_summary,
         stock_summary.id_part,
         parts.description as part_name,
         parts.vendor_code,
         parts.unit,
         parts.location,
         stock_summary.quantity,
         stock_summary.date,
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

    // 2. Group usage by Month
    const monthGroupsMap = new Map();
    usageLogs.forEach((row) => {
      const key = row.month_key;
      if (!monthGroupsMap.has(key)) {
        monthGroupsMap.set(key, {
          month_key: key,
          month_label: row.month_label,
          year: parseInt(row.year_val, 10),
          month: parseInt(row.month_val, 10),
          total_quantity: 0,
          total_items: 0,
          parts: [],
        });
      }

      const group = monthGroupsMap.get(key);
      group.total_quantity += Number(row.quantity || 0);
      group.total_items += 1;
      group.parts.push({
        id_summary: row.id_summary,
        id_part: row.id_part,
        part_name: row.part_name,
        vendor_code: row.vendor_code,
        unit: row.unit,
        location: row.location,
        quantity: Number(row.quantity || 0),
        date: row.date,
        request_id: row.request_id || '-',
        subject: row.subject || '-',
      });
    });

    const monthlyBreakdown = Array.from(monthGroupsMap.values());

    // 3. Calculate Routine Machine Needs (Perkiraan Kebutuhan Rutin Mesin Ini)
    // Aggregates parts across all recorded history for this asset to show what parts this machine regularly consumes
    const [partFrequencyQuery] = await pool.query(
      `SELECT 
         stock_summary.id_part,
         parts.description as part_name,
         parts.vendor_code,
         parts.unit,
         parts.location,
         SUM(stock_summary.quantity) as total_quantity_used,
         COUNT(*) as replacement_count,
         MIN(stock_summary.date) as first_used,
         MAX(stock_summary.date) as last_used,
         TIMESTAMPDIFF(MONTH, MIN(stock_summary.date), MAX(stock_summary.date)) as active_month_span
       FROM stock_summary
       INNER JOIN parts ON parts.id_part = stock_summary.id_part
       WHERE stock_summary.id_asset = ? AND stock_summary.qty < 0
       GROUP BY stock_summary.id_part, parts.description, parts.vendor_code, parts.unit, parts.location
       ORDER BY total_quantity_used DESC`,
      [idAsset]
    );

    const routineNeeds = partFrequencyQuery.map((row) => {
      const totalQty = Number(row.total_quantity_used || 0);
      const replacementCount = Number(row.replacement_count || 0);
      const monthSpan = Math.max(1, Number(row.active_month_span || 1));
      
      // Monthly average consumption specifically for THIS machine
      const monthlyRate = Number((totalQty / monthSpan).toFixed(1));
      const recommendedStockForMachine = Math.max(1, Math.ceil(monthlyRate));

      let replacementFrequencyText = '';
      if (replacementCount > 1 && row.first_used !== row.last_used) {
        const daysBetween = Math.max(1, Math.round((new Date(row.last_used) - new Date(row.first_used)) / (1000 * 60 * 60 * 24)));
        const avgDaysBetween = Math.round(daysBetween / (replacementCount - 1));
        if (avgDaysBetween < 30) {
          replacementFrequencyText = `Rutin diganti tiap ~${avgDaysBetween} hari`;
        } else {
          const avgMonths = (avgDaysBetween / 30).toFixed(1);
          replacementFrequencyText = `Rutin diganti tiap ~${avgMonths} bulan`;
        }
      } else {
        replacementFrequencyText = 'Pernah diganti 1 kali';
      }

      return {
        id_part: row.id_part,
        part_name: row.part_name,
        vendor_code: row.vendor_code || '',
        unit: row.unit || 'pcs',
        location: row.location || '-',
        total_quantity_used: totalQty,
        replacement_count: replacementCount,
        monthly_rate: monthlyRate,
        recommended_monthly_need: recommendedStockForMachine,
        frequency_note: replacementFrequencyText,
        last_used: row.last_used,
      };
    });

    const totalAllPartsQuantity = usageLogs.reduce((acc, row) => acc + Number(row.quantity || 0), 0);

    return NextResponse.json({
      id_asset: idAsset,
      total_parts_quantity: totalAllPartsQuantity,
      total_records: usageLogs.length,
      monthly_breakdown: monthlyBreakdown,
      routine_needs: routineNeeds, // Estimated regular needs for this machine
    });
  } catch (error) {
    console.error('assetpartsusage error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

