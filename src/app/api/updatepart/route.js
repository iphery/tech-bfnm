import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      idPart,
      description,
      vendor_code,
      unit,
      location,
      remark,
      status,
      is_import,
      image,
    } = body;

    if (!idPart) {
      return NextResponse.json({ error: 'idPart is required' }, { status: 400 });
    }

    // Process image if base64 provided
    let imagePath = image;
    if (typeof image === 'string' && image.startsWith('data:image')) {
      try {
        const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = `part_${idPart}_${Date.now()}.${ext}`;

          const balifoamDir = '/home/balifoam/public_html/mita/mobile/flutter/image_spare_part';

          // 1. If server has direct filesystem access to balifoam public_html (on production server)
          if (fs.existsSync(balifoamDir)) {
            const filepath = path.join(balifoamDir, filename);
            fs.writeFileSync(filepath, buffer);
            imagePath = filename;
          } else {
            // 2. Upload via HTTP to Balifoam server
            let uploadedRemotely = false;

            // 2a. Try direct upload script inside image_spare_part/upload.php
            try {
              const uploadRes = await fetch('https://balifoam.com/mita/mobile/flutter/image_spare_part/upload.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image, idPart, filename }),
              });
              if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                if (uploadData.error === 0 && uploadData.filename) {
                  imagePath = uploadData.filename;
                  uploadedRemotely = true;
                }
              }
            } catch (phpErr) {
              // upload.php not yet uploaded or network error
            }

            // 2b. Try Laravel API endpoint
            if (!uploadedRemotely) {
              try {
                const remoteRes = await fetch('https://mitalaravel.balifoam.com/api/savingpartimage', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image, idPart }),
                });
                if (remoteRes.ok) {
                  const data = await remoteRes.json();
                  if (data.image) {
                    imagePath = data.image;
                    uploadedRemotely = true;
                  }
                }
              } catch (remoteErr) {
                // Laravel endpoint not yet added
              }
            }

            // 2c. Fallback to local Next.js storage
            if (!uploadedRemotely) {
              const dir = path.join(process.cwd(), 'public', 'images', 'parts');
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              const filepath = path.join(dir, filename);
              fs.writeFileSync(filepath, buffer);
              imagePath = filename;
            }
          }
        }
      } catch (imgErr) {
        console.error('Failed to save part image:', imgErr);
      }
    }

    // Build dynamic UPDATE query
    const fields = [];
    const values = [];

    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (vendor_code !== undefined) {
      fields.push('vendor_code = ?');
      values.push(vendor_code);
    }
    if (unit !== undefined) {
      fields.push('unit = ?');
      values.push(unit);
    }
    if (location !== undefined) {
      fields.push('location = ?');
      values.push(location);
    }
    if (remark !== undefined) {
      fields.push('remark = ?');
      values.push(remark);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (is_import !== undefined) {
      fields.push('is_import = ?');
      values.push(Number(is_import) === 1 ? 1 : 0);
    }
    if (imagePath !== undefined) {
      fields.push('image = ?');
      values.push(imagePath);
    }

    if (fields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' });
    }

    values.push(idPart);
    const query = `UPDATE parts SET ${fields.join(', ')} WHERE id_part = ?`;
    await pool.query(query, values);

    return NextResponse.json({
      message: 'Suku cadang berhasil diperbarui',
      image: imagePath,
    });
  } catch (error) {
    console.error('updatepart error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

