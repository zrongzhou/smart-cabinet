/**
 * API client for Smart Cabinet
 * Fetches data from PostgreSQL via API routes
 */

const API_BASE = '/api';

// Helper: Clean string values (remove surrounding quotes like "value" or 'value')
function cleanStringValue(val: any): string {
  if (typeof val !== 'string') return String(val || '');
  let cleaned = val.trim();
  // Remove surrounding quotes (double or single)
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

// ============================================================
// Products API
// ============================================================

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: { zh: string; en: string; ar: string };
  description?: { zh: string; en: string; ar: string };
  shortDescription?: { zh: string; en: string; ar: string };
  price: number;
  hidePrice: boolean;
  images: string[];
  features?: { en: string[]; zh: string[]; ar: string[] };
  specifications?: { [key: string]: { zh: string; en: string; ar: string } } | { en?: string; zh?: string; ar?: string };
  status: string;
  featured: boolean;
  order: number;
  categories: { id: string; slug: string; name: any; type?: string }[];
  tags: { id: string; slug: string; name: any }[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchProducts(params?: {
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: Product[]; total: number; page: number; pageSize: number }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.featured) searchParams.set('featured', 'true');
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  const res = await fetch(`${API_BASE}/products?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

// ============================================================
// Blog Posts API
// ============================================================

export interface BlogPost {
  id: string;
  slug: string;
  title: { zh: string; en: string; ar: string };
  excerpt?: { zh: string; en: string; ar: string };
  content?: { en: string; zh?: string; ar?: string }; // Optional: list API doesn't return content (too large)
  author?: string;
  publishedAt?: string;
  status: string;
  featured: boolean;
  image?: string; // Optional: list API doesn't return image (too large), detail API does
  hasImage?: boolean; // Added by list API: indicates if blog has an image
  category?: string;
  tags: { id: string; slug: string; name: any }[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchBlogs(params?: {
  tag?: string;
  search?: string;
  published?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ data: BlogPost[]; total: number; page: number; pageSize: number }> {
  const searchParams = new URLSearchParams();
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.published) searchParams.set('published', 'true');
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  const res = await fetch(`${API_BASE}/blogs?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch blogs');
  return res.json();
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blogs/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch blog');
  return res.json();
}

// ============================================================
// FAQs API
// ============================================================

export interface FAQ {
  id: string;
  question: { zh: string; en: string; ar: string };
  answer: { zh: string; en: string; ar: string };
  category: string;
  order: number;
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchFAQs(params?: {
  category?: string;
  status?: string;
}): Promise<FAQ[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);

  const res = await fetch(`${API_BASE}/faqs?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch FAQs');
  const json = await res.json();
  return json.data || json || [];
}

// ============================================================
// Categories API
// ============================================================

export interface Category {
  id: string;
  slug: string;
  name: { zh: string; en: string; ar: string };
  icon?: string;
  description?: { zh: string; en: string; ar: string };
  parentId?: string;
  order: number;
  status: string;
  type: string;
}

export async function fetchCategories(type?: string): Promise<Category[]> {
  const searchParams = new URLSearchParams();
  if (type) searchParams.set('type', type);

  const res = await fetch(`${API_BASE}/categories?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

// ============================================================
// Tags API
// ============================================================

export interface Tag {
  id: string;
  slug: string;
  name: { zh: string; en: string; ar: string };
  color: string;
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}

// ============================================================
// Site Settings API
// ============================================================

export interface SiteSettings {
  [key: string]: any;
}

export async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  const data = await res.json();
  // Clean all string values to remove surrounding quotes
  const cleaned: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    const v = data[key];
    cleaned[key] = typeof v === 'string' ? cleanStringValue(v) : v;
  });
  return cleaned as SiteSettings;
}

// ============================================================
// Admin API (requires auth)
// ============================================================

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Login page sets 'admin_token' in localStorage (see src/app/admin/login/page.tsx)
  return localStorage.getItem('admin_token');
}

// Products Admin
export async function fetchAdminProducts(): Promise<Product[]> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/products`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch admin products');
  return res.json();
}

export async function fetchAdminProduct(id: string): Promise<Product> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch admin product');
  return res.json();
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

// Blogs Admin
export async function fetchAdminBlogs(): Promise<BlogPost[]> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/blogs`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch admin blogs');
  return res.json();
}

export async function createBlog(data: Partial<BlogPost>): Promise<BlogPost> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create blog');
  return res.json();
}

export async function updateBlog(slug: string, data: Partial<BlogPost>): Promise<BlogPost> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/blogs/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update blog');
  return res.json();
}

export async function deleteBlog(slug: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/blogs/${slug}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete blog');
}

// FAQs Admin
export async function fetchAdminFAQs(): Promise<FAQ[]> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/faqs`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch admin FAQs');
  return res.json();
}

export async function createFAQ(data: Partial<FAQ>): Promise<FAQ> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/faqs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create FAQ');
  return res.json();
}

export async function updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/faqs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update FAQ');
  return res.json();
}

export async function deleteFAQ(id: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/faqs/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete FAQ');
}

// Categories Admin
export async function fetchAdminCategories(): Promise<Category[]> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/categories`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch admin categories');
  return res.json();
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update category');
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete category');
}

// Tags Admin
export async function fetchAdminTags(): Promise<Tag[]> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/tags`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch admin tags');
  return res.json();
}

export async function updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/tags/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update tag');
  return res.json();
}

export async function deleteTag(id: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/tags/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete tag');
}

// Settings Admin
export async function fetchAdminSettings(): Promise<SiteSettings> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSetting(key: string, value: any): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error('Failed to update setting');
}

// ============================================================
// Pages API
// ============================================================

export interface Page {
  id: string;
  slug: string;
  title: { zh: string; en: string; ar: string };
  blocks: any[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchPages(): Promise<Page[]> {
  const res = await fetch(`${API_BASE}/pages`);
  if (!res.ok) throw new Error('Failed to fetch pages');
  return res.json();
}

export async function fetchPageBySlug(slug: string): Promise<Page> {
  const res = await fetch(`${API_BASE}/pages/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch page');
  return res.json();
}

// Admin Pages API
export async function fetchAdminPages(): Promise<Page[]> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/pages`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch admin pages');
  return res.json();
}

export async function fetchAdminPage(slug: string): Promise<Page> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/pages/${slug}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch admin page');
  return res.json();
}

export async function createPage(data: Partial<Page>): Promise<Page> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create page');
  return res.json();
}

export async function updatePage(slug: string, data: Partial<Page>): Promise<Page> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/pages/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update page');
  return res.json();
}

export async function deletePage(slug: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/admin/pages/${slug}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete page');
}
