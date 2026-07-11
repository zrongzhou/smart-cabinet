/**
 * product-url.ts
 * 产品公开访问路径的集中管理（v265 应用层扩展）。
 *
 * 背景：Excel 源数据中，柜体产品 url 在 /products/ 下，而 物料/行业/其他产品分别在
 * /applications/ 与 /solutions/ 下。seed 已按 store 的 slug 保留了这些前缀
 * （柜体=`xxx.html`，物料=`applications/xxx.html`，行业=`solutions/xxx.html`）。
 *
 * 为保留 Excel 原 url 可达，所有产品链接都应依据 slug 是否含 "/" 决定公开路径：
 *   - slug 含 "/"（如 `applications/tool-vending-machine-cnc-tools.html`）
 *       → 公开路径即 slug 本身
 *   - 否则（如 `tool-vending-machine-cnc-tools.html`）
 *       → 公开路径为 `products/<slug>`
 */

/** 返回产品相对公开路径（不含 locale 前缀，也不含站点根）。 */
export function getProductPublicPath(slug: string | null | undefined): string {
  if (!slug) return '';
  // Only solutions/ and applications/ prefixed slugs bypass the products/ segment.
  // A cabinet leaf that accidentally contains a stray "/" (e.g. "test-abc/a.html")
  // must still go through products/[...slug] — otherwise the URL would 404 because
  // no root-level route matches it.
  const lower = slug.toLowerCase();
  if (lower.startsWith('solutions/') || lower.startsWith('applications/')) return slug;
  return `products/${slug}`;
}

/** 返回产品导航链接（含 locale 前缀）。空 slug 返回 '#'。 */
export function getProductHref(slug: string | null | undefined, locale: string): string {
  if (!slug) return '#';
  return `/${locale}/${getProductPublicPath(slug)}`;
}
