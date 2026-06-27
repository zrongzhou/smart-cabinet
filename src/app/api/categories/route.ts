import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/categories
 * 获取所有分类
 * 支持查询参数：
 * - type: 分类类型 (cabinet/item/industry/custom)
 * - status: 状态 (默认 active)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'active';

    // 构建 where 条件
    const where: Record<string, unknown> = {
      status,
      deletedAt: null,
    };

    // 类型筛选
    if (type) {
      where.type = type;
    }

    // 获取分类列表
    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          where: {
            deletedAt: null,
          },
        },
        parent: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
