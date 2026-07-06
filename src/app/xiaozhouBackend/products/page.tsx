'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2, Search, Filter, ChevronLeft, ChevronRight, X, Package } from 'lucide-react';
import { fetchUnifiedCategories } from '@/data/unified-data';

export const dynamic = 'force-dynamic';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function AdminProductsPage() {
  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);  // Default to 10 so pagination shows for small datasets
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state (for display only - actual filtering uses params)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  // Language used to render category names in the filter dropdown (EN by default
  // to preserve the existing behaviour; user can switch to 中文).
  const [categoryLang, setCategoryLang] = useState<'en' | 'zh'>('en');

  // Batch management state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');
  
  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load products with pagination
  // CRITICAL FIX: Accept search and category as explicit parameters to avoid
  // React state batching timing issues (setState is async!)
  const loadProducts = useCallback(async (page: number = 1, size: number = pageSize, search: string = '', category: string = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
      });
      if (search) params.set('search', search);
      if (category) params.set('category', category);

      const [productsRes, categoriesData] = await Promise.all([
        fetch(`/api/admin/products?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
          },
        }),
        fetchUnifiedCategories(),
      ]);

      if (!productsRes.ok) throw new Error('Failed to fetch products');
      const productsData = await productsRes.json();

      setProducts(productsData.data || []);
      setTotalProducts(productsData.total || 0);
      setTotalPages(Math.ceil((productsData.total || 0) / size));
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);  // No dependencies - all values passed as params

  useEffect(() => {
    // Initial load with explicit empty filters
    loadProducts(1, pageSize, '', '');
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search - pass value DIRECTLY to avoid state timing issue
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    loadProducts(1, pageSize, value, selectedCategory);  // Pass current category too
  };

  // Handle category filter - pass value DIRECTLY
  const handleCategoryFilter = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    loadProducts(1, pageSize, searchQuery, value);  // Pass current search too
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page, pageSize, searchQuery, selectedCategory);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    loadProducts(1, size, searchQuery, selectedCategory);
  };

  // 层级分组展示：L1 一级分类（parentId === null）作为 optgroup 标签，
  // L2 子分类（parentId 有值）作为可选项放入对应 optgroup，按 order 排序。
  // L1 本身不可选，仅 L2 可选（与后端按 categories.some:{id} 过滤一致）。
  const resolveCategoryName = (cat: any): string => {
    // When Chinese is selected, prefer the Chinese name, then fall back to others.
    if (categoryLang === 'zh') {
      const zh = cat.nameZh || (cat.name && typeof cat.name === 'object' ? cat.name.zh : '') || '';
      if (zh) return zh;
    }
    // Default / English preference: English → Chinese → Arabic.
    const direct = cat.nameEn || cat.nameZh || cat.nameAr || '';
    if (direct) return direct;
    if (cat.name && typeof cat.name === 'object') return cat.name.en || cat.name.zh || cat.name.ar || '';
    return 'Unnamed';
  };

  const l1Categories = categories
    .filter((c: any) => !c.parentId)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const l2ByParent: Record<string, any[]> = {};
  categories.forEach((c: any) => {
    if (c.parentId) {
      if (!l2ByParent[c.parentId]) l2ByParent[c.parentId] = [];
      l2ByParent[c.parentId].push(c);
    }
  });
  Object.keys(l2ByParent).forEach((pid) => {
    l2ByParent[pid].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  });

  const dimensions = [...new Set(categories.map(c => c.type))];
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set(dimensions));

  const toggleDimension = (dim: string) => {
    setExpandedDimensions(prev => {
      const next = new Set(prev);
      if (next.has(dim)) next.delete(dim);
      else next.add(dim);
      return next;
    });
  };

  // Batch selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(products.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个产品吗？此操作不可恢复！`)) return;
    
    setBatchLoading(true);
    setBatchError('');
    try {
      const token = localStorage.getItem('admin_token') || '';
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/admin/products?id=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      );
      const results = await Promise.all(deletePromises);
      const failed = results.filter(r => !r.ok).length;
      
      if (failed > 0) {
        setBatchError(`删除了 ${selectedIds.size - failed} 个产品，${failed} 个失败`);
      }
      
      setSelectedIds(new Set());
      loadProducts(currentPage, pageSize, searchQuery, selectedCategory);
    } catch (err: any) {
      setBatchError(err.message || '批量删除失败');
    } finally {
      setBatchLoading(false);
    }
  };

  // Batch status change
  const handleBatchStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要将选中的 ${selectedIds.size} 个产品状态改为"${status}"吗？`)) return;

    setBatchLoading(true);
    setBatchError('');
    try {
      const token = localStorage.getItem('admin_token') || '';
      const updatePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/admin/products?id=${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        })
      );
      const results = await Promise.all(updatePromises);
      const failed = results.filter(r => !r.ok).length;

      if (failed > 0) {
        setBatchError(`更新了 ${selectedIds.size - failed} 个产品，${failed} 个失败`);
      }

      setSelectedIds(new Set());
      loadProducts(currentPage, pageSize, searchQuery, selectedCategory);
    } catch (err: any) {
      setBatchError(err.message || '批量更新失败');
    } finally {
      setBatchLoading(false);
    }
  };

  // Single delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除产品"${name}"吗？`)) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      loadProducts(currentPage, pageSize, searchQuery, selectedCategory);
    } catch (err: any) {
      alert('删除失败：' + (err.message || '未知错误'));
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination render
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-11 h-11 rounded-xl transition-all duration-200 text-base font-semibold ${
            i === currentPage
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-blue-300'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center justify-between px-8 py-6 border-t border-gray-200">
        <div className="flex items-center gap-6">
          <span className="text-base text-gray-600 font-medium">
            共 {totalProducts} 个产品，第 {currentPage}/{totalPages} 页
          </span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-4 py-2.5 text-base border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size} 条/页</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-11 h-11 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-11 h-11 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">产品管理</h1>
          <div className="flex items-center gap-4">
            {selectedIds.size > 0 && (
              <span className="text-base text-gray-600 font-medium">
                已选择 {selectedIds.size} 个产品
              </span>
            )}
            <Link
              href="/xiaozhouBackend/products/add"
              className="inline-flex items-center gap-2.5 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-base font-medium shadow-lg shadow-blue-200"
            >
              <Plus className="w-5 h-5" />
              添加产品
            </Link>
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <button
              onClick={() => handleSelectAll(false)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-blue-100 transition-colors"
              title="取消选择"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-base text-blue-900 font-medium">
              已选择 {selectedIds.size} 个产品
            </span>
            <div className="flex items-center gap-3 ml-6">
              <button
                onClick={() => handleBatchStatus('active')}
                disabled={batchLoading}
                className="px-5 py-2.5 text-base bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium shadow-lg shadow-emerald-200"
              >
                批量启用
              </button>
              <button
                onClick={() => handleBatchStatus('draft')}
                disabled={batchLoading}
                className="px-5 py-2.5 text-base bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium shadow-lg shadow-gray-200"
              >
                批量草稿
              </button>
              <button
                onClick={() => handleBatchStatus('discontinued')}
                disabled={batchLoading}
                className="px-5 py-2.5 text-base bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium shadow-lg shadow-yellow-200"
              >
                批量停售
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={batchLoading}
                className="px-5 py-2.5 text-base bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors font-medium shadow-lg shadow-red-200"
              >
                {batchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                批量删除
              </button>
            </div>
            {batchError && (
              <span className="text-base text-red-600 ml-3">{batchError}</span>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center gap-5 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索产品名称、SKU..."
              className="w-full pl-12 pr-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            />
          </div>

          {/* Category Filter + language toggle */}
          <div className="flex items-center gap-3">
            {/* Language switch: EN / 中文 */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setCategoryLang('en')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${categoryLang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setCategoryLang('zh')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${categoryLang === 'zh' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                中文
              </button>
            </div>

            {/* Category Filter - Grouped by Dimension */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="pl-12 pr-10 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base bg-white min-w-[320px]"
              >
                <option value="">所有分类</option>
                {l1Categories.map((l1: any) => {
                  const children = l2ByParent[l1.id] || [];
                  if (children.length === 0) return null;
                  const groupLabel = resolveCategoryName(l1);
                  return (
                    <optgroup key={l1.id} label={groupLabel}>
                      {children.map((cat: any, idx: number) => {
                        const isLast = idx === children.length - 1;
                        const treePrefix = isLast ? '└ ' : '├ ';
                        return (
                          <option key={cat.id} value={cat.id}>
                            {`${treePrefix}${resolveCategoryName(cat)}`}
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => { handleSearch(''); handleCategoryFilter(''); }}
              className="px-6 py-3.5 text-base text-gray-600 hover:text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      <div className="p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            {error}
            <button onClick={() => loadProducts(currentPage, pageSize, searchQuery, selectedCategory)} className="ml-4 text-base underline">重试</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="px-6 py-5 text-left w-12">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && products.every(p => selectedIds.has(p.id))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">图片</th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU编号</th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">推荐</th>
                  <th className="px-6 py-5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Checkbox */}
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {/* Product Image */}
                    <td className="px-6 py-5">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name?.en || 'Product'}
                          className="w-20 h-16 object-cover rounded-xl border border-gray-200"
                        />
                      ) : product.image ? (
                        <img
                          src={product.image}
                          alt={product.name?.en || 'Product'}
                          className="w-20 h-16 object-cover rounded-xl border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">无图</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-gray-900 text-base">{product.name?.en || product.name || 'Unnamed'}</div>
                      <div className="text-sm text-gray-500 mt-1">{product.name?.zh || ''}</div>
                    </td>
                    <td className="px-6 py-5 text-base text-gray-600">{product.sku || '-'}</td>
                    {/* Category */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {product.categories && product.categories.slice(0, 2).map((cat: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                            {cat.name?.zh || cat.name?.en || cat.name?.ar || cat.name || 'Unknown'}
                          </span>
                        ))}
                        {product.categories && product.categories.length > 2 && (
                          <span className="text-sm text-gray-500">+{product.categories.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
                        product.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        product.status === 'draft' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          product.status === 'active' ? 'bg-emerald-500' :
                          product.status === 'draft' ? 'bg-gray-400' :
                          'bg-yellow-500'
                        }`}></span>
                        {product.status === 'active' ? '启用' : product.status === 'draft' ? '草稿' : product.status === 'discontinued' ? '停售' : product.status || '未知'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {product.featured ? (
                        <span className="text-yellow-500 text-2xl">★</span>
                      ) : (
                        <span className="text-gray-300 text-2xl">☆</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/xiaozhouBackend/products/edit/${product.id}`}
                          className="admin-btn-action-edit"
                          title="编辑"
                        >
                          <Pencil className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name?.en || product.name || 'Unnamed')}
                          disabled={deletingId === product.id}
                          className="admin-btn-action-delete disabled:opacity-50"
                          title="删除"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                      <p className="text-lg">{searchQuery || selectedCategory ? '没有匹配的产品。' : '暂无产品。'}</p>
                      {!searchQuery && !selectedCategory && (
                        <Link href="/xiaozhouBackend/products/add" className="text-blue-600 hover:underline ml-1 text-base">创建产品</Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
}
