'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X, Plus, Trash2, Image as ImageIcon, FolderOpen, ExternalLink } from 'lucide-react';
import { adminApi } from '@/data/unified-data';

export const dynamic = 'force-dynamic';

export default function AddProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  // Media picker state
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [insertDescriptionField, setInsertDescriptionField] = useState<'descriptionEn' | 'descriptionZh' | 'descriptionAr' | null>(null);
  const [showDescPreview, setShowDescPreview] = useState(false);
  const [form, setForm] = useState({
    nameEn: '', nameZh: '', nameAr: '',
    sku: '', slug: '',
    price: '',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    descriptionEn: '', descriptionZh: '', descriptionAr: '',
    featuresEn: '', featuresZh: '', featuresAr: '',
    images: [] as string[],
    status: 'active' as 'active' | 'draft' | 'archived',
    featured: false,
    hidePrice: false,
    order: 0,
    specificationsEn: '',
    specificationsZh: '',
    specificationsAr: '',
    seoKeywords: '', // Added for SEO keywords
  });

  // Generate SEO keywords from product names
  const generateSeoKeywords = (): string => {
    const names = [form.nameEn, form.nameZh, form.nameAr].filter(Boolean);
    const keywords = new Set<string>();
    
    names.forEach(name => {
      // Split by spaces, commas, hyphens, etc.
      name.split(/[\s,\-–—/]+/).forEach(word => {
        word = word.toLowerCase().trim();
        // Filter out short words, pure numbers, and common stop words
        if (word.length >= 2 && 
            !/^\d+$/.test(word) && 
            !['the', 'a', 'an', 'of', 'in', 'for', 'is', 'and', '的', '了', '是'].includes(word)) {
          keywords.add(word);
        }
      });
    });
    
    // Add some generic industry keywords
    keywords.add('smart cabinet');
    keywords.add('tool management');
    keywords.add('storage solution');
    
    return Array.from(keywords).join(', ');
  };

  // Auto-generate SEO keywords when names change
  useEffect(() => {
    if (!form.seoKeywords && (form.nameEn || form.nameZh || form.nameAr)) {
      const keywords = generateSeoKeywords();
      if (keywords) {
        setForm(prev => ({ ...prev, seoKeywords: keywords }));
      }
    }
  }, [form.nameEn, form.nameZh, form.nameAr]);

  useEffect(() => {
    adminApi.getCategories().then(setCategories).catch(() => {});
    adminApi.getTags().then(setTags).catch(() => {});
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (form.nameEn && !form.slug) {
      const slug = form.nameEn.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Spaces to hyphens
        .replace(/-+/g, '-')      // Multiple hyphens to one
        .trim();
      if (slug) setForm(prev => ({ ...prev, slug }));
    }
  }, [form.nameEn]);

  // Check slug uniqueness and generate unique slug
  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}&status=all`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            // Slug exists, try with counter
            counter++;
            slug = `${baseSlug}-${counter}`;
          } else {
            // Slug is unique
            return slug;
          }
        } else {
          // Error checking, return the original slug
          return slug;
        }
      } catch (error) {
        console.error('Error checking slug uniqueness:', error);
        return slug;
      }
    }
  };

  // Auto-generate SKU from name
  useEffect(() => {
    if (form.nameEn && !form.sku) {
      const base = form.nameEn.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);
      const sku = `${base}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
      setForm(prev => ({ ...prev, sku }));
    }
  }, [form.nameEn]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (id: string) => {
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter(cid => cid !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const handleTagToggle = (id: string) => {
    setForm(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter(tid => tid !== id)
        : [...prev.tagIds, id],
    }));
  };

  // Media picker: open and load files
  const openMediaPicker = async () => {
    setShowMediaPicker(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/media/list', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data.files || []);
      }
    } catch (e) {
      console.error('Failed to load media:', e);
    }
  };

  // Select image from media picker
  const selectMediaImage = (url: string) => {
    if (insertDescriptionField) {
      // Insert into description field
      const imgTag = `<img src="${url}" alt="" style="max-width:100%;height:auto;margin:8px 0;" />`;
      setForm(prev => ({ ...prev, [insertDescriptionField]: prev[insertDescriptionField] + '\n' + imgTag }));
      setInsertDescriptionField(null);
    } else {
      // Add to images array (original behavior)
      setForm(prev => ({ ...prev, images: [...prev.images, url] }));
    }
    setShowMediaPicker(false);
  };

  // Upload file directly from this page
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const formData = new FormData();
      formData.append('file', file);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
          // Refresh media list
          const listRes = await fetch('/api/admin/media/list', { credentials: 'include' });
          if (listRes.ok) {
            const listData = await listRes.json();
            setMediaFiles(listData.files || []);
          }
        }
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nameEn || !form.sku) {
      setError('名称（英文）和 SKU 是必填项');
      return;
    }
    if (!form.slug) {
      setError('URL别名是必填项');
      return;
    }
    setSaving(true);
    try {
      // Check slug uniqueness
      const uniqueSlug = await generateUniqueSlug(form.slug);
      
      await adminApi.createProduct({
        name: { en: form.nameEn, zh: form.nameZh || form.nameEn, ar: form.nameAr || form.nameEn },
        slug: uniqueSlug,
        sku: form.sku,
        price: parseFloat(form.price) || 0,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
        description: { en: form.descriptionEn, zh: form.descriptionZh || form.descriptionEn, ar: form.descriptionAr || form.descriptionEn },
        features: {
          en: form.featuresEn.split('\n').filter(l => l.trim()),
          zh: form.featuresZh.split('\n').filter(l => l.trim()),
          ar: form.featuresAr.split('\n').filter(l => l.trim()),
        },
        images: form.images,
        status: form.status,
        featured: form.featured,
        hidePrice: form.hidePrice,
        order: form.order,
        specifications: {
          en: form.specificationsEn,
          zh: form.specificationsZh,
          ar: form.specificationsAr,
        },
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || '创建产品失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-gray-900">添加产品</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* ===== Basic Information ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名称（英文）<span className="text-red-500">*</span></label>
              <input type="text" required value={form.nameEn} onChange={e => handleChange('nameEn', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="请输入产品名称" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名称（中文）</label>
              <input type="text" value={form.nameZh} onChange={e => handleChange('nameZh', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="产品名称" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名称（阿拉伯语）</label>
              <input type="text" value={form.nameAr} onChange={e => handleChange('nameAr', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="اسم المنتج" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU编号 <span className="text-red-500">*</span></label>
              <input type="text" required value={form.sku} onChange={e => handleChange('sku', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="SKU-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL别名</label>
              <input type="text" value={form.slug} onChange={e => handleChange('slug', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="自动从名称生成" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格（$）</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => handleChange('price', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
              <input type="number" min="0" value={form.order} onChange={e => handleChange('order', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="active">启用</option>
                <option value="draft">草稿</option>
                <option value="archived">归档</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => handleChange('featured', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">推荐产品</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.hidePrice} onChange={e => handleChange('hidePrice', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">隐藏价格（联系询价）</span>
            </label>
          </div>
        </div>

        {/* ===== 分类 & 标签 ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
            分类
          </h2>
          {categories.length > 0 ? (() => {
            // Group categories by type
            const grouped = categories.reduce((acc: Record<string, typeof categories>, cat) => {
              const type = cat.type || 'other';
              if (!acc[type]) acc[type] = [];
              acc[type].push(cat);
              return acc;
            }, {} as Record<string, typeof categories>);

            const typeLabels: Record<string, string> = {
              'cabinet-type': '📁 柜型分类',
              'managed-items': '📦 管理物料',
              'industry': '🏭 行业分类',
              'custom-solution': '⚙️ 定制方案',
            };

            // Load custom dimension labels from localStorage
            const customLabels: Record<string, string> = {};
            if (typeof window !== 'undefined') {
              try {
                const saved = localStorage.getItem('admin_custom_dimensions');
                if (saved) {
                  const dims = JSON.parse(saved);
                  Object.entries(dims).forEach(([key, val]: [string, any]) => {
                    if (val && typeof val === 'object' && val.labelZh) {
                      customLabels[key] = val.labelZh;
                    } else if (typeof val === 'string') {
                      customLabels[key] = val;
                    }
                  });
                }
              } catch {}
            }

            // Clean up display name: remove emoji/icons/garbled chars
            const cleanName = (name: any): string => {
              const raw = name?.zh || name?.en || name || '';
              // Remove common garbled patterns (diamonds, icons, etc.)
              return raw.replace(/[\u25c6\u25c7\u2666\u25a0\u25cf\u25cb\u25ce\u25d8\u25d9\u2b1b\u2b1c]+/g, '').replace(/\u25c6+/g, '').trim() || raw || '未命名';
            };

            return (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(grouped).map(([type, cats]) => (
                  <div key={type}>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">
                      {typeLabels[type] || customLabels[type] || type}
                      <span className="ml-2 text-gray-300">({cats.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cats.map(cat => (
                        <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            form.categoryIds.includes(cat.id)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}>
                          {cleanName(cat.name)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })() : <p className="text-gray-400 text-sm">暂无分类</p>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
            标签
          </h2>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button type="button" key={tag.id} onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.tagIds.includes(tag.id)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                  }`}>
                  {tag.name?.zh || tag.name?.en || tag.name || '标签'}
                </button>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">暂无标签</p>}
        </div>

        {/* ===== 图片 ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
              图片（{form.images.length}）
            </h2>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploadingFile ? '上传中...' : '上传图片'}
                <input type="file" accept="image/*" onChange={handleDirectUpload} className="hidden" />
              </label>
              <button type="button" onClick={openMediaPicker}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                <FolderOpen className="w-4 h-4" /> 媒体库
              </button>
            </div>
          </div>

          {/* Media Picker Modal */}
          {showMediaPicker && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">选择图片</h3>
                  <button type="button" onClick={() => setShowMediaPicker(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  {mediaFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>暂无媒体文件，请先上传</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {mediaFiles.map((file) => (
                        <button key={file.id} type="button" onClick={() => selectMediaImage(file.url)}
                          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors group">
                          {file.url.startsWith('/api/media/') ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-2">
                              <ExternalLink className="w-8 h-8 text-gray-300" />
                              <span className="absolute bottom-0 inset-x-0 text-[10px] truncate px-1 pb-0.5 bg-black/40 text-white">{file.name}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 transition-colors flex items-center justify-center">
                            <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                  点击图片添加到产品，或使用上方"上传图片"按钮
                </div>
              </div>
            </div>
          )}
          {form.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = '/images/placeholder.png'}} />
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">{img.split('/').pop()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
              <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">点击"添加图片链接"来添加产品图片</p>
              <p className="text-xs mt-1">提示：请先从媒体库上传图片，然后复制链接到这里</p>
            </div>
          )}
        </div>

        {/* ===== Description ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-cyan-600 rounded-full"></span>
            描述
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">描述（英文）</label>
                <button type="button" onClick={() => { setInsertDescriptionField('descriptionEn'); openMediaPicker(); }} 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> 插入图片
                </button>
              </div>
              <textarea value={form.descriptionEn} onChange={e => handleChange('descriptionEn', e.target.value)} rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full product description in English... You can insert images using the button above." />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">描述（中文）</label>
                <button type="button" onClick={() => { setInsertDescriptionField('descriptionZh'); openMediaPicker(); }} 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> 插入图片
                </button>
              </div>
              <textarea value={form.descriptionZh} onChange={e => handleChange('descriptionZh', e.target.value)} rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="产品详细描述... 可以使用上方按钮插入图片" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">描述（阿拉伯语）</label>
                <button type="button" onClick={() => { setInsertDescriptionField('descriptionAr'); openMediaPicker(); }} 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> 插入图片
                </button>
              </div>
              <textarea value={form.descriptionAr} onChange={e => handleChange('descriptionAr', e.target.value)} rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="وصف المنتج بالتفصيل... يمكنك إدراج الصور باستخدام الزر أعلاه" dir="rtl" />
            </div>

            {/* Description Preview Toggle */}
            {(form.descriptionEn || form.descriptionZh) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowDescPreview(!showDescPreview)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mb-2">
                  {showDescPreview ? '▼ 隐藏预览' : '▶ 预览效果（HTML渲染）'}
                </button>
                {showDescPreview && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.descriptionEn && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-1">English Preview:</p>
                        <div className="prose prose-xs max-w-none" dangerouslySetInnerHTML={{ __html: form.descriptionEn }} />
                      </div>
                    )}
                    {form.descriptionZh && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-1">中文预览：</p>
                        <div className="prose prose-xs max-w-none" dangerouslySetInnerHTML={{ __html: form.descriptionZh }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== Features ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            主要特点（每行一个）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">特点（英文）</label>
              <textarea value={form.featuresEn} onChange={e => handleChange('featuresEn', e.target.value)} rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                placeholder={"RFID Auto-Tracking\nReal-Time Inventory\nClosed-Loop Management"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">特点（中文）</label>
              <textarea value={form.featuresZh} onChange={e => handleChange('featuresZh', e.target.value)} rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder={"RFID 自动追踪\n实时库存监控\n闭环管理"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">特点（阿拉伯语）</label>
              <textarea value={form.featuresAr} onChange={e => handleChange('featuresAr', e.target.value)} rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder={"تتبع RFID آلي\nمراقبة المخزون في الوقت الفعلي\nإدارة الحلقة المغلقة"} dir="rtl" />
            </div>
          </div>
        </div>

        {/* ===== Specifications ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
            规格参数 (Specifications)
          </h2>
          <p className="text-sm text-gray-500 mb-3">产品技术参数，支持三语言（可用 HTML 表格）</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specifications (EN)</label>
              <textarea
                value={form.specificationsEn}
                onChange={e => handleChange('specificationsEn', e.target.value)}
                rows={5}
                placeholder={"Dimensions: 800x600x450mm\nCapacity: 80 tool types\nPower: AC 220V 50Hz\nWeight: 180kg"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">规格参数 (中文)</label>
              <textarea
                value={form.specificationsZh}
                onChange={e => handleChange('specificationsZh', e.target.value)}
                rows={5}
                placeholder={"尺寸：800x600x450mm\n容量：80种刀具类型\n电源：AC 220V 50Hz\n重量：180kg"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المواصفات (AR)</label>
              <textarea
                value={form.specificationsAr}
                onChange={e => handleChange('specificationsAr', e.target.value)}
                rows={5}
                placeholder={"الأبعاد: 800×600×450 مم\nالسعة: 80 نوع من الأدوات\nالطاقة: AC 220V 50Hz\nالوزن: 180 كجم"}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* ===== SEO Keywords ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
            SEO 关键词
          </h2>
          <p className="text-sm text-gray-500 mb-3">基于产品名称自动生成，可手动修改</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
            <textarea
              value={form.seoKeywords}
              onChange={e => handleChange('seoKeywords', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="smart cabinet, tool management, storage solution"
            />
            <button
              type="button"
              onClick={() => {
                const keywords = generateSeoKeywords();
                if (keywords) {
                  handleChange('seoKeywords', keywords);
                }
              }}
              className="mt-2 px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            >
              重新生成关键词
            </button>
          </div>
        </div>

        {/* ===== Submit ===== */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/admin/products" className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            取消
          </Link>
          <button type="submit" disabled={saving}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium">
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存产品
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
