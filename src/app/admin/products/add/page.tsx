'use client';

import { notFound } from 'next/navigation';

/**
 * 弃用后台（DEPRECATED）：添加产品页面已迁移至活动后台 /xiaozhouBackend。
 * 统一返回 404，不再渲染任何内容。历史实现保留在 git 历史中。
 */
export default function AddProductPage() {
  notFound();
}
