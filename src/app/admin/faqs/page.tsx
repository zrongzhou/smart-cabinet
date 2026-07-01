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
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 text-base">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回仪表盘
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">FAQ 管理</h1>
          <p className="text-gray-600 mt-2 text-lg">管理系统中的所有常见问题，支持分类、排序和批量操作</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2.5 px-6 py-3 text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 disabled:opacity-50 shadow-sm"
          >
            <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <Link
            href="/admin/faqs/add"
            className="btn-primary flex items-center space-x-2.5 text-base py-3.5 px-6"
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
          <div className="admin-card mb-8 p-6">
            <div className="flex flex-col gap-5">
              {/* Search and Category Filter */}
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索问题或答案..."
                    className="w-full pl-12 pr-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none admin-form-input transition-all text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                    <X className="w-5 h-5" />
                  </button>
                  )}
                </div>

                {/* Category Pills — FAQ-specific categories */}
                <div className="flex items-center gap-3 flex-wrap">
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filterCategory === cat.key ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batch Actions */}
              {selectedItems.length > 0 && (
                <div className="p-5 bg-blue-50 rounded-xl flex items-center justify-between">
                  <span className="text-base text-blue-700 font-medium">
                    已选中 {selectedItems.length} 个FAQ
                  </span>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBatchStatusChange('active')}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-base hover:bg-green-700 transition-colors font-medium shadow-lg shadow-green-200"
                    >
                      批量启用
                    </button>
                    <button
                      onClick={() => handleBatchStatusChange('inactive')}
                      className="px-5 py-2.5 bg-gray-600 text-white rounded-xl text-base hover:bg-gray-700 transition-colors font-medium shadow-lg shadow-gray-200"
                    >
                      批量禁用
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-base hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-200"
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
                <div className="px-8 py-5 border-b border-gray-200 flex items-center">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center space-x-3 text-base text-gray-600 hover:text-gray-900"
                  >
                    {selectedItems.length === filteredFaqs.length ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                    <span>全选</span>
                  </button>
                  <span className="ml-6 text-base text-gray-500">
                    共 {filteredFaqs.length} 个FAQ
                  </span>
                </div>

                <div className="divide-y divide-gray-200">
                  {filteredFaqs.map((faq, index) => (
                    <div key={faq.id}>
                      {/* Question Row */}
                      <div className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-150">
                        <div className="flex items-center space-x-4 flex-1">
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
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>

                          <button
                            onClick={() => toggleExpand(faq.id)}
                            className="flex-1 flex items-center space-x-4 text-left group"
                          >
                            <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${faq.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-base">
                                {faq.question.zh}
                              </div>
                              <div className="text-base text-gray-500 mt-1">{faq.question.en}</div>
                            </div>
                            {faq.isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center space-x-3 ml-6">
                          {/* Category Badge */}
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm hidden sm:inline font-medium">
                            {getCategoryName(faq.category || '')}
                          </span>

                          {/* Status Badge - clickable */}
                          <button
                            onClick={() => toggleStatus(faq)}
                            className={faq.status === 'active' ? 'admin-badge admin-badge-success cursor-pointer hover:opacity-80' : 'admin-badge admin-badge-warning cursor-pointer hover:opacity-80'}
                            disabled={saving}
                          >
                            {faq.status === 'active' ? '已启用' : '已禁用'}
                          </button>

                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors text-lg"
                            title="上移"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === filteredFaqs.length - 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors text-lg"
                            title="下移"
                          >
                            ↓
                          </button>
                          <Link
                            href={`/admin/faqs/edit/${faq.id}`}
                            className="admin-btn-action-edit"
                            title="编辑"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="admin-btn-action-delete"
                            title="删除"
                            disabled={saving}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Answer Preview (Expanded) */}
                      {faq.isExpanded && (
                        <div className="px-8 pb-5 bg-gradient-to-r from-blue-50/30 to-transparent border-l-4 border-blue-500 ml-8 mr-8 rounded-r-xl">
                          <div className="text-base text-gray-600 leading-relaxed pl-5">
                            {faq.answer.zh}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">暂无FAQ，点击"添加FAQ"按钮创建。</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
