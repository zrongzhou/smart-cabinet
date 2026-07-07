import en from '@/messages/admin.en.json';
import zh from '@/messages/admin.zh.json';
import ar from '@/messages/admin.ar.json';

/**
 * Admin UI i18n loader (V8 / T7).
 *
 * The admin console previously hardcoded Chinese labels (e.g. nav "仪表盘").
 * We now keep three locale dictionaries under `src/messages/admin.{en,zh,ar}.json`
 * and resolve labels through `adminT(key)`. The active locale is stored in the
 * `admin_locale` cookie (`getAdminLocale`) and falls back to `en`.
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
 * Read the admin UI locale from the `admin_locale` cookie, defaulting to `en`.
 * Safe during SSR / when `document` is unavailable (returns `en`).
 */
export function getAdminLocale(): AdminLocale {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('admin_locale='));
  if (!match) return 'en';
  const raw = decodeURIComponent(match.split('=').slice(1).join('=')).trim();
  return (adminLocales as string[]).includes(raw) ? (raw as AdminLocale) : 'en';
}

/**
 * Translate an admin UI key. Resolution order:
 *   1. requested/explicit locale dictionary
 *   2. `en` fallback dictionary
 *   3. the key itself (never render an empty string)
 */
export function adminT(key: string, locale?: AdminLocale): string {
  const loc = locale ?? getAdminLocale();
  if (DICTS[loc] && DICTS[loc][key] !== undefined) return DICTS[loc][key];
  if (DICTS.en[key] !== undefined) return DICTS.en[key];
  return key;
}
