import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 防止热重载时创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/pages/[slug]
 * 获取单页内容（前端使用）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error: any) {
    console.error('Error fetching page:', error);
    
    // If table doesn't exist, return 404 (frontend should use fallback)
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Page table not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}
