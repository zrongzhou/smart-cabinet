'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Eye, Trash2, Filter } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

interface Review {
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
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    slug: string;
    name: { en: string; zh: string; ar: string };
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const AdminReviewsPage = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);

  const pageSize = 20;

  const translations: Record<string, Record<string, string>> = {
    en: {
      title: 'Reviews Management',
      all: 'All',
      approved: 'Approved',
      pending: 'Pending',
      filterBy: 'Filter by:',
      product: 'Product',
      author: 'Author',
      rating: 'Rating',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      view: 'View',
      verified: 'Verified',
      confirmDelete: 'Are you sure you want to delete this review?',
      confirmApprove: 'Approve this review?',
      confirmReject: 'Reject this review?',
      success: 'Operation completed successfully',
      error: 'An error occurred',
      noReviews: 'No reviews found',
    },
    zh: {
      title: '评论管理',
      all: '全部',
      approved: '已审核',
      pending: '待审核',
      filterBy: '筛选：',
      product: '产品',
      author: '作者',
      rating: '评分',
      status: '状态',
      date: '日期',
      actions: '操作',
      approve: '批准',
      reject: '拒绝',
      delete: '删除',
      view: '查看',
      verified: '已验证',
      confirmDelete: '确定要删除此评论吗？',
      confirmApprove: '批准此评论？',
      confirmReject: '拒绝此评论？',
      success: '操作成功',
      error: '发生错误',
      noReviews: '暂无评论',
    },
    ar: {
      title: 'إدارة المراجعات',
      all: 'الكل',
      approved: 'معتمدة',
      pending: 'قيد الانتظار',
      filterBy: 'تصفية حسب:',
      product: 'المنتج',
      author: 'الكاتب',
      rating: 'التقييم',
      status: 'الحالة',
      date: 'التاريخ',
      actions: 'الإجراءات',
      approve: 'اعتماد',
      reject: 'رفض',
      delete: 'حذف',
      view: 'عرض',
      verified: 'مؤكدة',
      confirmDelete: 'هل أنت متأكد من حذف هذه المراجعة؟',
      confirmApprove: 'اعتماد هذه المراجعة؟',
      confirmReject: 'رفض هذه المراجعة؟',
      success: 'تمت العملية بنجاح',
      error: 'حدث خطأ',
      noReviews: 'لا توجد مراجعات',
    },
  };

  const translate = (key: string): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  };

  useEffect(() => {
    fetchReviews();
  }, [page, filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (filter !== 'all') {
        params.append('isApproved', filter === 'approved' ? 'true' : 'false');
      }

      const response = await fetch(`/api/admin/reviews?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else if (response.status === 401 || response.status === 403) {
        router.push('/xiaozhouBackend/login');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    if (!confirm(translate('confirmApprove'))) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ isApproved: true }),
      });

      if (response.ok) {
        alert(translate('success'));
        fetchReviews();
      } else {
        alert(translate('error'));
      }
    } catch (error) {
      alert(translate('error'));
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm(translate('confirmReject'))) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ isApproved: false }),
      });

      if (response.ok) {
        alert(translate('success'));
        fetchReviews();
      } else {
        alert(translate('error'));
      }
    } catch (error) {
      alert(translate('error'));
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm(translate('confirmDelete'))) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        alert(translate('success'));
        fetchReviews();
      } else {
        alert(translate('error'));
      }
    } catch (error) {
      alert(translate('error'));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
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
    return date.toLocaleDateString();
  };

  const translateProductName = (name: { en: string; zh: string; ar: string }) => {
    if (!name) return '';
    return name[locale] || name.en || name.zh || name.ar || '';
  };

  return (
    <div className="p-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{translate('title')}</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{translate('filterBy')}</span>
        </div>
        <button
          onClick={() => {
            setFilter('all');
            setPage(1);
          }}
          className={`px-4 py-2 rounded ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {translate('all')}
        </button>
        <button
          onClick={() => {
            setFilter('approved');
            setPage(1);
          }}
          className={`px-4 py-2 rounded ${
            filter === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {translate('approved')}
        </button>
        <button
          onClick={() => {
            setFilter('pending');
            setPage(1);
          }}
          className={`px-4 py-2 rounded ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {translate('pending')}
        </button>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{translate('noReviews')}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translate('product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translate('author')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translate('rating')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translate('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translate('date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translate('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {review.product
                          ? translateProductName(review.product.name)
                          : review.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{review.authorName}</div>
                      {review.isVerified && (
                        <span className="text-xs text-green-600">{translate('verified')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          review.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {review.isApproved ? translate('approved') : translate('pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title={translate('view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="text-green-600 hover:text-green-900"
                            title={translate('approve')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {review.isApproved && (
                          <button
                            onClick={() => handleReject(review.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={translate('reject')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:text-red-900"
                          title={translate('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
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

      {/* Review Detail Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Review Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <strong>Product:</strong>{' '}
                {selectedReview.product
                  ? translateProductName(selectedReview.product.name)
                  : selectedReview.productId}
              </div>

              <div>
                <strong>Author:</strong>{' '}
                {selectedReview.authorName}
                {selectedReview.authorEmail && (
                  <span className="text-gray-500"> ({selectedReview.authorEmail})</span>
                )}
              </div>

              <div>
                <strong>Rating:</strong>{' '}
                {renderStars(selectedReview.rating)}
              </div>

              {selectedReview.title && (
                <div>
                  <strong>Title:</strong>{' '}
                  {selectedReview.title}
                </div>
              )}

              <div>
                <strong>Content:</strong>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                  {selectedReview.content}
                </p>
              </div>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <strong>Images:</strong>
                  <div className="flex gap-2 mt-1">
                    {selectedReview.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <strong>Status:</strong>{' '}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedReview.isApproved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedReview.isApproved ? translate('approved') : translate('pending')}
                </span>
                {selectedReview.isVerified && (
                  <span className="ml-2 text-xs text-green-600">{translate('verified')}</span>
                )}
              </div>

              <div>
                <strong>Helpfulness:</strong>{' '}
                {selectedReview.helpful} helpful, {selectedReview.notHelpful} not helpful
              </div>

              <div>
                <strong>Date:</strong>{' '}
                {formatDate(selectedReview.createdAt)}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {!selectedReview.isApproved && (
                <button
                  onClick={() => {
                    handleApprove(selectedReview.id);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {translate('approve')}
                </button>
              )}
              {selectedReview.isApproved && (
                <button
                  onClick={() => {
                    handleReject(selectedReview.id);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  {translate('reject')}
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete(selectedReview.id);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {translate('delete')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
