import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/products/[slug]
 * 获取单个产品详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    const product = await prisma.product.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        categories: true,
        tags: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
