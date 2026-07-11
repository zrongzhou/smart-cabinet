'use client';

import { notFound } from 'next/navigation';

/**
 * 弃用后台（DEPRECATED）：产品管理列表页已迁移至活动后台 /xiaozhouBackend/products。
 * 出于安全与一致性考虑，旧 /admin 产品管理页面统一返回 404，不再渲染任何内容。
 * 历史实现保留在 git 历史中，如需恢复可回溯本文件旧版本。
 */
export default function AdminProductsPage() {
  notFound();
}
