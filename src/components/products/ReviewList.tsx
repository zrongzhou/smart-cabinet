'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/types/review';

// ReviewList component - displays reviews for a product
// Uses product slug instead of ID to avoid route conflicts

interface ReviewListProps {
  productSlug: string;
  locale: string;
  isLoggedIn: boolean;
  onReviewSubmitted?: () => void;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const ReviewList: React.FC<ReviewListProps> = ({
  productSlug,
  locale,
  isLoggedIn,
  onReviewSubmitted,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');
  const [showForm, setShowForm] = useState(false);

  const pageSize = 10;

  const translations: Record<string, Record<string, string>> = {
    en: {
      reviews: 'Reviews',
      writeReview: 'Write a Review',
      rating: 'Rating',
      average: 'Average',
      basedOn: 'based on',
      reviewCount: 'reviews',
      allRatings: 'All Ratings',
      star: 'Star',
      stars: 'Stars',
      filterBy: 'Filter by',
      sortBy: 'Sort by',
      newest: 'Newest',
      oldest: 'Oldest',
      mostHelpful: 'Most Helpful',
      highestRating: 'Highest Rating',
      lowestRating: 'Lowest Rating',
      verified: 'Verified Purchase',
      helpful: 'Helpful',
      notHelpful: 'Not Helpful',
      loadMore: 'Load More',
      noReviews: 'No reviews yet. Be the first to review this product!',
      submitReview: 'Submit Review',
      loading: 'Loading...',
    },
    zh: {
      reviews: '评论',
      writeReview: '写评论',
      rating: '评分',
      average: '平均',
      basedOn: '基于',
      reviewCount: '条评论',
      allRatings: '所有评分',
      star: '星',
      stars: '星',
      filterBy: '筛选',
      sortBy: '排序',
      newest: '最新',
      oldest: '最早',
      mostHelpful: '最有帮助',
      highestRating: '最高评分',
      lowestRating: '最低评分',
      verified: '已验证购买',
      helpful: '有帮助',
      notHelpful: '没帮助',
      loadMore: '加载更多',
      noReviews: '暂无评论。成为第一个评论此产品的人！',
      submitReview: '提交评论',
      loading: '加载中...',
    },
    ar: {
      reviews: 'المراجعات',
      writeReview: 'اكتب مراجعة',
      rating: 'التقييم',
      average: 'المتوسط',
      basedOn: 'بناء على',
      reviewCount: 'مراجعة',
      allRatings: 'جميع التقييمات',
      star: 'نجمة',
      stars: 'نجوم',
      filterBy: 'تصفية حسب',
      sortBy: 'ترتيب حسب',
      newest: 'الأحدث',
      oldest: 'الأقدم',
      mostHelpful: 'الأكثر فائدة',
      highestRating: 'أعلى تقييم',
      lowestRating: 'أقل تقييم',
      verified: 'مشتريات مؤكدة',
      helpful: 'مفيد',
      notHelpful: 'غير مفيد',
      loadMore: 'عرض المزيد',
      noReviews: 'لا توجد مراجعات بعد. كن أول من يراجع هذا المنتج!',
      submitReview: 'إرسال المراجعة',
      loading: 'جاري التحميل...',
    },
  };

  const t = translations[locale] || translations.en;

  useEffect(() => {
    fetchReviews();
  }, [productSlug, page, filter, sort]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort,
      });

      if (filter !== 'all') {
        params.append('rating', filter);
      }

      // First, get the product to find its ID
      const productRes = await fetch(`/api/products?slug=${productSlug}&status=all`);
      if (!productRes.ok) {
        throw new Error('Product not found');
      }
      const productData = await productRes.json();
      const product = productData.data?.[0];
      
      if (!product) {
        throw new Error('Product not found');
      }

      const response = await fetch(
        `/api/products/${productSlug}/reviews?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful }),
      });

      // Refresh reviews to show updated counts
      fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg';
    return (
      <div className={`flex items-center ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {t.reviews} ({stats?.total || 0})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {t.writeReview}
        </button>
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t.writeReview}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {/* ReviewForm will be imported here */}
            <p className="text-gray-600 mb-4">
              {t.loading} ReviewForm component...
            </p>
          </div>
        </div>
      )}

      {/* Rating Statistics */}
      {stats && stats.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats.average.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.average), 'lg')}
              <p className="text-sm text-gray-600 mt-2">
                {t.basedOn} {stats.total} {t.reviewCount}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star as keyof typeof stats.distribution] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <button
                      onClick={() => setFilter(filter === star.toString() ? 'all' : star.toString())}
                      className={`text-sm ${filter === star.toString() ? 'font-bold text-blue-600' : 'text-gray-600'} hover:text-blue-600`}
                    >
                      {star} {t.star}
                    </button>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-600 mr-2">{t.filterBy}:</label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded"
          >
            <option value="all">{t.allRatings}</option>
            <option value="5">5 {t.stars}</option>
            <option value="4">4 {t.stars}</option>
            <option value="3">3 {t.stars}</option>
            <option value="2">2 {t.stars}</option>
            <option value="1">1 {t.star}</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mr-2">{t.sortBy}:</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
            <option value="most_helpful">{t.mostHelpful}</option>
            <option value="highest_rating">{t.highestRating}</option>
            <option value="lowest_rating">{t.lowestRating}</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">{t.loading}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t.noReviews}</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating, 'sm')}
                    {review.isVerified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {t.verified}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{review.authorName}</span>
                    <span>•</span>
                    <span>{formatDate(review.createdAt.toString())}</span>
                  </div>
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold mb-2">{review.title}</h4>
              )}

              <p className="text-gray-700 mb-4">{review.content}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Buttons */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">{t.helpful}?</span>
                <button
                  onClick={() => handleHelpful(review.id, true)}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                >
                  <span>👍</span>
                  <span>({review.helpful})</span>
                </button>
                <button
                  onClick={() => handleHelpful(review.id, false)}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                >
                  <span>👎</span>
                  <span>({review.notHelpful})</span>
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
