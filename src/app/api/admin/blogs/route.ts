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
    // Shape parity with the DB admin response: blog-level FAQ (none for seeds).
    faq: null,
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
 * V8.4 fix: bug 6 — detect a Prisma "missing column" error. The `seoKeywords`
 * column on `blog_posts` is newly introduced; environments that have not yet
 * applied its migration would otherwise fail every blog save with a raw
 * "Failed to update blog". We treat that as a soft condition and retry without
 * the new field so the save still succeeds.
 */
function isMissingColumnError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2022') {
    return true;
  }
  const msg = e instanceof Error ? e.message : String(e);
  return /seo_keywords|column .* does not exist|does not exist/i.test(msg);
}

/**
 * V8.4 fix: bug 6 — run a blog write (create/update). If it fails because the
 * `seoKeywords` column is missing, strip that field and retry once. This keeps
 * the feature working both before and after the migration is applied.
 */
async function writeBlogResilient<T>(
  payload: Record<string, any>,
  run: (p: any) => Promise<T>
): Promise<T> {
  try {
    return await run(payload);
  } catch (err) {
    // V8.11: also tolerate a missing `faq` column (new migration). Strip both
    // the soft fields and retry once so the save still succeeds before/after
    // the migration is applied.
    if (
      isMissingColumnError(err) &&
      payload &&
      ('seoKeywords' in payload || 'faq' in payload)
    ) {
      const { seoKeywords, faq, ...rest } = payload;
      return await run(rest);
    }
    throw err;
  }
}

/**
 * V8.5 fix: bug 3 — resolve only the tag ids that actually exist as `BlogTag`
 * records. Static-seed blogs (e.g. id '14') carry plain STRING tags such as
 * 'cnc' / 'tools' / 'inventory' which are NOT valid `BlogTag` CUID ids. Passing
 * them to `connect`/`set` throws Prisma error P2018 ("Expected N records to be
 * connected, found only 0"). We filter to the ids that really exist, so the
 * write never fails on a missing relation and only valid tags are linked.
 */
async function resolveValidTagIds(tagIds: unknown): Promise<string[]> {
  if (!Array.isArray(tagIds)) return [];
  const ids = (tagIds as unknown[])
    .map((id) => (typeof id === 'string' ? id.trim() : ''))
    .filter((id) => id.length > 0);
  if (ids.length === 0) return [];
  try {
    const found = await prisma.tag.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const valid = new Set(found.map((t) => t.id));
    return ids.filter((id) => valid.has(id));
  } catch {
    // Tag table unreachable — skip tag linking rather than failing the save.
    return [];
  }
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

    // V8.11 — persist the blog-level FAQ list (structured [question/answer] x
    // locale array coming from the editor). New migration column; writeBlogResilient
    // below strips it if the migration has not been applied yet.
    if (body.faq !== undefined) {
      (blogData as any).faq = body.faq;
    }

    // 创建博客（含标签关联）
    const createData: any = {
      ...blogData,
    };
    // V8.5 fix: bug 3 — only connect tag ids that exist. String tags coming from
    // a static-seed blog ('cnc', 'tools', …) are not real BlogTag ids and would
    // otherwise throw Prisma P2018 ("Expected N records, found 0").
    if (body.tagIds && Array.isArray(body.tagIds) && body.tagIds.length > 0) {
      const validTagIds = await resolveValidTagIds(body.tagIds);
      if (validTagIds.length > 0) {
        createData.tags = {
          connect: validTagIds.map((id: string) => ({ id })),
        };
      }
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
      // P2018: a connect/set referenced a record (e.g. a tag) that doesn't exist.
      // The valid-tag filter above should prevent this, but surface a friendly
      // Chinese message instead of the raw Prisma error if it ever still occurs.
      if (error.code === 'P2018' || /connected, found only/i.test(error.message)) {
        return badRequestResponse('部分关联数据（如标签）不存在，已忽略无效项后请重试');
      }
    }
    return serverErrorResponse('博客创建失败，请检查表单后重试');
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
        // V8.4 fix: bug 6 — tolerate a changed slug on re-save: also match the
        // original seed slug, otherwise a second save would create a duplicate row.
        const slug = (body.slug || staticSeed.slug || '').toString().trim();
        const candidateSlugs = Array.from(
          new Set([slug, (staticSeed.slug || '').toString().trim()].filter(Boolean))
        );
        const materialized = candidateSlugs.length
          ? await prisma.blogPost.findFirst({ where: { slug: { in: candidateSlugs } } })
          : null;
        const baseData = {
          title: pickLocalized(body.title, staticSeed.title),
          excerpt: pickLocalized(body.excerpt, staticSeed.excerpt),
          content: pickLocalized(body.content, staticSeed.content),
          author: body.author || staticSeed.author || '',
          status: body.status || staticSeed.status || 'draft',
          featured: body.featured ?? staticSeed.featured ?? false,
          image: body.image || staticSeed.image || null,
          category: body.category || staticSeed.category || null,
          // V8.4 fix: bug 6 — persist seoKeywords (string sent by the editor form).
          seoKeywords: body.seoKeywords !== undefined ? body.seoKeywords : (staticSeed.seoKeywords ?? null),
          // V8.11 — persist the blog-level FAQ list, falling back to the seed's faq.
          faq: body.faq !== undefined ? body.faq : (staticSeed.faq ?? null),
        };
        // V8.5 fix: bug 3 — only connect tag ids that exist as BlogTag records.
        // Static-seed string tags are dropped here so no P2018 is thrown.
        const validTagIds = await resolveValidTagIds(body.tagIds);
        const tagConnect =
          validTagIds.length > 0
            ? { tags: { connect: validTagIds.map((id: string) => ({ id })) } }
            : {};

        if (materialized) {
          // V8.4 fix: bug 6 — resilient write (retry without seoKeywords if the
          // column migration has not been applied yet).
          const updated = await writeBlogResilient(
            { ...baseData, ...tagConnect },
            (p) => prisma.blogPost.update({ where: { id: materialized.id }, data: p, include: { tags: true } })
          );
          return NextResponse.json(updated);
        }

        const created = await writeBlogResilient(
          {
            ...baseData,
            slug,
            publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
            ...tagConnect,
          },
          (p) => prisma.blogPost.create({ data: p, include: { tags: true } })
        );
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
    // V8.4 fix: bug 6 — map seoKeywords so the blog editor can save it.
    if (body.seoKeywords !== undefined) updateData.seoKeywords = body.seoKeywords;
    // V8.11 — map the blog-level FAQ list so the editor can save it.
    if (body.faq !== undefined) (updateData as any).faq = body.faq;

    // 处理标签关联
    // V8.5 fix: bug 3 — only `set` tag ids that actually exist. This prevents
    // Prisma P2018 ("Expected N records to be connected, found only 0") when the
    // form submits string tags (from a static seed) that aren't real BlogTag ids.
    if (body.tagIds !== undefined) {
      const validTagIds = await resolveValidTagIds(body.tagIds);
      updateData.tags = { set: validTagIds.map((id: string) => ({ id })) };
    }

    // V8.4 fix: bug 6 — resilient write (retry without seoKeywords if the column
    // migration has not been applied yet), so the blog update never hard-fails.
    const updatedBlog = await writeBlogResilient(updateData, (p) =>
      prisma.blogPost.update({ where: { id }, data: p, include: { tags: true } })
    );

    return NextResponse.json(updatedBlog);
  } catch (error) {
    // V8.4 fix: bug 6 — log the real cause (not just the generic message) so the
    // failure can be diagnosed in future instead of only seeing "Failed to update blog".
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[PUT /api/admin/blogs] Failed to update blog:', detail, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return badRequestResponse('Slug already exists');
      }
      // P2018: a connect/set referenced a record (e.g. a tag) that doesn't exist.
      if (error.code === 'P2018' || /connected, found only/i.test(error.message)) {
        return badRequestResponse('部分关联数据（如标签）不存在，已自动忽略无效项，请重试');
      }
    }
    return serverErrorResponse('博客保存失败，请检查表单后重试' + (detail ? `：${detail}` : ''));
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

    // 检查博客是否存在（DB 优先）
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      // 静态 seed 博客（data/blogs.ts）不在 DB 中。DELETE 对它们是无操作，
      // 但必须避免返回 "Blog not found" 误导用户。GET/PUT 已有同样的兜底逻辑。
      const staticSeed = resolveStaticBlogForAdmin(id);
      if (staticSeed) {
        return NextResponse.json({
          success: true,
          message: 'Built-in blog (not stored in DB) — nothing to delete',
        });
      }
      return badRequestResponse('Blog not found');
    }

    // 先断开与 Tag 的多对多关联，避免外键约束导致删除失败（P2003）
    await prisma.blogPost.update({
      where: { id },
      data: { tags: { set: [] } },
    });

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
