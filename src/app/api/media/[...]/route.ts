import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// Resolve uploads directory (consistent with admin/media routes)
function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  return join(process.cwd(), 'uploads');
}

const UPLOAD_DIR = getUploadDir();

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[]; [key: string]: string[] | undefined }> }
) {
  try {
    const resolvedParams = await params;
    // Support both "path" (catch-all [...]) and direct array params
    const pathSegments = resolvedParams?.path || Object.values(resolvedParams || {})[0] || [];
    // If it's not an array, treat entire string as filename
    const filename = Array.isArray(pathSegments)
      ? pathSegments.join('/')
      : String(pathSegments || '');

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const filepath = join(UPLOAD_DIR, filename);

    // Verify file exists
    let fileStats;
    try {
      fileStats = await stat(filepath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (!fileStats.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 400 });
    }

    const buffer = await readFile(filepath);
    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Media serve error:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
