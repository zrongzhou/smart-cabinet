import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * 获取产品列表
 * 支持查询参数：
 * - category: 分类 ID
 * - tag: 标签 ID
 * - search: 搜索关键词（搜索 name 字段）
 * - featured: 是否只返回精选产品 (true/false)
 * - status: 产品状态 (默认 active)
 * - page: 页码 (默认 1)
 * - pageSize: 每页数量 (默认 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const slug = searchParams.get('slug');

    const skip = (page - 1) * pageSize;

    // 构建 where 条件
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    // status=all 表示不筛选状态
    if (status && status !== 'all') {
      where.status = status;
    }

    // 分类筛选
    if (category) {
      where.categories = {
        some: {
          id: category,
        },
      };
    }

    // 标签筛选
    if (tag) {
      where.tags = {
        some: {
          tagId: tag,
        },
      };
    }

    // 精选筛选
    if (featured === 'true') {
      where.featured = true;
    }

    // Slug 筛选（用于产品详情页）
    if (slug) {
      where.slug = slug;
    }

    // 搜索（搜索 name 字段中的英文名称）
    if (search) {
      where.OR = [
        {
          name: {
            path: ['en'],
            string_contains: search,
          },
        },
        {
          name: {
            path: ['zh'],
            string_contains: search,
          },
        },
        {
          sku: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // 获取总数
    const total = await prisma.product.count({ where });

    // 获取产品列表（只选择必要的字段以提高性能）
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        slug: true,
        sku: true,
        name: true,
        description: true, // 用于简短描述
        price: true,
        hidePrice: true,
        images: true,
        featured: true,
        status: true,
        order: true,
        specifications: true,
        features: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: products,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
