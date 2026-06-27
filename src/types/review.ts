// Review type definitions

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
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Relations (optional, included when fetched with relations)
  product?: {
    id: string;
    slug: string;
    name: { en: string; zh: string; ar: string };
  };
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ReviewResponse {
  data: Review[];
  stats: ReviewStats;
  pagination: ReviewPagination;
}
