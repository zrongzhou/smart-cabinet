/**
 * Bug 3 (P0) — Blog update no longer throws Prisma P2018 on tag relations.
 *
 * The fix introduces resolveValidTagIds(): it keeps only the tag ids that
 * actually exist as BlogTag rows, dropping the plain STRING tags that come from
 * static-seed blogs (e.g. 'cnc', 'tools') which are not real CUID ids. This
 * prevents the "Expected N records to be connected, found only 0" failure.
 *
 * We drive it through the real route handlers (POST create / PUT update-existing)
 * with Prisma fully mocked, and additionally verify the defensive friendly-Chinese
 * P2018 message still fires if a write somehow throws P2018.
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
  const tag = { findMany: vi.fn() };
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  }
  class PrismaClient {
    blogPost = blogPost;
    tag = tag;
    $disconnect = vi.fn();
  }
  return { mockPrisma: { blogPost, tag, PrismaClient, PrismaClientKnownRequestError } };
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
  notFoundResponse: (m: string) =>
    new Response(JSON.stringify({ error: m }), { status: 404 }),
}));

// Static-seed blogs are not needed for the tag tests; provide an empty default.
vi.mock('@/data/blogs', () => ({ default: [] as any[] }));

import { NextRequest } from 'next/server';
import { POST, PUT } from '@/app/api/admin/blogs/route';

function makePost(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/blogs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

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
  mockPrisma.blogPost.delete.mockReset();
  mockPrisma.blogPost.count.mockReset();
  mockPrisma.blogPost.findMany.mockReset();
  mockPrisma.tag.findMany.mockReset();
});

describe('Bug 3 — resolveValidTagIds drops invalid string/non-CUID tag ids', () => {
  it('POST create: a string tag ("cnc") is dropped, only the valid CUID connects', async () => {
    mockPrisma.blogPost.findFirst.mockResolvedValue(null); // slug free
    mockPrisma.tag.findMany.mockResolvedValue([{ id: 'valid-1' }]); // only valid-1 exists
    mockPrisma.blogPost.create.mockResolvedValue({ id: 'new' });
    mockPrisma.blogPost.findUnique.mockResolvedValue({ id: 'new', tags: [] });

    const res = await POST(
      makePost({
        title: { en: 'T' },
        slug: 's1',
        content: { en: 'c' },
        tagIds: ['cnc', 'valid-1'],
      })
    );

    expect(res.status).toBe(201); // no P2018 — create succeeded
    const createCall = mockPrisma.blogPost.create.mock.calls[0][0];
    expect(createCall.data.tags).toEqual({ connect: [{ id: 'valid-1' }] });
  });

  it('POST create: ALL string tags (cnc/tools/inventory) are filtered → no tags key', async () => {
    mockPrisma.blogPost.findFirst.mockResolvedValue(null);
    mockPrisma.tag.findMany.mockResolvedValue([]); // none of them are real ids
    mockPrisma.blogPost.create.mockResolvedValue({ id: 'x' });
    mockPrisma.blogPost.findUnique.mockResolvedValue({ id: 'x', tags: [] });

    const res = await POST(
      makePost({
        title: { en: 'T' },
        slug: 's2',
        content: { en: 'c' },
        tagIds: ['cnc', 'tools', 'inventory'],
      })
    );

    expect(res.status).toBe(201);
    const createCall = mockPrisma.blogPost.create.mock.calls[0][0];
    expect(createCall.data.tags).toBeUndefined(); // invalid ids dropped entirely
  });

  it('PUT update-existing: a string tag ("cnc") is resolved to an empty set (no P2018)', async () => {
    mockPrisma.blogPost.findUnique.mockResolvedValue({ id: 'dbid', slug: 's', title: { en: 'T' } });
    mockPrisma.tag.findMany.mockResolvedValue([]); // 'cnc' is not a real tag id
    mockPrisma.blogPost.update.mockResolvedValue({ id: 'dbid', tags: [] });

    const res = await PUT(
      makePut('dbid', {
        title: { en: 'T' },
        slug: 's',
        content: { en: 'c' },
        tagIds: ['cnc'],
      })
    );

    expect(res.status).toBe(200); // no P2018 thrown on update
    const updateCall = mockPrisma.blogPost.update.mock.calls[0][0];
    expect(updateCall.data.tags).toEqual({ set: [] }); // dropped string tag becomes empty set
  });

  it('PUT update-existing: valid tag ids are kept via set', async () => {
    mockPrisma.blogPost.findUnique.mockResolvedValue({ id: 'dbid', slug: 's', title: { en: 'T' } });
    mockPrisma.tag.findMany.mockResolvedValue([{ id: 'real-1' }, { id: 'real-2' }]);
    mockPrisma.blogPost.update.mockResolvedValue({ id: 'dbid', tags: [] });

    const res = await PUT(
      makePut('dbid', {
        title: { en: 'T' },
        slug: 's',
        content: { en: 'c' },
        tagIds: ['real-1', 'real-2'],
      })
    );

    expect(res.status).toBe(200);
    const updateCall = mockPrisma.blogPost.update.mock.calls[0][0];
    expect(updateCall.data.tags).toEqual({ set: [{ id: 'real-1' }, { id: 'real-2' }] });
  });
});

describe('Bug 3 — defensive P2018 still returns a friendly Chinese message', () => {
  it('if a write throws P2018, the response is a 400 with a Chinese hint (not raw Prisma)', async () => {
    mockPrisma.blogPost.findFirst.mockResolvedValue(null);
    mockPrisma.tag.findMany.mockResolvedValue([{ id: 'valid-1' }]);
    // Simulate a residual P2018 even after filtering (defensive fallback path).
    mockPrisma.blogPost.create.mockRejectedValue(
      new mockPrisma.PrismaClientKnownRequestError(
        'Error: Expected 1 records to be connected, found only 0',
        'P2018'
      )
    );

    const res = await POST(
      makePost({
        title: { en: 'T' },
        slug: 's3',
        content: { en: 'c' },
        tagIds: ['valid-1'],
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe('string');
    expect(body.error).toContain('关联数据'); // friendly Chinese: 部分关联数据（如标签）不存在…
  });
});
