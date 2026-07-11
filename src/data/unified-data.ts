/**
 * Unified data layer — API ONLY, NO localStorage, NO static defaults
 *
 * This module provides a unified data layer that:
 * 1. Reads from API ONLY (no localStorage fallback, no static defaults)
 * 2. Works on both client and server (async fetch only)
 * 3. All sync functions (getUnified*) are REMOVED — use async fetch in components
 *
 * MIGRATION GUIDE:
 * - getUnifiedSettings() → useEffect + fetchUnifiedSettings()
 * - getUnifiedProducts() → useEffect + fetchUnifiedProducts()
 * - getUnifiedCategories() → useEffect + fetchUnifiedCategories()
 * - etc.
 */

// ============================================================
// Types — keep same interface for compatibility
// ============================================================

export interface Product {
  id: string;
  name: { en: string; zh: string; ar: string };
  slug: string;
  sku: string;
  categories: Array<{ id: string; name: { en: string; zh: string; ar: string }; slug: string; type?: string }>;
  categoryIds?: string[];
  tags: string[];
  description: { en: string; zh: string; ar: string };
  features: { en: string[]; zh: string[]; ar: string[] };
  price: number;
  images: string[];
  status: 'active' | 'inactive' | 'coming-soon';
  featured: boolean;
  hidePrice?: boolean;
  order?: number;
  seoKeywords?: string;
  specs?: { [key: string]: { en: string; zh: string; ar: string } };
  specifications?: { en?: string; zh?: string; ar?: string };
  relatedProducts?: string[];
}

export interface LocalCategory {
  id: string;
  nameZh: string;
  nameEn: string;
  nameAr?: string;
  slug: string;
  icon?: string;
  description?: { zh?: string; en?: string; ar?: string } | null;
  parentId?: string | null;
  order: number;
  status: string;
  type: string; // cabinet-type/managed-items/industry/custom-solution
  createdAt?: string;
}

export interface SiteSettings {
  companyName: string;
  companyNameZh: string;
  companyNameAr: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactEmails: string[];
  contactPhones: string[];
  contactWhatsAppNumbers: string[];
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
  wechatWebhookUrl: string;
  wechatNotificationEnabled: boolean;
}

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

// ============================================================
// BlogPost API type
// ============================================================
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

// ============================================================
// FAQ type (from Prisma schema — matches FAQ model)
// ============================================================
export interface FAQ {
  id: string;
  question: { en: string; zh: string; ar: string };
  answer: { en: string; zh: string; ar: string };
  category: string; // 固定枚举
  order: number;
  status: string;
  featured?: boolean;
  createdAt?: string;
}

// ============================================================
// Review type (from Prisma schema — matches Review model)
// ============================================================
export interface Review {
  id: string;
  productId: string;
  userId?: string;
  authorName: string;
  authorEmail?: string;
  rating: number;
  title?: string;
  content: string;
  images: string[];
  isVerified: boolean;
  isApproved: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================
// DEFAULT Settings (used as fallback ONLY when API is unreachable on initial load)
// NOTE: These are NOT read from localStorage. If API fails, component shows error/loading.
// ============================================================
const DEFAULT_SETTINGS: SiteSettings = {
  companyName: 'Guangzhou Qiuyan Technology Co., Ltd.',
  companyNameZh: '广州秋彦科技有限公司',
  companyNameAr: 'قوانغتشو تشيويان لتكنولوجيا المحدودة',
  logo: '',
  favicon: '',
  contactEmail: 'sabina@wstoolcabinet.com',
  contactPhone: '+86 156 2216 0659',
  contactWhatsApp: '+86 156 2216 0659',
  contactEmails: ['sabina@wstoolcabinet.com'],
  contactPhones: ['+86 156 2216 0659'],
  contactWhatsAppNumbers: ['+86 156 2216 0659'],
  address: 'Panyu District, Guangzhou, Guangdong Province, China',
  addressZh: '中国广东省广州市番禺区',
  addressAr: 'منطقة بانيو، قوانغتشو، مقاطعة غوانغدونغ، الصين',
  seoTitle: 'Smart Cabinet - Intelligent Tool Management Solutions',
  seoDescription: 'Professional smart tool cabinet and vending machine manufacturer.',
  seoKeywords: 'smart cabinet, tool cabinet, vending machine, RFID, CNC',
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
  wechatWebhookUrl: '',
  wechatNotificationEnabled: false,
};

// ============================================================
// Base URL helper — works on both client and server
// Export for use in other files
// ============================================================
export function getBaseUrl(): string {
  // More reliable server/browser detection
  const isServer = typeof window === 'undefined' || (typeof process !== 'undefined' && process.versions && process.versions.node);
  
  if (!isServer) {
    // Browser environment: use relative URL (empty base)
    return '';
  }
  
  // Server environment: use localhost:3000 for internal API calls
  return 'http://localhost:3000';
}

// ============================================================
// Helper: Clean string value (remove surrounding quotes)
// ============================================================
function cleanStringValue(val: any): string {
  if (typeof val !== 'string') return String(val || '');
  let cleaned = val.trim();
  // Remove surrounding double quotes or single quotes (handle multiple layers)
  while ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
         (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}

// ============================================================
// Async fetch functions — API ONLY, no localStorage fallback
// ============================================================

/**
 * Fetch products from API ONLY.
 * No localStorage fallback. Returns [] on error.
 */
export async function fetchUnifiedProducts(status: string = 'active', featured?: boolean): Promise<Product[]> {
  try {
    const params = new URLSearchParams({ status });
    // When the caller explicitly wants featured products, push the filter down to
    // the API so the DB-level `where.featured` clause guarantees the correct set
    // is returned (decoupled from client-side field serialization).
    if (featured) params.set('featured', 'true');
    const res = await fetch(`${getBaseUrl()}/api/products?${params.toString()}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('[unified-data] API fetch failed (products):', error);
    return [];
  }
}

/**
 * Fetch single product by slug from API ONLY.
 */
export async function fetchUnifiedProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products?slug=${encodeURIComponent(slug)}&status=all`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] || null;
  } catch (error) {
    console.error('[unified-data] API fetch failed (product by slug):', error);
    return null;
  }
}

/**
 * Fetch blogs from API ONLY.
 */
export async function fetchUnifiedBlogs(published: boolean = true): Promise<BlogPostAPI[]> {
  try {
    const url = published ? `${getBaseUrl()}/api/blogs?published=true` : `${getBaseUrl()}/api/blogs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('[unified-data] API fetch failed (blogs):', error);
    return [];
  }
}

/**
 * Fetch FAQs from API ONLY.
 */
export async function fetchUnifiedFaqs(): Promise<FAQ[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/faqs`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('[unified-data] API fetch failed (faqs):', error);
    return [];
  }
}

/**
 * Fetch categories from API ONLY.
 * Normalizes API response (cat.name may be {zh,en,ar} object).
 */
export async function fetchUnifiedCategories(): Promise<LocalCategory[]> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/categories`;
    // Debug: log environment info and call stack
    const envInfo = {
      isServer: typeof window === 'undefined',
      hasProcess: typeof process !== 'undefined',
      hasNodeVersion: typeof process !== 'undefined' && process.versions ? !!process.versions.node : false,
      baseUrl,
      url
    };
    console.log(`[fetchUnifiedCategories] Env: ${JSON.stringify(envInfo)}`);
    console.log(`[fetchUnifiedCategories] Stack: ${new Error().stack?.split('\n').slice(0, 5).join('\n')}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const categories = await res.json();

    return (categories || []).map((cat: any) => {
      const nameObj = cat.name && typeof cat.name === 'object' && !Array.isArray(cat.name)
        ? cat.name : null;
      const rawNameZh = (cat.nameZh && cat.nameZh !== '') ? cat.nameZh : (nameObj?.zh || '');
      const rawNameEn = (cat.nameEn && cat.nameEn !== '') ? cat.nameEn : (nameObj?.en || '');
      const rawNameAr = (cat.nameAr && cat.nameAr !== '') ? cat.nameAr : (nameObj?.ar || '');
      return {
        id: cat.id,
        nameZh: typeof rawNameZh === 'string' ? rawNameZh : String(rawNameZh || ''),
        nameEn: typeof rawNameEn === 'string' ? rawNameEn : String(rawNameEn || ''),
        nameAr: typeof rawNameAr === 'string' ? rawNameAr : (rawNameAr ? String(rawNameAr) : ''),
        slug: cat.slug || '',
        icon: cat.icon || '',
        description: cat.description && typeof cat.description === 'object' && !Array.isArray(cat.description) ? cat.description : null,
        parentId: cat.parentId || null,
        order: cat.order || 0,
        status: cat.status || 'active',
        type: cat.type || 'custom',
      };
    });
  } catch (error) {
    console.error('[unified-data] API fetch failed (categories):', error);
    return [];
  }
}

/**
 * Fetch categories grouped by dimension (async version).
 * Reads custom dimension labels from API (admin_custom_dimensions endpoint or from categories data).
 */
export async function fetchCategoriesGrouped(): Promise<{ type: string; label: string; categories: LocalCategory[] }[]> {
  const allCats = await fetchUnifiedCategories();
  const typeOrder = ['cabinet-type', 'managed-items', 'industry', 'custom-solution'];

  // Build a map of L1 parent categories (parentId === null) to derive DB-backed group labels.
  const parentMap: Record<string, LocalCategory> = {};
  allCats.forEach((c: any) => { if (!c.parentId) parentMap[c.id] = c; });

  // Collect all active types from actual data + built-in order
  const activeTypes = [...new Set(allCats.map(c => c.type))];
  const sortedTypes = [
    ...typeOrder.filter(t => activeTypes.includes(t)),
    ...activeTypes.filter(t => !typeOrder.includes(t))
  ];

  return sortedTypes.map(type => {
    // Derive the group label from the DB-backed L1 parent name of the group's representative member.
    const representative = allCats.find(c => c.type === type);
    const parent = representative && representative.parentId ? parentMap[representative.parentId] : null;
    const label = parent ? (parent.nameEn || parent.nameZh || parent.nameAr || type) : type;
    return {
      type,
      label,
      categories: allCats.filter(c => c.type === type),
    };
  }).filter(g => g.categories.length > 0);
}

/**
 * Fetch settings from API ONLY.
 * Returns DEFAULT_SETTINGS if API fails (for initial render only).
 * NOTE: Components should use useState + useEffect to fetch settings properly.
 */
export async function fetchUnifiedSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/settings`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const settings = await res.json();
    
    // Clean string values to remove surrounding quotes
    const cleanedSettings: Record<string, any> = {};
    Object.keys(settings).forEach(key => {
      const val = settings[key];
      if (typeof val === 'string') {
        cleanedSettings[key] = cleanStringValue(val);
      } else {
        cleanedSettings[key] = val;
      }
    });
    
    return { ...DEFAULT_SETTINGS, ...cleanedSettings };
  } catch (error) {
    console.error('[unified-data] API fetch failed (settings):', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Fetch tags from API ONLY.
 */
export async function fetchUnifiedTags(): Promise<Tag[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/tags`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('[unified-data] API fetch failed (tags):', error);
    return [];
  }
}

// ============================================================
// Admin API helpers (with auth) — unchanged, API only
// ============================================================

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Fix relative URL for server environment
  const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(fullUrl, { ...options, headers });
}

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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async updateProduct(id: string, data: any): Promise<Product> {
    const res = await authFetch(`/api/admin/products?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/products?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
  },

  // Categories
  async fetchAdminCategories(): Promise<LocalCategory[]> {
    const res = await authFetch('/api/admin/categories');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data || []);
  },

  async createCategory(data: any): Promise<LocalCategory> {
    const res = await authFetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async updateCategory(id: string, data: any): Promise<LocalCategory> {
    const res = await authFetch(`/api/admin/categories?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/categories?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async updateBlog(id: string, data: any): Promise<BlogPostAPI> {
    const res = await authFetch(`/api/admin/blogs?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async deleteBlog(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/blogs?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
  },

  // FAQs
  async fetchAdminFaqs(productId?: string, pageSize = 200): Promise<FAQ[]> {
    let url = '/api/admin/faqs';
    if (productId) {
      url += `?productId=${encodeURIComponent(productId)}&pageSize=${pageSize}`;
    }
    const res = await authFetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },

  async createFaq(data: any): Promise<FAQ> {
    const res = await authFetch('/api/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async updateFaq(id: string, data: any): Promise<FAQ> {
    const res = await authFetch(`/api/admin/faqs?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async deleteFaq(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/faqs?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async updateTag(id: string, data: any): Promise<Tag> {
    const res = await authFetch(`/api/admin/tags?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  async deleteTag(id: string): Promise<void> {
    const res = await authFetch(`/api/admin/tags?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
  },

  // Helpers for backward compatibility (used in category/tag management pages)
  async getCategories(): Promise<any[]> {
    const res = await authFetch('/api/admin/categories');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data || []);
  },

  async getTags(): Promise<any[]> {
    const res = await authFetch('/api/admin/tags');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return json.data || [];
  },
};

// ============================================================
// DEPRECATED sync functions — DO NOT USE
// These functions are kept only to avoid breaking imports during migration.
// They log a warning and return empty/default values.
// Use the async fetchUnified*() functions instead.
// ============================================================

export function getUnifiedSettings(): SiteSettings {
  console.warn(
    '[unified-data] getUnifiedSettings() is DEPRECATED. ' +
    'Use useState + useEffect with fetchUnifiedSettings() instead. ' +
    'Returning DEFAULT_SETTINGS as fallback.'
  );
  return { ...DEFAULT_SETTINGS };
}

export function getUnifiedProducts(): Product[] {
  console.warn(
    '[unified-data] getUnifiedProducts() is DEPRECATED. ' +
    'Use useEffect with fetchUnifiedProducts() instead. Returning [].'
  );
  return [];
}

export function getUnifiedFeaturedProducts(): Product[] {
  console.warn('[unified-data] getUnifiedFeaturedProducts() is DEPRECATED. Returning [].');
  return [];
}

export function getUnifiedProductBySlug(slug: string): Product | undefined {
  console.warn('[unified-data] getUnifiedProductBySlug() is DEPRECATED. Use fetchUnifiedProductBySlug() instead.');
  return undefined;
}

export function getUnifiedBlogs(): any[] {
  console.warn('[unified-data] getUnifiedBlogs() is DEPRECATED. Use fetchUnifiedBlogs() instead. Returning [].');
  return [];
}

export function getUnifiedFaqs(): FAQ[] {
  console.warn('[unified-data] getUnifiedFaqs() is DEPRECATED. Use fetchUnifiedFaqs() instead. Returning [].');
  return [];
}

export function getUnifiedCategories(): LocalCategory[] {
  console.warn('[unified-data] getUnifiedCategories() is DEPRECATED. Use fetchUnifiedCategories() instead. Returning [].');
  return [];
}

// ============================================================
// Default export (for backward compatibility)
// ============================================================
export default {
  fetchUnifiedProducts,
  fetchUnifiedProductBySlug,
  fetchUnifiedBlogs,
  fetchUnifiedFaqs,
  fetchUnifiedCategories,
  fetchCategoriesGrouped,
  fetchUnifiedSettings,
  fetchUnifiedTags,
  getUnifiedSettings,  // deprecated
  getUnifiedProducts,  // deprecated
  getUnifiedFeaturedProducts,  // deprecated
  getUnifiedProductBySlug,  // deprecated
  getUnifiedBlogs,  // deprecated
  getUnifiedFaqs,  // deprecated
  getUnifiedCategories,  // deprecated
  adminApi,
};
