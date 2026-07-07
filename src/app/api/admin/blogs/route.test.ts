import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// REAL SOURCE UNDER TEST: src/app/api/admin/blogs/route.ts
// We execute the actual GET/PUT handlers with a mocked Prisma DB layer, mocked
// auth, and a minimal NextRequest/NextResponse. The static seed module
// (@/data/blogs) is imported for real so we verify the genuine
// resolveStaticBlogForAdmin() fallback for seed-only blogs such as id '14'.
// ---------------------------------------------------------------------------

const { mockBlog, mockAuth, MockNextRequest, MockNextResponse } = vi.hoisted(() => {
  class MockNextRequest {
    url: string;
    method: string;
    private body?: string;
    constructor(url: string, init?: { method?: string; body?: string }) {
      this.url = url;
      this.method = init?.method ?? 'GET';
      this.body = init?.body;
    }
    async json() {
      return this.body ? JSON.parse(this.body) : {};
    }
  }
  const MockNextResponse = {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      ok: (init?.status ?? 200) < 400,
      json: async () => data,
    }),
  };
  const mockBlog = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const mockAuth = {
    verifyAuth: vi.fn().mockResolvedValue(true),
  };
  return { mockBlog, mockAuth, MockNextRequest, MockNextResponse };
});

// Mock Prisma: route declares `const prisma = new PrismaClient()` and uses
// `prisma.blogPost.*`. Provide a real PrismaClientKnownRequestError so the
// `instanceof` guard in the catch blocks keeps working.
vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    blogPost = mockBlog;
    $disconnect = vi.fn();
  },
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      code: string;
      constructor(code: string) {
        super(`Prisma error ${code}`);
        this.code = code;
      }
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  verifyAuth: mockAuth.verifyAuth,
  unauthorizedResponse: () => ({ status: 401, ok: false, json: async () => ({ error: 'unauthorized' }) }),
  badRequestResponse: (m: string) => ({ status: 400, ok: false, json: async () => ({ error: m }) }),
  serverErrorResponse: (m: string) => ({ status: 500, ok: false, json: async () => ({ error: m }) }),
}));

vi.mock('next/server', () => ({
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
}));

import { GET, PUT } from '@/app/api/admin/blogs/route';
import * as authLib from '@/lib/auth';

// Cast to any at the call boundary: we intentionally use a lightweight mock
// request (matching the existing faqs/route.test.ts convention) so tsc stays clean.
const mkReq = (url: string, init?: { method?: string; body?: unknown }): any =>
  new MockNextRequest(url, {
    method: init?.method,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

const SEED_ID = '14';
const SEED_SLUG = 'cnc-tool-inventory-management-guide';

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.verifyAuth.mockResolvedValue(true);
  // default: no DB rows for the seed
  mockBlog.findUnique.mockResolvedValue(null);
  mockBlog.findFirst.mockResolvedValue(null);
  mockBlog.findMany.mockResolvedValue([]);
  mockBlog.count.mockResolvedValue(0);
  mockBlog.create.mockImplementation((args: any) => Promise.resolve({ id: 'created-id', ...args.data }));
  mockBlog.update.mockImplementation((args: any) => Promise.resolve({ id: args.where.id, ...args.data }));
});

describe('Blogs admin API — V8.3 bug 3: static seed (id 14) resolution', () => {
  describe('GET /api/admin/blogs?id=14 (static seed lookup)', () => {
    it('B3-G1: DB unreachable (findUnique throws) -> falls back to static seed by numeric id (200)', async () => {
      mockBlog.findUnique.mockRejectedValue(new Error('DB down'));
      const res = await GET(mkReq(`http://localhost/api/admin/blogs?id=${SEED_ID}`));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.slug).toBe(SEED_SLUG);
      expect(String(body.id)).toBe(SEED_ID);
    });

    it('B3-G2: DB has no row for id 14 -> falls back to static seed (200)', async () => {
      mockBlog.findUnique.mockResolvedValue(null);
      mockBlog.findFirst.mockResolvedValue(null);
      const res = await GET(mkReq(`http://localhost/api/admin/blogs?id=${SEED_ID}`));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.slug).toBe(SEED_SLUG);
    });

    it('B3-G3: resolves by descriptive slug as well (200)', async () => {
      const res = await GET(mkReq(`http://localhost/api/admin/blogs?id=${SEED_SLUG}`));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(String(body.id)).toBe(SEED_ID);
    });

    it('B3-G4: unknown id -> 404 (no static seed, no DB row)', async () => {
      mockBlog.findUnique.mockResolvedValue(null);
      mockBlog.findFirst.mockResolvedValue(null);
      const res = await GET(mkReq('http://localhost/api/admin/blogs?id=999999'));
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/admin/blogs?id=14 (materialize seed into a real DB row)', () => {
    it('B3-P1: first save (no DB row) -> creates a DB row by slug (201) and keeps seed title when body is empty', async () => {
      mockBlog.findUnique.mockResolvedValue(null);
      mockBlog.findFirst.mockResolvedValue(null); // not yet materialized
      const res = await PUT(mkReq(`http://localhost/api/admin/blogs?id=${SEED_ID}`, {
        method: 'PUT',
        body: { title: {}, excerpt: {}, content: {} }, // empty -> pickLocalized must keep seed values
      }));
      expect(res.status).toBe(201);
      expect(mockBlog.create).toHaveBeenCalledTimes(1);
      const data = mockBlog.create.mock.calls[0][0].data;
      expect(data.slug).toBe(SEED_SLUG);
      // pickLocalized: empty body.title -> keep the real, non-empty seed title
      expect(data.title).toBeDefined();
      expect(data.title.en).toContain('CNC');
      // no tags supplied -> tags key must be absent (no connect with bad ids)
      expect(data.tags).toBeUndefined();
    });

    it('B3-P2: second save (row already materialized) -> updates the existing row (200), no duplicate create', async () => {
      mockBlog.findUnique.mockResolvedValue(null);
      mockBlog.findFirst.mockResolvedValue({ id: 'db-14', slug: SEED_SLUG });
      const res = await PUT(mkReq(`http://localhost/api/admin/blogs?id=${SEED_ID}`, {
        method: 'PUT',
        body: { title: { en: 'Updated title' }, excerpt: {}, content: {} },
      }));
      expect(res.status).toBe(200);
      expect(mockBlog.update).toHaveBeenCalledTimes(1);
      expect(mockBlog.update.mock.calls[0][0].where.id).toBe('db-14');
      expect(mockBlog.create).not.toHaveBeenCalled();
      // provided title wins over seed
      expect(mockBlog.update.mock.calls[0][0].data.title.en).toBe('Updated title');
    });

    it('B3-P3: id with no static seed -> 400 (Blog not found)', async () => {
      mockBlog.findUnique.mockResolvedValue(null);
      const res = await PUT(mkReq('http://localhost/api/admin/blogs?id=999999', {
        method: 'PUT',
        body: { title: { en: 'x' } },
      }));
      expect(res.status).toBe(400);
      expect(mockBlog.create).not.toHaveBeenCalled();
    });

    it('B3-P4: missing id -> 400 (Blog ID is required)', async () => {
      const res = await PUT(mkReq('http://localhost/api/admin/blogs', { method: 'PUT', body: {} }));
      expect(res.status).toBe(400);
    });
  });

  describe('Auth gate', () => {
    it('B3-A1: unauthenticated GET -> 401', async () => {
      vi.mocked(authLib.verifyAuth).mockResolvedValueOnce(false);
      const res = await GET(mkReq('http://localhost/api/admin/blogs?id=14'));
      expect(res.status).toBe(401);
    });
  });
});
