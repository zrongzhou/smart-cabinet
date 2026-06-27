import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/blogs
 * 获取博客列表
 * 支持查询参数：
 * - tag: 标签 ID
 * - category: 博客分类
 * - search: 搜索关键词
 * - published: 是否只返回已发布 (true/false)
 * - page: 页码 (默认 1)
 * - pageSize: 每页数量 (默认 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const published = searchParams.get('published');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const skip = (page - 1) * pageSize;

    // 构建 where 条件
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    // 发布状态筛选
    if (published === 'true') {
      where.status = 'published';
    } else if (published === 'false') {
      where.status = 'draft';
    }

    // 分类筛选
    if (category) {
      where.category = category;
    }

    // 标签筛选
    if (tag) {
      where.tags = {
        some: {
          tagId: tag,
        },
      };
    }

    // 搜索
    if (search) {
      where.OR = [
        {
          title: {
            path: ['en'],
            string_contains: search,
          },
        },
        {
          title: {
            path: ['zh'],
            string_contains: search,
          },
        },
        {
          excerpt: {
            path: ['en'],
            string_contains: search,
          },
        },
        {
          excerpt: {
            path: ['zh'],
            string_contains: search,
          },
        },
      ];
    }

    // 获取总数
    const total = await prisma.blogPost.count({ where });

    // 获取博客列表
    // 注意：使用 select 而非 include，明确排除 content 和 image 字段
    // - content 可能包含巨大的 base64 图片（列表不需要完整内容）
    // - image 是 base64 数据，列表只需要知道是否有图片（用 hasImage 字段）
    const blogsRaw = await prisma.blogPost.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        image: true,  // 临时选择，用于计算 hasImage
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: true,
        tags: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: pageSize,
    });

    // 转换数据：过滤 base64 图片（太大），保留正常 URL 图片
    const isBase64 = (val: string | null | undefined): boolean => {
      if (!val) return false;
      const trimmed = val.trim();
      // Base64 data URI 检测：data:image 开头或超过 1KB 的疑似 base64
      if (trimmed.startsWith('data:image')) return true;
      if (trimmed.length > 10000 && !trimmed.startsWith('http') && !trimmed.startsWith('/')) return true;
      return false;
    };

    const blogs = blogsRaw.map(blog => {
      const img = blog.image;
      const isB64 = isBase64(img);
      return {
        ...blog,
        // 如果是 base64 就返回空字符串（太大不能传给前端）；否则保留原始 URL
        image: isB64 ? '' : (img || ''),
        hasImage: !!img && img.length > 0,
      };
    });

    return NextResponse.json({
      data: blogs,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
