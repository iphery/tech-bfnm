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
    const filename = `${cleanAssetId}_${timeStr}.jpg`;

    let newImageName = null;
    let uploadedRemotely = false;

    // 1. Coba upload ke remote balifoam
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

    // 2. Coba upload ke laravel api
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

    // 3. Fallback simpan lokal public
    if (!uploadedRemotely) {
      const localDir = path.join(process.cwd(), 'public', 'images', 'assets');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      const filepath = path.join(localDir, filename);
      fs.writeFileSync(filepath, buffer);
      newImageName = filename;
    }

    // 4. Update database Assets kolom Image
    await pool.query('UPDATE Assets SET Image = ? WHERE ID_Asset = ?', [newImageName, idAsset]);

    return NextResponse.json({
      error: 0,
      message: 'Successfull',
      filename: newImageName,
    });
  } catch (error) {
    console.error('savingassetimage error:', error);
    return NextResponse.json({ error: 1, message: error.message }, { status: 500 });
  }
}
