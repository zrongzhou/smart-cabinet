import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware
 * ----------
 * 职责：
 *  1. 根路径 `/` → 308 永久重定向到 `/en`（明确语义，避免 307 临时重定向）。
 *  2. `/panel` → `/admin` 重定向（旧后台入口已废弃）。
 *  3. `/admin` 路由注入 `no-store` 系列响应头，防止后台页面被浏览器/代理缓存。
 *  4. 在所有命中的请求上注入 `x-pathname` 请求头，供根布局 layout.tsx
 *     在服务端渲染正确的 <html lang/dir>（阿语页 SSR 即带 dir="rtl"），
 *     不再依赖客户端 useEffect。
 *
 * 注意：本文件【绝不】改动两级关键词系统（seo-keywords.ts），
 * 也不处理 canonical / keywords，仅负责重定向、缓存头与 x-pathname 注入。
 */

const ADMIN_PATHS = [
  '/admin',
  '/admin/login',
  '/admin/products',
  '/admin/categories',
  '/admin/blog',
  '/admin/faqs',
  '/admin/media',
  '/admin/settings',
];

/**
 * 克隆当前请求头并以 `x-pathname` 写入真实 pathname，
 * 使下游 Server Component（layout.tsx）能通过 headers() 读取。
 */
function withPathnameHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  return requestHeaders;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 根路径 → 308 永久重定向到 /en
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url, 308);
  }

  // 2. /panel → /admin 重定向（旧后台入口已废弃）
  if (pathname === '/panel' || pathname === '/panel/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url, 308);
  }

  // 3. /admin 路由：注入 x-pathname 头，并强制 no-cache
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next({
      request: { headers: withPathnameHeader(request) },
    });
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // 4. 合法 locale 路由（en/zh/ar）：注入 x-pathname 头后放行
  const validLocales = ['en', 'zh', 'ar'];
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && validLocales.includes(segments[0])) {
    // 产品列表页 HTML：禁止浏览器/代理缓存。分类排序等前端逻辑依赖最新 JS，
    // 旧的 HTML 缓存会让用户停留在旧包，导致「排序不生效」等回归问题。
    // 静态资源(_next/static)仍走长缓存，不受影响。
    if (pathname.endsWith('/products')) {
      const response = NextResponse.next({
        request: { headers: withPathnameHeader(request) },
      });
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      );
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
    // 其它合法 locale 路由，注入头后放行
    return NextResponse.next({
      request: { headers: withPathnameHeader(request) },
    });
  }

  // 5. 其它所有命中 matcher 的请求：兜底注入 x-pathname 头，保证 SSR lang/dir 正确
  return NextResponse.next({
    request: { headers: withPathnameHeader(request) },
  });
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/panel',
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
