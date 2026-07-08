/**
 * Bug 1 (P1) — Product FAQ editor + products API safely read/write `faq`.
 *
 * Part A (component): <ProductFaqEditor/> is a controlled editor. It must render
 *   an empty state, add a new FAQ entry (3-lang question+answer), update a field,
 *   and remove an entry — all via onChange without mutating internal state.
 * Part B (API): POST /api/admin/products and PUT /api/admin/products read/write
 *   `body.faq` null-safely: a faq object, an empty array, null, or undefined must
 *   all persist correctly and never crash the handler.
 *
 * Prisma / auth are mocked for the API part. The component part needs no mocks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// ---- Mock layer for the products API ----
const { mockPrisma } = vi.hoisted(() => {
  const product = {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };
  class PrismaClient {
    product = product;
    $disconnect = vi.fn();
  }
  return { mockPrisma: { product, PrismaClient } };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: mockPrisma.PrismaClient,
  Prisma: {},
}));

vi.mock('@/lib/prisma', () => ({
  prisma: new mockPrisma.PrismaClient(),
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

import ProductFaqEditor from '@/components/product/ProductFaqEditor';
import { POST, PUT } from '@/app/api/admin/products/route';
import { NextRequest } from 'next/server';

const SAMPLE_FAQ = [
  {
    question: { en: 'Q1', zh: '问1', ar: 'س1' },
    answer: { en: 'A1', zh: '答1', ar: 'ج1' },
  },
];

function makeReq(method: string, id: string | null, body: unknown): NextRequest {
  const url = id
    ? `http://localhost/api/admin/products?id=${id}`
    : 'http://localhost/api/admin/products';
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockPrisma.product.findUnique.mockReset();
  mockPrisma.product.findFirst.mockReset();
  mockPrisma.product.create.mockReset();
  mockPrisma.product.update.mockReset();
  // default: no slug/sku conflict on create, existing product found on update
  mockPrisma.product.findFirst.mockResolvedValue(null);
  cleanup();
});

describe('Bug 1 (A) — ProductFaqEditor controlled editing', () => {
  it('shows an empty state and adds a new FAQ entry via onChange', () => {
    const onChange = vi.fn();
    render(<ProductFaqEditor value={[]} onChange={onChange} />);

    expect(screen.getByText(/暂无 FAQ/)).toBeTruthy();
    fireEvent.click(screen.getByText(/添加 FAQ/));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(Array.isArray(next)).toBe(true);
    expect(next).toHaveLength(1);
    expect(next[0]).toHaveProperty('question');
    expect(next[0]).toHaveProperty('answer');
    // each field is trilingual
    expect(next[0].question).toHaveProperty('en');
    expect(next[0].question).toHaveProperty('zh');
    expect(next[0].question).toHaveProperty('ar');
  });

  it('edits a field and removes an entry, all through onChange', () => {
    const onChange = vi.fn();
    render(<ProductFaqEditor value={SAMPLE_FAQ} onChange={onChange} />);

    // type into the first English (question) input
    const englishInputs = screen.getAllByPlaceholderText('English');
    fireEvent.change(englishInputs[0], { target: { value: 'Updated Q' } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall[0].question.en).toBe('Updated Q');

    // remove the only entry
    fireEvent.click(screen.getByLabelText('删除'));
    const afterRemove = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(afterRemove).toHaveLength(0);
  });
});

describe('Bug 1 (B) — products API reads/writes faq null-safely', () => {
  it('POST create persists a normal faq object', async () => {
    mockPrisma.product.create.mockResolvedValue({ id: 'p1' });
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1' });

    const res = await POST(
      makeReq('POST', null, {
        name: { en: 'N' },
        slug: 's1',
        sku: 'k1',
        price: 10,
        faq: SAMPLE_FAQ,
      })
    );

    expect(res.status).toBe(201);
    const createCall = mockPrisma.product.create.mock.calls[0][0];
    expect(createCall.data.faq).toEqual(SAMPLE_FAQ);
  });

  it('POST create stores faq=null without crashing', async () => {
    mockPrisma.product.create.mockResolvedValue({ id: 'p2' });
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p2' });

    const res = await POST(
      makeReq('POST', null, {
        name: { en: 'N' },
        slug: 's2',
        sku: 'k2',
        price: 10,
        faq: null,
      })
    );

    expect(res.status).toBe(201);
    const createCall = mockPrisma.product.create.mock.calls[0][0];
    expect(createCall.data.faq).toBeNull();
  });

  it('POST create stores an empty faq array without crashing', async () => {
    mockPrisma.product.create.mockResolvedValue({ id: 'p3' });
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p3' });

    const res = await POST(
      makeReq('POST', null, {
        name: { en: 'N' },
        slug: 's3',
        sku: 'k3',
        price: 10,
        faq: [],
      })
    );

    expect(res.status).toBe(201);
    const createCall = mockPrisma.product.create.mock.calls[0][0];
    expect(createCall.data.faq).toEqual([]);
  });

  it('POST create with no faq key leaves faq unset (no crash)', async () => {
    mockPrisma.product.create.mockResolvedValue({ id: 'p4' });
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p4' });

    const res = await POST(
      makeReq('POST', null, { name: { en: 'N' }, slug: 's4', sku: 'k4', price: 10 })
    );

    expect(res.status).toBe(201);
    const createCall = mockPrisma.product.create.mock.calls[0][0];
    expect(createCall.data.faq).toBeUndefined();
  });

  it('PUT update persists a faq object', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ id: 'p5', slug: 's5', sku: 'k5' });
    mockPrisma.product.update.mockResolvedValue({ id: 'p5' });

    const res = await PUT(makeReq('PUT', 'p5', { faq: SAMPLE_FAQ }));

    expect(res.status).toBe(200);
    const updateCall = mockPrisma.product.update.mock.calls[0][0];
    expect(updateCall.data.faq).toEqual(SAMPLE_FAQ);
  });
});
