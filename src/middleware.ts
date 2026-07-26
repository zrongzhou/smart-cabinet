import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LOCALES = ['en', 'zh', 'ar'];
// 合法的非 locale 顶层路由（不走 [locale]，绝不能误判为非法 locale）
// 注意：'panel' 必须列入，否则会被下方「非法 locale 404」误杀，导致 /panel → /admin 重定向失效。
const LEGIT_TOPS = new Set(['admin', 'api', 'xiaozhouBackend', 'robots.txt', 'sitemap.xml', 'uploads', 'panel']);

// --- Public-page edge caching (CDN / EdgeOne) ---
// Public, locale-prefixed, GET-only pages receive a cacheable Cache-Control header
// so the CDN can serve them from the edge. Secrets / user-scoped routes are excluded.
const NO_CACHE_SEGMENTS = ['account', 'login', 'register', 'cart', 'checkout', 'applications', 'managed-items', 'user'];

// Admin/backend responses must never be cached by the CDN (EdgeOne injects a 7-day
// default cache when no Cache-Control is present, which would serve stale lists after
// a delete/edit). Force a strict no-store policy on every admin/backend response.
const ADMIN_NO_STORE = 'private, no-cache, no-store, max-age=0, must-revalidate';

/**
 * Decide whether a response for the given path/method may be cached at the edge.
 * Only GET requests under a valid locale prefix are cacheable; API, backend,
 * admin/panel and user-scoped (account/cart/checkout/…) routes are never cached.
 */
function isPublicCacheable(pathname: string, method: string): boolean {
  if (method !== 'GET') return false;
  const seg = pathname.split('/').filter(Boolean)[0] || '';
  if (!VALID_LOCALES.includes(seg)) return false; // only locale-prefixed public pages
  if (pathname.includes('/api/')) return false;
  if (pathname.includes('/xiaozhouBackend')) return false;
  if (pathname.includes('/admin')) return false;
  if (pathname.includes('/panel')) return false;
  for (const s of NO_CACHE_SEGMENTS) {
    if (pathname.includes('/' + s)) return false; // user-related / sensitive pages
  }
  return true;
}

/**
 * Attach `Cache-Control: public, s-maxage=7776000, stale-while-revalidate=604800` to a
 * response when the request targets a cacheable public page (90-day edge cache).
 */
function withPublicCache(response: NextResponse, request: NextRequest): NextResponse {
  if (isPublicCacheable(request.nextUrl.pathname, request.method)) {
    response.headers.set('Cache-Control', 'public, max-age=7776000, s-maxage=7776000, stale-while-revalidate=604800');
  }
  return response;
}

/**
 * Attach a strict `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`
 * to a response so the CDN (EdgeOne) never caches admin/backend API output.
 */
function withAdminNoStore(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', ADMIN_NO_STORE);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 根路径 308 跳转到默认语言 /en
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url, 308);
  }

  // 2. 非法 locale 首段 → 404（修复 /shop-2 等死链渲染首页造成的重复内容）
  //    matcher 已排除 _next/static、_next/image、favicon.ico、images/；
  //    其余合法顶层（admin/api/xiaozhouBackend/robots.txt/sitemap.xml/uploads）放行。
  const seg = pathname.split('/').filter(Boolean)[0] || '';
  if (seg && !VALID_LOCALES.includes(seg) && !LEGIT_TOPS.has(seg)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 3. 将当前 pathname 注入请求头，供根布局渲染正确的 <html lang/dir>
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 4. /panel 路由已废弃下线：直接 404
  //    （原 /panel → /admin 重定向已停用，避免指向已下线的后台）
  if (pathname === '/panel' || pathname.startsWith('/panel/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 5. /admin/* 后台已全部废弃下线：直接 404
  //    ⚠️ 仅保留 /xiaozhouBackend/* 作为后台入口。
  //    ⚠️ 不影响 /api/admin/** —— 该前缀路径为 /api/ 开头，xiaozhouBackend 依赖这些 API。
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 5b. 后台/管理端 API：强制 no-store，禁止 CDN 缓存
  //     /api/admin 以 /api/ 开头，不会被上方 /admin 404 拦截，这里单独兜底；
  //     /xiaozhouBackend 是后台入口，其列表/编辑接口同样禁止缓存。
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/xiaozhouBackend')) {
    return withAdminNoStore(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // 6. 合法 locale 路由
  if (seg && VALID_LOCALES.includes(seg)) {
    return withPublicCache(NextResponse.next({ request: { headers: requestHeaders } }), request);
  }

  return withPublicCache(NextResponse.next({ request: { headers: requestHeaders } }), request);
}

export const config = {
  matcher: ['/admin/:path*', '/panel', '/((?!_next/static|_next/image|favicon.ico|favicon.svg|images/).*)'],
};
