import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Resolve uploads directory (consistent with upload/delete routes)
function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  return join(process.cwd(), 'uploads');
}

const UPLOAD_DIR = getUploadDir();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let files: string[];
    try {
      files = await readdir(UPLOAD_DIR);
    } catch (readErr: any) {
      // Directory doesn't exist yet — create it
      if (readErr.code === 'ENOENT') {
        await mkdir(UPLOAD_DIR, { recursive: true });
        console.log('[List] Created uploads directory:', UPLOAD_DIR);
        files = [];
      } else {
        throw readErr;
      }
    }

    const fileList: Array<{
      id: string;
      url: string;
      name: string;
      size: number;
      type: string;
      createdAt: string;
    }> = [];

    for (const filename of files) {
      // Skip hidden files
      if (filename.startsWith('.')) continue;

      const filepath = join(UPLOAD_DIR, filename);
      try {
        const stats = await stat(filepath);
        if (stats.isFile()) {
          // Infer MIME type from file extension
          const ext = '.' + filename.split('.').pop()?.toLowerCase();
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
          const type = MIME_TYPES[ext] || 'application/octet-stream';
          
          fileList.push({
            id: filename,
            url: `/api/media/${filename}`,
            name: filename,
            size: stats.size,
            type: type,
            createdAt: stats.birthtime.toISOString(),
          });
        }
      } catch (e) {
        // skip files that can't be read
      }
    }

    // Sort by creation time, newest first
    fileList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const total = fileList.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = fileList.slice(startIndex, endIndex);

    console.log('[List] Successfully listed', paginatedFiles.length, 'files (page', page, '/', totalPages, ') from', UPLOAD_DIR);
    return NextResponse.json({ 
      files: paginatedFiles,
      total: total,
      totalPages: totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('[List] Media list error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
