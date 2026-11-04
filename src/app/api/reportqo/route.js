import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const year = parseInt(body.year, 10) || new Date().getFullYear();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Total machine count for uptime percentage calculation
    const [machineRows] = await pool.query(
      `SELECT COUNT(*) as total FROM Assets WHERE UPPER(Type) = 'MP'`
    );
    const machineCount = machineRows[0]?.total || 1;

    // Fetch all CM requests for this year
    const [requests] = await pool.query(
      `SELECT 
        r.ID_Request, r.ID_Asset, r.Time_Request, r.Time_Response, r.Time_Repair_Complete,
        r.Problem, r.Solution, r.POS_Required, r.Time_POS, r.Time_POS_Complete,
        a.Type
       FROM Request r
       LEFT JOIN Assets a ON a.ID_Asset = r.ID_Asset
       WHERE YEAR(r.Time_Request) = ?
         AND r.Maintenance_Type = 'CM'`,
      [year]
    );

    const result = [];

    for (let m = 1; m <= 12; m++) {
      const monthRequests = (requests || []).filter((r) => {
        if (!r.Time_Request) return false;
        const d = new Date(r.Time_Request);
        return d.getMonth() + 1 === m;
      });

      const mpRequests = monthRequests.filter((r) => String(r.Type).toUpperCase() === 'MP');
      const kRequests = monthRequests.filter((r) => String(r.Type).toUpperCase() === 'K');

      let serviceTime = 0;
      let count = 0;
      let down = 0;
      // Default standard working hours per month (approx 8 hrs * 25 days)
      const hourcount = 200;

      for (const dt of mpRequests) {
        let repairTime = 0;
        if (dt.Time_Response && dt.Time_Repair_Complete) {
          const tResp = new Date(dt.Time_Response).getTime();
          const tComp = new Date(dt.Time_Repair_Complete).getTime();
          if (!isNaN(tResp) && !isNaN(tComp) && tComp >= tResp) {
            repairTime = (tComp - tResp) / (1000 * 60 * 60);

            if (dt.POS_Required === 1 && dt.Time_POS && dt.Time_POS_Complete) {
              const tPosStart = new Date(dt.Time_POS).getTime();
              const tPosEnd = new Date(dt.Time_POS_Complete).getTime();
              if (!isNaN(tPosStart) && !isNaN(tPosEnd) && tPosEnd >= tPosStart) {
                const orderTime = (tPosEnd - tPosStart) / (1000 * 60 * 60);
                repairTime = Math.max(0, repairTime - orderTime);
              }
            }
          }
        }

        serviceTime += repairTime;
        count += 1;

        if (repairTime > hourcount) {
          down += 1;
        }
      }

      const average = count > 0 ? serviceTime / count : 0;
      const percentdown = machineCount > 0 ? ((machineCount - down) / machineCount) * 100 : 100;

      let overhault = 0;
      for (const k of kRequests) {
        const prob = (k.Problem || '').toLowerCase();
        const sol = (k.Solution || '').toLowerCase();
        if (prob.includes('overhault') || prob.includes('overhaul')) {
          overhault += 1;
        }
        if (sol.includes('overhault') || sol.includes('overhaul')) {
          overhault += 1;
        }
      }

      result.push({
        month: m,
        monthname: `${monthNames[m - 1]} ${year}`,
        count: count,
        average: Number(average.toFixed(2)),
        overhault: overhault,
        hour: hourcount,
        down: Number(percentdown.toFixed(2)),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('reportqo error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
