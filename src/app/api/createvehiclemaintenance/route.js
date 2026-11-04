import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idAsset, km: current_km, uid } = body;

    let username = 'User';
    if (uid) {
      const [users] = await pool.query('SELECT Name FROM User WHERE Uid = ?', [uid]);
      if (users.length > 0) {
        username = users[0].Name;
      }
    }

    const [assets] = await pool.query('SELECT Based FROM Assets WHERE ID_Asset = ?', [idAsset]);
    const based = assets.length > 0 ? assets[0].Based : null;

    let problem = 'Perawatan rutin...';
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const idRegister = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const timeRequest = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    if (based === 'KM') {
      const [kmSchedules] = await pool.query('SELECT Schedule_KM, Next_Maintenance FROM KMbasedSchedule WHERE ID_Asset = ?', [idAsset]);
      let schedule = 0;
      let nextMaintenance = '';
      if (kmSchedules.length > 0) {
        schedule = kmSchedules[0].Schedule_KM;
        nextMaintenance = kmSchedules[0].Next_Maintenance;
      }

      problem = `${nextMaintenance} @ schedule KM ${schedule}`;
      const terlambat = Number(current_km) - Number(schedule);

      await pool.query(
        'UPDATE KMbasedSchedule SET Current_KM = ?, Late_KM = ? WHERE ID_Asset = ?',
        [current_km, terlambat, idAsset]
      );

      await pool.query(
        `INSERT INTO KMLateService (ID_Request, ID_Asset, ScheduleKM, ServiceKM, Late)
         VALUES (?, ?, ?, ?, ?)`,
        [idRegister, idAsset, schedule, current_km, terlambat]
      );
    } else {
      const [timeSchedules] = await pool.query('SELECT Service FROM TimeVehicleSchedule WHERE ID_Asset = ?', [idAsset]);
      const nextService = timeSchedules.length > 0 ? timeSchedules[0].Service : '';
      if (nextService === 'KI') {
        problem = 'Perawatan rutin - Intermediate Service';
      } else if (nextService === 'KM') {
        problem = 'Perawatan rutin - Minor Service';
      } else if (nextService === 'KF') {
        problem = 'Perawatan rutin - Full Service';
      }
    }

    await pool.query(
      `INSERT INTO Request (ID_Request, ID_Asset, Time_Request, Maintenance_Type, Problem, Requestor, Step, ID_Requestor)
       VALUES (?, ?, ?, 'PM', ?, ?, 1, ?)`,
      [idRegister, idAsset, timeRequest, problem, username, uid]
    );

    await pool.query('UPDATE Assets SET Reserve = 1 WHERE ID_Asset = ?', [idAsset]);

    return NextResponse.json({ error: 0, message: 'Successfull' });
  } catch (error) {
    console.error('createvehiclemaintenance error:', error);
    return NextResponse.json({ error: 1, message: error.message }, { status: 500 });
  }
}
