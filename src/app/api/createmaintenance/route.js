import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idAsset, uid } = body;

    let username = 'User';
    if (uid) {
      const [users] = await pool.query('SELECT Name FROM User WHERE Uid = ?', [uid]);
      if (users.length > 0) {
        username = users[0].Name;
      }
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const idRegister = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const timeRequest = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    await pool.query(
      `INSERT INTO Request (ID_Request, ID_Asset, Time_Request, Maintenance_Type, Problem, Requestor, Step, ID_Requestor)
       VALUES (?, ?, ?, 'PM', 'Perawatan rutin...', ?, 1, ?)`,
      [idRegister, idAsset, timeRequest, username, uid]
    );

    await pool.query(
      `UPDATE Assets SET Reserve = 1, View = 1 WHERE ID_Asset = ?`,
      [idAsset]
    );

    return NextResponse.json({ error: 0, message: 'Successfull' });
  } catch (error) {
    console.error('createmaintenance error:', error);
    return NextResponse.json({ error: 1, message: error.message }, { status: 500 });
  }
}
