export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price?: number;
  description?: string;
  features?: string;
  images?: string[];
  category: string;
  status?: 'active' | 'inactive' | 'coming-soon';
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  publishedAt: string;
  tags: string[];
}
