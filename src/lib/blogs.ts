/**
 * V8 Blog merge layer.
 *
 * The site has TWO blog sources that must be presented as one:
 *   1. Static seed content in `src/data/blogs.ts` (16 posts, including the two
 *      V7 posts that were never written to the database).
 *   2. Editor-managed posts in the Postgres `blog_posts` table.
 *
 * This module is the single source of truth for list/detail reads. Both the
 * public `/api/blogs` and `/api/blogs/[slug]` routes delegate to it, so the
 * list page and detail page always agree.
 *
 * Rule: database posts win on slug collision; static-only posts are appended.
 */

import { prisma } from '@/lib/prisma';
import staticBlogs from '@/data/blogs';

export interface MergedBlogTag {
  id: string;
  slug: string;
  name: { en: string; zh: string; ar: string };
}

export interface MergedBlogPost {
  id: string;
  slug: string;
  title: { en: string; zh: string; ar: string };
  excerpt?: { en: string; zh: string; ar: string };
  content?: { en: string; zh: string; ar: string };
  author: string;
  publishedAt?: string;
  status: string;
  featured: boolean;
  image?: string;
  category?: string;
  tags: MergedBlogTag[];
  source: 'db' | 'static';
  createdAt: string;
  updatedAt: string;
}

export interface MergedBlogListParams {
  publishedOnly?: boolean;
  search?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
  /** Include static seed blogs from data/blogs.ts (default: false — DB-only) */
  includeStatic?: boolean;
}

/** Convert a static blog entry into the normalized merged shape. */
function normalizeStaticBlog(b: any): MergedBlogPost {
  const title = normalizeTrilingual(b.title);
  const excerpt = normalizeTrilingual(b.excerpt);
  const content = normalizeTrilingual(b.content);
  const tags: MergedBlogTag[] = (b.tags || []).map((t: string) => ({
    id: t,
    slug: String(t).toLowerCase().replace(/\s+/g, '-'),
    name: { en: t, zh: t, ar: t },
  }));
  return {
    id: b.id || b.slug,
    slug: b.slug,
    title,
    excerpt,
    content,
    author: b.author || 'Admin',
    publishedAt: b.publishedAt,
    status: 'published',
    featured: !!b.featured,
    image: b.image || '',
    category: b.category || 'General',
    tags,
    source: 'static',
    createdAt: b.publishedAt || b.updatedAt || new Date().toISOString(),
    updatedAt: b.updatedAt || b.publishedAt || new Date().toISOString(),
  };
}

/** Coerce a value into the { en, zh, ar } shape. */
function normalizeTrilingual(value: any): { en: string; zh: string; ar: string } {
  if (!value) return { en: '', zh: '', ar: '' };
  if (typeof value === 'string') return { en: value, zh: value, ar: value };
  return {
    en: value.en || '',
    zh: value.zh || '',
    ar: value.ar || '',
  };
}

/** A slug is "descriptive" only if it looks like words, not a bare id/number. */
export function isDescriptiveSlug(slug: unknown): boolean {
  if (typeof slug !== 'string' || !slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) && /[a-z]/i.test(slug);
}

/**
 * Fixes posts whose DB `slug` was saved as a numeric/placeholder id (e.g. "13").
 * In that case we look the post up by its static id and reuse the canonical
 * descriptive slug so the public URL stays clean.
 */
export function resolveBlogSlug(slug: unknown, id: unknown): string {
  if (isDescriptiveSlug(slug)) return slug as string;
  const byId = staticBlogs.find((b) => String(b.id) === String(slug));
  if (byId) return byId.slug;
  return typeof slug === 'string' ? slug : String(id ?? '');
}

/** Build the Prisma where clause shared by the DB read. */
function buildDbWhere(params: MergedBlogListParams): Record<string, unknown> {
  const where: Record<string, unknown> = { deletedAt: null };
  if (params.publishedOnly) where.status = 'published';
  if (params.category) where.category = params.category;
  if (params.tag) {
    where.tags = { some: { tagId: params.tag } };
  }
  if (params.search) {
    where.OR = [
      { title: { path: ['en'], string_contains: params.search } },
      { title: { path: ['zh'], string_contains: params.search } },
      { excerpt: { path: ['en'], string_contains: params.search } },
      { excerpt: { path: ['zh'], string_contains: params.search } },
    ];
  }
  return where;
}

/** Fetch DB posts (never throws — falls back to [] on failure). */
async function fetchDbPosts(
  params: MergedBlogListParams
): Promise<MergedBlogPost[]> {
  try {
    const where = buildDbWhere(params);
    const rows = await prisma.blogPost.findMany({
      where,
      include: { tags: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map((row: any) => ({
      id: row.id,
      slug: resolveBlogSlug(row.slug, row.id),
      title: row.title,
      excerpt: row.excerpt || undefined,
      content: row.content || undefined,
      author: row.author || 'Admin',
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : undefined,
      status: row.status,
      featured: !!row.featured,
      image: row.image || '',
      category: row.category || 'General',
      tags: (row.tags || []).map((t: any) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
      })),
      source: 'db',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error('[blogs] DB read failed, falling back to static only:', err);
    return [];
  }
}

/**
 * Return the merged, paginated blog list.
 * Database posts take precedence; static-only posts are appended.
 */
export async function getMergedBlogList(
  params: MergedBlogListParams = {}
): Promise<{ data: MergedBlogPost[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, params.pageSize || 20);

  const dbPosts = await fetchDbPosts(params);
  const dbSlugs = new Set(dbPosts.map((p) => p.slug));

  // Static posts (only if explicitly requested — default is DB-only to avoid
  // surfacing legacy/test seed blogs that the user may have deleted from DB).
  let staticPosts: MergedBlogPost[] = [];
  if (params.includeStatic) {
    staticPosts = staticBlogs
      .map(normalizeStaticBlog)
      .filter((p) => !dbSlugs.has(p.slug));

    // Apply lightweight filters to static posts too (DB already filtered).
    if (params.publishedOnly) {
      staticPosts = staticPosts.filter((p) => p.status === 'published');
    }
    if (params.category) {
      staticPosts = staticPosts.filter(
        (p) => (p.category || '').toLowerCase() === params.category!.toLowerCase()
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      staticPosts = staticPosts.filter(
        (p) =>
          p.title.en.toLowerCase().includes(q) ||
          p.title.zh.toLowerCase().includes(q) ||
          (p.excerpt?.en || '').toLowerCase().includes(q)
      );
    }
    if (params.tag) {
      staticPosts = staticPosts.filter((p) =>
        p.tags.some((t) => t.id === params.tag || t.slug === params.tag)
      );
    }
  } // end includeStatic

  const merged = [...dbPosts, ...staticPosts].sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });

  const total = merged.length;
  const start = (page - 1) * pageSize;
  const data = merged.slice(start, start + pageSize);
  return { data, total, page, pageSize };
}

/** Fetch a single post by slug from DB first, then static. */
export async function getMergedBlogBySlug(slug: string): Promise<MergedBlogPost | null> {
  try {
    const row = await prisma.blogPost.findFirst({
      where: { slug, deletedAt: null },
      include: { tags: true },
    });
    if (row) {
      return {
        id: row.id,
        slug: resolveBlogSlug(row.slug, row.id),
        title: normalizeTrilingual(row.title),
        excerpt: normalizeTrilingual(row.excerpt),
        content: normalizeTrilingual(row.content),
        author: row.author || 'Admin',
        publishedAt: row.publishedAt ? row.publishedAt.toISOString() : undefined,
        status: row.status,
        featured: !!row.featured,
        image: row.image || '',
        category: row.category || 'General',
        tags: (row.tags || []).map((t: any) => ({ id: t.id, slug: t.slug, name: normalizeTrilingual(t.name) })),
        source: 'db',
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    }
  } catch (err) {
    console.error('[blogs] DB lookup failed, trying static:', err);
  }

  const staticPost = staticBlogs.find((b) => b.slug === slug);
  return staticPost ? normalizeStaticBlog(staticPost) : null;
}

/** Detect a (huge) base64-embedded image so the list API can drop it. */
export function isBase64Image(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith('data:image')) return true;
  if (trimmed.length > 10000 && !trimmed.startsWith('http') && !trimmed.startsWith('/')) return true;
  return false;
}
