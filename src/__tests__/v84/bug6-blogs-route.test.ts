/**
 * Bug 6 — Blog editor no longer returns "Failed to update".
 * Exercises PUT /api/admin/blogs with the V8.4 resilient-write logic:
 *   - Scenario A: editing a STATIC seed blog (id '14', only in data/blogs.ts,
 *     no DB row) materializes it via create → 201 (not 404/500).
 *   - Scenario B: a DB update throws a "missing column seoKeywords" error;
 *     writeBlogResilient retries WITHOUT seoKeywords and succeeds → 200 (not 500).
 *
 * PrismaClient, @/lib/auth and @/data/blogs are fully mocked so no DB is needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => {
  const blogPost = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  };
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  }
  class PrismaClient {
    blogPost = blogPost;
    $disconnect = vi.fn();
  }
  return {
    mockPrisma: { blogPost, PrismaClient, PrismaClientKnownRequestError },
  };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: mockPrisma.PrismaClient,
  Prisma: { PrismaClientKnownRequestError: mockPrisma.PrismaClientKnownRequestError },
}));

vi.mock('@/lib/auth', () => ({
  verifyAuth: () => Promise.resolve(true),
  unauthorizedResponse: () =>
    new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 }),
  badRequestResponse: (m: string) =>
    new Response(JSON.stringify({ error: m }), { status: 400 }),
  serverErrorResponse: (m: string) =>
    new Response(JSON.stringify({ error: m }), { status: 500 }),
}));

vi.mock('@/data/blogs', () => ({
  default: [
    {
      id: '14',
      slug: 'cnc-tool-inventory-management-guide',
      title: { en: 'CNC Tool Inventory', zh: 'CNC 刀具库存', ar: 'مخزون أدوات CNC' },
      excerpt: { en: 'ex', zh: '摘要', ar: 'ملخص' },
      content: { en: 'c', zh: '内容', ar: 'محتوى' },
      author: 'Admin',
      featured: true,
      image: null,
      category: null,
      tags: [],
    },
  ],
}));

import { NextRequest } from 'next/server';
import { PUT } from '@/app/api/admin/blogs/route';

function makePut(id: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/admin/blogs?id=${id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockPrisma.blogPost.findUnique.mockReset();
  mockPrisma.blogPost.findFirst.mockReset();
  mockPrisma.blogPost.create.mockReset();
  mockPrisma.blogPost.update.mockReset();
  mockPrisma.blogPost.findUnique.mockResolvedValue(null);
  mockPrisma.blogPost.findFirst.mockResolvedValue(null);
});

describe('Bug 6 — PUT /api/admin/blogs resilient write', () => {
  it('Scenario A: editing a static seed blog (id 14) materializes it → 201', async () => {
    const body = {
      slug: 'cnc-tool-inventory-management-guide',
      seoKeywords: 'cnc, tools',
    };
    mockPrisma.blogPost.create.mockResolvedValue({
      id: 'created-id',
      slug: body.slug,
      title: { en: 'CNC Tool Inventory' },
      tags: [],
    });

    const res = await PUT(makePut('14', body));

    expect(res.status).toBe(201);
    expect(mockPrisma.blogPost.findUnique).toHaveBeenCalled();
    expect(mockPrisma.blogPost.create).toHaveBeenCalledTimes(1);
  });

  it('Scenario B: missing-column error on update is retried without seoKeywords → 200', async () => {
    // existing DB record so we take the "real update" path
    mockPrisma.blogPost.findUnique.mockResolvedValue({ id: 'dbid', slug: 'dbslug' });
    // first attempt throws the Prisma missing-column error, retry succeeds
    mockPrisma.blogPost.update
      .mockRejectedValueOnce(
        Object.assign(new Error('column "seo_keywords" does not exist'), { code: 'P2022' })
      )
      .mockResolvedValue({ id: 'dbid', slug: 'dbslug', title: { en: 'DB' }, tags: [] });

    const res = await PUT(
      makePut('dbid', {
        slug: 'dbslug',
        title: { en: 'DB' },
        content: { en: 'c' },
        seoKeywords: 'kw',
      })
    );

    expect(res.status).toBe(200);
    expect(mockPrisma.blogPost.update).toHaveBeenCalledTimes(2);
    // the retry payload must have had seoKeywords stripped
    const secondCall = mockPrisma.blogPost.update.mock.calls[1][0];
    expect(secondCall.data).not.toHaveProperty('seoKeywords');
  });
});

// Debug: confirm the @/lib/auth mock is actually applied (not the real JWT verify)
describe('debug — auth mock wiring', () => {
  it('verifyAuth mock resolves true', async () => {
    const auth = await import('@/lib/auth');
    expect(typeof auth.verifyAuth).toBe('function');
    expect(await auth.verifyAuth({} as any)).toBe(true);
  });
});
