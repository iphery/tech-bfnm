import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { month, year, type = 'mp' } = body;

    const queryType = String(type).toUpperCase();
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (isNaN(m) || isNaN(y)) {
      return NextResponse.json({ service: [] });
    }

    const [rows] = await pool.query(
      `SELECT 
        r.ID_Request, r.ID_Asset, r.Time_Request, r.Time_Response, r.Time_Repair_Complete,
        r.Problem, r.Solution, r.User, r.POS_Required, r.Time_POS, r.Time_POS_Complete,
        a.Type, a.Class, a.Manufacture, a.Model, a.Description, a.No
       FROM Request r
       LEFT JOIN Assets a ON a.ID_Asset = r.ID_Asset
       WHERE UPPER(a.Type) = ?
         AND MONTH(r.Time_Request) = ?
         AND YEAR(r.Time_Request) = ?
         AND r.Maintenance_Type = 'CM'
       ORDER BY r.Time_Request DESC`,
      [queryType, m, y]
    );

    const service = (rows || []).map((row) => {
      let description = '';
      if (row.Type === 'K') {
        description = [row.Manufacture, row.Model, row.No].filter(Boolean).join(' ');
      } else {
        description = [row.Description, row.Manufacture, row.Model].filter(Boolean).join(' ');
      }

      // Calculate working hours or duration in hours
      let repairTime = 0;
      if (row.Time_Response && row.Time_Repair_Complete) {
        const tResp = new Date(row.Time_Response).getTime();
        const tComp = new Date(row.Time_Repair_Complete).getTime();
        if (!isNaN(tResp) && !isNaN(tComp) && tComp >= tResp) {
          repairTime = (tComp - tResp) / (1000 * 60 * 60);

          if (row.POS_Required === 1 && row.Time_POS && row.Time_POS_Complete) {
            const tPosStart = new Date(row.Time_POS).getTime();
            const tPosEnd = new Date(row.Time_POS_Complete).getTime();
            if (!isNaN(tPosStart) && !isNaN(tPosEnd) && tPosEnd >= tPosStart) {
              const orderTime = (tPosEnd - tPosStart) / (1000 * 60 * 60);
              repairTime = Math.max(0, repairTime - orderTime);
            }
          }
        }
      }

      let formattedDate = '-';
      if (row.Time_Request) {
        const d = new Date(row.Time_Request);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }
      }

      return {
        id_request: row.ID_Request,
        id_asset: row.ID_Asset,
        description: description || row.Description || row.ID_Asset,
        category: row.Class || '-',
        problem: row.Problem || '-',
        solution: row.Solution || '-',
        repair_time: Number(repairTime.toFixed(2)),
        user: row.User || '-',
        time_request: formattedDate,
      };
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('reportservice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
