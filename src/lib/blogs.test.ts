import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    blogPost: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import * as prismaMod from '@/lib/prisma';
import { getMergedBlogList, getMergedBlogBySlug, isBase64Image } from './blogs';

const prisma = prismaMod.prisma as any;

const V7_SLUGS = ['industrial-vending-machine-trends-2026.html', 'cnc-tool-inventory-management-guide.html'];

function dbPost(slug: string, overrides: any = {}) {
  return {
    id: 'db-' + slug,
    slug,
    title: { en: slug, zh: slug, ar: slug },
    excerpt: { en: '', zh: '', ar: '' },
    content: { en: '', zh: '', ar: '' },
    author: 'Admin',
    publishedAt: new Date('2026-01-01'),
    status: 'published',
    featured: false,
    image: '',
    category: 'General',
    tags: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('blogs merge layer (V8 T1 / Q5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.blogPost.findMany.mockResolvedValue([]);
    prisma.blogPost.findFirst.mockResolvedValue(null);
  });

  it('includes the two V7 posts that were previously hidden', async () => {
    const { data, total } = await getMergedBlogList();
    expect(total).toBeGreaterThanOrEqual(16);
    const slugs = data.map((p) => p.slug);
    for (const s of V7_SLUGS) expect(slugs).toContain(s);
    expect(data.every((p) => p.source === 'static')).toBe(true);
  });

  it('lets DB posts win on slug collision and de-dupes', async () => {
    prisma.blogPost.findMany.mockResolvedValue([dbPost('future-of-intelligent-tool-storage')]);
    const { data } = await getMergedBlogList();
    const hits = data.filter((p) => p.slug === 'future-of-intelligent-tool-storage');
    expect(hits).toHaveLength(1);
    expect(hits[0].source).toBe('db');
  });

  it('appends DB-only posts alongside static posts', async () => {
    prisma.blogPost.findMany.mockResolvedValue([dbPost('db-only-post')]);
    const { data } = await getMergedBlogList();
    expect(data.some((p) => p.slug === 'db-only-post' && p.source === 'db')).toBe(true);
    expect(data.some((p) => p.slug === V7_SLUGS[0])).toBe(true);
  });

  it('paginates the merged list', async () => {
    const page1 = await getMergedBlogList({ page: 1, pageSize: 5 });
    const page2 = await getMergedBlogList({ page: 2, pageSize: 5 });
    expect(page1.data.length).toBeLessThanOrEqual(5);
    expect(page1.total).toBe(page2.total);
    const p1 = page1.data.map((p) => p.slug);
    const p2 = page2.data.map((p) => p.slug);
    expect(p1.some((s) => p2.includes(s))).toBe(false);
  });

  it('filters by search term', async () => {
    const { data } = await getMergedBlogList({ search: 'vending' });
    expect(data.length).toBeGreaterThan(0);
    expect(
      data.every((p) => (p.title.en + ' ' + (p.excerpt?.en || '')).toLowerCase().includes('vending'))
    ).toBe(true);
  });

  it('filters by category', async () => {
    const { data } = await getMergedBlogList({ category: 'General' });
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((p) => (p.category || '').toLowerCase() === 'general')).toBe(true);
  });

  it('getMergedBlogBySlug resolves a static V7 post', async () => {
    const post = await getMergedBlogBySlug(V7_SLUGS[1]);
    expect(post).not.toBeNull();
    expect(post!.slug).toBe(V7_SLUGS[1]);
    expect(post!.source).toBe('static');
  });

  it('getMergedBlogBySlug prefers a DB row when present', async () => {
    prisma.blogPost.findFirst.mockResolvedValue(dbPost('db-only-post'));
    const post = await getMergedBlogBySlug('db-only-post');
    expect(post).not.toBeNull();
    expect(post!.source).toBe('db');
  });

  it('getMergedBlogBySlug returns null for an unknown slug', async () => {
    expect(await getMergedBlogBySlug('does-not-exist')).toBeNull();
  });

  it('isBase64Image detects embedded / oversized images', () => {
    expect(isBase64Image('data:image/png;base64,abc')).toBe(true);
    expect(isBase64Image('a'.repeat(11000))).toBe(true);
    expect(isBase64Image('http://x/y.jpg')).toBe(false);
    expect(isBase64Image('/images/x.jpg')).toBe(false);
    expect(isBase64Image(null)).toBe(false);
    expect(isBase64Image('short')).toBe(false);
  });
});
