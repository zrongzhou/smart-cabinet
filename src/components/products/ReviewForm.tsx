'use client';

import React, { useState } from 'react';

interface ReviewFormProps {
  productId: string;
  locale: string;
  isLoggedIn: boolean;
  userName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  locale,
  isLoggedIn,
  userName,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(userName || '');
  const [authorEmail, setAuthorEmail] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const translations: Record<string, Record<string, string>> = {
    en: {
      writeReview: 'Write a Review',
      rating: 'Rating',
      title: 'Title (Optional)',
      content: 'Review Content',
      yourName: 'Your Name',
      yourEmail: 'Email (Optional)',
      uploadImages: 'Upload Images (Max 3)',
      submit: 'Submit Review',
      cancel: 'Cancel',
      submitting: 'Submitting...',
      success: 'Review submitted successfully! It will be visible after approval.',
      errorName: 'Please enter your name',
      errorContent: 'Please enter review content',
      errorRating: 'Please select a rating',
      loggedInAs: 'Logged in as',
      willBeVerified: 'Your review will be marked as verified purchase',
    },
    zh: {
      writeReview: '写评论',
      rating: '评分',
      title: '标题（可选）',
      content: '评论内容',
      yourName: '您的姓名',
      yourEmail: '邮箱（可选）',
      uploadImages: '上传图片（最多3张）',
      submit: '提交评论',
      cancel: '取消',
      submitting: '提交中...',
      success: '评论提交成功！审核通过后将显示。',
      errorName: '请输入您的姓名',
      errorContent: '请输入评论内容',
      errorRating: '请选择评分',
      loggedInAs: '登录为',
      willBeVerified: '您的评论将标记为已验证购买',
    },
    ar: {
      writeReview: 'اكتب مراجعة',
      rating: 'التقييم',
      title: 'العنوان (اختياري)',
      content: 'محتوى المراجعة',
      yourName: 'اسمك',
      yourEmail: 'البريد الإلكتروني (اختياري)',
      uploadImages: 'رفع الصور (الحد الأقصى 3)',
      submit: 'إرسال المراجعة',
      cancel: 'إلغاء',
      submitting: 'جاري الإرسال...',
      success: 'تم إرسال المراجعة بنجاح! ستظهر بعد الموافقة.',
      errorName: 'الرجاء إدخال اسمك',
      errorContent: 'الرجاء إدخال محتوى المراجعة',
      errorRating: 'الرجاء اختيار التقييم',
      loggedInAs: 'مسجل الدخول ك',
      willBeVerified: 'ستتم标记 مراجعتك كمشتريات مؤكدة',
    },
  };

  const t = translations[locale] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!authorName.trim()) {
      setError(t.errorName);
      return;
    }

    if (!content.trim()) {
      setError(t.errorContent);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          authorName,
          authorEmail: authorEmail || undefined,
          rating,
          title: title || undefined,
          content,
          images,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 3) return;

    // For simplicity, we'll use base64 encoding
    // In production, you should upload to a server
    const newImages: string[] = [];

    for (let i = 0; i < Math.min(files.length, 3 - images.length); i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (success) {
    return (
      <div className="text-center py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <p className="text-gray-700">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <h3 className="text-xl font-semibold">{t.writeReview}</h3>

      {/* Logged in info */}
      {isLoggedIn && userName && (
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded">
          {t.loggedInAs}: <strong>{userName}</strong>
          <br />
          <span className="text-sm">{t.willBeVerified}</span>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.rating} *
        </label>
        <div className="flex gap-2 text-3xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`focus:outline-none transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.title}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={200}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.content} *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Author Name (for non-logged in users) */}
      {!isLoggedIn && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.yourName} *
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      )}

      {/* Author Email (optional) */}
      {!isLoggedIn && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.yourEmail}
          </label>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.uploadImages}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={images.length >= 3}
          className="w-full"
        />
        {images.length > 0 && (
          <div className="flex gap-2 mt-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? t.submitting : t.submit}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t.cancel}
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
