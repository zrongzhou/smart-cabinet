'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Package, LayoutGrid, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { getProductHref } from '@/lib/product-url';
import { Product, Category } from '@/lib/api';
import OceanHeader from '@/components/OceanHeader';

// ===========================================================
// PRODUCTS FILTER — L2 sub-category Pills (v266)
// 产品列表页筛选只展示 4 个 L2 子分类（柜体类型 / 管理物料 / 行业 / 其他）
// 不展示 L1 容器、不展示 type 维度 Tab。
// 顺序固定：sub-cabinet-types → sub-managed-items → sub-industries → sub-others
// ===========================================================

/** Fixed display order for L2 sub-category pills — now sorted by name char length (descending, longer first) */
const L2_SLUG_ORDER: string[] = [
  // 保留此数组作为 fallback，但实际渲染已改为按名称长度排序
  // （保留常量定义以避免引用它的其他代码报错）
];

/**
 * Resolve a localized category name from its trilingual `name` field.
 * Priority by locale, with graceful fallbacks to other locales / slug.
 */
function getLocalizedCategoryName(
  name: { zh?: string; en?: string; ar?: string } | any,
  locale: string
): string {
  if (name && typeof name === 'object') {
    if (locale === 'zh') return name.zh || name.en || name.ar || '';
    if (locale === 'ar') return name.ar || name.en || name.zh || '';
    return name.en || name.zh || name.ar || '';
  }
  return String(name || '');
}

/**
 * Resolve the sort key for a category.
 *
 * Category.name is a trilingual object ({ zh, en, ar }); the schema has NO
 * top-level `nameEn` / `nameZh` fields, so sorting purely by
 * `a.name?.en || a.name?.zh || ''` is both correct and the simplest form.
 * Longer names sort first (descending by character length).
 */
function categoryNameForSort(
  name: { zh?: string; en?: string; ar?: string } | any
): string {
  if (name && typeof name === 'object') {
    return name.en || name.zh || name.ar || '';
  }
  return String(name || '');
}

const PRODUCTS_PER_PAGE = 6;

export default function ProductsClient({
  initialProducts = [],
  initialCategories = [],
}: {
  initialProducts?: Product[];
  initialCategories?: Category[];
}) {
  const { locale, t } = useLocale();
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  // V8.10: 产品与分类内容由服务端 SSR 透传（initialProducts/initialCategories），
  // 不再客户端拉取，确保产品卡片与链接出现在 SSR HTML 中（修复 client-swallow-SSR）。
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryExpanded, setCategoryExpanded] = useState<Record<string, boolean>>({});
  // L1 parent-category selection. null = "All" (show every L2 pill), otherwise shows only that L1's children.
  const [activeL1Id, setActiveL1Id] = useState<string | null>(null);

  // Ref to the products grid section — used to scroll into view on mobile when a filter is applied
  const productsGridRef = useRef<HTMLElement | null>(null);

  // 从 URL 读取 ?category=<slug> 预选 L2 子分类（导航点击 L2 带入）。
  // 仅匹配「子分类(L2, 含 parentId 或 parent)」，直接设 activeCategorySlug。
  // 该预选发生在客户端挂载后，SSR 阶段仍渲染「全部」，避免 hydration 不一致。
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const catSlug = params.get('category');
      if (catSlug && initialCategories.length > 0) {
        const l2 = initialCategories.find(
          (c: any) => c.slug === catSlug && (c.parentId || (c as any).parent)
        );
        if (l2) setActiveCategorySlug(l2.slug);
      }
    } catch {
      /* 忽略 URL 解析异常，保持默认（全部）展示 */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategorySlug]);

  // Scroll the products grid into view when the active category selection changes,
  // so the grid is never hidden behind the sticky filter panel on mobile.
  useEffect(() => {
    if (activeCategorySlug !== 'all' && productsGridRef.current) {
      productsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeCategorySlug]);

  // L2 sub-category pills (柜体类型 / 管理物料 / 行业 / 其他)
  // 按名称字符长度降序排列（字符多的在前，字符少的在后）
  const l2Categories: Category[] = useMemo(() => {
    const l2 = categories.filter((c) => c.parentId != null || (c as any).parent != null);
    return [...l2].sort((a: any, b: any) => {
      const na = categoryNameForSort(a.name).length;
      const nb = categoryNameForSort(b.name).length;
      return nb - na; // descending: longer names first
    });
  }, [categories]);

  // L1 parent categories (parentId === null) with their L2 children grouped underneath.
  // Each L1 is a real hierarchy container; its L2 children are the filter pills.
  // L1 按名称长度降序排列；组内 L2 也按名称长度降序
  const l1Groups = useMemo(() => {
    const l1 = categories.filter((c: any) => c.parentId == null || c.parent != null);
    return l1
      // Sort L1 groups by name length descending (longer names first)
      .sort((a: any, b: any) => {
        const na = categoryNameForSort(a.name).length;
        const nb = categoryNameForSort(b.name).length;
        return nb - na;
      })
      .map((g: any) => {
        const children = l2Categories.filter(
          (c: any) => c.parentId === g.id || (c.parent && c.parent.id === g.id)
        );
        // L2 within group: also by name length descending
        children.sort((a: any, b: any) => {
          const na = categoryNameForSort(a.name).length;
          const nb = categoryNameForSort(b.name).length;
          return nb - na;
        });
        return { group: g, children };
      })
      .filter((g: any) => g.children.length > 0);
  }, [categories, l2Categories]);

  // Pill selection is handled inline via setActiveCategorySlug (single-select L2 filter).

  // Filter products based on selected L2 sub-category + search
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((product) => {
        const nameEn = (product.name.en || '').toLowerCase();
        const nameZh = (product.name.zh || '').toLowerCase();
        const nameAr = (product.name.ar || '').toLowerCase();
        const sku = (product.sku || '').toLowerCase();
        return nameEn.includes(query) || nameZh.includes(query) || nameAr.includes(query) || sku.includes(query);
      });
    }

    // L1 parent-category filter: when an L1 tab is active, restrict the result
    // to products that belong to any of that L1 group's L2 children. This makes
    // clicking "By Cabinets types (8)" show only its 8 sub-category products
    // instead of the whole catalog (the original bug).
    if (activeL1Id) {
      const l1Group = l1Groups.find((g: any) => g.group.id === activeL1Id);
      if (l1Group && l1Group.children.length > 0) {
        const childIds = l1Group.children.map((c: any) => c.id);
        result = result.filter((product) =>
          (product.categories || []).some(
            (cat: any) => childIds.includes(cat.id) || childIds.includes(cat.slug)
          )
        );
      }
    }

    // L2 sub-category filter (single-select)
    if (activeCategorySlug !== 'all') {
      const target = l2Categories.find((c) => c.slug === activeCategorySlug);
      if (target) {
        result = result.filter((product) =>
          (product.categories || []).some(
            (cat: any) => cat.id === target.id || cat.slug === target.slug
          )
        );
      }
    }

    return result;
  }, [activeCategorySlug, activeL1Id, l1Groups, l2Categories, products, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Compute product count per category (used to show counts and hide empty categories)
  const categoryProductCount: Record<string, number> = {};
  categories.forEach(c => { categoryProductCount[c.id] = 0; });
  products.forEach(p => {
    (p.categories || []).forEach(c => {
      if (categoryProductCount[c.id] !== undefined) categoryProductCount[c.id]++;
    });
  });


  // Skeleton loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        {/* Header skeleton */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="h-12 w-64 bg-white/20 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-80 bg-white/10 rounded-lg mx-auto animate-pulse" />
          </div>
        </section>

        {/* Filter skeleton */}
        <section className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Search bar skeleton */}
            <div className="relative max-w-md mx-auto mb-5">
              <div className="w-full h-11 bg-blue-50 rounded-xl animate-pulse" />
            </div>

            {/* Row 0: L1 parent tabs + All-tab skeleton (default state shows only this row) — centered, unified sizes */}
            <div className="flex flex-wrap justify-center gap-2">
              <div className="h-9 w-24 bg-blue-50 rounded-full animate-pulse" />
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-9 w-32 bg-blue-50 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </section>

        {/* Product grid skeleton */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="h-68 bg-blue-50 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 bg-blue-50 rounded animate-pulse" />
                  <div className="h-6 w-full bg-blue-50 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-blue-50 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-blue-50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Page Header — Ocean Theme */}
      <OceanHeader
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        icon={<Package className="w-8 h-8 text-blue-300" />}
      />

      {/* Primary Dimension Filter + Search — Enhanced Glass Effect */}
      <section className="sticky top-16 z-40 max-h-[60vh] overflow-y-auto md:max-h-none md:overflow-visible" style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(248,250,252,0.65) 100%)',
        backdropFilter: 'blur(24px) saturate(1.9)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.9)',
        borderBottom: '1px solid rgba(226,232,240,0.5)',
        boxShadow: '0 4px 32px rgba(148,163,184,0.1), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto mb-5">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'zh' ? '搜索产品名称、SKU...' : locale === 'ar' ? 'بحث عن المنتجات...' : 'Search products by name, SKU...'}
              className="w-full pl-11 pr-10 py-2.5 glass-input rounded-xl text-sm outline-none transition-all text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 transition-colors text-gray-400 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Filter Panel — 透光玻璃面板 */}
          <div className="relative glass-panel water-ripple rounded-2xl px-6 py-5 overflow-hidden"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--rx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
              e.currentTarget.style.setProperty('--ry', `${((e.clientY - rect.top) / rect.height) * 100}%`);
            }}
          >
            {/* Subtle accent bar - shows under active dimension tab instead of top line */}
            <div className="h-1" />
            
            {/* Row 0: L1 parent-category tabs + "All" button — centered */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {/* "All" button — same size/weight as L1 tabs (px-4 py-2 text-[13px] font-semibold) */}
              <button
                onClick={() => { setActiveCategorySlug('all'); setActiveL1Id(null); }}
                className={`relative px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 inline-flex items-center gap-1.5 water-ripple ${
                  activeCategorySlug === 'all'
                    ? 'text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5'
                    : 'glass-btn text-gray-700 hover:-translate-y-0.5'
                }`}
                style={activeCategorySlug === 'all' ? {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                } : undefined}
              >
                {/* Left accent bar for active state */}
                {activeCategorySlug === 'all' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-white/60 rounded-r" />
                )}
                <LayoutGrid className="w-[14px] h-[14px] flex-shrink-0"
                  style={{ color: activeCategorySlug === 'all' ? '#ffffff' : '#2563eb' }} />
                <span style={activeCategorySlug !== 'all' ? { color: 'inherit' } : undefined}>
                  {t('products.filterAll') || 'All'}
                </span>
                <span className={`text-[11px] font-normal tabular-nums ml-0.5`}
                  style={{ color: activeCategorySlug === 'all' ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                  ({products.length})
                </span>
              </button>

              {/* L1 parent-category tabs */}
              {l1Groups.map(({ group, children }) => {
                const isActiveL1 = activeL1Id === group.id;
                const totalInGroup = children.reduce(
                  (sum: number, c: any) => sum + (categoryProductCount[c.id] || 0),
                  0
                );
                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      if (isActiveL1) {
                        // Re-click the active L1 → collapse pills AND clear any L2
                        // filter, returning to the clean default state.
                        setActiveL1Id(null);
                        setActiveCategorySlug('all');
                      } else {
                        // Click a different L1 → expand that group's L2 pills.
                        // Clear any previously selected L2 (activeCategorySlug) so
                        // we don't accidentally combine L1 + L2 filters and get an
                        // empty result.
                        setActiveL1Id(group.id);
                        setActiveCategorySlug('all');
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 border ${
                      isActiveL1
                        ? 'text-blue-600 bg-blue-50 border-blue-200'
                        : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-blue-200'
                    }`}
                  >
                    {getLocalizedCategoryName(group.name, locale)}
                    <span className="text-[10px] ml-0.5 opacity-60">({totalInGroup})</span>
                  </button>
                );
              })}
            </div>

            {/* Row 1: L2 sub-category pills — ONLY shown when an L1 group is active.
                Default state (activeL1Id === null) shows NO L2 pills, keeping the
                filter area to a single clean row. */}
            {activeL1Id !== null && (
              <div className="flex flex-wrap items-center justify-center gap-[6px] mt-3 pt-3 border-t border-gray-100">
                {(l1Groups.find((g: any) => g.group.id === activeL1Id)?.children || []).map((cat: any) => {
                  const count = categoryProductCount[cat.id] || 0;
                  const isActive = activeCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategorySlug(isActive ? 'all' : cat.slug)}
                      className={`relative px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 inline-flex items-center gap-1.5 water-ripple ${
                        isActive ? 'text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5'
                          : 'glass-btn text-gray-700 hover:-translate-y-0.5'
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' } : undefined}
                    >
                      {isActive && (<div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-white/60 rounded-r" />)}
                      <span style={!isActive ? { color: 'inherit' } : undefined}>{getLocalizedCategoryName(cat.name, locale)}</span>
                      <span className={`text-[11px] font-normal tabular-nums ml-0.5`} style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {/* Results count */}
          {(searchQuery || activeCategorySlug !== 'all') && (
            <div className="text-center mt-4">
              <span className="inline-flex items-center px-3.5 py-1 glass-btn rounded-full text-[12px] font-medium text-gray-600">
                {locale === 'zh'
                  ? `找到 ${filteredProducts.length} 个产品`
                  : locale === 'ar'
                    ? `${filteredProducts.length} منتج تم العثور عليه`
                    : `${filteredProducts.length} products found`}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section ref={productsGridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[50vh]">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
                        <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
            <p className="text-2xl" style={{ color: '#4b5563' }}>
              {t('products.noProducts') || 'No products found.'}
            </p>
            {(searchQuery || activeCategorySlug !== 'all' || activeL1Id) && (
              <button
                onClick={() => { setSearchQuery(''); setActiveCategorySlug('all'); }}
                className="mt-4 px-4 py-2 text-blue-600 hover:opacity-80 font-medium text-sm"
              >
                {locale === 'zh' ? '清除筛选' : locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {paginatedProducts.map((product, index) => {
                const isPriority = index < 3;
                const detailHref = getProductHref(product.slug, locale);
                const name = locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en;
                return (
                  <Link key={product.id} href={detailHref}
                    className="group relative glass-card water-ripple rounded-2xl overflow-hidden block"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      e.currentTarget.style.setProperty('--rx', `${x}%`);
                      e.currentTarget.style.setProperty('--ry', `${y}%`);

                      // 移动透光光斑
                      const glow = e.currentTarget.querySelector('.card-glow-spot') as HTMLElement | null;
                      if (glow) {
                        glow.style.left = `${x}%`;
                        glow.style.top = `${y}%`;
                        glow.style.transform = 'translate(-50%, -50%)';
                      }

                      // 第三波纹跟随鼠标
                      const w3 = e.currentTarget.querySelector('.ripple-wave3') as HTMLElement | null;
                      if (w3) {
                        w3.style.left = `${x}%`;
                        w3.style.top = `${y}%`;
                      }
                    }}
                  >
                    {/* 透光光斑 — 跟随鼠标移动 */}
                    <div className="card-glow-spot" />
                    {/* 第三层波纹 */}
                    <div className="ripple-wave3" />
                    {/* Product Image */}
                    {product.images && product.images[0] ? (
                      <div className="relative h-56 overflow-hidden bg-blue-50">
                        <img src={product.images[0]} alt={name}
                          className="w-full h-56 object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                          loading={isPriority ? 'eager' : 'lazy'}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-lg">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {locale === 'zh' ? '查看详情' : 'View Details'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 bg-gradient-to-br from-blue-50 to-gray-200 flex items-center justify-center">
                        <Package className="w-16 h-16 mx-auto" style={{ color: '#9ca3af' }} />
                        <p className="text-xs absolute bottom-4" style={{ color: '#9ca3af' }}>{locale === 'zh' ? '暂无图片' : 'No Image'}</p>
                      </div>
                    )}
                    {/* Product Info */}
                    <div className="p-5 flex flex-col h-full">
                      {product.categories?.[0] && (
                        <span 
                          className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-2 w-fit"
                          style={{ 
                            backgroundColor: 'rgba(59,130,246,0.1)', 
                            color: '#2563eb' 
                          }}
                        >
                          {(() => { 
                            const c = product.categories?.[0]; 
                            if (!c) return null;
                            const n = (c as any).name;
                            if (n && typeof n === 'object') {
                              if (locale === 'zh') return n.zh || n.en || n.ar || c.slug || '';
                              if (locale === 'ar') return n.ar || n.en || n.zh || c.slug || '';
                              return n.en || n.zh || n.ar || c.slug || '';
                            }
                            // Fallback: name is a plain string (old data)
                            return String(n || c.slug || '');
                          })()}
                        </span>
                      )}
                      <h3 className="text-lg font-bold mb-1.5 line-clamp-2 group-hover:text-blue-600 leading-snug text-gray-900">{name}</h3>
                      <p className="text-xs font-mono mb-2" style={{ color: '#2563eb' }}>{product.sku}</p>
                      {product.hidePrice ? (
                        <p className="text-sm font-medium mb-2" style={{ color: '#2563eb' }}>{locale === 'zh' ? '联系我们询价' : 'Contact for Pricing'}</p>
                      ) : product.price > 0 ? (
                        <p className="text-base font-bold mb-2" style={{ color: '#ef4444' }}>${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}</p>
                      ) : (
                        <p className="text-xs italic mb-2" style={{ color: '#9ca3af' }}>{locale === 'zh' ? '价格面议' : 'Contact for Price'}</p>
                      )}
                      <p className="text-sm mb-3 line-clamp-2 flex-1" style={{ color: '#4b5563' }}
                        dangerouslySetInnerHTML={{
                          __html: (locale === 'zh' ? product.description?.zh : locale === 'ar' ? product.description?.ar : product.description?.en) || ''
                        }}
                      />
                      <span className="inline-flex items-center font-semibold text-sm mt-auto" style={{ color: '#2563eb' }}>
                        {t('products.viewDetails') || 'View Details'}
                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-4 py-3 rounded-lg glass-btn text-sm font-medium text-gray-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {locale === 'zh' ? '上一页' : locale === 'ar' ? 'السابق' : 'Previous'}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[44px] min-h-[44px] rounded-lg text-sm font-semibold transition-all duration-200 ${
                      currentPage === page
                        ? 'text-white shadow-md'
                        : 'glass-btn hover:text-blue-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-4 py-3 rounded-lg glass-btn text-sm font-medium text-gray-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                >
                  {locale === 'zh' ? '下一页' : locale === 'ar' ? 'التالي' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            src={lightboxImage}
            alt="Product zoom view"
            loading="lazy"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-4 text-white/60 text-sm">Click anywhere to close</p>
        </div>
      )}
      {/* 透光玻璃水面质感 — 全局效果系统 */}
      <style>{`
        /* ============================================
           GLASS WATER SURFACE — 核心视觉系统
           透光玻璃 + 水面波纹 = 高级动态质感
           ============================================ */

        /* ---- 通用玻璃容器基础 ---- */
        .glass-surface {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(255,255,255,0.52) 40%,
            rgba(240,248,255,0.45) 100%
          );
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow:
            0 8px 32px rgba(59,130,246,0.08),
            0 2px 8px rgba(148,163,184,0.06),
            inset 0 1px 0 rgba(255,255,255,0.7),
            inset 0 -1px 0 rgba(200,220,255,0.15);
        }

        /* ---- 水波纹容器（所有需要水波纹的元素加这个class） ---- */
        .water-ripple {
          position: relative;
          overflow: hidden;
        }

        /* 波纹层：多层同心圆从鼠标位置扩散 */
        .water-ripple::before,
        .water-ripple::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%, -50%);
          left: var(--rx, 50%);
          top: var(--ry, 50%);
        }

        /* 主波纹 — 蓝色填充圆 */
        .water-ripple::before {
          width: 0; height: 0;
          background: radial-gradient(circle,
            rgba(59,130,246,0.30) 0%,
            rgba(96,165,250,0.15) 40%,
            transparent 70%
          );
          z-index: 2;
        }

        /* 次波纹 — 环形波纹圈 */
        .water-ripple::after {
          width: 0; height: 0;
          border: 2px solid rgba(147,197,253,0.45);
          background: transparent;
          box-shadow: 0 0 16px rgba(59,130,246,0.20);
          z-index: 2;
        }

        /* 第三波纹 — 更大的外围涟漪 */
        .ripple-wave3 {
          position: absolute;
          width: 0; height: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(147,197,253,0.25);
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%, -50%);
          left: var(--rx, 50%);
          top: var(--ry, 50%);
          z-index: 2;
        }

        /* hover 时触发三层波纹扩散动画 */
        @keyframes ripple-expand-1 {
          0%   { width: 0; height: 0; opacity: 0.8; }
          100% { width: 420px; height: 420px; opacity: 0; }
        }
        @keyframes ripple-expand-2 {
          0%   { width: 0; height: 0; opacity: 0.7; }
          100% { width: 360px; height: 360px; opacity: 0; }
        }
        @keyframes ripple-expand-3 {
          0%   { width: 0; height: 0; opacity: 0.5; }
          100% { width: 480px; height: 480px; opacity: 0; }
        }

        .water-ripple:hover::before {
          animation: ripple-expand-1 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .water-ripple:hover::after {
          animation: ripple-expand-2 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.08s forwards;
        }
        .water-ripple:hover .ripple-wave3 {
          animation: ripple-expand-3 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.16s forwards;
        }


        /* ============================================
           产品卡片 — 玻璃水面卡片
           ============================================ */
        .glass-card {
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.78) 0%,
            rgba(245,250,255,0.62) 50%,
            rgba(235,245,255,0.55) 100%
          );
          backdrop-filter: blur(18px) saturate(1.5);
          -webkit-backdrop-filter: blur(18px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.65);
          border-top-color: rgba(255,255,255,0.85);
          border-left-color: rgba(255,255,255,0.75);
          box-shadow:
            0 4px 24px rgba(30,64,175,0.07),
            0 1px 4px rgba(148,163,184,0.05),
            0 0 0 1px rgba(200,220,255,0.1),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(180,210,255,0.12);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .glass-card:hover {
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.88) 0%,
            rgba(248,252,255,0.78) 50%,
            rgba(238,245,255,0.70) 100%
          );
          border-color: rgba(147,197,253,0.45);
          box-shadow:
            0 16px 48px rgba(37,99,235,0.14),
            0 4px 16px rgba(148,163,184,0.08),
            0 0 0 1px rgba(147,197,253,0.2),
            inset 0 1px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(180,215,255,0.2);
          transform: translateY(-6px) scale(1.01);
        }

        /* 卡片顶部光泽线 — 增强玻璃感 */
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg,
            transparent, rgba(255,255,255,0.9), transparent);
          border-radius: 999px;
          z-index: 5;
        }

        /* 卡片内光斑 — 随鼠标移动的透光效果 */
        .glass-card .card-glow-spot {
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle,
            rgba(147,197,253,0.12) 0%,
            transparent 70%
          );
          filter: blur(20px);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .glass-card:hover .card-glow-spot {
          opacity: 1;
        }


        /* ============================================
           筛选面板 — 玻璃面板
           ============================================ */
        .glass-panel {
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.68) 0%,
            rgba(248,252,255,0.55) 50%,
            rgba(235,245,255,0.42) 100%
          );
          backdrop-filter: blur(14px) saturate(1.3);
          -webkit-backdrop-filter: blur(14px) saturate(1.3);
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow:
            0 4px 20px rgba(37,99,235,0.05),
            inset 0 1px 0 rgba(255,255,255,0.6),
            inset 0 -1px 0 rgba(190,215,255,0.1);
        }


        /* ============================================
           按钮 — 玻璃按钮
           ============================================ */
        .glass-btn {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.7) 0%,
            rgba(248,252,255,0.5) 100%
          );
          backdrop-filter: blur(10px) saturate(1.3);
          -webkit-backdrop-filter: blur(10px) saturate(1.3);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow:
            0 2px 8px rgba(148,163,184,0.06),
            inset 0 1px 0 rgba(255,255,255,0.7);
          transition: all 0.3s ease;
        }

        .glass-btn:hover {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.88) 0%,
            rgba(240,248,255,0.7) 100%
          );
          border-color: rgba(147,197,253,0.35);
          box-shadow:
            0 4px 16px rgba(37,99,235,0.1),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }


        /* ============================================
           搜索框 — 玻璃输入框
           ============================================ */
        .glass-input {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.65) 0%,
            rgba(248,252,255,0.48) 100%
          );
          backdrop-filter: blur(12px) saturate(1.3);
          -webkit-backdrop-filter: blur(12px) saturate(1.3);
          border: 1px solid rgba(200,215,230,0.4);
          box-shadow:
            inset 0 1px 3px rgba(148,163,184,0.08),
            0 1px 0 rgba(255,255,255,0.6);
          transition: all 0.3s ease;
        }

        .glass-input:focus-within,
        .glass-input:focus {
          border-color: rgba(96,165,250,0.5);
          box-shadow:
            inset 0 1px 3px rgba(148,163,184,0.06),
            0 0 0 3px rgba(59,130,246,0.08),
            0 1px 0 rgba(255,255,255,0.6);
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.82) 0%,
            rgba(248,252,255,0.62) 100%
          );
        }
      `}</style>
    </div>
  );
}
