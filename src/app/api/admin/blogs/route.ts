import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyAuth, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * GET /api/admin/blogs
 * 获取所有博客（管理后台）
 * 支持查询参数：?id=xxx 获取单篇博客（含完整 content）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证鉴权
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 如果提供了 id 参数，返回单篇博客（含完整 content）
    if (id) {
      const blog = await prisma.blogPost.findUnique({
        where: { id },
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

      return NextResponse.json(blog);
    }

    // 否则返回博客列表（不含 content，用于列表显示）
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * pageSize;

    // 构建 where 条件
    const where: Prisma.BlogPostWhereInput = {};

    // 状态筛选
    if (status) {
      where.status = status;
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

    // 获取博客列表（不含 content 和 tags，列表显示不需要）
    const blogs = await prisma.blogPost.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        image: true,
        status: true,
        featured: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: true,
      },
      orderBy: [
        { updatedAt: 'desc' },
      ],
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: blogs,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return serverErrorResponse('Failed to fetch blogs');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/admin/blogs
 * 创建新博客
 */
export async function POST(request: NextRequest) {
  try {
    // 验证鉴权
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // 验证必填字段
    if (!body.title || !body.slug || !body.content) {
      return badRequestResponse('Title, slug, and content are required');
    }

    // 检查 slug 是否已存在
    const existingBlog = await prisma.blogPost.findFirst({
      where: { slug: body.slug },
    });

    if (existingBlog) {
      return badRequestResponse('Slug already exists');
    }

    // 准备数据
    const blogData: Prisma.BlogPostCreateInput = {
      slug: body.slug,
      title: body.title || {},
      excerpt: body.excerpt || null,
      content: body.content || {},
      author: body.author || '',
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      status: body.status || 'draft',
      featured: body.featured || false,
      image: body.image || null,
      category: body.category || null,
    };

    // 创建博客（含标签关联）
    const createData: any = {
      ...blogData,
    };
    if (body.tagIds && Array.isArray(body.tagIds) && body.tagIds.length > 0) {
      createData.tags = {
        connect: body.tagIds.map((tagId: string) => ({ id: tagId })),
      };
    }

    const blog = await prisma.blogPost.create({
      data: createData,
    });

    // 返回完整博客信息
    const createdBlog = await prisma.blogPost.findUnique({
      where: { id: blog.id },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(createdBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug already exists');
      }
    }
    return serverErrorResponse('Failed to create blog');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PUT /api/admin/blogs?id={id}
 * 更新博客
 */
export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('Blog ID is required');
    }

    const body = await request.json();

    // 检查博客是否存在
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return badRequestResponse('Blog not found');
    }

    // 如果 slug 改变了，检查是否已存在
    if (body.slug && body.slug !== existingBlog.slug) {
      const conflictBlog = await prisma.blogPost.findFirst({
        where: { slug: body.slug, NOT: { id: id as string } },
      });

      if (conflictBlog) {
        return badRequestResponse('Slug already exists');
      }
    }

    // 准备更新数据
    const updateData: Prisma.BlogPostUpdateInput = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.category !== undefined) updateData.category = body.category;

    // 处理标签关联
    if (body.tagIds !== undefined) {
      if (Array.isArray(body.tagIds) && body.tagIds.length > 0) {
        updateData.tags = { set: body.tagIds.map((tagId: string) => ({ id: tagId })) };
      } else {
        updateData.tags = { set: [] };
      }
    }

    const updatedBlog = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: { tags: true },
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug already exists');
      }
    }
    return serverErrorResponse('Failed to update blog');
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/admin/blogs?id={id}
 * 删除博客
 */
export async function DELETE(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('Blog ID is required');
    }

    // 检查博客是否存在
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return badRequestResponse('Blog not found');
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return serverErrorResponse('Failed to delete blog');
  } finally {
    await prisma.$disconnect();
  }
}
