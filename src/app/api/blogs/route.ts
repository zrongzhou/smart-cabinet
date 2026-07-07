import { NextRequest, NextResponse } from 'next/server';
import { getMergedBlogList, isBase64Image } from '@/lib/blogs';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/blogs
 * 获取博客列表（V8：合并 数据库 + 静态种子 双源，见 src/lib/blogs.ts）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const published = searchParams.get('published');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const { data, total, page: p, pageSize: ps } = await getMergedBlogList({
      publishedOnly: published === 'true',
      search,
      category,
      tag,
      page,
      pageSize,
    });

    // 转换：过滤 base64 图片（太大），保留正常 URL 图片 + hasImage 标记
    const blogs = data.map((blog) => {
      const img = blog.image;
      const isB64 = isBase64Image(img);
      return {
        ...blog,
        image: isB64 ? '' : (img || ''),
        hasImage: !!img && !isB64,
      };
    });

    return NextResponse.json({
      data: blogs,
      total,
      page: p,
      pageSize: ps,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
