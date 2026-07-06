import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// REAL SOURCE UNDER TEST: src/app/api/admin/faqs/route.ts
// We execute the actual GET/POST/PUT/DELETE handlers with a mocked DB layer
// (Prisma), mocked auth, and a minimal NextRequest/NextResponse. This proves
// the real handler logic — not just that the code exists.
// ---------------------------------------------------------------------------

const { mockFaq, mockAuth, MockNextRequest, MockNextResponse } = vi.hoisted(() => {
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
  return {
    mockFaq: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    mockAuth: {
      verifyAuth: vi.fn().mockResolvedValue(true),
    },
    MockNextRequest,
    MockNextResponse,
  };
});

// Mock Prisma: the route declares `const prisma = new PrismaClient()` at module
// load and uses `prisma.fAQ.*` (note the exact model-cased property `fAQ`).
vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    fAQ = mockFaq;
    $disconnect = vi.fn();
  },
  Prisma: {},
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

import { GET, POST, PUT, DELETE } from '@/app/api/admin/faqs/route';
import * as authLib from '@/lib/auth';

const mkReq = (url: string, init?: { method?: string; body?: unknown }) =>
  new MockNextRequest(url, {
    method: init?.method,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

beforeEach(() => {
  mockFaq.findMany.mockReset();
  mockFaq.count.mockReset();
  mockFaq.create.mockReset();
  mockFaq.update.mockReset();
  mockFaq.delete.mockReset();
  mockFaq.findUnique.mockReset();
  mockAuth.verifyAuth.mockReset();
  mockAuth.verifyAuth.mockResolvedValue(true);

  // default happy-path returns
  mockFaq.count.mockResolvedValue(0);
  mockFaq.findMany.mockResolvedValue([]);
  mockFaq.create.mockImplementation((args: any) => Promise.resolve({ id: 'new-id', ...args.data }));
  mockFaq.update.mockImplementation((args: any) => Promise.resolve({ id: args.where.id, ...args.data }));
  mockFaq.delete.mockResolvedValue(undefined);
  mockFaq.findUnique.mockResolvedValue({ id: 'faq-1', productId: 'prod-1' });
});

describe('A. GET /api/admin/faqs — productId filtering', () => {
  it('A1: with productId -> where.productId is set (returns only that product FAQ)', async () => {
    mockFaq.findMany.mockResolvedValue([{ id: 'f1', productId: 'prod-1' }]);
    mockFaq.count.mockResolvedValue(1);

    const res = await GET(mkReq('http://localhost/api/admin/faqs?productId=prod-1'));
    const body = await res.json();

    expect(mockFaq.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ productId: 'prod-1' }) }),
    );
    expect(mockFaq.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ productId: 'prod-1' }) }),
    );
    expect(body.data).toHaveLength(1);
  });

  it('A2: without productId -> where.productId is UNDEFINED (global page compatibility)', async () => {
    mockFaq.findMany.mockResolvedValue([
      { id: 'g1', productId: null },
      { id: 'g2', productId: 'prod-1' },
    ]);
    mockFaq.count.mockResolvedValue(2);

    const res = await GET(mkReq('http://localhost/api/admin/faqs'));
    const body = await res.json();

    const where = mockFaq.findMany.mock.calls[0][0].where;
    expect(where.productId).toBeUndefined();
    expect(body.data).toHaveLength(2);
  });
});

describe('B. POST /api/admin/faqs — persist productId via relation', () => {
  it('B1: with productId -> data.product = { connect: { id } } (no scalar FK write)', async () => {
    const res = await POST(
      mkReq('http://localhost/api/admin/faqs', {
        method: 'POST',
        body: {
          question: { en: 'Q?', zh: '问？', ar: '؟' },
          answer: { en: 'A', zh: '答', ar: 'ج' },
          category: 'features',
          productId: 'prod-1',
        },
      }),
    );
    expect(res.status).toBe(201);
    const data = mockFaq.create.mock.calls[0][0].data;
    expect(data.product).toEqual({ connect: { id: 'prod-1' } });
    expect((data as any).productId).toBeUndefined(); // Prisma v6: FK via relation only
  });

  it('B2: without productId -> data.product is undefined (global FAQ, productId stays null)', async () => {
    await POST(
      mkReq('http://localhost/api/admin/faqs', {
        method: 'POST',
        body: { question: { en: 'Q' }, answer: { en: 'A' } },
      }),
    );
    const data = mockFaq.create.mock.calls[0][0].data;
    expect(data.product).toBeUndefined();
  });

  it('B3: missing question/answer -> 400 bad request', async () => {
    const res = await POST(
      mkReq('http://localhost/api/admin/faqs', {
        method: 'POST',
        body: { question: {} },
      }),
    );
    expect(res.status).toBe(400);
    expect(mockFaq.create).not.toHaveBeenCalled();
  });
});

describe('C. PUT /api/admin/faqs — productId guard (CRITICAL foot-gun proof)', () => {
  const fullPayload = {
    question: { en: 'Updated Q', zh: '更新问', ar: 'تحديث' },
    answer: { en: 'Updated A', zh: '更新答', ar: 'تحديث ج' },
    category: 'features',
    status: 'active',
    order: 3,
  };

  it('C1 (MAIN): PUT WITHOUT productId does NOT touch product -> no disconnect', async () => {
    // This is exactly what ProductFaqBlock.updateFaq(row.id, buildPayload(row)) sends:
    // buildPayload() never includes productId.
    const res = await PUT(
      mkReq('http://localhost/api/admin/faqs?id=faq-1', {
        method: 'PUT',
        body: fullPayload,
      }),
    );
    expect(res.status).toBe(200);

    const data = mockFaq.update.mock.calls[0][0].data;
    // CRITICAL ASSERTION: the `product` key must be entirely absent from the
    // Prisma update payload, so the `!== undefined` guard prevented disconnect.
    expect('product' in data).toBe(false);
    expect(data.product).toBeUndefined();
    // ...and the normal fields are still applied:
    expect(data.question.en).toBe('Updated Q');
    expect(data.answer.en).toBe('Updated A');
    expect(data.order).toBe(3);
  });

  it('C2: PUT WITH productId present -> reconnects via relation', async () => {
    await PUT(
      mkReq('http://localhost/api/admin/faqs?id=faq-1', {
        method: 'PUT',
        body: { ...fullPayload, productId: 'prod-2' },
      }),
    );
    const data = mockFaq.update.mock.calls[0][0].data;
    expect(data.product).toEqual({ connect: { id: 'prod-2' } });
  });

  it('C3 (documented edge, NOT triggered by frontend): PUT with productId=null explicitly disconnects', async () => {
    // Transparency test: the guard only blocks `undefined`. An explicit `null`
    // WOULD disconnect. The frontend never sends productId at all, so this path
    // is unreachable from ProductFaqBlock — documented as residual risk, not a bug.
    await PUT(
      mkReq('http://localhost/api/admin/faqs?id=faq-1', {
        method: 'PUT',
        body: { ...fullPayload, productId: null },
      }),
    );
    const data = mockFaq.update.mock.calls[0][0].data;
    expect(data.product).toEqual({ disconnect: true });
  });

  it('C4: PUT missing id -> 400', async () => {
    const res = await PUT(mkReq('http://localhost/api/admin/faqs', { method: 'PUT', body: fullPayload }));
    expect(res.status).toBe(400);
  });
});

describe('D. DELETE /api/admin/faqs — by id', () => {
  it('D1: DELETE with id removes the FAQ', async () => {
    const res = await DELETE(mkReq('http://localhost/api/admin/faqs?id=faq-1', { method: 'DELETE' }));
    expect(res.status).toBe(200);
    expect(mockFaq.delete).toHaveBeenCalledWith({ where: { id: 'faq-1' } });
  });

  it('D2: DELETE missing id -> 400', async () => {
    const res = await DELETE(mkReq('http://localhost/api/admin/faqs', { method: 'DELETE' }));
    expect(res.status).toBe(400);
  });
});

describe('Auth gate', () => {
  it('unauthenticated GET -> 401', async () => {
    vi.mocked(authLib.verifyAuth).mockResolvedValueOnce(false);
    const res = await GET(mkReq('http://localhost/api/admin/faqs'));
    expect(res.status).toBe(401);
  });
});
