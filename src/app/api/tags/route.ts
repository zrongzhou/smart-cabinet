import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/tags
 * 获取所有标签
 */
export async function GET(request: NextRequest) {
  try {
  const tags = await prisma.tag.findMany({
    orderBy: [
      { slug: 'asc' },
    ],
  });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
