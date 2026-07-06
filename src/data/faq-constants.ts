// FAQ 固定分类枚举（11 项）
// 区块（ProductFaqBlock）与全局 add 页（admin/faqs/add）共用，避免魔法字符串散落。
// 值(value) 与 Prisma FAQ.category 字段一一对应；label 为后台展示用中文名。

export interface FaqCategoryOption {
  value: string;
  label: string;
}

export const FAQ_CATEGORIES: FaqCategoryOption[] = [
  { value: 'features', label: '功能特性' },
  { value: 'security', label: '安全权限' },
  { value: 'tracking', label: '追踪追溯' },
  { value: 'reporting', label: '报表导出' },
  { value: 'integration', label: '系统集成' },
  { value: 'products', label: '产品相关' },
  { value: 'customization', label: '定制开发' },
  { value: 'applications', label: '应用场景' },
  { value: 'sales', label: '购买咨询' },
  { value: 'support', label: '售后服务' },
  { value: 'company', label: '关于公司' },
];

// per-product FAQ 使用的状态枚举（与全局 add 页的 active/inactive 相互独立，见设计 §8）
export type ProductFaqStatus = 'active' | 'draft';

export const PRODUCT_FAQ_STATUS_OPTIONS: { value: ProductFaqStatus; label: string }[] = [
  { value: 'active', label: '启用 (Active)' },
  { value: 'draft', label: '草稿 (Draft)' },
];
