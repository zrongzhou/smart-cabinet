/**
 * Bug 5 — Add Product no longer throws React #31 (object rendered as child).
 * The fix guards every `cat.name` / `parent.name` / `tag.name` access with
 * `?.en` / `?.zh` / String() fallbacks so a trilingual name object is never
 * passed raw to React. We feed categories/tags whose `name` is a trilingual
 * object {en,zh,ar} and assert the component renders string text and never
 * emits "[object Object]".
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const getCategories = vi.fn();
const getTags = vi.fn();

vi.mock('@/data/unified-data', () => ({
  adminApi: {
    getCategories: () => getCategories(),
    getTags: () => getTags(),
    createProduct: vi.fn(),
  },
}));

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({ token: null, isAuthenticated: false, user: null }),
}));

import AddProductPage from '@/app/xiaozhouBackend/products/add/page';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Bug 5 — AddProduct renders trilingual names without React #31', () => {
  it('renders category / parent-group / tag labels from trilingual objects as strings', async () => {
    getCategories.mockResolvedValue([
      { id: 'p1', parentId: null, name: { en: 'Tools Parent', zh: '工具父级', ar: 'أداة' } },
      { id: 'c1', parentId: 'p1', name: { en: 'CNC Tools', zh: 'CNC 刀具', ar: 'أدوات CNC' } },
    ]);
    // tag intentionally omits `zh` so the guard falls back to `name.en`
    getTags.mockResolvedValue([{ id: 't1', name: { en: 'TagEn', ar: 'علامة' } }]);

    render(<AddProductPage />);

    // category button shows cleanName(cat.name?.en)
    expect(await screen.findByText('CNC Tools')).toBeTruthy();
    // parent group label shows parent.nameEn
    expect(await screen.findByText('Tools Parent')).toBeTruthy();
    // tag button falls back to name.en (zh omitted)
    expect(screen.getByText('TagEn')).toBeTruthy();

    // defensive: React #31 would have stringified an object to "[object Object]"
    expect(document.body.textContent).not.toContain('[object Object]');
  });
});
