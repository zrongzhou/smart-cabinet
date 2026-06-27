export interface Product {
  id: string;
  name: {
    en: string;
    zh: string;
    ar: string;
  };
  slug: string;
  sku?: string;
  categories?: string[];
  price?: number;
  hidePrice?: boolean;
  description?: {
    en: string;
    zh: string;
    ar: string;
  };
  features?: {
    en: string[];
    zh: string[];
    ar: string[];
  };
  images?: string[];
  specs?: {
    [key: string]: {
      en: string;
      zh: string;
      ar: string;
    };
  };
  status?: 'active' | 'inactive' | 'coming-soon';
  featured?: boolean;
  relatedProducts?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: {
    en: string;
    zh: string;
    ar: string;
  };
  slug: string;
  description?: {
    en: string;
    zh: string;
    ar: string;
  };
  icon?: string;
  status?: 'active' | 'inactive';
  order?: number;
}

export interface FAQ {
  id: string;
  question: {
    en: string;
    zh: string;
    ar: string;
  };
  answer: {
    en: string;
    zh: string;
    ar: string;
  };
  category?: string;
  order: number;
  status?: 'active' | 'inactive';
}

export interface BlogPost {
  id: string;
  title: {
    en: string;
    zh: string;
    ar: string;
  };
  slug: string;
  content: {
    en: string;
    zh: string;
    ar: string;
  };
  excerpt?: {
    en: string;
    zh: string;
    ar: string;
  };
  author?: string;
  publishedAt?: string;
  tags?: string[];
  coverImage?: string;
  status?: 'active' | 'inactive';
}
