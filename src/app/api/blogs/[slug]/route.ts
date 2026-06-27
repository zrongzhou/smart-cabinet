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
 * GET /api/blogs/[slug]
 * 获取单篇博客详情
 * 注意：博客内容中的图片现在使用 /api/media/xxx.jpg 引用，不再是 base64 内嵌
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    const blog = await prisma.blogPost.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        tags: true,
      },
    });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // 直接返回博客数据（图片已迁移为 /api/media/ 引用，不再有 base64 问题）
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
