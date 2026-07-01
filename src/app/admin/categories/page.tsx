'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft, GripVertical, X, Check, Search, RefreshCw, AlertCircle, Loader2,
  FolderOpen, Package, Box, Wrench, Settings, Cpu, Shield, Lock, Star, Heart, Truck, Building2, Factory, Layers, Zap, Clock, Globe, Database, FileText, Image } from 'lucide-react';
import { getAllCategoryTypes, getCategoriesByType, dimensionLabels, default as allDefaultCategories } from '@/data/categories';
import { fetchUnifiedCategories, fetchCategoriesGrouped, adminApi, type LocalCategory } from '@/data/unified-data';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

// Icon mapping: name → Lucide component
const ICON_MAP: Record<string, any> = {
  FolderOpen, Package, Box, Wrench, Settings, Cpu, Shield, Lock, Star, Heart,
  Truck: Truck, Building2, Factory, Layers, Zap, Clock, Globe, Database, FileText, Image,
};
const getIconComponent = (name: string) => ICON_MAP[name] || null;

type CategoryType = 'cabinet-type' | 'managed-items' | 'industry' | 'custom-solution' | string;

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<CategoryType>('cabinet-type');
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [customDimensions, setCustomDimensions] = useState<{key: string; label: string; labelZh: string; labelEn: string; labelAr: string; icon: string}[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDimensionModal, setShowDimensionModal] = useState(false);
  const [editingDimension, setEditingDimension] = useState<{key: string} | null>(null);
  const [editingCategory, setEditingCategory] = useState<LocalCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    nameZh: '',
    nameEn: '',
    nameAr: '',
    slug: '',
    icon: '',
    descriptionZh: '',
    descriptionEn: '',
    descriptionAr: '',
    type: 'cabinet-type' as CategoryType,
    status: 'active' as 'active' | 'inactive',
  });
  const [dimensionForm, setDimensionForm] = useState({ key: '', labelZh: '', labelEn: '', labelAr: '', icon: '' });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories from API
      const categoriesData = await fetchUnifiedCategories();
      setCategories(categoriesData);

      // Extract custom dimensions from category types
      const builtIn = new Set(['cabinet-type', 'managed-items', 'industry', 'custom-solution']);
      const dims = [...new Set(categoriesData.map((c: any) => c.type))]
        .filter((t: string) => !builtIn.has(t))
        .map((t: string) => ({ key: t, label: t }));

      // Load custom dimension labels — API (DB) as PRIMARY source, localStorage as cache
      if (typeof window !== 'undefined') {
        let dbDimLabels: Record<string, {labelZh: string; labelEn: string; labelAr: string; icon: string}> | null = null;

        // ① Try loading from database via dedicated dimension-labels API
        try {
          const dimRes = await fetch('/api/dimension-labels');
          if (dimRes.ok) {
            const rawLabels = await dimRes.json();
            if (rawLabels && typeof rawLabels === 'object' && Object.keys(rawLabels).length > 0) {
              dbDimLabels = rawLabels as Record<string, {labelZh: string; labelEn: string; labelAr: string; icon: string}>;
              console.log('[categories] Dimension labels loaded from DB:', Object.keys(dbDimLabels));
            }
          }
        } catch (e) {
          console.warn('[categories] Failed to load dimension labels from API, will use fallback:', e);
        }

        // ② Load from localStorage as cache/fallback
        let localLabels: Record<string, {labelZh: string; labelEn: string; labelAr: string; icon: string}> | null = null;
        const savedDims = localStorage.getItem('admin_custom_dimensions');
        if (savedDims) { localLabels = JSON.parse(savedDims); }

        // ③ Merge: DB is primary, localStorage fills gaps, key-only dims get sensible defaults
        const mergedLabels: Record<string, {labelZh: string; labelEn: string; labelAr: string; icon: string}> = {};
        
        // First apply DB labels
        if (dbDimLabels) { Object.assign(mergedLabels, dbDimLabels); }
        // Then overlay with localStorage (more recent manual edits)
        if (localLabels) { 
          Object.keys(localLabels).forEach(k => {
            if (!mergedLabels[k] || !mergedLabels[k].labelZh || mergedLabels[k].labelZh === k) {
              // Only use localStorage when DB has missing or fallback values
              mergedLabels[k] = localLabels[k];
            }
          });
        }

        setCustomDimensions(dims.map(d => ({
          key: d.key,
          label: mergedLabels[d.key]?.labelZh || d.label,
          labelZh: mergedLabels[d.key]?.labelZh || d.label,
          labelEn: mergedLabels[d.key]?.labelEn || d.label,
          labelAr: mergedLabels[d.key]?.labelAr || d.label,
          icon: mergedLabels[d.key]?.icon || '',
        })));

        // ④ Sync back to localStorage so it's available for frontend products page
        if (dbDimLabels && JSON.stringify(dbDimLabels) !== savedDims) {
          localStorage.setItem('admin_custom_dimensions', JSON.stringify(mergedLabels));
        }
      } else {
        // SSR fallback (shouldn't normally happen)
        setCustomDimensions(dims.map(d => ({ key: d.key, label: d.label, labelZh: d.label, labelEn: d.label, labelAr: d.label, icon: '' })));
      }

      // Load product counts from API (not localStorage)
      try {
        const productsRes = await fetch('/api/products?status=all');
        const productsJson = await productsRes.json();
        const products = productsJson.data || productsJson || [];
        const counts: Record<string, number> = {};
        products.forEach((p: any) => {
          // p.categories from API is [{id, slug, name}] not string[]
          const catIds = Array.isArray(p.categories)
            ? p.categories.map((c: any) => c.id).filter(Boolean)
            : [];
          catIds.forEach((catId: string) => {
            counts[catId] = (counts[catId] || 0) + 1;
          });
        });
        setProductCounts(counts);
      } catch (e) {
        console.warn('[categories] Failed to load product counts from API, trying localStorage:', e);
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const savedProducts = localStorage.getItem('admin_products');
          if (savedProducts) {
            const products = JSON.parse(savedProducts);
            const counts: Record<string, number> = {};
            products.forEach((p: any) => {
              if (p.categories && Array.isArray(p.categories)) {
                p.categories.forEach((catId: string) => {
                  counts[catId] = (counts[catId] || 0) + 1;
                });
              }
            });
            setProductCounts(counts);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // Save functions - now using API
  const saveCategories = async (newCategories: LocalCategory[]) => {
    setCategories(newCategories);
    // Note: Individual category changes are now handled via API
  };

  // Dimension CRUD
  const handleDimensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dimensionForm.key.trim()) return;

    try {
      setSaving(true);
      const key = dimensionForm.key.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const newDim = {
        key,
        label: dimensionForm.labelZh || key,
        labelZh: dimensionForm.labelZh || dimensionForm.labelEn || key,
        labelEn: dimensionForm.labelEn || dimensionForm.labelZh || key,
        labelAr: dimensionForm.labelAr || dimensionForm.labelZh || key,
        icon: dimensionForm.icon || '',
      };

      // Save custom dimension labels to localStorage (cache)
      const dimLabels: Record<string, {labelZh: string; labelEn: string; labelAr: string; icon: string}> = {};
      (editingDimension ? customDimensions.map(d => d.key === editingDimension.key ? key : d.key) : [...customDimensions.map(d => d.key), key]).forEach(k => {
        const found = k === key ? newDim : customDimensions.find(d => d.key === k);
        if (found) dimLabels[k] = { labelZh: found.labelZh, labelEn: found.labelEn, labelAr: found.labelAr, icon: found.icon || '' };
      });
      localStorage.setItem('admin_custom_dimensions', JSON.stringify(dimLabels));

      // Persist to database (source of truth — survives cache clear)
      // ① Primary: custom_dimensions table (v129)
      // ② Backup: site_settings (backwards compatibility)
      try {
        await fetch('/api/admin/custom-dimensions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dimensions: dimLabels }),
        });
        console.log('[categories] Dimension labels persisted to custom_dimensions table');
      } catch (e) {
        console.warn('[categories] Failed to persist to custom_dimensions table:', e);
        // Fallback to legacy API if new one fails
        try {
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'custom_dimension_labels', value: JSON.stringify(dimLabels) }),
          });
        } catch (e2) {
          console.warn('[categories] Fallback to site_settings also failed:', e2);
        }
      }

      // Update state
      if (editingDimension) {
        setCustomDimensions(prev => prev.map(d => d.key === editingDimension.key ? { ...newDim, key } : d));
        if (key !== editingDimension.key) {
          setCategories(prev => prev.map(c => c.type === editingDimension.key ? {...c, type: key} : c));
          setActiveTab(key);
        }
      } else {
        setCustomDimensions(prev => {
          if (prev.some(d => d.key === key)) return prev;
          return [...prev, { ...newDim, key }];
        });
      }

      setShowDimensionModal(false);
      setEditingDimension(null);
      setDimensionForm({ key: '', labelZh: '', labelEn: '', labelAr: '', icon: '' });
      if (!editingDimension) setActiveTab(key);
    } catch (err: any) {
      setError(err.message || '保存维度失败');
    } finally {
      setSaving(false);
    }
  };

  // Edit dimension handler
  const handleEditDimension = (dim: typeof customDimensions[0]) => {
    setEditingDimension({ key: dim.key });
    setDimensionForm({
      key: dim.key,
      labelZh: dim.labelZh,
      labelEn: dim.labelEn,
      labelAr: dim.labelAr,
      icon: (dim as any).icon || '',
    });
    setShowDimensionModal(true);
  };

  // Delete dimension handler
  const handleDeleteDimension = async (key: string) => {
    if (!confirm(`确定要删除维度 "${key}" 吗？该维度下的分类将变为未归类。`)) return;

    // Update state
    const newDims = customDimensions.filter(d => d.key !== key);
    setCustomDimensions(newDims);
    setCategories(prev => prev.map(c => c.type === key ? {...c, type: 'custom-solution'} : c));
    if (activeTab === key) setActiveTab('cabinet-type');

    // Remove from localStorage
    const savedDims = localStorage.getItem('admin_custom_dimensions');
    if (savedDims) {
      const dimLabels = JSON.parse(savedDims);
      delete dimLabels[key];
      localStorage.setItem('admin_custom_dimensions', JSON.stringify(dimLabels));

      // Sync removal to database (primary + backup)
      try {
        // Primary: custom_dimensions table
        await fetch(`/api/admin/custom-dimensions?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
        console.log(`[categories] Dimension "${key}" removed from custom_dimensions table`);
      } catch (e) {
        // Fallback to legacy API
        try {
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'custom_dimension_labels', value: JSON.stringify(dimLabels) }),
          });
        } catch (e2) { console.warn('[categories] Failed to sync dimension delete:', e2); }
      }
    }
  };

  // Category CRUD
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const categoryData: any = {
        name: {
          zh: categoryForm.nameZh,
          en: categoryForm.nameEn,
          ar: categoryForm.nameAr || categoryForm.nameEn,
        },
        slug: categoryForm.slug || categoryForm.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        icon: categoryForm.icon,
        description: {
          zh: categoryForm.descriptionZh,
          en: categoryForm.descriptionEn,
          ar: categoryForm.descriptionAr || categoryForm.descriptionEn,
        },
        parentId: null,
        order: editingCategory ? editingCategory.order : categories.length,
        status: categoryForm.status,
        type: categoryForm.type,
      };

      if (editingCategory) {
        // Update via API
        const updated = await adminApi.updateCategory(editingCategory.id, categoryData);
        setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
      } else {
        // Create via API
        const created = await adminApi.createCategory(categoryData);
        setCategories([...categories, created]);
      }

      setShowModal(false);
      setEditingCategory(null);
      setCategoryForm({
        nameZh: '',
        nameEn: '',
        nameAr: '',
        slug: '',
        icon: '',
        descriptionZh: '',
        descriptionEn: '',
        descriptionAr: '',
        type: activeTab,
        status: 'active',
      });
    } catch (err: any) {
      setError(err.message || '保存分类失败');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (category: LocalCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      nameZh: category.nameZh,
      nameEn: category.nameEn,
      nameAr: category.nameAr || '',
      slug: category.slug,
      icon: category.icon || '',
      descriptionZh: category.description?.zh || '',
      descriptionEn: category.description?.en || '',
      descriptionAr: category.description?.ar || '',
      type: category.type as CategoryType,
      status: category.status as 'active' | 'inactive',
    });
    setShowModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (typeof window !== 'undefined' && confirm('确定要删除这个分类吗？相关的产品和标签也会受影响。')) {
      try {
        setSaving(true);
        await adminApi.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (err: any) {
        setError(err.message || '删除分类失败');
      } finally {
        setSaving(false);
      }
    }
  };

  // Filter categories by active tab and search
  const filteredCategories = categories.filter(c => {
    const matchesTab = c.type === activeTab;
    const matchesSearch = !searchQuery ||
      c.nameZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Tab configuration — built-in + custom dimensions
  // Force icon mapping for known dimensions (fix Bug #4: robot dimension shows ❤️)
  const FORCED_DIMENSION_ICONS: Record<string, string> = {
    'testrobot': '⚙️',  // Force robot dimension to use gear icon
    'robot': '⚙️',
    'service': '⚙️',
    'solution': '⚙️',
  };
  const baseTabs: { key: CategoryType; label: string; icon: string }[] = [
    { key: 'cabinet-type', label: '柜型分类', icon: '🗄️' },
    { key: 'managed-items', label: '管理物料', icon: '📦' },
    { key: 'industry', label: '行业分类', icon: '🏭' },
    { key: 'custom-solution', label: '定制方案', icon: '⚙️' },
  ];
  const builtInLabels: Record<string, { key: string; label: string; labelZh: string; labelEn: string; labelAr: string; icon: string }> = {
    cabinet: { key: 'cabinet-type', label: '柜型分类', labelZh: '柜型分类', labelEn: 'Cabinet Type', labelAr: 'نوع الخزانة', icon: '🗄️' },
    item: { key: 'managed-items', label: '管理物料', labelZh: '管理物料', labelEn: 'Managed Items', labelAr: 'المواد المدارة', icon: '📦' },
    industry: { key: 'industry', label: '行业分类', labelZh: '行业分类', labelEn: 'Industry', labelAr: 'الصناعة', icon: '🏭' },
    custom: { key: 'custom-solution', label: '定制方案', labelZh: '定制方案', labelEn: 'Custom', labelAr: 'مخصص', icon: '⚙️' },
  };
  // Map custom dimensions with forced icon replacement
  const allTabs = [...baseTabs, ...customDimensions.map(d => {
    const forcedIcon = FORCED_DIMENSION_ICONS[d.key] || FORCED_DIMENSION_ICONS[d.key.toLowerCase()] || null;
    const icon = forcedIcon || (d as any).icon || '⚙️';
    // If the stored icon is an emoji like ❤️, replace with forced icon
    const finalIcon = (icon === '❤️' || icon === '💖' || icon === '💗') ? '⚙️' : icon;
    return { key: d.key as CategoryType, label: d.label, icon: finalIcon };
  })];

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 text-base">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回仪表盘
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">分类管理</h1>
          <p className="text-gray-600 mt-2 text-lg">按维度管理产品分类</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2.5 px-6 py-3 text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <Link
            href="/admin/tags"
            className="inline-flex items-center gap-2.5 px-6 py-3 text-base font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200 shadow-sm"
          >
            <span className="text-lg">🏷️</span>
            标签管理
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Main Card */}
          <div className="admin-card">
            {/* Tabs + Search + Add */}
            <div className="border-b border-gray-200">
              {/* Tab Navigation */}
              <div className="flex gap-2 px-6 pt-5 flex-wrap">
                {allTabs.map((tab) => {
                  const isCustom = !['cabinet-type','managed-items','industry','custom-solution'].includes(tab.key);
                  const customDim = isCustom ? customDimensions.find(d => d.key === tab.key) : null;
                  return (
                    <div key={tab.key} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-6 py-3.5 text-base font-medium transition-all rounded-t-xl ${
                          activeTab === tab.key
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-2.5 text-lg">{tab.icon}</span>
                        {tab.label}
                        <span className="ml-3 px-3 py-0.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                          {categories.filter(c => c.type === tab.key).length}
                        </span>
                      </button>
                      {/* Edit/Delete buttons */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditDimension(isCustom ? (customDim || { key: tab.key, label: tab.key, labelZh: tab.key, labelEn: tab.key, labelAr: tab.key, icon: '' }) : (builtInLabels[tab.key] || { key: tab.key, label: tab.label, labelZh: tab.label, labelEn: tab.label, labelAr: tab.label, icon: '' })); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑维度名称（三语言）"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isCustom && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteDimension(tab.key); }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除维度"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {/* New Dimension Button */}
                <button
                  onClick={() => { setEditingDimension(null); setDimensionForm({ key: '', labelZh: '', labelEn: '', labelAr: '', icon: '' }); setShowDimensionModal(true); }}
                  className="px-6 py-3.5 text-base font-medium transition-all rounded-t-xl text-blue-500 hover:text-blue-700 hover:bg-blue-50 border-2 border-dashed border-blue-300"
                  title="新建一级分类（新维度）"
                >
                  + 新建维度
                </button>
              </div>

              {/* Search and Add Button */}
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="relative w-80">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索分类..."
                    className="w-full pl-12 admin-form-input text-base"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (confirm('确定要重置为默认分类数据吗？当前自定义分类将丢失。')) {
                        localStorage.removeItem('admin_categories');
                        loadData();
                      }
                    }}
                    className="flex items-center space-x-2.5 px-5 py-3 text-base font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 shadow-sm"
                    title="重置为默认分类数据"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>重置默认</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({
                        nameZh: '',
                        nameEn: '',
                        nameAr: '',
                        slug: '',
                        icon: '',
                        descriptionZh: '',
                        descriptionEn: '',
                        descriptionAr: '',
                        type: activeTab,
                        status: 'active',
                      });
                      setShowModal(true);
                    }}
                    className="btn-primary flex items-center space-x-2.5 text-base py-3.5 px-6"
                  >
                    <Plus className="w-5 h-5" />
                    <span>添加分类</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Table */}
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">排序</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">图标</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">中文名</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">英文名</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">SLUG</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">状态</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">产品数</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((category, index) => (
                    <tr
                      key={category.id}
                      className="hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      {/* Order */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 font-medium">{index + 1}</span>
                      </td>
                      {/* Icon */}
                      <td className="px-6 py-4">
                        {category.icon ? (
                          (() => { const IconComp = getIconComponent(category.icon); return IconComp ? <IconComp className="w-6 h-6 text-gray-700" /> : <span className="text-2xl">{category.icon}</span>; })()
                        ) : (
                          <span className="text-gray-300 text-2xl">−</span>
                        )}
                      </td>
                      {/* Chinese Name */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-base">{category.nameZh}</div>
                      </td>
                      {/* English Name */}
                      <td className="px-6 py-4 text-base text-gray-600">{category.nameEn}</td>
                      {/* Slug */}
                      <td className="px-6 py-4 text-base text-gray-500 font-mono hidden lg:table-cell">{category.slug}</td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
                          category.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-50 text-gray-500 border border-gray-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            category.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}></span>
                          {category.status === 'active' ? '已启用' : '已禁用'}
                        </span>
                      </td>
                      {/* Product Count */}
                      <td className="px-6 py-4 text-base text-gray-600 font-medium">
                        {mounted ? (productCounts[category.id] || 0) : 0}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="admin-btn-action-edit"
                            title="编辑"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="admin-btn-action-delete"
                            title="删除"
                            disabled={saving}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCategories.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <FolderOpen className="w-20 h-20 mx-auto mb-4 text-gray-200" />
                  <p className="text-lg">暂无分类，点击"添加分类"按钮创建。</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCategory ? '编辑分类' : '添加分类'}
            </h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              {/* Dimension Type Selection (for new categories) */}
              {!editingCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所属维度 *</label>
                  <select
                    value={categoryForm.type}
                    onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as CategoryType })}
                    className="admin-form-input w-full"
                    required
                  >
                    {allTabs.map(tab => (
                      <option key={tab.key} value={tab.key}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类名称（中文）*</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.nameZh}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nameZh: e.target.value })}
                    className="admin-form-input w-full"
                    placeholder="请输入中文名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (English)*</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.nameEn}
                    onChange={(e) => {
                      const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                      setCategoryForm({ ...categoryForm, nameEn: e.target.value, slug });
                    }}
                    className="admin-form-input w-full"
                    placeholder="Please enter English name"
                  />
                </div>
              </div>

              {/* Arabic name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفئة (العربية)</label>
                <input
                  type="text"
                  value={categoryForm.nameAr}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                  className="admin-form-input w-full text-right"
                  placeholder="الرجاء إدخال اسم الفئة بالعربية"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug*</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="admin-form-input w-full font-mono text-sm"
                  placeholder="slug-url-friendly"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                <div className="space-y-2">
                  {/* Icon picker grid */}
                  <div className="grid grid-cols-10 gap-1.5 p-2 border border-gray-200 rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                    {['FolderOpen','Package','Box','Wrench','Settings','Cpu','Shield','Lock','Star','Heart','Truck','Building2','Factory','Layers','Zap','Clock','Globe','Database','FileText','Image'].map(iconName => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-xs transition-all ${
                          categoryForm.icon === iconName
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                        }`}
                        title={iconName}
                      >
                        {iconName.charAt(0)}
                      </button>
                    ))}
                  </div>
                  {/* Manual input fallback */}
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="admin-form-input w-full font-mono text-sm"
                    placeholder="或输入图标名称: FolderOpen, Package..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述（中文）</label>
                <textarea
                  rows={2}
                  value={categoryForm.descriptionZh}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descriptionZh: e.target.value })}
                  className="admin-form-input w-full resize-none"
                  placeholder="中文描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述（英文）</label>
                <textarea
                  rows={2}
                  value={categoryForm.descriptionEn}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descriptionEn: e.target.value })}
                  className="admin-form-input w-full resize-none"
                  placeholder="Description in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述（阿拉伯语）</label>
                <textarea
                  rows={2}
                  value={categoryForm.descriptionAr}
                  onChange={(e) => setCategoryForm({ ...categoryForm, descriptionAr: e.target.value })}
                  className="admin-form-input w-full resize-none"
                  placeholder="الوصف بالعربية"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={categoryForm.status}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value as 'active' | 'inactive' })}
                  className="admin-form-input w-full"
                >
                  <option value="active">已启用</option>
                  <option value="inactive">已禁用</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                  disabled={saving}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      保存中...
                    </>
                  ) : (
                    <>
                      {editingCategory ? '保存修改' : '创建分类'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dimension Creation/Edit Modal */}
      {showDimensionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingDimension ? '编辑一级分类（维度）' : '新建一级分类（维度）'}
            </h2>
            <form onSubmit={handleDimensionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">维度标识 (英文 key)*</label>
                <input
                  type="text" required
                  value={dimensionForm.key}
                  onChange={(e) => setDimensionForm({ ...dimensionForm, key: e.target.value })}
                  className="admin-form-input w-full font-mono text-sm"
                  placeholder="如: service, solution, robot"
                  disabled={!!editingDimension}
                />
                <p className="text-xs text-gray-400 mt-1">{editingDimension ? '创建后不可修改 key' : '仅支持英文小写字母、数字和横线'}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中文名称 *</label>
                  <input
                    type="text" required
                    value={dimensionForm.labelZh}
                    onChange={(e) => setDimensionForm({ ...dimensionForm, labelZh: e.target.value })}
                    className="admin-form-input w-full"
                    placeholder="如: 机器人"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English Name *</label>
                  <input
                    type="text" required
                    value={dimensionForm.labelEn}
                    onChange={(e) => setDimensionForm({ ...dimensionForm, labelEn: e.target.value })}
                    className="admin-form-input w-full"
                    placeholder="Robotics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم (العربية)</label>
                  <input
                    type="text"
                    value={dimensionForm.labelAr}
                    onChange={(e) => setDimensionForm({ ...dimensionForm, labelAr: e.target.value })}
                    className="admin-form-input w-full text-right"
                    placeholder="الروبوتات"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Icon picker for dimension */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">维度图标</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-10 gap-1.5 p-2 border border-gray-200 rounded-lg bg-gray-50 max-h-28 overflow-y-auto">
                    {['📁','📦','🔧','⚙️','💻','🛡️','🔒','⭐','🚚','🏢','🏭','📚','⚡','🕐','🌐','🗄️','📄','🖼️','🤖','🧭','🔬','💡','🚀','⚙️'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setDimensionForm({ ...dimensionForm, icon: emoji })}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-base transition-all ${
                          dimensionForm.icon === emoji
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={dimensionForm.icon}
                    onChange={(e) => setDimensionForm({ ...dimensionForm, icon: e.target.value })}
                    className="admin-form-input w-full font-mono text-sm"
                    placeholder="或输入 emoji/图标名，如 🤖"
                  />
                </div>
              </div>

              {/* Show delete button for editing */}
              {editingDimension && (
                <div className="pt-2 border-t border-red-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteDimension(editingDimension.key);
                      setShowDimensionModal(false);
                      setEditingDimension(null);
                    }}
                    className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> 删除此维度
                  </button>
                  <p className="text-xs text-gray-400 mt-1 text-center">删除后该维度下的所有分类将移至"定制方案"</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => { setShowDimensionModal(false); setEditingDimension(null); }} className="btn-secondary flex-1">取消</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      保存中...
                    </>
                  ) : (
                    <>
                      {editingDimension ? '保存修改' : '创建维度'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
