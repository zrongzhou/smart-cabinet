'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft, X, Check, Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { fetchUnifiedTags, adminApi } from '@/data/unified-data';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

interface Tag {
  id: string;
  nameZh: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  color: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#D946EF', // Fuchsia
];

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [tagForm, setTagForm] = useState({
    nameZh: '',
    nameEn: '',
    nameAr: '',
    slug: '',
    color: '#3B82F6',
    status: 'active' as 'active' | 'inactive',
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tags from API
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tags from API
      const tagsData = await fetchUnifiedTags();
      setTags(tagsData);

      // Load product counts from the DB (products API) — no localStorage fallback.
      // Counts are keyed by tag id so the UI can show how many products use each tag.
      try {
        const productsRes = await fetch('/api/products?status=all');
        const productsJson = await productsRes.json();
        const products = productsJson.data || productsJson || [];
        const counts: Record<string, number> = {};
        products.forEach((p: any) => {
          const tagIds = Array.isArray(p.tags)
            ? p.tags.map((t: any) => (typeof t === 'string' ? t : t.id)).filter(Boolean)
            : [];
          tagIds.forEach((tagId: string) => {
            counts[tagId] = (counts[tagId] || 0) + 1;
          });
        });
        setProductCounts(counts);
      } catch (e) {
        console.warn('[tags] Failed to load product counts from API:', e);
        setProductCounts({});
      }
    } catch (err: any) {
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // Seed default tags (fallback for empty state)
  const seedDefaultTags = () => {
    const defaultTags: Tag[] = [
      { id: 'tag-1', nameZh: '热销', nameEn: 'Best Seller', nameAr: 'الأکثر مبیعاً', slug: 'best-seller', color: '#EF4444', status: 'active', createdAt: new Date().toISOString() },
      { id: 'tag-2', nameZh: '新品', nameEn: 'New Arrival', nameAr: 'وصل حدیثاً', slug: 'new-arrival', color: '#10B981', status: 'active', createdAt: new Date().toISOString() },
      { id: 'tag-3', nameZh: '限量版', nameEn: 'Limited Edition', nameAr: 'إصدار محدود', slug: 'limited', color: '#8B5CF6', status: 'active', createdAt: new Date().toISOString() },
      { id: 'tag-4', nameZh: '推荐', nameEn: 'Recommended', nameAr: 'موصى به', slug: 'recommended', color: '#F59E0B', status: 'active', createdAt: new Date().toISOString() },
    ];
    setTags(defaultTags);
  };

  // Save tags via API
  const saveTags = async (newTags: Tag[]) => {
    setTags(newTags);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const tagData: any = {
        nameZh: tagForm.nameZh,
        nameEn: tagForm.nameEn,
        nameAr: tagForm.nameAr,
        slug: tagForm.slug || tagForm.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        color: tagForm.color,
        status: tagForm.status,
      };

      if (editingTag) {
        // Update existing tag via API
        const updated = await adminApi.updateTag(editingTag.id, tagData);
        setTags(tags.map(t => t.id === editingTag.id ? updated : t));
      } else {
        // Create new tag via API
        const created = await adminApi.createTag(tagData);
        setTags([...tags, created]);
      }

      setShowModal(false);
      setEditingTag(null);
      setTagForm({
        nameZh: '',
        nameEn: '',
        nameAr: '',
        slug: '',
        color: '#3B82F6',
        status: 'active',
      });
    } catch (err: any) {
      setError(err.message || '保存标签失败');
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setTagForm({
      nameZh: tag.nameZh,
      nameEn: tag.nameEn,
      nameAr: tag.nameAr,
      slug: tag.slug,
      color: tag.color,
      status: tag.status,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && confirm('确定要删除这个标签吗？相关的产品引用会保留但显示为已删除的标签。')) {
      try {
        setSaving(true);
        await adminApi.deleteTag(id);
        setTags(tags.filter(t => t.id !== id));
      } catch (err: any) {
        setError(err.message || '删除标签失败');
      } finally {
        setSaving(false);
      }
    }
  };

  // Filter tags by search
  const filteredTags = tags.filter(t => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.nameZh.toLowerCase().includes(query) ||
      t.nameEn.toLowerCase().includes(query) ||
      t.slug.toLowerCase().includes(query)
    );
  });

  // NOTE: product counts are read from the DB-derived `productCounts` state
  // (populated in loadData), not from localStorage.

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/xiaozhouBackend" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回仪表盘
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">标签管理</h1>
          <p className="text-gray-600 mt-1">管理系统中的所有标签，用于产品标记和筛选</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <Link
            href="/xiaozhouBackend/categories"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <span>📁</span>
            分类管理
          </Link>
          <button
            onClick={() => {
              setEditingTag(null);
              setTagForm({
                nameZh: '',
                nameEn: '',
                nameAr: '',
                slug: '',
                color: '#3B82F6',
                status: 'active',
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>添加标签</span>
          </button>
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
          {/* Search Bar */}
          <div className="admin-card mb-6 p-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标签名称或slug..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none admin-form-input transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tags Table */}
          <div className="admin-card overflow-hidden">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 w-10">颜色</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">中文名</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">English Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 hidden lg:table-cell">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 w-20">产品数</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 w-16">状态</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTags.map((tag, index) => (
                  <tr
                    key={tag.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    {/* Color */}
                    <td className="px-4 py-3">
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm"
                        style={{ backgroundColor: tag.color }}
                      />
                    </td>
                    {/* Chinese Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block px-2 py-0.5 text-xs text-white rounded"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.nameZh}
                        </span>
                      </div>
                    </td>
                    {/* English Name */}
                    <td className="px-4 py-3 text-sm text-gray-600">{tag.nameEn}</td>
                    {/* Slug */}
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono hidden lg:table-cell">{tag.slug}</td>
                    {/* Product Count */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center justify-center w-8 h-6 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        {mounted ? (productCounts[tag.id] || 0) : 0}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={tag.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                        {tag.status === 'active' ? '已启用' : '已禁用'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTags.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>暂无标签，点击"添加标签"按钮创建。</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTag ? '编辑标签' : '添加标签'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签名称（中文）*</label>
                  <input
                    type="text"
                    required
                    value={tagForm.nameZh}
                    onChange={(e) => setTagForm({ ...tagForm, nameZh: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none admin-form-input transition-all"
                    placeholder="请输入中文名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name (English)*</label>
                  <input
                    type="text"
                    required
                    value={tagForm.nameEn}
                    onChange={(e) => {
                      const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                      setTagForm({ ...tagForm, nameEn: e.target.value, slug });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none admin-form-input transition-all"
                    placeholder="Please enter English name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الوسم (العربية)</label>
                <input
                  type="text"
                  value={tagForm.nameAr}
                  onChange={(e) => setTagForm({ ...tagForm, nameAr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right"
                  placeholder="الرجاء إدخال اسم الوسم بالعربية"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={tagForm.slug}
                  onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none admin-form-input transition-all font-mono text-sm"
                  placeholder="slug-url-friendly"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签颜色</label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTagForm({ ...tagForm, color })}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          tagForm.color === color
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tagForm.color}
                      onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={tagForm.color}
                      onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={tagForm.status}
                  onChange={(e) => setTagForm({ ...tagForm, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none admin-form-input transition-all"
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
                      {editingTag ? '保存修改' : '创建标签'}
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
