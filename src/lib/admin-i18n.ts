import en from '@/messages/admin.en.json';
import zh from '@/messages/admin.zh.json';
import ar from '@/messages/admin.ar.json';

/**
 * Admin UI i18n loader (V8 / T7, fixed to Chinese in V8.5).
 *
 * The admin console previously hardcoded Chinese labels (e.g. nav "仪表盘"),
 * then gained an en/zh/ar switcher. As of V8.5 (bug 4) the entire backend
 * console is FIXED to Chinese — the language switcher in `AdminShell` is
 * disabled and `getAdminLocale()` always resolves `'zh'`. The three dictionaries
 * under `src/messages/admin.{en,zh,ar}.json` are kept so `adminT` still resolves
 * safely, but the Chinese dictionary is authoritative.
 *
 * This module is client-safe (no `next/server` imports) so it can be used from
 * the `AdminShell` client component.
 */

export type AdminLocale = 'en' | 'zh' | 'ar';

export const adminLocales: AdminLocale[] = ['en', 'zh', 'ar'];

const DICTS: Record<AdminLocale, Record<string, string>> = {
  en: en as unknown as Record<string, string>,
  zh: zh as unknown as Record<string, string>,
  ar: ar as unknown as Record<string, string>,
};

/**
 * V8.5 fix: bug 4 — the backend admin console is fixed to Chinese. We always
 * resolve `'zh'` so every admin page (dashboard, payment config, products,
 * blogs, orders, services, settings, nav/breadcrumb, …) renders in Chinese,
 * regardless of any stale `admin_locale` cookie. The storefront (next-intl,
 * `[locale]` routes) is intentionally unaffected and keeps its en/zh/ar support.
 */
export function getAdminLocale(): AdminLocale {
  return 'zh';
}

/**
 * Translate an admin UI key. Resolution order (V8.5, bug 4 — backend is fixed
 * to Chinese):
 *   1. requested/explicit locale dictionary
 *   2. Chinese dictionary (authoritative fallback)
 *   3. the key itself (never render an empty string)
 */
export function adminT(key: string, locale?: AdminLocale): string {
  const loc = locale ?? getAdminLocale();
  if (DICTS[loc] && DICTS[loc][key] !== undefined) return DICTS[loc][key];
  if (DICTS.zh[key] !== undefined) return DICTS.zh[key];
  return key;
}
