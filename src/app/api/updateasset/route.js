import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      idAsset,
      Description,
      Class,
      Type,
      Manufacture,
      Model,
      No,
      Location,
      User,
      PM_Category,
      Based,
      Capacity,
      Power,
      Voltage,
      Phase,
      Frequency,
      Year_Manufacture,
      Serial_Number,
      image, // base64
    } = body;

    if (!idAsset) {
      return NextResponse.json({ error: 'idAsset is required' }, { status: 400 });
    }

    let newImageName = null;

    if (image && typeof image === 'string') {
      const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `${idAsset.replace(/[^a-zA-Z0-9_-]/g, '')}_${timeStr}.jpg`;

      let uploadedRemotely = false;

      // 1. Try Balifoam PHP upload script in image_asset folder
      try {
        const phpRes = await fetch('https://balifoam.com/mita/mobile/flutter/image_asset/upload.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: cleanBase64, idAsset, filename }),
        });
        if (phpRes.ok) {
          const phpData = await phpRes.json();
          if (phpData.error === 0 && phpData.filename) {
            newImageName = phpData.filename;
            uploadedRemotely = true;
          }
        }
      } catch (err) {
        // upload.php not yet uploaded
      }

      // 2. Try Laravel API endpoint
      if (!uploadedRemotely) {
        try {
          const laravelRes = await fetch('https://mitalaravel.balifoam.com/api/savingassetpicture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: cleanBase64, idAsset }),
          });
          if (laravelRes.ok) {
            const lData = await laravelRes.json();
            if (lData.image || lData.filename) {
              newImageName = lData.image || lData.filename;
              uploadedRemotely = true;
            }
          }
        } catch (err) {
          // laravel endpoint fallback
        }
      }

      // 3. Fallback: Save to Next.js public directory
      if (!uploadedRemotely) {
        const localDir = path.join(process.cwd(), 'public', 'images', 'assets');
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        const filepath = path.join(localDir, filename);
        fs.writeFileSync(filepath, buffer);
        newImageName = filename;
      }
    }

    // Build update fields dynamically
    const updateFields = [];
    const updateValues = [];

    const fieldMap = {
      Description,
      Class,
      Type,
      Manufacture,
      Model,
      No,
      Location,
      User,
      PM_Category,
      Based,
      Capacity,
      Power,
      Voltage,
      Phase,
      Frequency,
      Year_Manufacture,
      Serial_Number,
    };

    Object.entries(fieldMap).forEach(([col, val]) => {
      if (val !== undefined) {
        updateFields.push(`${col} = ?`);
        updateValues.push(val);
      }
    });

    if (newImageName) {
      updateFields.push('Image = ?');
      updateValues.push(newImageName);
    }

    if (updateFields.length > 0) {
      updateValues.push(idAsset);
      await pool.query(
        `UPDATE Assets SET ${updateFields.join(', ')} WHERE ID_Asset = ?`,
        updateValues
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data aset berhasil diperbarui',
      image: newImageName,
    });
  } catch (error) {
    console.error('updateasset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

