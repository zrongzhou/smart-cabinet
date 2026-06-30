'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Package, Layers, Box, Building2, Settings, Wrench, Cpu, Shield, Lock, Star, Heart, Truck, Factory, Zap, Clock, Globe, Database, FileText, Image, ZoomIn, Search, ChevronLeft, ChevronRight, ExternalLink, Archive, Briefcase, Code, Cog, Puzzle, Bot, BrainCircuit } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { Product, Category } from '@/lib/api';
import { getBaseUrl } from '@/data/unified-data';
import OceanHeader from '@/components/OceanHeader';

// ===========================================================
// DIMENSION ICON SYSTEM — Lucide React components only (v133)
// NO emoji — emojis render inconsistently across platforms/themes
// Priority: Admin DB setting > Built-in default > Settings fallback
// ===========================================================

/** Built-in DEFAULT icons for dimension types — used ONLY when admin hasn't set a custom one */
const dimensionDefaultIcons: Record<string, any> = {
  'cabinet-type':   Archive,     // file cabinet
  'managed-items':  Package,     // box/package
  'industry':       Building2,   // building (v134: changed from Factory which rendered blank on some browsers)
  'custom-solution': Settings,    // gear
  'robots':         Cpu,         // processor chip
  'robotics':       Cpu,
};

/** All supported Lucide icons — registry for admin-selected icon names from DB */
const lucideIconRegistry: Record<string, any> = {
  Package, Archive, Box, Briefcase, Building2, Factory, Settings, Wrench, Cpu,
  Shield, Lock, Star, Heart, Truck, Zap, Clock, Globe, Database, FileText,
  Image, Layers, Code, Cog, Puzzle, Bot, BrainCircuit,
};

/** Dimension visual config — FIXED colors (no CSS variables) */
const dimensionColors: Record<string, {
  colorClass: string;
  activeBg: string;
  barColor: string;
  textColor: string;
}> = {
  'cabinet-type':    { colorClass: 'text-blue-600', activeBg: 'bg-blue-600', barColor: 'bg-blue-600', textColor: 'text-blue-600' },
  'managed-items':   { colorClass: 'text-blue-600', activeBg: 'bg-blue-600', barColor: 'bg-blue-600', textColor: 'text-blue-600' },
  'industry':        { colorClass: 'text-blue-600', activeBg: 'bg-blue-600', barColor: 'bg-blue-600', textColor: 'text-blue-600' },
  'custom-solution': { colorClass: 'text-blue-600', activeBg: 'bg-blue-600', barColor: 'bg-blue-600', textColor: 'text-blue-600' },
};
const defaultDimColor = { colorClass: 'text-blue-600', activeBg: 'bg-blue-600', barColor: 'bg-blue-600', textColor: 'text-blue-600' };

/**
 * Resolve icon for a dimension type.
 * Priority: customIcons (from DB/API) → built-in defaults → Settings
 * ALWAYS returns a Lucide React component.
 */
function resolveDimensionIcon(type: string, customIcons: Record<string, any>): any {
  const normalized = type.toLowerCase().replace(/[_\s]+/g, '-');

  // 1. Admin-customized icon from database (HIGHEST priority — admin is always right!)
  const customIconName = (customIcons[normalized] || customIcons[type])?.icon;
  if (customIconName && typeof customIconName === 'string') {
    const registered = lucideIconRegistry[customIconName];
    if (registered) return registered;
    // If admin set an unrecognized name, fall through to default
  }

  // 2. Built-in default icon
  if (dimensionDefaultIcons[normalized]) return dimensionDefaultIcons[normalized];
  if (dimensionDefaultIcons[type]) return dimensionDefaultIcons[type];

  // 3. Universal fallback
  return Settings;
}

  // Label maps for dimension tabs - matches Category.type values in DB
  const labelMapZh: Record<string, string> = {
    'cabinet-type': '柜型分类',
    'managed-items': '管理物料',
    'industry': '行业分类',
    'custom-solution': '定制方案',
    // Note: Custom dimensions like "robots" are now loaded from DB via API — no need to hardcode here
  };

  const labelMapEn: Record<string, string> = {
    'cabinet-type': 'By Cabinet Type',
    'managed-items': 'By Managed Items',
    'industry': 'By Industry',
    'custom-solution': 'Custom Solutions',
    // Note: Custom dimensions loaded from DB via API
  };

  const labelMapAr: Record<string, string> = {
    'cabinet-type': 'حسب نوع الخزانة',
    'managed-items': 'حسب المواد المدارة',
    'industry': 'حسب الصناعة',
    'custom-solution': 'حلول مخصصة',
    // Note: Custom dimensions loaded from DB via API
  };

const PRODUCTS_PER_PAGE = 6;

export default function ProductsPage() {
  const { locale, t } = useLocale();
  const [activeDimension, setActiveDimension] = useState<string>('all');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryExpanded, setCategoryExpanded] = useState<Record<string, boolean>>({});
  const [customDimLabels, setCustomDimLabels] = useState<Record<string, string>>({});
  const [customDimLabelsI18n, setCustomDimLabelsI18n] = useState<Record<string, {zh?: string, en?: string, ar?: string}>>({});
  /** Custom icons from admin DB/API — overrides built-in defaults */
  const [customDimIcons, setCustomDimIcons] = useState<Record<string, {icon?: string}>>({});

  // Load custom dimension labels — API (DB) as PRIMARY, localStorage as cache/fallback
  useEffect(() => {
    const loadDimLabels = async () => {
      // ① Try loading from database via dedicated dimension-labels API
      try {
        const dimRes = await fetch('/api/dimension-labels');
        if (dimRes.ok) {
          const rawLabels = await dimRes.json();
          if (rawLabels && typeof rawLabels === 'object' && Object.keys(rawLabels).length > 0) {
            parseAndSetLabels(rawLabels);
            return; // DB data loaded successfully, skip localStorage
          }
        }
      } catch (e) {
        console.warn('[products] Failed to load dimension labels from API, using fallback:', e);
      }

      // ② Fallback: load from localStorage
      try {
        const saved = localStorage.getItem('admin_custom_dimensions');
        if (saved) { parseAndSetLabels(JSON.parse(saved)); }
      } catch (e) {
        console.error('Failed to load custom dimension labels:', e);
      }
    };

    const parseAndSetLabels = (dims: any) => {
      if (!dims || typeof dims !== 'object') return;
      const labels: Record<string, string> = {};
      const labelsI18n: Record<string, {zh?: string, en?: string, ar?: string}> = {};
      const icons: Record<string, {icon?: string}> = {};

      Object.entries(dims).forEach(([key, val]: [string, any]) => {
        if (val && typeof val === 'object') {
          labels[key] = val.labelZh || val.labelEn || val.label || key;
          labelsI18n[key] = {
            zh: val.labelZh || val.label || undefined,
            en: val.labelEn || val.label || undefined,
            ar: val.labelAr || val.label || undefined,
          };
          // Extract icon — this is what admin sets in the backend!
          if (val.icon) {
            icons[key] = { icon: String(val.icon) };
          }
        } else if (typeof val === 'string' && val) {
          labels[key] = val;
          labelsI18n[key] = { zh: val, en: val, ar: val };
        }
      });

      setCustomDimLabels(labels);
      setCustomDimLabelsI18n(labelsI18n);
      setCustomDimIcons(icons); // Store custom icons for resolveDimensionIcon()
    };

    loadDimLabels();
  }, []);

  // Helper to get dimension label
  const getDimensionLabel = (type: string): string => {
    // 1. Check built-in label maps first
    if (locale === 'zh' && labelMapZh[type]) return labelMapZh[type];
    if (locale === 'en' && labelMapEn[type]) return labelMapEn[type];
    if (locale === 'ar' && labelMapAr[type]) return labelMapAr[type];
    
    // 2. Custom dimension labels from localStorage (i18n) - CORRECT approach!
    const dimLabel = customDimLabelsI18n[type];
    if (dimLabel) {
      return dimLabel[locale] || dimLabel.en || dimLabel.zh || dimLabel.ar || type;
    }
    
    // 3. Fallback to old single-language customDimLabels
    if (customDimLabels[type]) return customDimLabels[type];
    
    // 4. Final fallback: return generic label for custom dimensions (DO NOT use category name!)
    // This prevents dimension tab from showing a category name like "机器狗"
    if (locale === 'zh') return '自定义维度';
    if (locale === 'en') return 'Custom Dimension';
    if (locale === 'ar') return 'بعد مخصص';
    return type;
  };

  // Load products and categories from API
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const baseUrl = getBaseUrl();
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${baseUrl}/api/products?status=active`),
          fetch(`${baseUrl}/api/categories`),
        ]);
        if (cancelled) return;
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.data || data || []);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data || []);
        }
      } catch (e) {
        console.error('Failed to load products/categories:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeDimension, activeCategories]);

  // Get category types for filter display - show all types (built-in + custom)
  const builtInTypeOrder = ['cabinet-type', 'managed-items', 'industry', 'custom-solution'];
  const categoryTypes = [...new Set(categories.map(c => c.type).filter(Boolean))] as string[];
  // Sort: built-in types first in order, then custom types alphabetically
  categoryTypes.sort((a, b) => {
    const aIdx = builtInTypeOrder.indexOf(a);
    const bIdx = builtInTypeOrder.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  // Toggle category selection (multi-select)
  const toggleCategory = (categoryId: string) => {
    setActiveCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Clear category selection when dimension changes
  const handleDimensionChange = (dimension: string) => {
    setActiveDimension(dimension);
    setActiveCategories([]);
  };

  // Filter products based on selection + search
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

    // Dimension filter (categories are objects with .type)
    if (activeDimension !== 'all') {
      result = result.filter((product) => {
        return product.categories?.some((cat: any) => cat.type === activeDimension);
      });
    }

    // Category filter (categories are objects with .id)
    if (activeCategories.length > 0) {
      result = result.filter((product) =>
        product.categories?.some((cat: any) => activeCategories.includes(cat.id))
      );
    }

    return result;
  }, [activeDimension, activeCategories, products, categories, searchQuery]);

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

  // Compute product count per dimension type
  const dimensionProductCount: Record<string, number> = {};
  categoryTypes.forEach(t => { dimensionProductCount[t] = 0; });
  products.forEach(p => {
    (p.categories || []).forEach(c => {
      if (c.type && dimensionProductCount[c.type] !== undefined) {
        dimensionProductCount[c.type] = (dimensionProductCount[c.type] || 0) + 1;
      }
    });
  });

  // Get categories for active dimension (only show categories that have products, or keep all but show count)
  const dimensionCategories =
    activeDimension === 'all' ? [] : categories.filter(c => c.type === activeDimension);

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

            {/* Dimension tabs skeleton */}
            <div className="flex flex-wrap gap-3 justify-center mb-5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-28 bg-blue-50 rounded-full animate-pulse" />
              ))}
            </div>

            {/* Category pills skeleton */}
            <div className="pt-3 border-t border-gray-200">
              <div className="h-4 w-24 bg-blue-50 rounded-full animate-pulse mb-2.5 mx-auto" />
              <div className="flex flex-wrap gap-[6px] justify-start">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-8 w-20 bg-blue-50 rounded-full animate-pulse" />
                ))}
              </div>
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
      <section className="sticky top-16 z-40" style={{
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
            
            {/* Row 1: Dimension Tabs - unified design system */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* "All" button */}
              <button
                onClick={() => handleDimensionChange('all')}
                className={`relative px-5 py-2.5 rounded-full text-[14px] font-bold transition-all duration-200 inline-flex items-center gap-1.5 water-ripple ${
                  activeDimension === 'all'
                    ? 'bg-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                    : 'glass-btn text-gray-700 hover:-translate-y-0.5'
                }`}
                style={activeDimension !== 'all' ? undefined : undefined}
              >
                <span>{t('products.filterAll') || 'All'}</span>
              </button>
              {categoryTypes.map((type) => {
                const count = dimensionProductCount[type] || 0;
                const isEmpty = count === 0;
                const dc = dimensionColors[type] || defaultDimColor;
                const IconComp = resolveDimensionIcon(type, customDimIcons); // Admin DB > built-in default
                const isActive = activeDimension === type && !isEmpty;

                // Render Lucide icon — white when active, blue when inactive
                const dimensionIcon = (
                  <IconComp
                    className="w-[14px] h-[14px] flex-shrink-0"
                    style={{ color: isActive ? '#ffffff' : '#2563eb' }}
                  />
                );

                const label = getDimensionLabel(type);

                return (
                  <button
                    key={type}
                    onClick={() => handleDimensionChange(type)}
                    className={`relative px-4 py-2.5 rounded-full text-[14px] font-bold transition-all duration-200 inline-flex items-center gap-1.5 water-ripple ${
                      isActive
                        ? `text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 ring-1 ring-white/30`
                        : `glass-btn text-gray-700 hover:-translate-y-0.5`
                    }`}
                    title={isEmpty ? (locale === 'zh' ? '该维度暂无产品' : 'No products in this dimension') : ''}
                  >
                    {/* Left accent bar for active state */}
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-white/60 rounded-r" />
                    )}
                    {/* Dimension icon — inline style color for reliability */}
                    {dimensionIcon && <span className="flex-shrink-0">{dimensionIcon}</span>}
                    {/* Label — inherit from button inline style */}
                    <span style={!isActive ? { color: 'inherit' } : undefined}>{label}</span>
                    {/* Count badge — explicit fallback color */}
                    <span
                      className={`text-[11px] font-normal tabular-nums ml-0.5`}
                      style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#6b7280' }}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Sub-category Pills */}
            {activeDimension !== 'all' && dimensionCategories.length > 0 && (() => {
              const allCats = dimensionCategories;
              // Inherit color from the active parent dimension
              const dc = dimensionColors[activeDimension] || defaultDimColor;
              const dimLabel = getDimensionLabel(activeDimension);

              return (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: '#d1d5db' }}>
                  {/* Label row — BOLD and visible */}
                  <div className="flex items-center justify-center gap-2 mb-2.5 px-1">
                    <div className={`h-[2px] w-5 rounded-full ${dc.barColor}`} />
                    <span className={`text-[12px] font-bold uppercase tracking-wider ${dc.textColor}`}>
                      {dimLabel}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: '#4b5563' }}>
                      — {locale === 'zh' ? '子分类' : locale === 'ar' ? 'تصنيفات فرعية' : 'sub-categories'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-[6px]">
                    {allCats.map((cat) => {
                      const count = categoryProductCount[cat.id] || 0;
                      const isSelected = activeCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`relative px-3.5 py-[7px] rounded-full text-[12px] font-medium transition-all duration-200 leading-none inline-flex items-center water-ripple ${
                            isSelected
                              ? `text-white shadow-md hover:shadow-lg`
                              : `glass-btn text-gray-600 hover:-translate-y-0.5`
                          }`}
                          style={isSelected ? { backgroundColor: '#2563eb' } : undefined}
                        >
                            {isSelected && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/90 mr-1.5" />
                          )}
                          <span>{(() => {
                            const n = (cat as any).name;
                            if (n && typeof n === 'object') {
                              if (locale === 'zh') return n.zh || n.en || n.ar || cat.slug || '';
                              if (locale === 'ar') return n.ar || n.en || n.zh || cat.slug || '';
                              return n.en || n.zh || n.ar || cat.slug || '';
                            }
                            return String(n || cat.slug || '');
                          })()}</span>
                          {/* Count — always clearly visible */}
                          <span className={`ml-1.5 text-[11px] tabular-nums ${isSelected ? 'text-white/80' : ''}`}
                            style={!isSelected ? { color: '#4b5563' } : undefined}
                          >
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Results count */}
          {(searchQuery || activeCategories.length > 0 || activeDimension !== 'all') && (
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
                        <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
            <p className="text-2xl" style={{ color: '#4b5563' }}>
              {t('products.noProducts') || 'No products found.'}
            </p>
            {(searchQuery || activeDimension !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); handleDimensionChange('all'); }}
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
                const detailHref = `/${locale}/products/${product.slug}`;
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
          transform: translate(-50%, -50%) scale(0);
          transition: none;
        }

        /* 主波纹 — 蓝色填充圆 */
        .water-ripple::before {
          width: 20px; height: 20px;
          left: var(--rx, 50%);
          top: var(--ry, 50%);
          background: radial-gradient(circle,
            rgba(59,130,246,0.25) 0%,
            rgba(96,165,250,0.12) 40%,
            transparent 70%
          );
          z-index: 2;
        }

        /* 次波纹 — 环形波纹圈 */
        .water-ripple::after {
          width: 10px; height: 10px;
          left: var(--rx, 50%);
          top: var(--ry, 50%);
          border: 1.5px solid rgba(147,197,253,0.35);
          background: transparent;
          box-shadow: 0 0 12px rgba(59,130,246,0.15);
          z-index: 2;
        }

        /* 第三波纹 — 更大的外围涟漪 */
        .ripple-wave3 {
          position: absolute;
          width: 8px; height: 8px;
          border-radius: 50%;
          border: 1px solid rgba(147,197,253,0.2);
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
          z-index: 2;
        }

        /* hover 时触发三层波纹扩散动画 */
        @keyframes ripple-expand-1 {
          0%   { width: 20px; height: 20px; opacity: 1; }
          100% { width: 450px; height: 450px; opacity: 0; }
        }
        @keyframes ripple-expand-2 {
          0%   { width: 10px; height: 10px; opacity: 0.9; }
          100% { width: 380px; height: 380px; opacity: 0; }
        }
        @keyframes ripple-expand-3 {
          0%   { width: 8px; height: 8px; opacity: 0.6; }
          100% { width: 500px; height: 500px; opacity: 0; }
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
