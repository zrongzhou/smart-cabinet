import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/faqs
 * 获取 FAQ 列表
 * 支持查询参数：
 * - category: FAQ 分类
 * - page: 页码 (默认 1)
 * - pageSize: 每页数量 (默认 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const skip = (page - 1) * pageSize;

    // 构建 where 条件
    const where: Record<string, unknown> = {
      status: 'active',
    };

    // 分类筛选
    if (category) {
      where.category = category;
    }

    // 获取总数
    const total = await prisma.fAQ.count({ where });

    // 获取 FAQ 列表
    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: faqs,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
