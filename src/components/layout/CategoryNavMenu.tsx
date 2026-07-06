'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useLocale } from '@/lib/i18n';

// ============================================================
// CategoryNavMenu — 「产品分类」两级下拉（P0-5）
//
// 挂载时 fetch /api/categories，本地计算：
//   L1 = cats.filter(c => !c.parentId)
//   L2 = L1.children（API 已 include children）
// 渲染 L1（仅容器，不可点）→ 其下 L2 链接，L2 指向 /{locale}/products?category=<L2.slug>
//
// variant:
//   'desktop' —— 顶部导航「产品 ▾」hover/click 展开浮层（对齐现有语言切换浮层）
//   'mobile'  —— 移动端抽屉内逐层展开（点击 L1 展开 L2，点 L2 跳转并收起抽屉）
// ============================================================

interface ApiCategory {
  id: string;
  slug: string;
  name: { zh?: string; en?: string; ar?: string };
  parentId?: string | null;
  type?: string;
  icon?: string | null;
  children?: ApiCategory[];
}

interface CategoryNavMenuProps {
  variant?: 'desktop' | 'mobile';
  /** mobile 模式下点击 L2 后回调（用于收起抽屉） */
  onNavigate?: () => void;
}

/** 按当前 locale 取分类名（对齐 products/page.tsx 的取名逻辑）。 */
function getLocalizedName(name: any, locale: string): string {
  if (name && typeof name === 'object') {
    if (locale === 'zh') return name.zh || name.en || name.ar || '';
    if (locale === 'ar') return name.ar || name.en || name.zh || '';
    return name.en || name.zh || name.ar || '';
  }
  return String(name || '');
}

export default function CategoryNavMenu({ variant = 'desktop', onNavigate }: CategoryNavMenuProps) {
  const { locale, t } = useLocale();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = (await res.json()) as ApiCategory[];
        if (!cancelled) setCategories(data || []);
      } catch (e) {
        console.error('[CategoryNavMenu] 加载分类失败：', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // L1 = 无 parentId 的分类；其 children 即 L2
  const l1List = categories.filter((c) => !c.parentId);
  const triggerLabel = t('nav.products') || 'Products';

  if (loading || l1List.length === 0) {
    // 加载中或暂无分类：降级为普通「产品」链接，避免空白
    return (
      <Link
        href={`/${locale}/products`}
        className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
      >
        {triggerLabel}
      </Link>
    );
  }

  // ===================== 桌面端浮层 =====================
  if (variant === 'desktop') {
    return (
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
          aria-expanded={open}
        >
          <span>{triggerLabel}</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <>
            {/* hover 桥接：防止鼠标移动到浮层时缝隙导致收起 */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-[640px] max-w-[90vw] bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 grid grid-cols-2 gap-4">
              {l1List.map((l1) => (
                <div key={l1.id} className="min-w-0">
                  {/* L1 仅作容器，不可点 */}
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 truncate">
                    {getLocalizedName(l1.name, locale)}
                  </div>
                  <div className="flex flex-col gap-1">
                    {(l1.children || []).map((l2) => (
                      <Link
                        key={l2.id}
                        href={`/${locale}/products?category=${l2.slug}`}
                        className="px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors truncate"
                      >
                        {getLocalizedName(l2.name, locale)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ===================== 移动端抽屉手风琴 =====================
  return (
    <div className="space-y-1">
      {l1List.map((l1) => {
        const isExpanded = !!expanded[l1.id];
        return (
          <div key={l1.id}>
            <button
              type="button"
              onClick={() => setExpanded((prev) => ({ ...prev, [l1.id]: !prev[l1.id] }))}
              className="w-full flex items-center justify-between py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium min-h-[44px]"
              aria-expanded={isExpanded}
            >
              <span>{getLocalizedName(l1.name, locale)}</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
              <div className="pl-6 flex flex-col">
                {(l1.children || []).map((l2) => (
                  <Link
                    key={l2.id}
                    href={`/${locale}/products?category=${l2.slug}`}
                    onClick={() => onNavigate?.()}
                    className="py-2.5 px-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm min-h-[40px] flex items-center"
                  >
                    {getLocalizedName(l2.name, locale)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
