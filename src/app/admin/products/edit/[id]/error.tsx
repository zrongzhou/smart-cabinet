'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, List } from 'lucide-react';

/**
 * 路由级错误边界：捕获 /admin/products/edit/[id] 段在渲染期抛出的任何未预料异常，
 * 避免整页白屏（"Application error: a client-side exception has occurred"）。
 * 即便 edit/page.tsx 内的防御逻辑未能兜住，这里也能给用户一个可操作的兜底页。
 */
export default function EditProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误便于排查（白屏问题定位）
    console.error('[admin/products/edit/[id]] render error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <List className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">产品未找到，请返回列表</h1>
        <p className="text-sm text-gray-500 mb-6">
          抱歉，页面加载出错。该产品可能已被删除、链接无效，或数据格式异常。
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            重试
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <List className="w-4 h-4" />
            返回产品列表
          </Link>
        </div>
      </div>
    </div>
  );
}
