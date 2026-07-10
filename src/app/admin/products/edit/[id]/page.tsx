'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Upload, X, Plus, Image as ImageIcon, FolderOpen, ExternalLink, PackageX } from 'lucide-react';
import { adminApi } from '@/data/unified-data';
import ProductFaqBlock from '@/components/admin/ProductFaqBlock';
import ProductSpecsBlock from '@/components/admin/ProductSpecsBlock';
import { normalizeSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

// Clean garbled unicode characters from category names
function cleanName(text: string | undefined | null): string {
  if (!text) return '';
  // Remove emoji, symbols, diamond chars, control characters, and mojibake patterns
  return text
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{25A0}-\u{25FF}\u{2702}-\u{27B0}◆◆●■▲▼♦♠♣♥★☆⚙️🗄️📦🏭📁]/gu, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Remove common mojibake patterns: v72 followed by non-ASCII, repeated diamonds
    .replace(/v\d+[\x80-\uffff]+/gi, '')
    .replace(/[◆●■▲▼♦]{3,}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 安全读取三语字段的某语言值，避免把数组/数字/嵌套对象直接塞进输入框触发
// React "Expected value to be a string" 崩溃。兼容 product.name 的多种形态：
//   - {en, zh, ar} 对象 -> 取对应语言值
//   - 纯字符串        -> 原样返回（三种语言用同一串）
//   - 数字            -> 转字符串
//   - 数组            -> 逗号分隔串
//   - null / undefined / 其它 -> 空串
function mlFieldToStr(field: any, lang: 'en' | 'zh' | 'ar'): string {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'number') return String(field);
  if (Array.isArray(field)) return field.filter((x: any) => x != null).map((x: any) => String(x)).join(', ');
  if (typeof field === 'object') {
    const v = (field as any)[lang];
    if (Array.isArray(v)) return v.filter((x: any) => x != null).map((x: any) => String(x)).join(', ');
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return '';
  }
  return '';
}

// 安全读取三语「多行」字段（如 features），兼容以下形态：
//   - 数组        -> 元素转字符串后以换行 join
//   - 字符串      -> 原样
//   - 数字        -> 转字符串
//   - {en,zh,ar} 对象 -> 取第一个存在的语言值（整对象被误传时的兜底）
//   - null / undefined / 其它 -> 空串
function mlFieldLines(raw: any): string {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  if (Array.isArray(raw)) return raw.filter((x: any) => x != null).map((x: any) => String(x)).join('\n');
  if (typeof raw === 'object') {
    const values = Object.values(raw).filter((v: any) => v != null);
    const first = values[0];
    if (typeof first === 'string') return first;
    if (Array.isArray(first)) return first.filter((x: any) => x != null).map((x: any) => String(x)).join('\n');
  }
  return '';
}

/**
 * Best-effort migration of the legacy `specifications` field ({en,zh,ar} freeform
 * text) into the canonical `specs` shape ([{param, value}]). Used on edit load so
 * old products keep their parameters after we stop writing `specifications`.
 * Each non-empty line is split on the first ":" / "：" into param + value.
 */
function migrateSpecificationsToSpecs(specifications: any): { param: string; value: string }[] {
  if (!specifications) return [];
  const text =
    (typeof specifications === 'string' && specifications) ||
    (specifications && typeof specifications === 'object' && (specifications.en || specifications.zh || specifications.ar)) ||
    '';
  if (typeof text !== 'string' || !text.trim()) return [];
  const rows: { param: string; value: string }[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const sep = line.includes('：') ? '：' : line.includes(':') ? ':' : null;
    if (!sep) {
      rows.push({ param: line, value: '' });
      continue;
    }
    const idx = line.indexOf(sep);
    const param = line.slice(0, idx).trim();
    const value = line.slice(idx + sep.length).trim();
    if (param) rows.push({ param, value });
  }
  return rows;
}

// 安全读取实体（分类/标签等）的展示名，避免把 trilingual 对象直接作为 React 子元素渲染，
// 触发 "Objects are not valid as a React child"（React Error #31，会导致组件崩溃、
// 被外层 catch 误判为"未找到产品"）。
// 解析优先级：顶层 nameEn/nameZh/nameAr（部分接口形态） → name 字段（字符串或 trilingual 对象）。
function entityName(entity: any, fallback: string = ''): string {
  if (!entity) return fallback;
  if (typeof entity.nameEn === 'string' && entity.nameEn) return entity.nameEn;
  if (typeof entity.nameZh === 'string' && entity.nameZh) return entity.nameZh;
  if (typeof entity.nameAr === 'string' && entity.nameAr) return entity.nameAr;
  const n = entity.name;
  if (typeof n === 'string' && n) return n;
  if (n && typeof n === 'object') {
    const v = n.en || n.zh || n.ar;
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
  }
  return fallback;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // 标记单条产品是否真正加载成功；为 false 时（未找到 / 加载异常）渲染友好的错误页而非表单，
  // 避免拿到 null/畸形数据时仍尝试渲染表单导致白屏。
  const [productFound, setProductFound] = useState(false);
  // 当访问的 id 在 DB 中不存在（如用户从书签/历史打开的旧链接）时，
  // 记录第一个有效产品的 id，提供「一键跳转到第一个产品」的逃生出口，
  // 避免用户卡在死页面、无法回到正常工作流。
  const [firstProductId, setFirstProductId] = useState<string | null>(null);
  const [redirectingToFirst, setRedirectingToFirst] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  // Media picker state
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [insertDescriptionField, setInsertDescriptionField] = useState<'descriptionEn' | 'descriptionZh' | 'descriptionAr' | null>(null);
  const [showDescPreview, setShowDescPreview] = useState(false);
  const [form, setForm] = useState({
    nameEn: '',
    nameZh: '',
    nameAr: '',
    sku: '',
    price: '',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    descriptionEn: '',
    descriptionZh: '',
    descriptionAr: '',
    featuresEn: '',
    featuresZh: '',
    featuresAr: '',
    images: [] as string[],
    // 与 Prisma Product.status（String）实际取值保持一致：active/draft/coming-soon/discontinued
    // 原类型 'active' | 'inactive' | 'coming-soon' 与 DB 不符，且 'inactive' 并非合法产品状态。
    status: 'active' as 'active' | 'draft' | 'coming-soon' | 'discontinued',
    featured: false,
    hidePrice: false,
    order: 0,
    slug: '',
    specificationsEn: '',
    specificationsZh: '',
    specificationsAr: '',
    // Canonical specs field (V8.6, [{param, value}]) — what the frontend detail page renders.
    specs: [] as { param: string; value: string }[],
    seoKeywords: '', // Added for SEO keywords
  });

  // Track if auto-fill has been done (to avoid re-running on subsequent edits)
  const autoFilledRef = useRef(false);

  // Auto-generate slug and SKU from name (only once on initial load)

  // Generate SEO keywords from product names
  const generateSeoKeywords = (): string => {
    const names = [form.nameEn, form.nameZh, form.nameAr].filter(Boolean);
    const keywords = new Set<string>();
    
    names.forEach(name => {
      name.split(/[\s,\-–—/]+/).forEach(word => {
        word = word.toLowerCase().trim();
        if (word.length >= 2 && 
            !/^\d+$/.test(word) && 
            !['the', 'a', 'an', 'of', 'in', 'for', 'is', 'and', '的', '了', '是'].includes(word)) {
          keywords.add(word);
        }
      });
    });
    
    keywords.add('smart cabinet');
    keywords.add('tool management');
    keywords.add('storage solution');
    
    return Array.from(keywords).join(', ');
  };

  // Check slug uniqueness and generate unique slug (excluding current product).
  // P0: normalize the base slug first so the stored slug matches the link slug.
  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let slug = normalizeSlug(baseSlug);
    let counter = 1;
    
    while (true) {
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}&status=all`);
        if (res.ok) {
          const json = await res.json();
          const existingProduct = json.data?.[0];
          
          // If product exists and it's not the current product, slug conflicts
          if (existingProduct && existingProduct.id !== productId) {
            counter++;
            slug = `${baseSlug}-${counter}`;
          } else {
            // Slug is unique or belongs to current product
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

  // Auto-generate SEO keywords when names change
  useEffect(() => {
    if (!form.seoKeywords && (form.nameEn || form.nameZh || form.nameAr)) {
      const keywords = generateSeoKeywords();
      if (keywords) {
        setForm(prev => ({ ...prev, seoKeywords: keywords }));
      }
    }
  }, [form.nameEn, form.nameZh, form.nameAr]);

  // Auto-generate slug and SKU from name (only once on initial load)
  useEffect(() => {
    if (!loading && !autoFilledRef.current && form.nameEn) {
      autoFilledRef.current = true;
      
      // Auto-generate SKU if empty
      if (!form.sku) {
        const base = form.nameEn.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);
        const sku = `${base}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
        setForm(prev => ({ ...prev, sku }));
      }
      
      // Auto-generate slug if empty
      if (!form.slug) {
        const slug = form.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (slug) setForm(prev => ({ ...prev, slug }));
      }
    }
  }, [loading, form.nameEn]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 分类/标签仍需全量；产品则直接按 id 拉取（避免分页漏数据导致"未找到产品"）
        const [cats, allTags] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getTags(),
        ]);
        setCategories(cats);
        setTags(allTags);

        // 直接按 id 查询单条产品（/api/admin/products?id= 已支持单条返回）
        // 使用正确的登录 token key（admin_token）并附带 cookie 鉴权，
        // 修复因误用 adminToken 导致 Bearer 为空、鉴权失败而"未找到产品"的问题。
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
        const prodRes = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        if (!prodRes.ok) {
          // [DEBUG] 记录鉴权/接口错误，便于线上排查"未找到产品"
          console.log('[EditProduct] load() HTTP error:', {
            productId,
            status: prodRes.status,
            statusText: prodRes.statusText,
          });
          throw new Error('加载产品失败');
        }
        const prodJson = await prodRes.json();
        // [DEBUG] 输出关键诊断信息（productId / 状态码 / 返回体前 200 字符），
        // 便于线上排查"未找到产品"问题，不改动既有解析与错误处理逻辑。
        console.log('[EditProduct] load() response:', {
          productId,
          status: prodRes.status,
          ok: prodRes.ok,
          bodyPreview: (() => {
            try { return JSON.stringify(prodJson).slice(0, 200); } catch { return '(unserializable)'; }
          })(),
        });
        // 兼容多种返回形态：数组 / { data:[...] } / 单对象
        const product = Array.isArray(prodJson)
          ? prodJson[0]
          : (prodJson.data && prodJson.data.length ? prodJson.data[0] : (prodJson && prodJson.id ? prodJson : null));
        if (!product) {
          setProductFound(false);
          setError('未找到产品');
          // 当前 id 在数据库中不存在（多半是书签/历史里的旧链接）。
          // 拉取第一个有效产品，提供「一键跳转」逃生出口，避免用户卡死在错误页。
          try {
            const listRes = await fetch('/api/admin/products?pageSize=1', {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              credentials: 'include',
            });
            if (listRes.ok) {
              const listJson = await listRes.json();
              const first = Array.isArray(listJson)
                ? listJson[0]
                : (listJson.data && listJson.data[0]);
              if (first && first.id) setFirstProductId(first.id);
            }
          } catch {
            /* 获取失败不影响错误页展示，仅不显示「跳转到第一个产品」按钮 */
          }
          return;
        }

        // 畸形数据兜底：即便 API 返回了"非 null"但字段缺失/类型异常的对象，
        // 下方所有 mlFieldToStr / mlFieldLines 调用都已做防御，不会抛异常。
        setForm({
          nameEn: mlFieldToStr(product.name, 'en'),
          nameZh: mlFieldToStr(product.name, 'zh'),
          nameAr: mlFieldToStr(product.name, 'ar'),
          sku: product.sku != null ? String(product.sku) : '',
          price: product.price != null ? String(product.price) : '',
          // Fix: Extract IDs from categories/tags objects
          categoryIds: Array.isArray((product as any).categoryIds)
            ? (product as any).categoryIds
            : Array.isArray(product.categories)
              ? product.categories.map((c: any) => c?.id).filter(Boolean)
              : [],
          tagIds: Array.isArray((product as any).tagIds)
            ? (product as any).tagIds
            : Array.isArray(product.tags)
              ? product.tags.map((t: any) => t?.id).filter(Boolean)
              : [],
          descriptionEn: mlFieldToStr(product.description, 'en'),
          descriptionZh: mlFieldToStr(product.description, 'zh'),
          descriptionAr: mlFieldToStr(product.description, 'ar'),
          featuresEn: mlFieldLines(product.features?.en),
          featuresZh: mlFieldLines(product.features?.zh),
          featuresAr: mlFieldLines(product.features?.ar),
          specificationsEn: mlFieldToStr(product.specifications, 'en'),
          specificationsZh: mlFieldToStr(product.specifications, 'zh'),
          specificationsAr: mlFieldToStr(product.specifications, 'ar'),
          // Canonical specs: prefer product.specs (the field the frontend renders).
          // If empty but the legacy `specifications` has data, migrate it so old
          // products keep their parameters after `specifications` is deprecated.
          specs: Array.isArray(product.specs) && product.specs.length > 0
            ? product.specs
                .filter((row: any) => row && (row.param || row.value))
                .map((row: any) => ({
                  param: typeof row.param === 'string' ? row.param : String(row.param ?? ''),
                  value: typeof row.value === 'string' ? row.value : (row.value ? String(row.value) : ''),
                }))
            : migrateSpecificationsToSpecs(product.specifications),
          images: Array.isArray(product.images) ? product.images.filter((x: any) => typeof x === 'string') : [],
          slug: product.slug != null ? String(product.slug) : '',
          status: typeof product.status === 'string' ? product.status : 'active',
          featured: !!product.featured,
          hidePrice: !!product.hidePrice,
          order: typeof product.order === 'number' ? product.order : 0,
          // seoKeywords：DB 存为 {en:string[],zh:string[],ar:string[]}（数组形态）或字符串或 null；
          // 编辑框需要纯字符串，故当 .en 为数组时 join 为逗号分隔串回填，避免 <input value={数组}> 崩溃。
          // 也兼容 .en 为数字/嵌套对象的畸形情况。
          seoKeywords: (() => {
            const sk = product.seoKeywords;
            if (typeof sk === 'string') return sk;
            if (sk && Array.isArray(sk.en)) return sk.en.filter((x: any) => x != null).map((x: any) => String(x)).join(', ');
            if (sk && typeof sk.en === 'string') return sk.en;
            if (sk && typeof sk.en === 'number') return String(sk.en);
            if (typeof sk === 'number') return String(sk);
            return '';
          })(),
        });
        setProductFound(true);
      } catch (err: any) {
        setProductFound(false);
        setError(err?.message || '加载产品失败');
      } finally {
        setLoading(false);
      }
    };
    if (productId) load();
  }, [productId]);

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
    setSaving(true);
    try {
      // Check slug uniqueness (P0: form.slug is normalized inside generateUniqueSlug)
      const slug = form.slug || form.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'product-' + Date.now();
      const uniqueSlug = await generateUniqueSlug(slug);
      
      await adminApi.updateProduct(productId, {
        name: { en: form.nameEn, zh: form.nameZh, ar: form.nameAr },
        slug: uniqueSlug,
        sku: form.sku,
        price: parseFloat(form.price) || 0,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
        description: { en: form.descriptionEn, zh: form.descriptionZh, ar: form.descriptionAr },
        features: {
          en: form.featuresEn.split('\n').filter(l => l.trim()),
          zh: form.featuresZh.split('\n').filter(l => l.trim()),
          ar: form.featuresAr.split('\n').filter(l => l.trim()),
        },
        // Canonical specs (V8.6) — the field the frontend detail page renders.
        // Legacy `specifications` is intentionally no longer written (deprecated).
        specs: form.specs.filter(s => s.param.trim() !== ''),
        images: form.images,
        status: form.status,
        featured: form.featured,
        hidePrice: form.hidePrice,
        order: form.order,
        // SEO 关键词：存为三语对象，使 buildProductMetadata 能渲染到 <meta keywords>
        seoKeywords: {
          en: form.seoKeywords,
          zh: form.seoKeywords,
          ar: form.seoKeywords,
        },
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || '更新产品失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 未找到产品 / 加载异常：渲染友好的错误页（带返回按钮），不再尝试渲染表单，
  // 避免拿到 null/畸形数据时仍渲染表单导致白屏。
  if (error || !productFound) {
    const jumpToFirst = () => {
      if (!firstProductId) return;
      setRedirectingToFirst(true);
      router.push(`/admin/products/edit/${firstProductId}`);
    };
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <PackageX className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">产品未找到</h1>
          <p className="text-sm text-gray-500 mb-2">
            {error || '未能加载该产品，它可能已被删除或链接无效。'}
          </p>
          {productId && (
            <p className="text-xs text-gray-400 mb-6 font-mono break-all">
              无效的产品 ID：{productId}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {firstProductId && (
              <button
                type="button"
                onClick={jumpToFirst}
                disabled={redirectingToFirst}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {redirectingToFirst ? '跳转中...' : '跳转到第一个有效产品'}
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              返回产品列表
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">编辑产品</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名称（英文） <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.nameEn}
                onChange={e => handleChange('nameEn', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入产品名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名称（中文）</label>
              <input
                type="text"
                value={form.nameZh}
                onChange={e => handleChange('nameZh', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="产品名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名称（阿拉伯语）</label>
              <input
                type="text"
                value={form.nameAr}
                onChange={e => handleChange('nameAr', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="اسم المنتج"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU编号 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={e => handleChange('sku', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SKU-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL别名</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => handleChange('slug', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="自动从名称生成"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格（$）</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
              <input
                type="number"
                min="0"
                value={form.order}
                onChange={e => handleChange('order', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">启用 (Active)</option>
                <option value="draft">草稿 (Draft)</option>
                <option value="coming-soon">即将推出 (Coming Soon)</option>
                <option value="discontinued">已停售 (Discontinued)</option>
                {/* 兜底：若 DB 中存在非预期 status 值，仍保留当前值作为 option，
                    避免受控 <select> 的 value 与所有 option 都不匹配导致渲染异常/白屏 */}
                {!['active', 'draft', 'coming-soon', 'discontinued'].includes(form.status) && form.status && (
                  <option value={form.status}>{form.status}</option>
                )}
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

        {/* Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-600 rounded-full"></span>
            分类
          </h2>
          {categories.length > 0 ? (() => {
            // 仅显示子分类(L2, parentId 有值)；L1 容器不进入产品多选。
            // 分组标题改用其 L1 parent 的真实英文名（从 categories 推导），不再硬编码中文。
            const parentMap: Record<string, any> = {};
            categories.forEach((c: any) => { if (!c.parentId) parentMap[c.id] = c; });

            const grouped = categories.reduce((acc: Record<string, any[]>, cat: any) => {
              if (!cat.parentId) return acc; // 跳过 L1 容器
              const parentId = cat.parentId;
              const groupKey = parentId || (cat.type || 'other');
              if (!acc[groupKey]) acc[groupKey] = [];
              acc[groupKey].push(cat);
              return acc;
            }, {} as Record<string, any[]>);

            const groupLabel = (groupKey: string): string => {
              const parent = parentMap[groupKey];
              // 用安全解析读取 L1 父级展示名：优先顶层 nameEn/nameZh/nameAr，
              // 其次 trilingual 对象 name.en/zh/ar。绝不直接返回对象，
              // 否则 React 会抛 "Objects are not valid as a React child"（Error #31）。
              if (parent) return entityName(parent, groupKey);
              return groupKey;
            };

            return (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(grouped).map(([groupKey, cats]) => (
                  <div key={groupKey}>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">
                      {groupLabel(groupKey)}
                      <span className="ml-2 text-gray-300">({cats.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cats.map((cat: any) => (
                        <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            form.categoryIds.includes(cat.id)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}>
                          {cleanName(cat.name?.en) || cleanName(cat.name?.zh) || cleanName(String(cat.name)) || '分类'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })() : <p className="text-gray-400 text-sm">暂无分类</p>}
        </div>

        {/* Tags */}
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
                  {entityName(tag, '标签')}
                </button>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">暂无标签</p>}
        </div>

        {/* Images */}
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
              <p className="text-sm">点击"上传图片"或"媒体库"来添加产品图片</p>
            </div>
          )}
        </div>

        {/* Description */}
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
              <textarea
                value={form.descriptionEn}
                onChange={e => handleChange('descriptionEn', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full product description in English... You can insert images using the button above."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">描述（中文）</label>
                <button type="button" onClick={() => { setInsertDescriptionField('descriptionZh'); openMediaPicker(); }} 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> 插入图片
                </button>
              </div>
              <textarea
                value={form.descriptionZh}
                onChange={e => handleChange('descriptionZh', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="产品详细描述... 可以使用上方按钮插入图片"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">描述（阿拉伯语）</label>
                <button type="button" onClick={() => { setInsertDescriptionField('descriptionAr'); openMediaPicker(); }} 
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> 插入图片
                </button>
              </div>
              <textarea
                value={form.descriptionAr}
                onChange={e => handleChange('descriptionAr', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="وصف المنتج بالتفصيل... يمكنك إدراج الصور باستخدام الزر أعلاه"
                dir="rtl"
              />
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

        {/* Features - 功能特点 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">功能特点 (Features)</h2>
          <p className="text-sm text-gray-500 mb-3">每行一个特点，支持三语言</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (EN)</label>
              <textarea
                value={form.featuresEn}
                onChange={e => handleChange('featuresEn', e.target.value)}
                rows={4}
                placeholder={"RFID automatic identification\nReal-time inventory tracking\nSmart alarm system"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">功能特点 (中文)</label>
              <textarea
                value={form.featuresZh}
                onChange={e => handleChange('featuresZh', e.target.value)}
                rows={4}
                placeholder={"RFID自动识别\n实时库存追踪\n智能报警系统"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الميزات (AR)</label>
              <textarea
                value={form.featuresAr}
                onChange={e => handleChange('featuresAr', e.target.value)}
                rows={4}
                placeholder={"تعريف RFID تلقائي\nتتبع المخزون في الوقت الفعلي\nنظام إنذار ذكي"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Specifications - canonical specs field (V8.6, [{param, value}]) */}
        <ProductSpecsBlock
          value={form.specs}
          onChange={(next) => handleChange('specs', next)}
        />

        {/* ===== SEO Keywords ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
            SEO 关键词
          </h2>
          <p className="text-sm text-gray-500 mb-3">基于产品名称自动生成，可手动修改</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Keywords
              <span className="text-xs text-gray-400 font-normal ml-1">(基于产品名称自动生成)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.seoKeywords || ''}
                onChange={(e) => handleChange('seoKeywords', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="smart cabinet, tool management, robot"
              />
              <button
                type="button"
                onClick={() => {
                  const keywords = generateSeoKeywords();
                  if (keywords) {
                    handleChange('seoKeywords', keywords);
                  }
                }}
                className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap"
              >
                重新生成
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">用逗号分隔多个关键词</p>
          </div>
        </div>

        {/* ===== Product FAQ (per-product) ===== */}
        <ProductFaqBlock productId={productId} />

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? '保存中...' : (
              <>
                <Save className="w-4 h-4" />
                更新产品
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
