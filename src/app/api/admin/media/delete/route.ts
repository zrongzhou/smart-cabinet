import { NextRequest, NextResponse } from 'next/server';
import { unlink, stat } from 'fs/promises';
import { join } from 'path';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

// Resolve uploads directory (consistent with upload/list routes)
function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  return join(process.cwd(), 'uploads');
}

const UPLOAD_DIR = getUploadDir();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filepath = join(UPLOAD_DIR, filename);

    // Verify file exists
    try {
      await stat(filepath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await unlink(filepath);
    console.log('[Delete] File deleted successfully:', filename);

    return NextResponse.json({ success: true, message: `Deleted ${filename}` });
  } catch (error) {
    console.error('[Delete] Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
