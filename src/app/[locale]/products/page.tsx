'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Package, Layers, Box, Building2, Settings, Wrench, Cpu, Shield, Lock, Star, Heart, Truck, Factory, Zap, Clock, Globe, Database, FileText, Image, ZoomIn, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { Product, Category } from '@/lib/api';
import { getBaseUrl } from '@/data/unified-data';

  // Icon mapping for dimensions - matches Category.type values in DB
  // Note: custom dimension icons are loaded from localStorage (set by admin)
  const dimensionIcons: Record<string, any> = {
    'cabinet-type': Layers,
    'managed-items': Box,
    'industry': Building2,
    'custom-solution': Settings,
  };

  // Color mapping for each dimension type - harmonious gradient scheme
  const dimensionColors: Record<string, { 
    icon: string; 
    bg: string; 
    border: string; 
    activeBg: string; 
    shadowColor: string;
    activeGradient: string;
    inactiveGradient: string;
    lightBg: string;
    textColor: string;
    barColor: string;
  }> = {
    'cabinet-type':   { 
      icon: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      activeBg: 'bg-blue-600', 
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      activeGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      inactiveGradient: 'bg-gradient-to-r from-gray-50 to-white',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      barColor: 'bg-blue-500'
    },
    'managed-items':  { 
      icon: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200', 
      activeBg: 'bg-emerald-600', 
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      activeGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      inactiveGradient: 'bg-gradient-to-r from-gray-50 to-white',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      barColor: 'bg-emerald-500'
    },
    'industry':       { 
      icon: 'text-violet-600', 
      bg: 'bg-violet-50', 
      border: 'border-violet-200', 
      activeBg: 'bg-violet-600', 
      shadowColor: 'rgba(139, 92, 246, 0.3)',
      activeGradient: 'bg-gradient-to-r from-violet-500 to-purple-600',
      inactiveGradient: 'bg-gradient-to-r from-gray-50 to-white',
      lightBg: 'bg-violet-50',
      textColor: 'text-violet-700',
      barColor: 'bg-violet-500'
    },
    'custom-solution': { 
      icon: 'text-amber-600', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200', 
      activeBg: 'bg-amber-600', 
      shadowColor: 'rgba(245, 158, 11, 0.3)',
      activeGradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
      inactiveGradient: 'bg-gradient-to-r from-gray-50 to-white',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      barColor: 'bg-amber-500'
    },
  };
  // Default color for unknown/custom types
  const defaultDimColor = { 
    icon: 'text-cyan-600', 
    bg: 'bg-cyan-50', 
    border: 'border-cyan-200', 
    activeBg: 'bg-cyan-600', 
    shadowColor: 'rgba(6, 182, 212, 0.3)',
    activeGradient: 'bg-gradient-to-r from-cyan-500 to-sky-500',
    inactiveGradient: 'bg-gradient-to-r from-gray-50 to-white',
    lightBg: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    barColor: 'bg-cyan-500'
  };

  // Helper to check if a string is an emoji (not a Lucide icon name)
  const isEmoji = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    // Emojis are typically 1-4 characters
    if (str.length > 4) return false;
    // Lucide icons are CamelCase like "Settings", "Package", etc.
    const lucideNames = ['Package','Layers','Box','Building2','Settings','Wrench','Cpu','Shield','Lock','Star','Heart','Truck','Factory','Zap','Clock','Globe','Database','FileText','Image'];
    if (lucideNames.includes(str)) return false;
    // If it contains non-ASCII characters, it's likely an emoji
    return /[^\u0000-\u007F]/.test(str);
  };

  // Helper to get icon for a dimension type (including custom types)
  // Returns either a React component (Lucide icon) or a string (emoji)
  const getDimensionIcon = (type: string): any => {
    // 1. Check hardcoded built-in icons first
    const builtInIcon = dimensionIcons[type];
    if (builtInIcon) return builtInIcon;
    
    // 2. Check custom dimension icon from localStorage (set by admin in categories page)
    try {
      const saved = localStorage.getItem('admin_custom_dimensions');
      if (saved) {
        const dims = JSON.parse(saved);
        if (dims[type] && dims[type].icon) {
          const iconVal = dims[type].icon;
          
          // If it's a Lucide icon name (not emoji), look it up
          if (typeof iconVal === 'string' && !isEmoji(iconVal)) {
            const lucideIcons: Record<string, any> = {
              Package, Layers, Box, Building2, Settings, Wrench, Cpu, Shield, Lock, Star,
              Heart, Truck, Factory, Zap, Clock, Globe, Database, FileText, Image
            };
            if (lucideIcons[iconVal]) {
              return lucideIcons[iconVal];
            }
          }
          
          // If it's an emoji (or unknown string), return as-is
          if (iconVal) return iconVal;
        }
      }
    } catch (e) {
      console.error('Failed to load custom dimension icon:', e);
    }
    
    // 3. Default to Settings icon for custom/unknown types
    return Settings;
  };

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

      Object.entries(dims).forEach(([key, val]: [string, any]) => {
        if (val && typeof val === 'object') {
          labels[key] = val.labelZh || val.labelEn || val.label || key;
          labelsI18n[key] = {
            zh: val.labelZh || val.label || undefined,
            en: val.labelEn || val.label || undefined,
            ar: val.labelAr || val.label || undefined,
          };
        } else if (typeof val === 'string' && val) {
          labels[key] = val;
          labelsI18n[key] = { zh: val, en: val, ar: val };
        }
      });

      setCustomDimLabels(labels);
      setCustomDimLabelsI18n(labelsI18n);
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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--tc-bg, #f9fafb)' }}>
        {/* Header skeleton */}
        <section className="text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden theme-hero-bg">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="h-12 w-64 bg-white/20 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-80 bg-white/10 rounded-lg mx-auto animate-pulse" />
          </div>
        </section>

        {/* Filter skeleton */}
        <section className="bg-[var(--card-bg)] border-b border-[var(--border-color)] sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Search bar skeleton */}
            <div className="relative max-w-md mx-auto mb-5">
              <div className="w-full h-11 bg-[var(--section-alt-bg, #f9fafb)] rounded-xl animate-pulse" />
            </div>

            {/* Dimension tabs skeleton */}
            <div className="flex flex-wrap gap-3 justify-center mb-5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-28 bg-[var(--section-alt-bg, #f9fafb)] rounded-full animate-pulse" />
              ))}
            </div>

            {/* Category pills skeleton */}
            <div className="pt-3 border-t" style={{ borderColor: 'color-mix(in srgb, var(--border-color, #e5e7eb) 50%, transparent)' }}>
              <div className="h-4 w-24 bg-[var(--section-alt-bg, #f9fafb)] rounded-full animate-pulse mb-2.5 mx-auto" />
              <div className="flex flex-wrap gap-[6px] justify-start">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-8 w-20 bg-[var(--section-alt-bg, #f9fafb)] rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Product grid skeleton */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[var(--card-bg)] rounded-2xl shadow-md overflow-hidden">
                <div className="h-68 bg-[var(--section-alt-bg, #f9fafb)] animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 bg-[var(--section-alt-bg, #f9fafb)] rounded animate-pulse" />
                  <div className="h-6 w-full bg-[var(--section-alt-bg, #f9fafb)] rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--tc-bg, #f9fafb)' }}>
      {/* Page Header */}
      <section className="text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden theme-hero-bg">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {t('products.title')}
          </h1>
          <p className="text-xl text-blue-100">
            {t('products.subtitle')}
          </p>
        </div>
      </section>

      {/* Primary Dimension Filter + Search */}
      <section className="bg-[var(--card-bg)] border-b border-[var(--border-color)] sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto mb-5">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted, #9ca3af)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'zh' ? '搜索产品名称、SKU...' : locale === 'ar' ? 'بحث عن المنتجات...' : 'Search products by name, SKU...'}
              className="w-full pl-11 pr-10 py-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all text-[var(--text-primary)]"
              style={{ backgroundColor: 'var(--section-alt-bg, #f9fafb)', borderColor: 'var(--border-color, #e5e7eb)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted, #9ca3af)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary, #111827)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted, #9ca3af)'; }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Filter Panel - Themed Card Container */}
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-lg px-6 py-5 border border-[var(--border-color)] overflow-visible">
            {/* Subtle accent bar - shows under active dimension tab instead of top line */}
            <div className="h-1" />
            
            {/* Row1: Dimension Tabs - unified design system */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* "All" button - light neutral style matching sibling pills */}
              <button
                onClick={() => handleDimensionChange('all')}
                className={`relative px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
                  activeDimension === 'all'
                    /* Active: subtle primary color — visible in ALL themes */
                    ? 'bg-[var(--primary-color)] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    /* Inactive: light pill same as other inactive tabs */
                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-color)]/30 hover:shadow-sm hover:-translate-y-0.5'
                }`}
              >
                <span>{t('products.filterAll') || 'All'}</span>
              </button>
              {categoryTypes.map((type) => {
                const count = dimensionProductCount[type] || 0;
                const isEmpty = count === 0;
                const dc = dimensionColors[type] || defaultDimColor;
                let dimensionIcon: React.ReactNode = null;
                const iconOrEmoji = getDimensionIcon(type);
                const isActive = activeDimension === type && !isEmpty;

                // Handle both React components (Lucide icons) and emoji strings
                if (iconOrEmoji && typeof iconOrEmoji === 'string') {
                  dimensionIcon = <span className="text-[14px]">{iconOrEmoji}</span>;
                } else if (iconOrEmoji) {
                  const IconComp = iconOrEmoji;
                  dimensionIcon = <IconComp className={`w-[14px] h-[14px] ${isActive ? 'text-white' : dc.icon}`} />;
                }

                const label = getDimensionLabel(type);

                return (
                  <button
                    key={type}
                    onClick={() => handleDimensionChange(type)}
                    className={`relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-all duration-200 inline-flex items-center gap-1.5 ${
                      isActive
                        /* Active: colored gradient — primary visual state */
                        ? `${dc.activeGradient} text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 ring-1 ring-white/25`
                        /* Inactive: unified light-pill style using CSS vars */
                        : `bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-color)]/30 hover:shadow-sm hover:-translate-y-0.5`
                    }`}
                    title={isEmpty ? (locale === 'zh' ? '该维度暂无产品' : 'No products in this dimension') : ''}
                  >
                    {/* Left accent bar for active state */}
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-white/60 rounded-r" />
                    )}
                    {/* Dimension icon — always show in its brand color */}
                    {dimensionIcon && <span className="flex-shrink-0">{dimensionIcon}</span>}
                    <span>{label}</span>
                    {/* Count badge — subtle, always visible */}
                    <span className={`text-[11px] font-normal tabular-nums ml-0.5 ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
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
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {/* Label row - shows which dimension is active */}
                  <div className="flex items-center justify-center gap-2 mb-2.5 px-1">
                    <div className={`h-[2px] w-5 rounded-full ${dc.barColor}`} />
                    <span className={`text-[12px] font-medium uppercase tracking-wider ${dc.textColor} opacity-60`}>
                      {dimLabel}
                    </span>
                    <span className="text-[11px] text-gray-400 font-normal">
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
                          className={`relative px-3 py-1.5 rounded-full text-[13px] transition-all duration-200 leading-none inline-flex items-center ${
                            isSelected
                              /* Selected: soft tint of parent dimension color */
                              ? `${dc.activeBg} text-white shadow-sm font-medium hover:shadow-md`
                              /* Unselected: clean light pill using CSS vars — consistent for ALL categories */
                              : `bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-color)]/30 hover:shadow-sm`
                          }`}
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
                          {/* Count — always visible, no dimming */}
                          <span className={`ml-1.5 text-[11px] tabular-nums ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
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
              <span className="inline-flex items-center px-3.5 py-1 bg-[var(--section-alt-bg, #f9fafb)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-full text-[12px] font-medium">
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
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-2xl text-gray-400">
              {t('products.noProducts') || 'No products found.'}
            </p>
            {(searchQuery || activeDimension !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); handleDimensionChange('all'); }}
                className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
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
                    className="group bg-[var(--card-bg)] rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-[var(--border-color)] hover:border-[var(--primary-color)]/30 block"
                  >
                    {/* Product Image */}
                    {product.images && product.images[0] ? (
                      <div className="relative h-56 overflow-hidden bg-[var(--section-alt-bg, #f9fafb)]">
                        <img src={product.images[0]} alt={name}
                          className="w-full h-56 object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                          loading={isPriority ? 'eager' : 'lazy'}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 bg-[var(--card-bg)]/90 backdrop-blur-sm text-[var(--text-primary)] px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-lg">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {locale === 'zh' ? '查看详情' : 'View Details'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 bg-gradient-to-br from-[var(--section-alt-bg, #f9fafb)] to-[var(--border-color)] flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto" />
                        <p className="text-xs text-gray-400 absolute bottom-4">{locale === 'zh' ? '暂无图片' : 'No Image'}</p>
                      </div>
                    )}
                    {/* Product Info */}
                    <div className="p-5 flex flex-col h-full">
                      {product.categories?.[0] && (
                        <span className="inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full mb-2 w-fit">
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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-blue-600 leading-snug">{name}</h3>
                      <p className="text-xs text-blue-500 dark:text-blue-400 font-mono mb-2">{product.sku}</p>
                      {product.hidePrice ? (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{locale === 'zh' ? '联系我们询价' : 'Contact for Pricing'}</p>
                      ) : product.price > 0 ? (
                        <p className="text-base font-bold text-red-500 dark:text-red-400 mb-2">${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}</p>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 italic">{locale === 'zh' ? '价格面议' : 'Contact for Price'}</p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-1"
                        dangerouslySetInnerHTML={{
                          __html: (locale === 'zh' ? product.description?.zh : locale === 'ar' ? product.description?.ar : product.description?.en) || ''
                        }}
                      />
                      <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm mt-auto">
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
                  className="flex items-center space-x-1 px-4 py-3 rounded-lg border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--section-alt-bg, #f9fafb)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
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
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-4 py-3 rounded-lg border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--section-alt-bg, #f9fafb)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
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
    </div>
  );
}
