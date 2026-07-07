/**
 * Bug 7 — Admin top horizontal nav removed; module navigation is now provided
 * by dashboard icon-card grids. Verifies:
 *   (a) xiaozhouBackend/page.tsx and admin/page.tsx render card-grid entries
 *       linking to /users, /services, /editor, /settings/payment
 *   (b) AdminShell no longer renders horizontal text-nav links (it only kept
 *       NAV_ITEMS for reference) — there are zero internal module <a> links.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// The two dashboard pages fetch /api/admin/stats on mount. Stub it so they leave
// the loading state and render the feature-card grid.
beforeAll(() => {
  (globalThis as any).fetch = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        totalProducts: 1,
        totalBlogs: 1,
        totalFaqs: 1,
        totalMessages: 1,
        totalCategories: 1,
        productTrend: 1,
        blogTrend: 1,
        faqTrend: 1,
        messageTrend: 1,
      }),
      { status: 200 }
    )
  );
});

vi.mock('@/lib/admin-i18n', () => ({
  getAdminLocale: () => 'en',
  adminT: (k: string) => k,
  adminLocales: ['en', 'zh', 'ar'],
}));

import XzDashboard from '@/app/xiaozhouBackend/page';
import AdminDashboard from '@/app/admin/page';
import AdminShell from '@/components/admin/AdminShell';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Bug 7 — dashboard card-grid navigation', () => {
  it('xiaozhouBackend dashboard exposes users / services / editor / payment cards', async () => {
    const { container } = render(<XzDashboard />);
    expect(await screen.findByText('用户管理')).toBeTruthy();
    expect(container.querySelector('a[href="/xiaozhouBackend/users"]')).not.toBeNull();
    expect(container.querySelector('a[href="/xiaozhouBackend/services"]')).not.toBeNull();
    expect(container.querySelector('a[href="/xiaozhouBackend/editor"]')).not.toBeNull();
    expect(container.querySelector('a[href="/xiaozhouBackend/settings/payment"]')).not.toBeNull();
  });

  it('admin dashboard exposes users / services / editor / payment cards', async () => {
    const { container } = render(<AdminDashboard />);
    expect(await screen.findByText('用户管理')).toBeTruthy();
    expect(container.querySelector('a[href="/admin/users"]')).not.toBeNull();
    expect(container.querySelector('a[href="/admin/services"]')).not.toBeNull();
    expect(container.querySelector('a[href="/admin/editor"]')).not.toBeNull();
    expect(container.querySelector('a[href="/admin/settings/payment"]')).not.toBeNull();
  });

  it('AdminShell renders but contains NO horizontal module-nav <a> links', () => {
    // simulate an authenticated session so AdminShell renders its chrome
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('admin_authenticated', 'true');
    }
    const { container } = render(<AdminShell prefix="xiaozhouBackend">{null}</AdminShell>);
    // header chrome is present
    expect(container.querySelector('header')).not.toBeNull();
    // the removed nav used to render anchors like /xiaozhouBackend/products etc.
    const navLinks = container.querySelectorAll('a[href^="/xiaozhouBackend/"]');
    expect(navLinks.length).toBe(0);
  });
});
