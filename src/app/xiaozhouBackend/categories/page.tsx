'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft, GripVertical, X, Check, Search, RefreshCw, AlertCircle, Loader2,
  FolderOpen, Package, Box, Wrench, Settings, Cpu, Shield, Lock, Star, Heart, Truck, Building2, Factory, Layers, Zap, Clock, Globe, Database, FileText, Image } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedCategories, adminApi, type LocalCategory } from '@/data/unified-data';

// Resolve a category's trilingual label from the normalized fields returned by
// fetchUnifiedCategories (nameZh / nameEn / nameAr). Falls back gracefully so the
// admin page and the public page always show identical names sourced from the DB.
function resolveCategoryLabel(cat: any, locale: string): string {
  if (!cat) return '';
  // Fallback: the object may already carry a normalized `label` field (e.g. the
  // customDimensions mapping produced in loadData), which has no name/nameZh.
  // Use it directly so derived tabs show the correct localized name.
  if (cat.label && typeof cat.label === 'string' && cat.label.trim()) return cat.label;
  const zh = cat.nameZh || (cat.name && cat.name.zh) || '';
  const en = cat.nameEn || (cat.name && cat.name.en) || '';
  const ar = cat.nameAr || (cat.name && cat.name.ar) || '';
  if (locale === 'zh') return zh || en || ar || '';
  if (locale === 'ar') return ar || en || zh || '';
  return en || zh || ar || '';
}

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

// Icon mapping: name → Lucide component
const ICON_MAP: Record<string, any> = {
  FolderOpen, Package, Box, Wrench, Settings, Cpu, Shield, Lock, Star, Heart,
  Truck: Truck, Building2, Factory, Layers, Zap, Clock, Globe, Database, FileText, Image,
};
const getIconComponent = (name: string) => ICON_MAP[name] || null;

// NOTE: The L2 "所属维度" (parent dimension) selector is now DB-derived. Its options
// come from `customDimensions` (built in loadData from the real L1 parent categories),
// so there is no longer any hardcoded Chinese dimension label array. The selected
// dimension is stored as `categoryForm.parentId` (the L1 parent category id) — the
// same id used as the tab key and as `activeTab`.

type CategoryType = 'cabinet-type' | 'managed-items' | 'industry' | 'custom-solution' | string;

export default function AdminCategoriesPage() {
  const { locale: adminLocale } = useLocale();
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
    parentId: null as string | null,
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

      // Derive the dimension tabs from the REAL hierarchy: L1 parent categories
      // (parentId === null). The tab key is the L1 category id and the label is read
      // from its trilingual `name` field (normalized into nameZh/nameEn/nameAr by
      // fetchUnifiedCategories). Built-in dimension names are NO LONGER hardcoded — the
      // admin and public pages now show identical, DB-backed names. This also removes the
      // old "product" leak, because the `type='product'` rows ARE the L1 parents (tabs),
      // not a stray custom dimension.
      const l1List = categoriesData.filter((c: any) => c.parentId == null || c.parent != null);
      setCustomDimensions(l1List.map((l1: any) => ({
        key: l1.id,
        label: resolveCategoryLabel(l1, adminLocale),
        labelZh: l1.nameZh || (l1.name && l1.name.zh) || '',
        labelEn: l1.nameEn || (l1.name && l1.name.en) || '',
        labelAr: l1.nameAr || (l1.name && l1.name.ar) || '',
        icon: l1.icon || '',
      })));


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
        // API failed — leave product counts empty (no localStorage fallback by design).
        console.warn('[categories] Failed to load product counts from API:', e);
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

  // Dimension (L1 parent category) CRUD.
  // The "维度" concept is now a real L1 Category row: creating/editing a dimension
  // creates or updates a Category with parentId=null, type='product'. We no longer
  // write to the custom_dimensions table or localStorage — the categories API is the
  // single source of truth, so the admin page and the public page show identical names.
  const handleDimensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dimensionForm.labelEn.trim() && !dimensionForm.labelZh.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const name = {
        zh: dimensionForm.labelZh || dimensionForm.labelEn,
        en: dimensionForm.labelEn || dimensionForm.labelZh,
        ar: dimensionForm.labelAr || dimensionForm.labelZh,
      };
      // Slug: use the explicit key (dimension identifier) when provided, else derive from EN name.
      const slugBase = dimensionForm.key.trim() || (dimensionForm.labelEn || dimensionForm.labelZh);
      const slug = slugBase.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const icon = dimensionForm.icon || '';

      if (editingDimension) {
        // editingDimension.key holds the L1 category id
        const existing = categories.find((c: any) => c.id === editingDimension.key);
        const updated = await adminApi.updateCategory(editingDimension.key, {
          name,
          slug: existing?.slug || slug,
          icon,
          description: { zh: '', en: '', ar: '' },
          parentId: null,
          order: existing?.order ?? 0,
          status: 'active',
          type: existing?.type || 'product',
        });
        setCategories(prev => prev.map(c => c.id === editingDimension.key ? (updated as any) : c));
      } else {
        const created: any = await adminApi.createCategory({
          name,
          slug,
          icon,
          description: { zh: '', en: '', ar: '' },
          parentId: null,
          order: categories.length,
          status: 'active',
          type: 'product',
        });
        setCategories(prev => [...prev, created]);
        setActiveTab(created.id);
      }

      setShowDimensionModal(false);
      setEditingDimension(null);
      setDimensionForm({ key: '', labelZh: '', labelEn: '', labelAr: '', icon: '' });
    } catch (err: any) {
      setError(err.message || '保存一级分类失败');
    } finally {
      setSaving(false);
    }
  };

  // Edit dimension handler (editing an existing L1 parent category)
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

  // Delete dimension handler — deletes the L1 parent Category row via the categories API.
  // (Child L2 categories keep their rows but become unparented; an admin can re-parent them
  // later. No data is lost.)
  const handleDeleteDimension = async (key: string) => {
    if (!confirm('确定要删除这个一级分类吗？其下的子分类将变为未归类（可在分类列表中重新归类）。')) return;

    try {
      setSaving(true);
      await adminApi.deleteCategory(key);
      setCategories(prev => prev.filter(c => c.id !== key));
      setCustomDimensions(prev => prev.filter(d => d.key !== key));
      if (activeTab === key) {
        const remaining = customDimensions.filter(d => d.key !== key);
        setActiveTab(remaining[0]?.key || '');
      }
    } catch (err: any) {
      setError(err.message || '删除一级分类失败');
    } finally {
      setSaving(false);
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
        parentId: editingCategory
          ? ((editingCategory as any).parentId ?? null)
          : (categoryForm.parentId ?? null),
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
        parentId: null,
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
      parentId: (category as any).parentId ?? null,
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

  // Filter categories by active tab (L1 parent id) and search.
  // Rows shown = the L2 children whose parentId === the selected L1.
  const isChildOf = (c: any, l1Id: string) =>
    c.parentId === l1Id || (c.parent && c.parent.id === l1Id);
  const filteredCategories = categories.filter(c => {
    const matchesTab = isChildOf(c, activeTab as string);
    const matchesSearch = !searchQuery ||
      c.nameZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Infer the `type` for a new L2 child from its L1 siblings (fallback 'custom-solution').
  const getInheritedType = (l1Id: string): string => {
    const children = categories.filter((c: any) => isChildOf(c, l1Id));
    return (children[0] && (children[0] as any).type) || 'custom-solution';
  };

  // Dimension tabs are now the L1 parent categories. Labels are resolved live from the
  // trilingual `name` field (DB-backed) so the admin and public pages stay in sync.
  // No hardcoded Chinese dimension labels remain.
  const allTabs = customDimensions.map(d => ({
    key: d.key as CategoryType,
    // Use the label already resolved in loadData (d.label) instead of calling
    // resolveCategoryLabel again — d has no name/nameZh fields, so the second
    // call would return an empty string (the root cause of the empty L1 tab).
    label: d.label || d.labelEn || d.labelZh || '',
    icon: d.icon || '🗂️',
  }));

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
          <Link href="/xiaozhouBackend" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 text-base">
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
            href="/xiaozhouBackend/tags"
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
              <div className="flex gap-1.5 px-5 pt-4 flex-wrap">
                {allTabs.map((tab) => {
                  // Each tab is an L1 parent category; the badge counts its L2 children.
                  const childCount = categories.filter((c: any) => isChildOf(c, tab.key as string)).length;
                  return (
                    <div key={tab.key} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
                          activeTab === tab.key
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-2 text-base">{tab.icon}</span>
                        {tab.label}
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                          {childCount}
                        </span>
                      </button>
                      {/* Edit/Delete buttons — every tab is a real L1 category */}
                      <button
                        onClick={(e) => { e.stopPropagation(); const l1 = customDimensions.find(d => d.key === tab.key); handleEditDimension({ key: tab.key, label: tab.label, labelZh: l1?.labelZh || tab.label, labelEn: l1?.labelEn || tab.label, labelAr: l1?.labelAr || tab.label, icon: tab.icon }); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑一级分类名称（三语言）"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDimension(tab.key); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除一级分类"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                {/* New L1 Category (一级分类) Button */}
                <button
                  onClick={() => { setEditingDimension(null); setDimensionForm({ key: '', labelZh: '', labelEn: '', labelAr: '', icon: '' }); setShowDimensionModal(true); }}
                  className="px-6 py-3.5 text-base font-medium transition-all rounded-t-xl text-blue-500 hover:text-blue-700 hover:bg-blue-50 border-2 border-dashed border-blue-300"
                  title="新建一级分类"
                >
                  + 新建一级分类
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
                      // Create an L2 child of the currently selected L1 parent.
                      const inheritedType = getInheritedType(activeTab as string);
                      setCategoryForm({
                        nameZh: '',
                        nameEn: '',
                        nameAr: '',
                        slug: '',
                        icon: '',
                        descriptionZh: '',
                        descriptionEn: '',
                        descriptionAr: '',
                        type: inheritedType,
                        parentId: activeTab as string,
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
                    value={categoryForm.parentId ?? ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value || null })}
                    className="admin-form-input w-full"
                    required
                  >
                    {customDimensions.map(d => (
                      <option key={d.key} value={d.key}>
                        {d.labelZh || d.labelEn || d.labelAr || d.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    将作为「{resolveCategoryLabel(
                      customDimensions.find((d: any) => d.key === categoryForm.parentId) || { nameZh: '', nameEn: '', nameAr: '' },
                      adminLocale
                    ) || '未选择父级'}」下的子分类
                  </p>
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
                  {/* Manual input only — 图标选择器网格已移除 */}
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="admin-form-input w-full font-mono text-sm"
                    placeholder="图标名称或 emoji，如 📦 🔧 🏭（留空则使用默认）"
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
                  <input
                    type="text"
                    value={dimensionForm.icon}
                    onChange={(e) => setDimensionForm({ ...dimensionForm, icon: e.target.value })}
                    className="admin-form-input w-full font-mono text-sm"
                    placeholder="图标名称或 emoji，如 🤖 🏭（留空则使用默认 🗂️）"
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
                  <p className="text-xs text-gray-400 mt-1 text-center">删除后该维度下的所有分类将移至默认维度</p>
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
