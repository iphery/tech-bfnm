import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'ALL'; // 'CM' | 'PM' | 'ALL'

    let whereClause = 'r.Step < 5';
    const params = [];

    if (type === 'CM') {
      whereClause += " AND r.Maintenance_Type = 'CM'";
    } else if (type === 'PM') {
      whereClause += " AND r.Maintenance_Type = 'PM'";
    } else {
      whereClause += " AND (r.Maintenance_Type = 'CM' OR r.Maintenance_Type = 'PM')";
    }

    const query = `
      SELECT 
        r.ID_Request, 
        r.ID_Asset, 
        r.Time_Request, 
        r.Maintenance_Type,
        r.Problem, 
        r.Step, 
        r.Requestor, 
        r.Technician,
        r.Time_Response,
        r.Time_Repair_Complete,
        a.Description, 
        a.Manufacture, 
        a.Model, 
        a.Type, 
        a.Location, 
        a.No,
        COALESCE(u.Name, '-') as tech_name
      FROM Request r
      LEFT JOIN Assets a ON a.ID_Asset = r.ID_Asset
      LEFT JOIN User u ON u.Uid = r.Technician
      WHERE ${whereClause}
      ORDER BY r.Time_Request DESC
    `;

    const [rows] = await pool.query(query, params);

    // Count summary
    const [counts] = await pool.query(`
      SELECT 
        SUM(CASE WHEN Maintenance_Type = 'CM' AND Step < 5 THEN 1 ELSE 0 END) as cm_count,
        SUM(CASE WHEN Maintenance_Type = 'PM' AND Step < 5 THEN 1 ELSE 0 END) as pm_count,
        SUM(CASE WHEN (Maintenance_Type = 'CM' OR Maintenance_Type = 'PM') AND Step < 5 THEN 1 ELSE 0 END) as total_count
      FROM Request
    `);

    return NextResponse.json({
      success: true,
      data: rows || [],
      counts: {
        cm: Number(counts[0]?.cm_count || 0),
        pm: Number(counts[0]?.pm_count || 0),
        total: Number(counts[0]?.total_count || 0),
      },
    });
  } catch (error) {
    console.error('API /api/maintenanceactivity error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
