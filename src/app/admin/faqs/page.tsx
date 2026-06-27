'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft, ChevronUp, ChevronDown, Search, X, CheckSquare, Square, Loader2 } from 'lucide-react';
import { fetchUnifiedFaqs, adminApi } from '@/data/unified-data';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

interface FAQ {
  id: string;
  question: { en: string; zh: string; ar: string };
  answer: { en: string; zh: string; ar: string };
  category: string;
  order: number;
  status: 'active' | 'inactive';
  isExpanded?: boolean;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load FAQs from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch FAQs from API
      const faqsData = await fetchUnifiedFaqs();
      setFaqs(faqsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && confirm('确定要删除这个FAQ吗？')) {
      try {
        setSaving(true);
        await adminApi.deleteFaq(id);
        setFaqs(faqs.filter(f => f.id !== id));
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      } catch (err: any) {
        setError(err.message || 'Failed to delete FAQ');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return;
    if (typeof window !== 'undefined' && confirm(`确定要删除选中的 ${selectedItems.length} 个FAQ吗？`)) {
      try {
        setSaving(true);
        await Promise.all(selectedItems.map(id => adminApi.deleteFaq(id)));
        const updated = faqs.filter(f => !selectedItems.includes(f.id));
        // Reorder
        const reordered = updated.map((f, idx) => ({ ...f, order: idx + 1 }));
        setFaqs(reordered);
        setSelectedItems([]);
      } catch (err: any) {
        setError(err.message || 'Failed to delete FAQs');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBatchStatusChange = async (status: 'active' | 'inactive') => {
    if (selectedItems.length === 0) return;
    try {
      setSaving(true);
      await Promise.all(
        selectedItems.map(id => {
          const faq = faqs.find(f => f.id === id);
          if (!faq) return Promise.resolve();
          return adminApi.updateFaq(id, { ...faq, status });
        })
      );
      const updated = faqs.map(f =>
        selectedItems.includes(f.id) ? { ...f, status } : f
      );
      setFaqs(updated);
      setSelectedItems([]);
    } catch (err: any) {
      setError(err.message || 'Failed to update FAQs');
    } finally {
      setSaving(false);
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order);
    const newFaqs = [...sortedFaqs];
    [newFaqs[index - 1].order, newFaqs[index].order] = [newFaqs[index].order, newFaqs[index - 1].order];

    try {
      setSaving(true);
      // Update both FAQs' order via API
      await Promise.all([
        adminApi.updateFaq(newFaqs[index - 1].id, newFaqs[index - 1]),
        adminApi.updateFaq(newFaqs[index].id, newFaqs[index]),
      ]);
      setFaqs([...newFaqs]);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder FAQs');
    } finally {
      setSaving(false);
    }
  };

  const moveDown = async (index: number) => {
    const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order);
    if (index === sortedFaqs.length - 1) return;
    const newFaqs = [...sortedFaqs];
    [newFaqs[index].order, newFaqs[index + 1].order] = [newFaqs[index + 1].order, newFaqs[index].order];

    try {
      setSaving(true);
      await Promise.all([
        adminApi.updateFaq(newFaqs[index].id, newFaqs[index]),
        adminApi.updateFaq(newFaqs[index + 1].id, newFaqs[index + 1]),
      ]);
      setFaqs([...newFaqs]);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder FAQs');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (faq: FAQ) => {
    try {
      setSaving(true);
      const newStatus = faq.status === 'active' ? 'inactive' : 'active';
      await adminApi.updateFaq(faq.id, { ...faq, status: newStatus });
      setFaqs(faqs.map(f => f.id === faq.id ? { ...f, status: newStatus } : f));
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id: string) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f));
  };

  const toggleSelectAll = () => {
    const filteredFaqs = getFilteredFaqs();
    if (selectedItems.length === filteredFaqs.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFaqs.map(f => f.id));
    }
  };

  // Filter FAQs
  const getFilteredFaqs = () => {
    let filtered = faqs;

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.question.zh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.question.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.zh.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(f => f.category === filterCategory);
    }

    return filtered.sort((a, b) => a.order - b.order);
  };

  const filteredFaqs = getFilteredFaqs();

  // Get category name (FAQ-specific)
  const getCategoryName = (cat: string) => {
    const catMap: Record<string, string> = {
      features: '功能特性', security: '安全权限', tracking: '追踪追溯',
      reporting: '报表导出', integration: '系统集成', products: '产品相关',
      customization: '定制开发', applications: '应用场景', sales: '购买咨询',
      support: '售后服务', company: '关于公司',
    };
    return catMap[cat] || cat || '未分类';
  };

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回仪表盘
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">FAQ 管理</h1>
          <p className="text-gray-600 mt-1">管理系统中的所有常见问题，支持分类、排序和批量操作</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 disabled:opacity-50"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <Link
            href="/admin/faqs/add"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>添加FAQ</span>
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
          {/* Filters and Batch Actions */}
          <div className="admin-card mb-6 p-4">
            <div className="flex flex-col gap-4">
              {/* Search and Category Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索问题或答案..."
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

                {/* Category Pills — FAQ-specific categories */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { key: '', label: '全部分类' },
                    { key: 'features', label: '功能特性' },
                    { key: 'security', label: '安全权限' },
                    { key: 'tracking', label: '追踪追溯' },
                    { key: 'reporting', label: '报表导出' },
                    { key: 'integration', label: '系统集成' },
                    { key: 'products', label: '产品相关' },
                    { key: 'customization', label: '定制开发' },
                    { key: 'applications', label: '应用场景' },
                    { key: 'sales', label: '购买咨询' },
                    { key: 'support', label: '售后服务' },
                    { key: 'company', label: '关于公司' },
                  ].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setFilterCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filterCategory === cat.key ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batch Actions */}
              {selectedItems.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    已选中 {selectedItems.length} 个FAQ
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBatchStatusChange('active')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      批量启用
                    </button>
                    <button
                      onClick={() => handleBatchStatusChange('inactive')}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      批量禁用
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      disabled={saving}
                    >
                      批量删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FAQ List (Collapsible) */}
          <div className="admin-card overflow-hidden">
            {filteredFaqs.length > 0 ? (
              <>
                {/* Select All Header */}
                <div className="px-6 py-3 border-b border-gray-200 flex items-center">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {selectedItems.length === filteredFaqs.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    <span>全选</span>
                  </button>
                  <span className="ml-4 text-sm text-gray-500">
                    共 {filteredFaqs.length} 个FAQ
                  </span>
                </div>

                <div className="divide-y divide-gray-200">
                  {filteredFaqs.map((faq, index) => (
                    <div key={faq.id}>
                      {/* Question Row */}
                      <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-150">
                        <div className="flex items-center space-x-3 flex-1">
                          <button
                            onClick={() => {
                              if (selectedItems.includes(faq.id)) {
                                setSelectedItems(selectedItems.filter(id => id !== faq.id));
                              } else {
                                setSelectedItems([...selectedItems, faq.id]);
                              }
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            {selectedItems.includes(faq.id) ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => toggleExpand(faq.id)}
                            className="flex-1 flex items-center space-x-3 text-left group"
                          >
                            <div className={`w-1 h-10 rounded-full flex-shrink-0 ${faq.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {faq.question.zh}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5">{faq.question.en}</div>
                            </div>
                            {faq.isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {/* Category Badge */}
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hidden sm:inline">
                            {getCategoryName(faq.category || '')}
                          </span>

                          {/* Status Badge - clickable */}
                          <button
                            onClick={() => toggleStatus(faq)}
                            className={faq.status === 'active' ? 'badge-active' : 'badge-inactive'}
                            disabled={saving}
                          >
                            {faq.status === 'active' ? '已启用' : '已禁用'}
                          </button>

                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                            title="上移"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === filteredFaqs.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                            title="下移"
                          >
                            ↓
                          </button>
                          <Link
                            href={`/admin/faqs/edit/${faq.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                            disabled={saving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Answer Preview (Expanded) */}
                      {faq.isExpanded && (
                        <div className="px-6 pb-4 bg-gradient-to-r from-blue-50/30 to-transparent border-l-4 border-blue-500 ml-6 mr-6 rounded-r-lg">
                            <div className="text-sm text-gray-600 leading-relaxed pl-4">
                              {faq.answer.zh}
                            </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>暂无FAQ，点击"添加FAQ"按钮创建。</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
