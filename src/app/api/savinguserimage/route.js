import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, idAsset } = body;

    if (!idAsset) {
      return NextResponse.json({ error: 1, message: 'idAsset is required' }, { status: 400 });
    }

    if (!image) {
      return NextResponse.json({ error: 1, message: 'image is required' }, { status: 400 });
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const cleanAssetId = idAsset.replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `user_${cleanAssetId}_${timeStr}.jpg`;

    let newUserImageName = null;
    let uploadedRemotely = false;

    // 1. Coba upload ke remote balifoam
    try {
      const phpUserRes = await fetch('https://balifoam.com/mita/mobile/flutter/image_user_profile/upload.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: cleanBase64, idAsset, filename }),
      });
      if (phpUserRes.ok) {
        const uData = await phpUserRes.json();
        if (uData.error === 0 && uData.filename) {
          newUserImageName = uData.filename;
          uploadedRemotely = true;
        }
      }
    } catch (err) {}

    // 2. Coba upload ke laravel api
    if (!uploadedRemotely) {
      try {
        const laravelRes = await fetch('https://mitalaravel.balifoam.com/api/savinguserpicture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: cleanBase64, idAsset }),
        });
        if (laravelRes.ok) {
          const lData = await laravelRes.json();
          if (lData.image || lData.filename) {
            newUserImageName = lData.image || lData.filename;
            uploadedRemotely = true;
          }
        }
      } catch (err) {}
    }

    // 3. Fallback simpan lokal public
    if (!uploadedRemotely) {
      const localUserDir = path.join(process.cwd(), 'public', 'images', 'users');
      if (!fs.existsSync(localUserDir)) {
        fs.mkdirSync(localUserDir, { recursive: true });
      }
      const userFilepath = path.join(localUserDir, filename);
      fs.writeFileSync(userFilepath, buffer);
      newUserImageName = filename;
    }

    // 4. Update database Assets kolom Profile_Image
    await pool.query('UPDATE Assets SET Profile_Image = ? WHERE ID_Asset = ?', [newUserImageName, idAsset]);

    return NextResponse.json({
      error: 0,
      message: 'Successfull',
      filename: newUserImageName,
    });
  } catch (error) {
    console.error('savinguserimage error:', error);
    return NextResponse.json({ error: 1, message: error.message }, { status: 500 });
  }
}
