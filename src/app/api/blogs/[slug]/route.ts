import { NextRequest, NextResponse } from 'next/server';
import { getMergedBlogBySlug, isBase64Image } from '@/lib/blogs';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

interface RouteParams {
  // NEXT15: params is now a Promise
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/blogs/[slug]
 * 获取单篇博客详情（V8：合并 数据库 + 静态种子 双源）
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params; // NEXT15

    const blog = await getMergedBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // 过滤超大 base64 封面图，仅保留 URL
    const img = blog.image;
    const isB64 = isBase64Image(img);

    return NextResponse.json({
      ...blog,
      image: isB64 ? '' : (img || ''),
      hasImage: !!img && !isB64,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
