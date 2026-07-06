'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { adminApi } from '@/data/unified-data';
import JsonTrilingualInput from '@/components/admin/JsonTrilingualInput';
import { FAQ_CATEGORIES } from '@/data/faq-constants';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

export default function AdminFaqAddPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    questionZh: '',
    questionEn: '',
    questionAr: '',
    answerZh: '',
    answerEn: '',
    answerAr: '',
    category: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const faqData = {
        question: {
          en: formData.questionEn,
          zh: formData.questionZh,
          ar: formData.questionAr || formData.questionEn,
        },
        answer: {
          en: formData.answerEn,
          zh: formData.answerZh,
          ar: formData.answerAr || formData.answerEn,
        },
        category: formData.category,
        status: formData.status,
        order: 999, // Will be reordered by the list page
      };

      await adminApi.createFaq(faqData);

      // Redirect to FAQ list page
      router.push('/admin/faqs');
    } catch (err: any) {
      setError(err.message || '创建FAQ失败');
    } finally {
      setSaving(false);
    }
  };

  // 分类选项复用全局 FAQ_CATEGORIES 常量（与产品 FAQ 区块共用）

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <p className="text-red-700 text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-6">
          <Link
            href="/admin/faqs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回FAQ列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">添加FAQ</h1>
          <p className="text-gray-600 mt-1">创建新的常见问题条目</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 分类选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">请选择分类</option>
                {FAQ_CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 问题输入（三语，共用 JsonTrilingualInput 组件） */}
            <JsonTrilingualInput
              label="问题"
              requireZh
              requireEn
              value={{ zh: formData.questionZh, en: formData.questionEn, ar: formData.questionAr }}
              onChange={(next) =>
                setFormData({ ...formData, questionZh: next.zh || '', questionEn: next.en || '', questionAr: next.ar || '' })
              }
            />

            {/* 答案输入（三语，共用 JsonTrilingualInput 组件） */}
            <JsonTrilingualInput
              label="答案"
              multiline
              requireZh
              requireEn
              value={{ zh: formData.answerZh, en: formData.answerEn, ar: formData.answerAr }}
              onChange={(next) =>
                setFormData({ ...formData, answerZh: next.zh || '', answerEn: next.en || '', answerAr: next.ar || '' })
              }
            />

            {/* 状态选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="active">已启用</option>
                <option value="inactive">已禁用</option>
              </select>
            </div>

            {/* 提交按钮 */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/faqs"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{saving ? '创建中...' : '创建FAQ'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
