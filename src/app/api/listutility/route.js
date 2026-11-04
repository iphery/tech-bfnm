import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT R.*, q1.Name as requestor, q1.imageUrl as requestor_image, q2.Name as technician
       FROM RequestOthers R
       LEFT JOIN User q1 ON q1.Uid = R.ID_Requestor
       LEFT JOIN User q2 ON q2.Uid = R.ID_Tech
       ORDER BY R.Time_Request DESC`
    );

    const [imageRows] = await pool.query(
      `SELECT ID_Request, Image_Name FROM Image`
    );

    const imageMap = {};
    for (const img of imageRows || []) {
      if (!imageMap[img.ID_Request]) {
        imageMap[img.ID_Request] = [];
      }
      imageMap[img.ID_Request].push(img.Image_Name);
    }

    const images = (rows || []).map((row) => imageMap[row.ID_Request] || []);

    return NextResponse.json({ response: rows || [], image: images });
  } catch (error) {
    console.error('listutility error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
