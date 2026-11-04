import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRequest, datetime, mode } = body;

    let field = null;
    switch (mode) {
      case 'request':
        field = 'Time_Request';
        break;
      case 'response':
        field = 'Time_Response';
        break;
      case 'part_request':
        field = 'Time_POS';
        break;
      case 'part_receive':
        field = 'Time_POS_Complete';
        break;
      case 'completed':
        field = 'Time_Repair_Complete';
        break;
      case 'checked':
        field = 'Tech_SPV';
        break;
      default:
        field = null;
    }

    if (field && idRequest) {
      await pool.query(
        `UPDATE Request SET ${field} = ? WHERE ID_Request = ?`,
        [datetime, idRequest]
      );
    }

    return NextResponse.json({ response: 'OK' });
  } catch (error) {
    console.error('updatealltime error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
