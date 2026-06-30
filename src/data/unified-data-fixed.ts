/**
 * Shared data hooks for reading/writing admin-managed content
 *
 * This module provides a unified data layer that:
 * 1. Reads from API (preferred) with localStorage fallback
 * 2. Falls back to static default data
 * 3. Works on both client and server (SSR-safe)
 *
 * Sync functions (getUnified*) are for SSR pages
 * Async functions (fetchUnified*) are for client-side/admin pages
 */

// Inline Product interface to avoid webpack resolution issues
interface Product {
  id: string;
  name: { en: string; zh: string; ar: string };
  slug: string;
  sku: string;
  categories: string[];
  tags: string[];
  description: { en: string; zh: string; ar: string };
  features: { en: string[]; zh: string[]; ar: string[] };
  price: number;
  images: string[];
  status: 'active' | 'inactive' | 'coming-soon';
  featured: boolean;
  hidePrice?: boolean;
  specs?: { [key: string]: { en: string; zh: string; ar: string } };
  relatedProducts?: string[];
}

// Inline products data to avoid webpack resolution issues
const products: Product[] = [
  {
    id: '1',
    name: { en: 'CNC Tool Smart Cabinet QT-DL80-48 - 80 Tool Types 48 Compartments', zh: 'CNC刀具智能柜 QT-DL80-48 - 80种刀具类型48格管理', ar: 'QT-DL80-48' },
    slug: 'cnc-tool-smart-cabinet-qt-dl80-48', sku: 'QT-DL80-48',
    categories: ['cabinet-1'],
    tags: ['CNC tool cabinet','RFID smart management','cutting tool','automated cabinet','刀具智能柜','CNC刀具管理','80 tool types','48 compartments'],
    description: {
      en: 'Professional CNC Tool Smart Cabinet with 80 Tool Types Management and 48 Multi-Purpose Storage Compartments. Features RFID automatic identification, real-time inventory monitoring, and complete tool lifecycle tracking.',
      zh: '专业CNC刀具智能柜，支持80种刀具类型管理和48个多功能存储格位。配备RFID自动识别、实时库存监控和完整刀具生命周期追踪功能。',
      ar: 'Professional CNC Tool Smart Cabinet with RFID.',
    },
    features: { en: ['RFID auto identification & tracking','Real-time inventory monitoring + alerts','80 tool types, 48 compartments','Auto issuing/recovery recording','Closed-loop management','ISO 9001 certified','Cloud data sync','7" touchscreen UI'], zh: ['RFID自动识别与追踪','实时库存监控+低库存警报','80种刀具类型，48格','自动发放/回收记录','闭环管理系统','ISO 9001认证','云端数据同步','7寸触摸屏'], ar: [] },
    price: 0, images: ['/images/products/qt-dl80-48.jpg'],
    status: 'active', featured: true, hidePrice: true,
    specs: { 'Tool Types':{en:'80 Types',zh:'80种',ar:''},'Compartments':{en:'48',zh:'48格',ar:''},'Identification':{en:'RFID',zh:'RFID',ar:''} },
    relatedProducts: ['2','3'],
  },
  {
    id: '2',
    name: { en: 'CNC Tool Smart Cabinet DL64A - End Mills Taps Inserts Auto Management', zh: 'CNC刀具智能柜 DL64A - 铣刀丝锥刀片自动化管理', ar: 'DL64A' },
    slug: 'cnc-tool-smart-cabinet-dl64a', sku: 'DL64A',
    categories: ['cabinet-1'],
    tags: ['DL64A','end mill management','tap management','insert tracking','铣刀管理','丝锥管理','刀片追踪'],
    description: { en: 'Optimized for end mills, taps & inserts with intelligent RFID identification.', zh: '专为铣刀、丝锥、刀片优化，配备RFID智能识别。', ar: '' },
    features: { en: ['End mill/tap/insert optimized','RFID intelligent ID','Real-time tracking','Compact design','User auth & access control'], zh: ['铣刀/丝锥/刀片优化','RFID智能识别','实时追踪','紧凑设计','用户验证+访问控制'], ar: [] },
    price: 0, images: ['/images/products/dl64a-1.jpg'],
    status: 'active', featured: true, hidePrice: true,
    specs: { 'Tool Types':{en:'64 Types',zh:'64种',ar:''},'Application':{en:'End Mills,Taps,Inserts',zh:'铣刀/丝锥/刀片',ar:''} },
    relatedProducts: ['1','3'],
  },
  {
    id: '3',
    name: { en: 'CNC Tool Expansion Cabinet DL60B - Compact High-Capacity Link', zh: 'CNC刀具扩展柜 DL60B - 紧凑高容量联动', ar: 'DL60B' },
    slug: 'cnc-tool-expansion-dl60b', sku: 'DL60B',
    categories: ['cabinet-1'],
    tags: ['expansion cabinet','DL60B','scalable storage','tool expansion','扩展柜','扩容方案'],
    description: { en: 'Compact high-capacity expansion for seamless main cabinet integration.', zh: '紧凑型高容量扩展，与主柜无缝集成。', ar: '' },
    features: { en: ['High-capacity expansion','Main cabinet link','Scalable modular','Compact footprint','Auto-sync'], zh: ['高容量扩展','主柜连接','可扩展模块','紧凑占地','自动同步'], ar: [] },
    price: 0, images: ['/images/products/dl60b.jpg'],
    status: 'active', featured: true, hidePrice: true,
    relatedProducts: ['1','2'],
  },
  {
    id: '4',
    name: { en: 'CNC Tool Expansion Cabinet DL80F - 80 Types 1-6 Units Cascading', zh: 'CNC刀具扩展柜 DL80F - 80种类型1-6台级联', ar: 'DL80F' },
    slug: 'cnc-tool-expansion-dl80f', sku: 'DL80F',
    categories: ['cabinet-1'],
    tags: ['DL80F','cascading cabinet','unlimited expansion','multi-unit link','级联扩展','多柜联动'],
    description: { en: 'Advanced expansion supporting 80 types with 1-6 unit cascading.', zh: '先进扩展柜，80种类型，支持1-6台级联。', ar: '' },
    features: { en: ['80 tool types','1-6 cascading units','Unlimited expansion','Centralized control','Real-time sync'], zh: ['80种刀具类型','1-6台级联','无限扩展','集中控制','实时同步'], ar: [] },
    price: 0, images: ['/images/products/dl80f.jpg'],
    status: 'active', featured: true, hidePrice: true,
    relatedProducts: ['1','2','3'],
  },
  {
    id: '5',
    name: { en: 'Drawer Smart Material Cabinet CTGJG-324 - 324 Compartment Multi-Material', zh: '抽屉式智能物料柜 CTGJG-324 - 324格多物料管理', ar: 'CTGJG-324' },
    slug: 'drawer-material-cabinet-ctgjg-324', sku: 'CTGJG-324',
    categories: ['cabinet-4','item-6'],
    tags: ['drawer cabinet','CTGJG-324','material management','fastener','consumables','抽屉柜','物料管理'],
    description: { en: '324-compartment drawer cabinet for multi-material management with intelligent tracking.', zh: '324格抽屉柜，多物料分类智能管理。', ar: '' },
    features: { en: ['324 compartments','Drawer layout','Per-compartment tracking','Fastener/small parts ideal','Anti-misplacement design'], zh: ['324格','抽屉布局','逐格追踪','适合紧固件小零件','防错放设计'], ar: [] },
    price: 0, images: ['/images/products/ctgjg-324.jpg'],
    status: 'active', featured: true, hidePrice: true,
    specs: { 'Compartments':{en:'324',zh:'324格',ar:''},'Type':{en:'Drawer',zh:'抽屉式',ar:''} },
    relatedProducts: ['1','6'],
  },
  {
    id: '6',
    name: { en: 'Smart Tool Cabinet STG-100 - General Purpose Tool Storage', zh: '智能工具柜 STG-100 - 通用工具存储管理', ar: 'STG-100' },
    slug: 'smart-tool-cabinet-stg-100', sku: 'STG-100',
    categories: ['cabinet-2','item-3'],
    tags: ['tool cabinet','STG-100','general tool','tool storage','工具柜','通用存储'],
    description: { en: 'General purpose smart tool cabinet for comprehensive tool storage with RFID tracking.', zh: '通用智能工具柜，全面工具存储，RFID追踪。', ar: '' },
    features: { en: ['General purpose storage','RFID all-type tracking','Automated inventory','Flexible config','Lending/tracking','Low-stock alerts'], zh: ['通用存储','全类型RFID追踪','自动库存','灵活配置','借还追踪','低库存预警'], ar: [] },
    price: 0, images: ['/images/products/stg-100.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['1','5'],
  },
  {
    id: '7',
    name: { en: 'Heavy-Duty Industrial Locker IL-200 - Large Equipment Storage', zh: '重型工业储物柜 IL-200 - 大型设备存储', ar: 'IL-200' },
    slug: 'heavy-duty-industrial-locker-il-200', sku: 'IL-200',
    categories: ['cabinet-3'],
    tags: ['industrial locker','IL-200','heavy-duty','large equipment','工业柜','重型存储'],
    description: { en: 'Heavy-duty industrial locker designed for large equipment and tool storage.', zh: '专为大型设备和工具存储设计的重型工业储物柜。', ar: '' },
    features: { en: ['Heavy-duty construction','Large capacity','Industrial grade','Secure storage','Customizable shelves'], zh: ['重型结构','大容量','工业级','安全存储','可定制货架'], ar: [] },
    price: 0, images: ['/images/products/il-200.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['1','6'],
  },
  {
    id: '8',
    name: { en: 'Compact Smart Cabinet CS-50 - Space-Saving Design', zh: '紧凑型智能柜 CS-50 - 节省空间设计', ar: 'CS-50' },
    slug: 'compact-smart-cabinet-cs-50', sku: 'CS-50',
    categories: ['cabinet-2'],
    tags: ['compact cabinet','CS-50','space-saving','small workspace','紧凑柜','节省空间'],
    description: { en: 'Space-saving compact smart cabinet ideal for small workshops and labs.', zh: '节省空间的紧凑型智能柜，理想用于小型车间和实验室。', ar: '' },
    features: { en: ['Compact design','Space-efficient','Full smart features','Easy installation','Perfect for labs'], zh: ['紧凑设计','节省空间','完整智能功能','易安装','适合实验室'], ar: [] },
    price: 0, images: ['/images/products/cs-50.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['6','7'],
  },
  {
    id: '9',
    name: { en: 'RFID Tool Cart RTC-36 - Mobile Tool Management', zh: 'RFID工具车 RTC-36 - 移动工具管理', ar: 'RTC-36' },
    slug: 'rfid-tool-cart-rtc-36', sku: 'RTC-36',
    categories: ['cabinet-4','item-5'],
    tags: ['tool cart','RTC-36','mobile','RFID','工具车','移动管理'],
    description: { en: 'Mobile RFID tool cart for flexible tool management across work areas.', zh: '移动RFID工具车，跨工作区域灵活管理工具。', ar: '' },
    features: { en: ['Mobile design','RFID tracking','36 tool types','Battery powered','Wireless sync'], zh: ['移动设计','RFID追踪','36种工具','电池供电','无线同步'], ar: [] },
    price: 0, images: ['/images/products/rtc-36.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['1','6'],
  },
  {
    id: '10',
    name: { en: 'Smart Vending Machine SVM-500 - Automated Tool Dispensing', zh: '智能售货机 SVM-500 - 自动化工具分发', ar: 'SVM-500' },
    slug: 'smart-vending-machine-svm-500', sku: 'SVM-500',
    categories: ['cabinet-3','item-4'],
    tags: ['vending machine','SVM-500','automated dispensing','24/7 access','售货机','自动分发'],
    description: { en: 'Automated smart vending machine for 24/7 tool and material access.', zh: '自动化智能售货机，24/7工具和物料访问。', ar: '' },
    features: { en: ['Automated dispensing','24/7 access','500 item capacity','User auth required','Usage analytics'], zh: ['自动分发','24/7访问','500 item容量','用户验证','使用分析'], ar: [] },
    price: 0, images: ['/images/products/svm-500.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['1','9'],
  },
];

const getAllProducts = () => products;
const getDefaultProducts = getAllProducts;

// ============================================================
// Products - Unified data source
// ============================================================

/**
 * Get all products: localStorage (admin) > static defaults
 * Call this only on client side (after mount)
 *
 * Auto-detects stale test data (names like "rabot", "test", "this is")
 * and re-seeds from static defaults automatically.
 */
export function getUnifiedProducts(): Product[] {
  if (typeof window === 'undefined') {
    return getDefaultProducts();
  }

  try {
    const saved = localStorage.getItem('admin_products');
    if (saved) {
      const adminProducts: Product[] = JSON.parse(saved);
      // Detect stale test data — if ANY product name contains obvious test markers,
      // discard localStorage entirely and use fresh static defaults
      const hasStaleData = adminProducts.some((p: Product) => {
        const allNames = `${p.name.en} ${p.name.zh} ${p.sku || ''}`.toLowerCase();
        return /^(rabot|test|this is |demo|sample|placeholder|111$|xxx)/i.test(allNames.trim());
      });
      if (hasStaleData) {
        console.warn('[unified-data] Stale test data detected in admin_products, reseeding from static defaults');
        localStorage.removeItem('admin_products');
        return getDefaultProducts();
      }
      // Only return active + coming-soon products to frontend
      return adminProducts.filter(p => p.status === 'active' || p.status === 'coming-soon');
    }
  } catch (e) {
    console.error('Failed to read admin_products from localStorage:', e);
  }

  return getDefaultProducts();
}

/**
 * Fetch products from API with localStorage fallback
 * Use this in admin pages (client-side)
 */
export async function fetchUnifiedProducts(status: string = 'active'): Promise<Product[]> {
  try {
    const res = await fetch(`/api/products?status=${status}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    // API returns { data: Product[], total, page, pageSize }
    return json.data || [];
  } catch (error) {
    console.warn('[unified-data] API fetch failed, falling back to localStorage:', error);
    return getUnifiedProducts();
  }
}

/**
 * Get featured products from unified source
 */
export function getUnifiedFeaturedProducts(): Product[] {
  return getUnifiedProducts().filter(p => p.featured && p.status === 'active');
}

/**
 * Get product by slug from unified source
 */
export function getUnifiedProductBySlug(slug: string): Product | undefined {
  return getUnifiedProducts().find(p => p.slug === slug);
}

// ============================================================
// Blog posts - Unified data source
// ============================================================
import blogsData from './blogs';
import { BlogPost as StaticBlogPost } from './blogs';

/**
 * BlogPost interface matching Prisma API response
 */
export interface BlogPostAPI {
  id: string;
  slug: string;
  title: { en: string; zh: string; ar: string };
  excerpt?: { en: string; zh: string; ar: string };
  content: { en: string; zh: string; ar: string };
  author?: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  image?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  tags?: { tagId: string; tag: { id: string; name: any; color: string } }[];
}

/**
 * Convert static BlogPost to BlogPostAPI format
 */
function convertStaticBlogToAPI(blog: StaticBlogPost): BlogPostAPI {
  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || undefined,
    content: blog.content,
    author: '',
    publishedAt: blog.publishedAt || new Date().toISOString(),
    status: 'published',
    featured: blog.featured,
    image: blog.image || undefined,
    category: blog.category || undefined,
    createdAt: blog.updatedAt || blog.publishedAt || new Date().toISOString(),
    updatedAt: blog.updatedAt || new Date().toISOString(),
    deletedAt: null,
    tags: (blog.tags || []).map(tagId => ({
      tagId,
      tag: { id: tagId, name: { en: tagId, zh: tagId, ar: tagId }, color: '#3B82F6' }
    }))
  };
}

export function getUnifiedBlogs(): StaticBlogPost[] {
  if (typeof window === 'undefined') {
    return blogsData;
  }

  try {
    const saved = localStorage.getItem('admin_blogs');
    if (saved) {
      const adminBlogs = JSON.parse(saved) as (StaticBlogPost & { status?: string })[];
      // Stale test data detection — same logic as products
      const hasStaleData = adminBlogs.some((b: any) => {
        const allText = `${b.title?.en || ''} ${b.title?.zh || ''} ${b.summary?.zh || ''}`.toLowerCase();
        return /^(this is |rabot|test|demo|111$|xxx|placeholder)/i.test(allText.trim());
      });
      if (hasStaleData) {
        console.warn('[unified-data] Stale test data detected in admin_blogs, using static defaults');
        localStorage.removeItem('admin_blogs');
        return blogsData;
      }
      return adminBlogs.filter(b => !b.status || b.status === 'published' || b.status === 'active');
    }
  } catch (e) {
    console.error('Failed to read admin_blogs from localStorage:', e);
  }

  return blogsData;
}

/**
 * Fetch blogs from API with localStorage fallback
 * Returns BlogPostAPI[] matching Prisma schema
 */
export async function fetchUnifiedBlogs(published: boolean = true): Promise<BlogPostAPI[]> {
  try {
    const url = published ? '/api/blogs?published=true' : '/api/blogs';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    // API returns { data: BlogPost[], total, page, pageSize }
    return json.data || [];
  } catch (error) {
    console.warn('[unified-data] API fetch failed, falling back to localStorage:', error);
    // Convert static BlogPost[] to BlogPostAPI[] format
    const staticData = getUnifiedBlogs();
    return staticData.map(convertStaticBlogToAPI);
  }
}

// ============================================================
// FAQs - Unified data source
// ============================================================
import faqsData, { getAllFAQs as getDefaultFaqs } from './faqs';
import { FAQ } from './faqs';

export function getUnifiedFaqs(): FAQ[] {
  if (typeof window === 'undefined') {
    return getDefaultFaqs();
  }

  try {
    const saved = localStorage.getItem('admin_faqs');
    if (saved) {
      const adminFaqs = JSON.parse(saved) as (FAQ & { status?: string })[];
      return adminFaqs.filter(f => !f.status || f.status === 'active');
    }
  } catch (e) {
    console.error('Failed to read admin_faqs from localStorage:', e);
  }

  return getDefaultFaqs();
}

/**
 * Fetch FAQs from API with localStorage fallback
 */
export async function fetchUnifiedFaqs(): Promise<FAQ[]> {
  try {
    const res = await fetch('/api/faqs');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    // API returns { data: FAQ[], total, page, pageSize }
    return json.data || [];
  } catch (error) {
    console.warn('[unified-data] API fetch failed, falling back to localStorage:', error);
    return getUnifiedFaqs();
  }
}

// ============================================================
// Categories - Unified data source with stale detection
// ============================================================
import categoriesData, { getAllCategoryTypes, getCategoriesByType } from './categories';

export interface LocalCategory {
  id: string;
  nameZh: string;
  nameEn: string;
  nameAr?: string;
  slug: string;
  icon?: string;
  description?: string;
  parentId?: string | null;
  order: number;
  status: string;
  type: string; // cabinet/item/industry/custom
  createdAt?: string;
}

/**
 * Get merged categories: localStorage > static defaults
 * Auto-detects test data (rabot-en, etc.) and re-seeds from static defaults
 */
export function getUnifiedCategories(): LocalCategory[] {
  if (typeof window === 'undefined') {
    // Server side: convert static data to LocalCategory format
    return categoriesData.map((cat: any) => ({
      id: cat.id,
      nameZh: cat.name.zh,
      nameEn: cat.name.en,
      nameAr: cat.name.ar || '',
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description?.zh || '',
      parentId: cat.parentId || null,
      order: cat.order || 0,
      status: 'active',
      type: cat.type,
    }));
  }

  try {
    const saved = localStorage.getItem('admin_categories');
    if (saved) {
      const adminCats: LocalCategory[] = JSON.parse(saved);
      // Stale test data detection — remove ONLY stale entries, keep valid ones
      const cleanCats = adminCats.filter((c: LocalCategory) => {
        const allText = `${c.nameEn} ${c.nameZh} ${c.slug || ''}`.toLowerCase();
        const isStale = /^(rabot|test|robot-en|this is|demo|111$|xxx)/i.test(allText.trim());
        if (isStale) console.warn('[unified-data] Removing stale category:', c.nameEn, c.nameZh);
        return !isStale;
      });
      if (cleanCats.length < adminCats.length) {
        // Some stale entries were filtered out — save cleaned data back
        localStorage.setItem('admin_categories', JSON.stringify(cleanCats));
        console.warn('[unified-data] Cleaned stale categories, kept', cleanCats.length, 'valid entries');
      }
      return cleanCats;
    }
  } catch (e) {
    console.error('Failed to read admin_categories from localStorage:', e);
  }

  // No saved data or error — return static defaults
  return categoriesData.map((cat: any) => ({
    id: cat.id,
    nameZh: cat.name.zh,
    nameEn: cat.name.en,
    nameAr: cat.name.ar || '',
    slug: cat.slug,
    icon: cat.icon,
    description: cat.description?.zh || '',
    parentId: cat.parentId || null,
    order: cat.order || 0,
    status: 'active',
    type: cat.type,
  }));
}

/**
 * Fetch categories from API with localStorage fallback
 */
export async function fetchUnifiedCategories(): Promise<LocalCategory[]> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const categories = await res.json();
    // API returns Category[] directly
    // NOTE: cat.name may be {zh,en,ar} object, cat.nameZh/nameEn may be empty strings
    return categories.map((cat: any) => {
      // Extract name from i18n object or flat fields
      const nameObj = cat.name && typeof cat.name === 'object' && !Array.isArray(cat.name)
        ? cat.name : null;
      const nameZh = (cat.nameZh && cat.nameZh !== '') ? cat.nameZh : (nameObj?.zh || '');
      const nameEn = (cat.nameEn && cat.nameEn !== '') ? cat.nameEn : (nameObj?.en || '');
      const nameAr = (cat.nameAr && cat.nameAr !== '') ? cat.nameAr : (nameObj?.ar || '');
      return {
        id: cat.id,
        nameZh,
        nameEn,
        nameAr,
        slug: cat.slug || '',
        icon: cat.icon || '',
        description: cat.description || '',
        parentId: cat.parentId || null,
        order: cat.order || 0,
        status: cat.status || 'active',
        type: cat.type || 'custom',
      };
    });
  } catch (error) {
    console.warn('[unified-data] API fetch failed, falling back to localStorage:', error);
    return getUnifiedCategories();
  }
}

/**
 * Get categories grouped by dimension/type for UI display
 * Includes custom dimensions from localStorage (e.g., "机器人")
 */
export function getCategoriesGrouped(): { type: string; label: string; categories: LocalCategory[] }[] {
  const allCats = getUnifiedCategories();
  const typeOrder = ['cabinet-type', 'managed-items', 'industry', 'custom-solution'];
  const labels: Record<string, string> = {
    'cabinet-type': '柜型分类',
    'managed-items': '管理物料',
    industry: '行业分类',
    'custom-solution': '定制方案',
  };

  // Get custom dimension labels from localStorage
  if (typeof window !== 'undefined') {
    try {
      const savedDims = localStorage.getItem('admin_custom_dimensions');
      if (savedDims) {
        const dimData = JSON.parse(savedDims);
        Object.entries(dimData).forEach(([key, val]: [string, any]) => {
          if (val && typeof val === 'object' && val.labelZh) {
            labels[key] = val.labelZh;
          } else if (typeof val === 'string') {
            labels[key] = val;
          }
        });
      }
    } catch {}
  }

  // Collect all active types from actual data + built-in order
  const activeTypes = [...new Set(allCats.map(c => c.type))];
  // Sort: built-in types first in order, then custom types
  const sortedTypes = [
    ...typeOrder.filter(t => activeTypes.includes(t)),
    ...activeTypes.filter(t => !typeOrder.includes(t))
  ];

  return sortedTypes.map(type => ({
    type,
    label: labels[type] || type,
    categories: allCats.filter(c => c.type === type),
  })).filter(g => g.categories.length > 0);
}

/**
 * Fetch categories grouped by dimension (async version)
 * Reads localStorage's admin_custom_dimensions for custom dimension labels
 */
export async function fetchCategoriesGrouped(): Promise<{ type: string; label: string; categories: LocalCategory[] }[]> {
  const allCats = await fetchUnifiedCategories();
  const typeOrder = ['cabinet-type', 'managed-items', 'industry', 'custom-solution'];
  const labels: Record<string, string> = {
    'cabinet-type': '柜型分类',
    'managed-items': '管理物料',
    industry: '行业分类',
    'custom-solution': '定制方案',
  };

  // Get custom dimension labels from localStorage
  if (typeof window !== 'undefined') {
    try {
      const savedDims = localStorage.getItem('admin_custom_dimensions');
      if (savedDims) {
        const dimData = JSON.parse(savedDims);
        Object.entries(dimData).forEach(([key, val]: [string, any]) => {
          if (val && typeof val === 'object' && val.labelZh) {
            labels[key] = val.labelZh;
          } else if (typeof val === 'string') {
            labels[key] = val;
          }
        });
      }
    } catch {}
  }

  // Collect all active types from actual data + built-in order
  const activeTypes = [...new Set(allCats.map(c => c.type))];
  const sortedTypes = [
    ...typeOrder.filter(t => activeTypes.includes(t)),
    ...activeTypes.filter(t => !typeOrder.includes(t))
  ];

  return sortedTypes.map(type => ({
    type,
    label: labels[type] || type,
    categories: allCats.filter(c => c.type === type),
  })).filter(g => g.categories.length > 0);
}

// ============================================================
// Site Settings - Unified data source
// ============================================================

export interface SiteSettings {
  companyName: string;
  companyNameZh: string;
  companyNameAr: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsApp: string;
  address: string;
  addressZh: string;
  addressAr: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImage: string;
  socialFacebook: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialYoutube: string;
  socialInstagram: string;
  socialWechat: string;
  socialWeibo: string;
  footerCopyright: string;
  footerLinks: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: 'Guangzhou Qiuyan Technology Co., Ltd.',
  companyNameZh: '广州秋彦科技有限公司',
  companyNameAr: 'قوانغتشو تشيويان لتكنولوجيا المحدودة',
  logo: '',
  favicon: '',
  contactEmail: 'sabina@wstoolcabinet.com',
  contactPhone: '+86 156 2216 0659',
  contactWhatsApp: '+86 156 2216 0659',
  address: 'Panyu District, Guangzhou, Guangdong Province, China',
  addressZh: '中国广东省广州市番禺区',
  addressAr: 'منطقة بانيو، قوانغتشو، مقاطعة غوانغدونغ، الصين',
  seoTitle: 'Smart Cabinet - Intelligent Tool Management Solutions',
  seoDescription: 'Professional smart tool cabinet and vending machine manufacturer. RFID tracking, real-time inventory, automated management for modern manufacturing.',
  seoKeywords: 'smart cabinet, tool cabinet, vending machine, RFID, CNC tool management, intelligent locker, tool storage',
  seoOgImage: '',
  socialFacebook: '',
  socialTwitter: '',
  socialLinkedin: '',
  socialYoutube: '',
  socialInstagram: '',
  socialWechat: 'SmartCabinet_Qiuyan',
  socialWeibo: '',
  footerCopyright: '\u00A9 2024 Guangzhou Qiuyan Technology Co., Ltd. All rights reserved.',
  footerLinks: '[{"label":"Privacy Policy","url":"/privacy"},{"label":"Terms of Service","url":"/terms"}]',
};

/**
 * Get site settings: localStorage (admin) > defaults
 * Call only on client side
 */
export function getUnifiedSettings(): SiteSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to read admin_settings from localStorage:', e);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Fetch settings from API with localStorage fallback
 * Defensive: flatten any i18n objects {zh,en,ar} to strings
 */
export async function fetchUnifiedSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const settings = await res.json();

    // Defensive: flatten i18n objects to strings (defense-in-depth)
    const flattened: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && ('en' in value || 'zh' in value)) {
        // i18n object — flatten to string
        flattened[key] = (value as any).en || (value as any).zh || (value as any).ar || '';
      } else if (typeof value === 'string') {
        flattened[key] = value;
      } else {
        flattened[key] = String(value || '');
      }
    }

    return { ...DEFAULT_SETTINGS, ...flattened };
  } catch (error) {
    console.warn('[unified-data] API fetch failed, falling back to localStorage:', error);
    return getUnifiedSettings();
  }
}

// ============================================================
// Tags - Async fetch functions
// ============================================================

export interface Tag {
  id: string;
  nameZh: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  color: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

/**
 * Fetch tags from API with localStorage fallback
 */
export async function fetchUnifiedTags(): Promise<Tag[]> {
  try {
    const res = await fetch('/api/tags');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    // API returns { data: Tag[], total, page, pageSize }
    return json.data || [];
  } catch (error) {
    console.warn('[unified-data] API fetch failed, falling back to localStorage:', error);
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('admin_tags');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  }
}

// ============================================================
// Admin API helpers (with auth)
// ============================================================

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

/**
 * Make authenticated request to admin API
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON bodies
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Admin API functions for CRUD operations
 */
export const adminApi = {
  // Products
  async fetchAdminProducts(status?: string): Promise<Product[]> {
    const url = status ? `/api/admin/products?status=${status}` : '/api/admin/products';
    const res = await authFetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async createProduct(data: any): Promise<Product> {
    const res = await authFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updateProduct(id: string, data: any): Promise<Product> {
    const res = await authFetch(`/api/admin/products?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/products?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
  },

  // Categories
  async fetchAdminCategories(): Promise<LocalCategory[]> {
    const res = await authFetch('/api/admin/categories');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async createCategory(data: any): Promise<LocalCategory> {
    const res = await authFetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updateCategory(id: string, data: any): Promise<LocalCategory> {
    const res = await authFetch(`/api/admin/categories?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/categories?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
  },

  // Blogs
  async fetchAdminBlogs(published?: boolean): Promise<BlogPostAPI[]> {
    const url = published !== undefined ? `/api/admin/blogs?published=${published}` : '/api/admin/blogs';
    const res = await authFetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async createBlog(data: any): Promise<BlogPostAPI> {
    const res = await authFetch('/api/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updateBlog(id: string, data: any): Promise<BlogPostAPI> {
    const res = await authFetch(`/api/admin/blogs?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async deleteBlog(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/blogs?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
  },

  // FAQs
  async fetchAdminFaqs(): Promise<FAQ[]> {
    const res = await authFetch('/api/admin/faqs');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async createFaq(data: any): Promise<FAQ> {
    const res = await authFetch('/api/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updateFaq(id: string, data: any): Promise<FAQ> {
    const res = await authFetch(`/api/admin/faqs?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async deleteFaq(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/faqs?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
  },

  // Tags
  async fetchAdminTags(): Promise<Tag[]> {
    const res = await authFetch('/api/admin/tags');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async createTag(data: any): Promise<Tag> {
    const res = await authFetch('/api/admin/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updateTag(id: string, data: any): Promise<Tag> {
    const res = await authFetch(`/api/admin/tags?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async deleteTag(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/tags?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
  },

  // Settings
  async fetchAdminSettings(): Promise<SiteSettings> {
    const res = await authFetch('/api/admin/settings');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updateSettings(data: any): Promise<SiteSettings> {
    const res = await authFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};

export default {
  getUnifiedProducts,
  getUnifiedFeaturedProducts,
  getUnifiedProductBySlug,
  getUnifiedBlogs,
  getUnifiedFaqs,
  getUnifiedSettings,
  getUnifiedCategories,
  getCategoriesGrouped,
  fetchUnifiedProducts,
  fetchUnifiedBlogs,
  fetchUnifiedFaqs,
  fetchUnifiedCategories,
  fetchUnifiedSettings,
  fetchCategoriesGrouped,
  fetchUnifiedTags,
  adminApi,
};
