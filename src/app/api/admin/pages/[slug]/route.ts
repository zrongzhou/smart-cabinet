import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

const prisma = new PrismaClient();

// Helper to check if table exists error
function isTableNotExistError(error: any): boolean {
  return error?.code === 'P2021' || 
         error?.message?.includes('does not exist in the current database');
}

// GET /api/admin/pages/[slug] - Fetch single page
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const slug = params.slug;
    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error: any) {
    console.error('Error fetching page:', error);
    
    // Handle table not exists error gracefully
    if (isTableNotExistError(error)) {
      console.warn('[Pages API] Page table does not exist yet. Returning 404.');
      return NextResponse.json({ error: 'Page not found (table not exists)' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

// PUT /api/admin/pages/[slug] - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const slug = params.slug;
    const body = await request.json();
    const { title, blocks } = body;

    const page = await prisma.page.update({
      where: { slug },
      data: {
        ...(title && { title }),
        ...(blocks && { blocks }),
      },
    });

    return NextResponse.json(page);
  } catch (error: any) {
    console.error('Error updating page:', error);
    
    // Handle table not exists error gracefully
    if (isTableNotExistError(error)) {
      console.warn('[Pages API] Page table does not exist yet. Cannot update page.');
      return NextResponse.json({ 
        error: '数据库表尚未创建，无法保存到服务器。内容已保存到本地存储。',
        code: 'P2021',
        fallback: 'localStorage'
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

// DELETE /api/admin/pages/[slug] - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const slug = params.slug;
    await prisma.page.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    
    // Handle table not exists error gracefully
    if (isTableNotExistError(error)) {
      console.warn('[Pages API] Page table does not exist yet. Cannot delete page.');
      return NextResponse.json({ 
        error: '数据库表尚未创建',
        code: 'P2021',
        fallback: 'localStorage'
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
