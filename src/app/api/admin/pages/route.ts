import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper to check if table exists error
function isTableNotExistError(error: any): boolean {
  return error?.code === 'P2021' || 
         error?.message?.includes('does not exist in the current database');
}

// GET /api/admin/pages - Fetch all pages
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(pages);
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    
    // Handle table not exists error gracefully
    if (isTableNotExistError(error)) {
      console.warn('[Pages API] Page table does not exist yet. Returning empty array.');
      return NextResponse.json([]);
    }
    
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/admin/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { slug, title, blocks } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'Missing required fields: slug, title' }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        slug,
        title,
        blocks: blocks || [],
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    console.error('Error creating page:', error);
    
    // Handle table not exists error gracefully
    if (isTableNotExistError(error)) {
      console.warn('[Pages API] Page table does not exist yet. Cannot create page.');
      return NextResponse.json({ 
        error: '数据库表尚未创建，请先运行数据库迁移。内容已保存到本地存储。',
        code: 'P2021',
        fallback: 'localStorage'
      }, { status: 503 });
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
