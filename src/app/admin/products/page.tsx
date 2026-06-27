'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2, Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  const [customDimensionLabels, setCustomDimensionLabels] = useState<Record<string, string>>({});
  
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
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
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
    // Load custom dimension labels from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedDims = localStorage.getItem('admin_custom_dimensions');
        if (savedDims) {
          const dimLabels = JSON.parse(savedDims);
          const labelsMap: Record<string, string> = {};
          Object.entries(dimLabels).forEach(([key, val]: [string, any]) => {
            labelsMap[key] = val.labelZh || val.labelEn || val.label || key;
          });
          setCustomDimensionLabels(labelsMap);
        }
      } catch (e) {
        console.warn('Failed to load custom dimension labels:', e);
      }
    }
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

  // Get unique dimensions from categories
  const dimensionLabels: Record<string, string> = {
    'cabinet-type': '柜型分类',
    'managed-items': '管理物料',
    'industry': '行业分类',
    'custom-solution': '定制方案',
    ...customDimensionLabels,
  };
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

  // Group categories by dimension
  const groupedCategories = dimensions.map(dim => ({
    dimension: dim,
    label: dimensionLabels[dim] || dim,
    categories: categories.filter(c => c.type === dim)
  }));

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
      const token = localStorage.getItem('adminToken') || '';
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
      const token = localStorage.getItem('adminToken') || '';
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
      const token = localStorage.getItem('adminToken') || '';
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
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            i === currentPage
              ? 'bg-blue-600 text-white font-medium'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            共 {totalProducts} 个产品，第 {currentPage}/{totalPages} 页
          </span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size} 条/页</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">产品管理</h1>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <span className="text-sm text-gray-600">
                已选择 {selectedIds.size} 个产品
              </span>
            )}
            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加产品
            </Link>
          </div>
        </div>

        {/* Batch Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <button
              onClick={() => handleSelectAll(false)}
              className="p-1.5 text-gray-600 hover:text-gray-900 rounded"
              title="取消选择"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-sm text-blue-900 font-medium">
              已选择 {selectedIds.size} 个产品
            </span>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleBatchStatus('active')}
                disabled={batchLoading}
                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                批量启用
              </button>
              <button
                onClick={() => handleBatchStatus('draft')}
                disabled={batchLoading}
                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                批量草稿
              </button>
              <button
                onClick={() => handleBatchStatus('discontinued')}
                disabled={batchLoading}
                className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                批量停售
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={batchLoading}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
              >
                {batchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                批量删除
              </button>
            </div>
            {batchError && (
              <span className="text-sm text-red-600 ml-2">{batchError}</span>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索产品名称、SKU..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          {/* Category Filter - Grouped by Dimension */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white min-w-[250px]"
            >
              <option value="">所有分类</option>
              {groupedCategories.map(group => (
                <optgroup key={group.dimension} label={`${group.label} (${group.categories.length})`}>
                  {group.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameZh || cat.nameEn || cat.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => { handleSearch(''); handleCategoryFilter(''); }}
              className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
            <button onClick={() => loadProducts(currentPage, pageSize, searchQuery, selectedCategory)} className="ml-4 text-sm underline">重试</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && products.every(p => selectedIds.has(p.id))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">图片</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU编号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">推荐</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    {/* Checkbox */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {/* Product Image */}
                    <td className="px-6 py-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name?.en || 'Product'}
                          className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      ) : product.image ? (
                        <img
                          src={product.image}
                          alt={product.name?.en || 'Product'}
                          className="w-16 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">无图</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name?.en || product.name || 'Unnamed'}</div>
                      <div className="text-sm text-gray-500">{product.name?.zh || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku || '-'}</td>
                    {/* Category */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories && product.categories.slice(0, 2).map((cat: any, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {cat.name?.zh || cat.name?.en || cat.name?.ar || cat.name || 'Unknown'}
                          </span>
                        ))}
                        {product.categories && product.categories.length > 2 && (
                          <span className="text-xs text-gray-500">+{product.categories.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        product.status === 'draft' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.status === 'active' ? 'bg-emerald-500' :
                          product.status === 'draft' ? 'bg-gray-400' :
                          'bg-yellow-500'
                        }`}></span>
                        {product.status === 'active' ? '启用' : product.status === 'draft' ? '草稿' : product.status === 'discontinued' ? '停售' : product.status || '未知'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.featured ? (
                        <span className="text-yellow-500 text-lg">★</span>
                      ) : (
                        <span className="text-gray-300 text-lg">☆</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name?.en || product.name || 'Unnamed')}
                          disabled={deletingId === product.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="删除"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      {searchQuery || selectedCategory ? '没有匹配的产品。' : '暂无产品。'}
                      {!searchQuery && !selectedCategory && (
                        <Link href="/admin/products/add" className="text-blue-600 hover:underline ml-1">创建产品</Link>
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
