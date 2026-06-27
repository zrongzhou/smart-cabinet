import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

// Resolve uploads directory (consistent with list route)
function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) {
    console.log('[Upload] Using UPLOAD_DIR from env:', process.env.UPLOAD_DIR);
    return process.env.UPLOAD_DIR;
  }
  const dir = join(process.cwd(), 'uploads');
  console.log('[Upload] Using default UPLOAD_DIR:', dir);
  return dir;
}

const UPLOAD_DIR = getUploadDir();

// Ensure uploads directory exists and is writable
async function ensureUploadDir() {
  try {
    // Create directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });
    console.log('[Upload] Upload directory ensured:', UPLOAD_DIR);
    
    // Check if directory is writable
    try {
      await access(UPLOAD_DIR, constants.W_OK);
      console.log('[Upload] Upload directory is writable');
    } catch (accessErr) {
      console.error('[Upload] Upload directory is NOT writable:', UPLOAD_DIR);
      throw new Error(`Upload directory is not writable: ${UPLOAD_DIR}`);
    }
  } catch (e: any) {
    console.error('[Upload] Failed to create/upload to directory:', UPLOAD_DIR, e);
    throw new Error(`Cannot access upload directory: ${UPLOAD_DIR} - ${e.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    console.log('[Upload] Starting upload...');
    console.log('[Upload] UPLOAD_DIR:', UPLOAD_DIR);
    console.log('[Upload] process.cwd():', process.cwd());
    
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      console.log('[Upload] No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('[Upload] File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}_${random}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    console.log('[Upload] Saving to:', filepath);

    // Convert File to Buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log('[Upload] File uploaded successfully:', filename, 'to', filepath);
    console.log('[Upload] File size on disk:', buffer.length);

    const url = `/api/media/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('[Upload] Upload error:', error);
    console.error('[Upload] Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}
