import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, a.Description, a.Class, a.Type, a.Manufacture, a.Model, a.No, a.Location, u.Name as TechName
       FROM Request r
       LEFT JOIN Assets a ON a.ID_Asset = r.ID_Asset
       LEFT JOIN User u ON u.Uid = r.Technician
       WHERE (r.Step <= 6 OR r.Step IN ('1','2','3','4','5','6')) 
         AND (TRIM(r.Maintenance_Type) = 'CM' OR r.Maintenance_Type IS NULL OR r.Maintenance_Type = '')
       ORDER BY r.Time_Request DESC`
    );

    return NextResponse.json({ outstanding: rows || [] });
  } catch (error) {
    console.error('weboutstanding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
