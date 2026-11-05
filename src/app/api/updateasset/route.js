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
      image, // base64 foto aset
      user_image, // base64 foto user pemegang
    } = body;

    if (!idAsset) {
      return NextResponse.json({ error: 'idAsset is required' }, { status: 400 });
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const cleanAssetId = idAsset.replace(/[^a-zA-Z0-9_-]/g, '');

    // 1. Process Asset Image
    let newImageName = null;
    if (image && typeof image === 'string') {
      const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const filename = `${cleanAssetId}_${timeStr}.jpg`;

      let uploadedRemotely = false;
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
      } catch (err) {}

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
        } catch (err) {}
      }

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

    // 2. Process User / Profile Image
    let newUserImageName = null;
    if (user_image && typeof user_image === 'string') {
      const cleanUserBase64 = user_image.replace(/^data:image\/\w+;base64,/, '');
      const userBuffer = Buffer.from(cleanUserBase64, 'base64');
      const userFilename = `user_${cleanAssetId}_${timeStr}.jpg`;

      let uploadedUserRemotely = false;
      try {
        const phpUserRes = await fetch('https://balifoam.com/mita/mobile/flutter/image_user_profile/upload.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: cleanUserBase64, idAsset, filename: userFilename }),
        });
        if (phpUserRes.ok) {
          const uData = await phpUserRes.json();
          if (uData.error === 0 && uData.filename) {
            newUserImageName = uData.filename;
            uploadedUserRemotely = true;
          }
        }
      } catch (err) {}

      if (!uploadedUserRemotely) {
        const localUserDir = path.join(process.cwd(), 'public', 'images', 'users');
        if (!fs.existsSync(localUserDir)) {
          fs.mkdirSync(localUserDir, { recursive: true });
        }
        const userFilepath = path.join(localUserDir, userFilename);
        fs.writeFileSync(userFilepath, userBuffer);
        newUserImageName = userFilename;
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

    if (newUserImageName) {
      updateFields.push('Profile_Image = ?');
      updateValues.push(newUserImageName);
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
      profile_image: newUserImageName,
    });
  } catch (error) {
    console.error('updateasset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
