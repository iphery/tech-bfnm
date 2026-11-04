import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idRequest, idAsset } = body;

    const [assets] = await pool.query('SELECT PM_Category, Type FROM Assets WHERE ID_Asset = ?', [idAsset]);
    if (assets.length === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const { PM_Category: pm, Type: asset_type } = assets[0];
    const maintenance_category = pm;
    let selected_pm = pm;

    if (asset_type === 'K') {
      if (pm === 'AD') {
        const [sch] = await pool.query('SELECT Service FROM TimeVehicleSchedule WHERE ID_Asset = ?', [idAsset]);
        selected_pm = sch.length > 0 ? sch[0].Service : '';
      } else {
        const [sch] = await pool.query('SELECT Next_Maintenance FROM KMbasedSchedule WHERE ID_Asset = ?', [idAsset]);
        const next_maintenance = sch.length > 0 ? sch[0].Next_Maintenance : '';
        if (next_maintenance === 'Minor Service') {
          selected_pm = 'KM';
        } else if (next_maintenance === 'Intermediate Service') {
          selected_pm = 'KI';
        } else if (next_maintenance === 'Full Service') {
          selected_pm = 'KF';
        }
      }
    } else if (asset_type === 'GS') {
      const month = new Date().getMonth() + 1;
      selected_pm = month === 12 ? 'GF' : 'GM';
    } else if (asset_type === 'FK' && maintenance_category === 'FK') {
      const [sch] = await pool.query('SELECT Service FROM TimeVehicleSchedule WHERE ID_Asset = ?', [idAsset]);
      selected_pm = sch.length > 0 ? sch[0].Service : '';
    } else if (asset_type === 'AD') {
      const [sch] = await pool.query('SELECT Service FROM TimeVehicleSchedule WHERE ID_Asset = ?', [idAsset]);
      selected_pm = sch.length > 0 ? sch[0].Service : '';
    }

    const [lists] = await pool.query('SELECT Code, Description, Assign, Widget FROM Checklist_Code WHERE Assign = ?', [selected_pm]);
    const result = lists.map((list) => ({
      code: list.Code,
      description: list.Description,
      assign: list.Assign,
      widget: list.Widget,
      checked: false,
      value: '',
    }));

    await pool.query('UPDATE Request SET new_checklist = ? WHERE ID_Request = ?', [JSON.stringify(result), idRequest]);
    return NextResponse.json({ response: 'Checklist added' });
  } catch (error) {
    console.error('addchecklist error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
