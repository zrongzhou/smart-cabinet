'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchUnifiedFaqs, adminApi } from '@/data/unified-data';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

export default function AdminFaqEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing FAQ data
  useEffect(() => {
    const loadFaq = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all FAQs and find the one with matching id
        const faqs = await fetchUnifiedFaqs();
        const faq = faqs.find((f: any) => f.id === id);

        if (!faq) {
          setError('FAQ不存在');
          return;
        }

        // Pre-fill form with existing data
        setFormData({
          questionZh: faq.question.zh || '',
          questionEn: faq.question.en || '',
          questionAr: faq.question.ar || '',
          answerZh: faq.answer.zh || '',
          answerEn: faq.answer.en || '',
          answerAr: faq.answer.ar || '',
          category: faq.category || '',
          status: (faq.status as 'active' | 'inactive') || 'active',
        });
      } catch (err: any) {
        setError(err.message || '加载FAQ失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadFaq();
    }
  }, [id]);

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
      };

      await adminApi.updateFaq(id, faqData);

      // Redirect to FAQ list page
      router.push('/xiaozhouBackend/faqs');
    } catch (err: any) {
      setError(err.message || '更新FAQ失败');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
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
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

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
            href="/xiaozhouBackend/faqs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回FAQ列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">编辑FAQ</h1>
          <p className="text-gray-600 mt-1">修改现有FAQ条目</p>
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
                {categoryOptions.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* 问题输入 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">问题</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  问题（中文） <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.questionZh}
                  onChange={(e) => setFormData({ ...formData, questionZh: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="请输入中文问题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.questionEn}
                  onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Please enter English question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سؤال (العربية)
                </label>
                <input
                  type="text"
                  value={formData.questionAr}
                  onChange={(e) => setFormData({ ...formData, questionAr: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="أدخل السؤال باللغة العربية"
                  dir="rtl"
                />
              </div>
            </div>

            {/* 答案输入 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">答案</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  答案（中文） <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.answerZh}
                  onChange={(e) => setFormData({ ...formData, answerZh: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="请输入中文答案"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer (English) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.answerEn}
                  onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Please enter English answer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  جواب (العربية)
                </label>
                <textarea
                  rows={6}
                  value={formData.answerAr}
                  onChange={(e) => setFormData({ ...formData, answerAr: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="أدخل الإجابة باللغة العربية"
                  dir="rtl"
                />
              </div>
            </div>

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
                href="/xiaozhouBackend/faqs"
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
                <span>{saving ? '保存中...' : '保存修改'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
