import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LOCALES = ['en', 'zh', 'ar'];
// 合法的非 locale 顶层路由（不走 [locale]，绝不能误判为非法 locale）
// 注意：'panel' 必须列入，否则会被下方「非法 locale 404」误杀，导致 /panel → /admin 重定向失效。
const LEGIT_TOPS = new Set(['admin', 'api', 'xiaozhouBackend', 'robots.txt', 'sitemap.xml', 'uploads', 'panel']);

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

  // 4. /panel → /admin
  if (pathname === '/panel' || pathname === '/panel/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // 5. admin 路由：禁止缓存
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // 6. 合法 locale 路由
  if (seg && VALID_LOCALES.includes(seg)) {
    if (pathname.endsWith('/products')) {
      const response = NextResponse.next({ request: { headers: requestHeaders } });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin/:path*', '/panel', '/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
