'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft, Star, StarOff, Search, X, Loader2, AlertCircle } from 'lucide-react';
import { fetchUnifiedBlogs, fetchUnifiedCategories, adminApi, type BlogPostAPI } from '@/data/unified-data';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

// Use BlogPostAPI type from unified-data
type BlogPost = BlogPostAPI;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load posts from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch blogs from API
      const postsData = await fetchUnifiedBlogs();
      setPosts(postsData);

      // Fetch categories from API
      const categoriesData = await fetchUnifiedCategories();
      setCategories(categoriesData);

      // Load tags from localStorage
      if (typeof window !== 'undefined') {
        const savedTags = localStorage.getItem('admin_tags');
        if (savedTags) {
          setTags(JSON.parse(savedTags));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      try {
        setSaving(true);
        await adminApi.deleteBlog(id);
        setPosts(posts.filter(p => p.id !== id));
      } catch (err: any) {
        setError(err.message || '删除文章失败');
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleStatus = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
      const updated = await adminApi.updateBlog(id, {
        ...post,
        status: post.status === 'published' ? 'draft' : 'published',
        updatedAt: new Date().toISOString(),
      });
      setPosts(posts.map(p => p.id === id ? updated : p));
    } catch (err: any) {
      setError(err.message || '更新文章失败');
    }
  };

  const toggleFeatured = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    try {
      const updated = await adminApi.updateBlog(id, {
        ...post,
        featured: !post.featured,
        updatedAt: new Date().toISOString(),
      });
      setPosts(posts.map(p => p.id === id ? updated : p));
    } catch (err: any) {
      setError(err.message || '更新文章失败');
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(p =>
    p.title.zh.toLowerCase().includes(searchDebounced.toLowerCase()) ||
    p.title.en.toLowerCase().includes(searchDebounced.toLowerCase())
  );

  // Get category name
  const getCategoryName = (slug?: string) => {
    if (!slug) return '未分类';
    const cat = categories.find(c => c.slug === slug);
    return cat ? (cat.nameZh || cat.nameEn || slug) : slug;
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

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
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回仪表盘
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">博客管理</h1>
          <p className="text-gray-600 mt-1">管理系统中的所有文章，支持富文本编辑、分类和标签。</p>
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
            href="/admin/blog/add"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>写文章</span>
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
          {/* Search Bar */}
          <div className="admin-card mb-6 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章标题..."
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

          {/* Posts List */}
          <div className="admin-card overflow-hidden">
            {filteredPosts.length > 0 ? (
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">封面图</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">文章标题</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">摘要预览</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">分类</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">状态</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">精选</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">更新时间</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post, index) => (
                    <tr
                      key={post.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition-colors duration-150`}
                    >
                      <td className="px-6 py-4">
                        {post.image ? (
                          <img src={post.image} alt="" className="w-16 h-12 object-cover rounded-lg shadow-sm" />
                        ) : (
                          <div className="w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 mb-1">{post.title.zh}</div>
                        <div className="text-sm text-gray-500">{post.title.en}</div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {post.tags.slice(0, 3).map(rel => {
                              const tag = tags.find(t => t.id === rel.tagId);
                              return tag ? (
                                <span key={rel.tagId} className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                                  {tag.nameZh || tag.nameEn}
                                </span>
                              ) : null;
                            })}
                            {post.tags.length > 3 && <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {truncateText(post.excerpt?.zh || post.content?.zh || '暂无摘要', 100)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {getCategoryName(post.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(post.id)}
                          className={post.status === 'published' ? 'badge-active cursor-pointer hover:opacity-80' : 'badge-warning cursor-pointer hover:opacity-80'}
                        >
                          {post.status === 'published' ? '已发布' : '草稿'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFeatured(post.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                          title={post.featured ? '取消精选' : '设为精选'}
                        >
                          {post.featured ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600" suppressHydrationWarning>
                        {new Date(post.updatedAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/blog/edit/${post.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
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
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>暂无文章，点击"写文章"按钮创建。</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
