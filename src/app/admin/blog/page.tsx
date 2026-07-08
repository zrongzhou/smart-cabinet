'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft, Star, StarOff, Search, X, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Pagination state
  const [blogPage, setBlogPage] = useState(1);
  const BLOG_PER_PAGE = 10;

  // Debounce search
  useEffect(() => {
    setBlogPage(1);
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

      const postsData = await fetchUnifiedBlogs();
      setPosts(postsData);

      const categoriesData = await fetchUnifiedCategories();
      setCategories(categoriesData);

      try {
        const tagsData = await adminApi.getTags();
        setTags(tagsData || []);
      } catch (tagErr: any) {
        console.warn('[blog] Failed to load tags from API:', tagErr);
        setTags([]);
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
        if ((blogPage - 1) * BLOG_PER_PAGE >= posts.length - 1) {
          setBlogPage(p => Math.max(1, p - 1));
        }
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

  // Pagination
  const totalBlogPages = Math.max(1, Math.ceil(filteredPosts.length / BLOG_PER_PAGE));
  const paginatedPosts = filteredPosts.slice((blogPage - 1) * BLOG_PER_PAGE, blogPage * BLOG_PER_PAGE);

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
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 text-base">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回仪表盘
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">博客管理</h1>
          <p className="text-gray-600 mt-2 text-lg">管理系统中的所有文章，支持富文本编辑、分类和标签。</p>
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
            href="/admin/blog/add"
            className="btn-primary flex items-center space-x-2.5 text-base py-3.5 px-6"
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
          <div className="admin-card mb-8 p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章标题..."
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
            <div className="mt-4 text-sm text-gray-500">
              共 <span className="font-semibold text-gray-700">{filteredPosts.length}</span> 篇文章
              {filteredPosts.length > BLOG_PER_PAGE && (
                <span className="ml-2">（第 {blogPage} / {totalBlogPages} 页）</span>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paginatedPosts.map((post) => (
                  <div key={post.id} className="flex gap-4 p-4 border border-gray-200 rounded-2xl hover:shadow-md hover:border-blue-200 transition-all bg-white">
                    {/* Cover */}
                    <div className="flex-shrink-0">
                      {post.image ? (
                        <img src={post.image} alt="" className="w-32 h-32 object-cover rounded-xl shadow-sm" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Body */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-base">{post.title.zh}</div>
                          <div className="text-sm text-gray-500 truncate">{post.title.en}</div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => toggleStatus(post.id)}
                            className={post.status === 'published' ? 'admin-badge admin-badge-success cursor-pointer hover:opacity-80' : 'admin-badge admin-badge-warning cursor-pointer hover:opacity-80'}
                          >
                            {post.status === 'published' ? '已发布' : '草稿'}
                          </button>
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
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                        {truncateText(post.excerpt?.zh || post.content?.zh || '暂无摘要', 120)}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {getCategoryName(post.category)}
                        </span>
                        {post.tags && post.tags.length > 0 && post.tags.slice(0, 3).map(rel => {
                          const tag = tags.find(t => t.id === rel.tagId);
                          return tag ? (
                            <span key={rel.tagId} className="px-2.5 py-1 text-xs rounded-lg" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                              {tag.nameZh || tag.nameEn}
                            </span>
                          ) : null;
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(post.slug || '')}
                            className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 font-mono bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-md px-2 py-1 transition-colors"
                            title="点击复制 Slug"
                          >
                            <span className="max-w-[140px] truncate">{post.slug || '-'}</span>
                            <span>📋</span>
                          </button>
                          <span suppressHydrationWarning>{new Date(post.updatedAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/blog/edit/${post.id}`}
                            className="admin-btn-action-edit"
                            title="编辑"
                          >
                            <Pencil className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="admin-btn-action-delete"
                            title="删除"
                            disabled={saving}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalBlogPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setBlogPage(p => Math.max(1, p - 1))}
                    disabled={blogPage === 1}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一页
                  </button>
                  {Array.from({ length: totalBlogPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setBlogPage(page)}
                      className={page === blogPage
                        ? 'px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg'
                        : 'px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setBlogPage(p => Math.min(totalBlogPages, p + 1))}
                    disabled={blogPage === totalBlogPages}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="admin-card text-center py-16 text-gray-400">
              <svg className="w-20 h-20 mx-auto mb-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">暂无文章，点击"写文章"按钮创建。</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
