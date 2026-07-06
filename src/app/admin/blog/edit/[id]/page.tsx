'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import MediaPicker from '@/components/admin/MediaPicker';
import { fetchUnifiedCategories, fetchUnifiedBlogs, adminApi, type BlogPostAPI } from '@/data/unified-data';

export const dynamic = 'force-dynamic';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'zh' | 'en' | 'ar'>('zh');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    titleZh: '',
    titleEn: '',
    titleAr: '',
    excerptZh: '',
    excerptEn: '',
    excerptAr: '',
    contentZh: '',
    contentEn: '',
    contentAr: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    category: '',
    tags: [] as string[],
    image: '',
    slug: '',
    seoKeywords: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [cats, tagsData] = await Promise.all([
          fetchUnifiedCategories(),
          adminApi.getTags(),
        ]);

        setCategories(cats);
        setTags(tagsData);

        // Fetch the full blog data from admin API (which includes content field)
        // The list API (/api/blogs) excludes content for performance
        // So we need to fetch from admin API which returns full blog data
        const blogRes = await fetch(`/api/admin/blogs?id=${postId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });

        if (!blogRes.ok) {
          throw new Error('Failed to fetch blog data');
        }

        const post = await blogRes.json();
        if (!post || !post.id) {
          setError('文章未找到 / Blog post not found');
          setLoading(false);
          return;
        }

        // Pre-fill form with existing data (now content is included)
        setFormData({
          titleZh: post.title?.zh || '',
          titleEn: post.title?.en || '',
          titleAr: post.title?.ar || '',
          excerptZh: post.excerpt?.zh || '',
          excerptEn: post.excerpt?.en || '',
          excerptAr: post.excerpt?.ar || '',
          contentZh: post.content?.zh || '',
          contentEn: post.content?.en || '',
          contentAr: post.content?.ar || '',
          status: post.status || 'draft',
          featured: post.featured || false,
          category: post.category || '',
          tags: post.tags?.map((t: any) => t.tagId) || [],
          image: post.image || '',
          slug: post.slug || '',
          seoKeywords: post.seoKeywords || '',
        });
      } catch (err: any) {
        setError(err.message || '加载文章失败');
      } finally {
        setLoading(false);
      }
    };

    if (postId) loadData();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.titleZh && !formData.titleEn) {
      setError('请至少填写一个语言版本的标题');
      return;
    }

    try {
      setSaving(true);

      // Use the manually-entered slug if valid, otherwise auto-generate from title
      const rawSlug = (formData.slug || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      let slug = rawSlug;
      if (!slug) {
        slug = formData.titleEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      if (!slug) {
        slug = formData.titleZh.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u4e00-\u9fff-]/g, '').toLowerCase();
      }
      if (!slug) {
        slug = 'post-' + Date.now();
      }

      const postData: any = {
        title: { en: formData.titleEn, zh: formData.titleZh, ar: formData.titleAr },
        slug: slug,
        excerpt: { en: formData.excerptEn, zh: formData.excerptZh, ar: formData.excerptAr },
        content: { en: formData.contentEn, zh: formData.contentZh, ar: formData.contentAr },
        status: formData.status,
        featured: formData.featured,
        category: formData.category || null,
        tagIds: formData.tags,
        image: formData.image || null,
        seoKeywords: formData.seoKeywords || null,
      };

      await adminApi.updateBlog(postId, postData);
      router.push('/admin/blog');
    } catch (err: any) {
      setError(err.message || '更新文章失败');
    } finally {
      setSaving(false);
    }
  };

  // Upload the chosen cover image to the server media store (instead of embedding
  // a base64 data URL in the DB), then use the returned public URL as the cover.
  const handleCoverUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        const uploadHeaders: Record<string, string> = {};
        if (token) uploadHeaders['Authorization'] = `Bearer ${token}`;
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          credentials: 'include',
          headers: uploadHeaders,
          body: formData,
        });
        const result = await res.json();
        if (res.ok && result.url) {
          setFormData(f => ({ ...f, image: result.url }));
        } else {
          setError(result.error || '封面上传失败');
        }
      } catch (err) {
        console.error('Cover upload failed:', err);
        setError('封面上传失败，请重试');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/blog" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-gray-900">编辑文章</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* 语言Tab切换 */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button type="button" onClick={() => setActiveTab('zh')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'zh' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>中文</button>
          <button type="button" onClick={() => setActiveTab('en')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'en' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>English</button>
          <button type="button" onClick={() => setActiveTab('ar')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ar' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>العربية</button>
        </div>

        {/* 分类选择 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">分类</h2>
          <select
            value={formData.category}
            onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
            className="admin-form-input w-full"
          >
            <option value="">选择分类</option>
            {categories.filter(c => c.status === 'active').map(c => (
              <option key={c.id} value={c.id}>{c.nameZh || c.nameEn}</option>
            ))}
          </select>
        </div>

        {/* 标签选择 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">标签</h2>
          <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg max-h-32 overflow-y-auto">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  const newTags = formData.tags.includes(tag.id)
                    ? formData.tags.filter(t => t !== tag.id)
                    : [...formData.tags, tag.id];
                  setFormData(f => ({ ...f, tags: newTags }));
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.tags.includes(tag.id)
                    ? 'text-white'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
                style={formData.tags.includes(tag.id) ? { backgroundColor: tag.color } : {}}
              >
                {tag.nameZh || tag.nameEn}
              </button>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-gray-400">暂无标签，请先在分类/标签管理中创建。</p>
            )}
          </div>
        </div>

        {/* 标题（中文） */}
        {activeTab === 'zh' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">标题（中文）*</label>
            <input
              type="text"
              required
              value={formData.titleZh}
              onChange={(e) => setFormData(f => ({ ...f, titleZh: e.target.value }))}
              className="admin-form-input w-full"
              placeholder="请输入中文标题"
            />
          </div>
        )}

        {/* 标题（英文） */}
        {activeTab === 'en' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)*</label>
            <input
              type="text"
              required
              value={formData.titleEn}
              onChange={(e) => setFormData(f => ({ ...f, titleEn: e.target.value }))}
              className="admin-form-input w-full"
              placeholder="Please enter English title"
            />
          </div>
        )}

        {/* 摘要（中文） */}
        {activeTab === 'zh' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">摘要（中文）</label>
            <textarea
              rows={2}
              value={formData.excerptZh}
              onChange={(e) => setFormData(f => ({ ...f, excerptZh: e.target.value }))}
              className="admin-form-input w-full resize-none"
              placeholder="请输入文章摘要（将显示在列表中）"
            />
          </div>
        )}

        {/* 摘要（英文） */}
        {activeTab === 'en' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary (English)</label>
            <textarea
              rows={2}
              value={formData.excerptEn}
              onChange={(e) => setFormData(f => ({ ...f, excerptEn: e.target.value }))}
              className="admin-form-input w-full resize-none"
              placeholder="Please enter English summary"
            />
          </div>
        )}

        {/* 封面图上传 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">封面图</label>
          <div className="flex items-center space-x-4">
            {formData.image && (
              <img src={formData.image} alt="" className="w-32 h-20 object-cover rounded-lg border border-gray-200 shadow-sm" />
            )}
            <button
              type="button"
              onClick={handleCoverUpload}
              disabled={uploading}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>{uploading ? '上传中...' : formData.image ? '更换封面' : '上传封面图'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>📷 媒体库</span>
            </button>
            {formData.image && (
              <button
                type="button"
                onClick={() => setFormData(f => ({ ...f, image: '' }))}
                className="text-sm text-red-600 hover:text-red-700"
              >
                移除
              </button>
            )}
          </div>
        </div>

        {/* 是否精选 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(f => ({ ...f, featured: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-sm text-gray-700">设为精选文章（显示在首页推荐）</label>
          </div>
        </div>

        {/* 状态选择 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(f => ({ ...f, status: e.target.value as 'draft' | 'published' | 'archived' }))}
            className="admin-form-input w-full"
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
            <option value="archived">归档</option>
          </select>
        </div>

        {/* SEO 设置 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO 设置</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(f => ({ ...f, slug: e.target.value }))}
                className="admin-form-input w-full"
                placeholder="例如: industrial-vending-machine-trends-2026"
              />
              <p className="text-xs text-gray-400 mt-1">仅限小写字母、数字和连字符，用于博客详情页网址。</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
              <textarea
                rows={2}
                value={formData.seoKeywords}
                onChange={(e) => setFormData(f => ({ ...f, seoKeywords: e.target.value }))}
                className="admin-form-input w-full resize-none"
                placeholder="多个关键词用逗号分隔"
              />
              <p className="text-xs text-gray-400 mt-1">用于搜索引擎优化，多个关键词用英文逗号分隔。</p>
            </div>
          </div>
        </div>

        {/* 内容（富文本，中文） */}
        {activeTab === 'zh' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">内容（中文）</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TipTapEditor
                content={formData.contentZh}
                onChange={(html) => setFormData(f => ({ ...f, contentZh: html }))}
              />
            </div>
          </div>
        )}

        {/* 内容（富文本，英文） */}
        {activeTab === 'en' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (English)</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TipTapEditor
                content={formData.contentEn}
                onChange={(html) => setFormData(f => ({ ...f, contentEn: html }))}
              />
            </div>
          </div>
        )}

        {/* 标题（阿拉伯语） */}
        {activeTab === 'ar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان (العربية)*</label>
            <input
              type="text"
              required
              value={formData.titleAr}
              onChange={(e) => setFormData(f => ({ ...f, titleAr: e.target.value }))}
              className="admin-form-input w-full"
              placeholder="أدخل العنوان باللغة العربية"
              dir="rtl"
            />
          </div>
        )}

        {/* 摘要（阿拉伯语） */}
        {activeTab === 'ar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">الملخص (العربية)</label>
            <textarea
              rows={2}
              value={formData.excerptAr}
              onChange={(e) => setFormData(f => ({ ...f, excerptAr: e.target.value }))}
              className="admin-form-input w-full resize-none"
              placeholder="أدخل ملخص المقالة (باللغة العربية)"
              dir="rtl"
            />
          </div>
        )}

        {/* 内容（富文本，阿拉伯语） */}
        {activeTab === 'ar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى (العربية)</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden" dir="rtl">
              <TipTapEditor
                content={formData.contentAr}
                onChange={(html) => setFormData(f => ({ ...f, contentAr: html }))}
              />
            </div>
          </div>
        )}

        {/* 提交 */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/admin/blog" className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            取消
          </Link>
          <button type="submit" disabled={saving}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存修改
              </>
            )}
          </button>
        </div>
      </form>

      {/* MediaPicker */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => {
          setFormData(f => ({ ...f, image: url }));
          setShowMediaPicker(false);
        }}
        fileType="image"
      />
    </div>
  );
}
