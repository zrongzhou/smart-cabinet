import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { verifyAuth, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
// Bug 10 fix: static seed blogs (e.g. id '14' = cnc-tool-inventory-management-guide)
// live only in data/blogs.ts and are never written to the DB (which uses CUID ids).
// This import lets the admin GET resolve them by numeric id or descriptive slug.
import staticBlogs from '@/data/blogs';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * Bug 10 fix: resolve a static seed blog (from data/blogs.ts) by its numeric id
 * or by its descriptive slug, and shape it exactly like the DB admin response so
 * the edit page can pre-fill the form directly. Returns null when not found.
 *
 * This is required because `BlogPost.id` in the DB is a CUID, so a static-only
 * blog such as id '14' (cnc-tool-inventory-management-guide) can never be found
 * via a DB lookup — that mismatch is the root cause of "Failed to fetch blog data".
 */
function resolveStaticBlogForAdmin(idOrSlug: string): any | null {
  const key = String(idOrSlug || '').trim().toLowerCase();
  if (!key) return null;
  const found = staticBlogs.find(
    (b) => String(b.id).toLowerCase() === key || b.slug.toLowerCase() === key
  );
  if (!found) return null;
  return {
    id: found.id,
    slug: found.slug,
    title: found.title,
    excerpt: found.excerpt,
    content: found.content,
    author: found.author || 'Admin',
    status: 'published',
    featured: !!found.featured,
    image: found.image || null,
    category: found.category || null,
    seoKeywords: null,
    // The edit page reads `post.tags?.map((t) => t.tagId)` — map string tags accordingly.
    tags: (found.tags || []).map((tag: string) => ({ tagId: tag })),
  };
}

/**
 * V8.3 fix: bug 3 — pick a localized object from the form payload when it actually
 * carries content, otherwise fall back to the static seed value. Avoids persisting
 * an empty `{ en: '', zh: '', ar: '' }` object when the editor left a field blank
 * but the seed had real content.
 */
function pickLocalized(formVal: any, seedVal: any): any {
  if (formVal && (formVal.en || formVal.zh || formVal.ar)) return formVal;
  return seedVal;
}

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
      // 1) Primary lookup by DB id (CUID), excluding soft-deleted posts.
      //    V8.3 fix: bug 3 — guard the DB calls so a missing/unavailable database
      //    cannot abort the request before the static-seed fallback (step 3) runs.
      //    Without this guard a seed-only / DB-less environment would 500 and the
      //    editor would show "Blog not found" for valid seed blogs (e.g. id '14').
      let blog: any = null;
      try {
        blog = await prisma.blogPost.findUnique({
          where: { id },
          include: { tags: true },
        });

        // 2) Fallback: the caller may have passed a descriptive slug instead of an id.
        if (!blog) {
          blog = await prisma.blogPost.findFirst({
            where: { slug: id, deletedAt: null },
            include: { tags: true },
          });
        }
      } catch (dbErr) {
        // DB unreachable (seed-only / dev without a database) — fall through to the
        // static-seed resolution so seeded blogs (e.g. id '14') still load.
        console.error('DB blog lookup failed, falling back to static seed:', dbErr);
        blog = null;
      }

      // 3) Fallback: resolve a static seed blog by numeric id or slug (Bug 10 fix).
      if (!blog) {
        const staticPost = resolveStaticBlogForAdmin(id);
        if (staticPost) {
          return NextResponse.json(staticPost);
        }
      }

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
    const where: Prisma.BlogPostWhereInput = { deletedAt: null };

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

    // V8.3 fix: bug 3 — static seed blogs (e.g. id '14' = cnc-tool-inventory-management-guide)
    // live only in data/blogs.ts and have no DB record (the DB uses CUID ids). When the editor
    // saves such a post, a plain "update" would fail with "Blog not found". Instead we
    // materialize the seed into a real DB row so the save succeeds (upsert by slug so a
    // second save updates the same row rather than colliding on the unique slug).
    if (!existingBlog) {
      const staticSeed = resolveStaticBlogForAdmin(id);
      if (staticSeed) {
        const slug = (body.slug || staticSeed.slug || '').toString();
        const materialized = await prisma.blogPost.findFirst({ where: { slug } });
        const baseData = {
          title: pickLocalized(body.title, staticSeed.title),
          excerpt: pickLocalized(body.excerpt, staticSeed.excerpt),
          content: pickLocalized(body.content, staticSeed.content),
          author: body.author || staticSeed.author || '',
          status: body.status || staticSeed.status || 'draft',
          featured: body.featured ?? staticSeed.featured ?? false,
          image: body.image || staticSeed.image || null,
          category: body.category || staticSeed.category || null,
        };
        const tagConnect =
          body.tagIds && Array.isArray(body.tagIds) && body.tagIds.length > 0
            ? { tags: { connect: body.tagIds.map((tagId: string) => ({ id: tagId })) } }
            : {};

        if (materialized) {
          const updated = await prisma.blogPost.update({
            where: { id: materialized.id },
            data: { ...baseData, ...tagConnect },
            include: { tags: true },
          });
          return NextResponse.json(updated);
        }

        const created = await prisma.blogPost.create({
          data: {
            ...baseData,
            slug,
            publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
            ...tagConnect,
          },
          include: { tags: true },
        });
        return NextResponse.json(created, { status: 201 });
      }
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
