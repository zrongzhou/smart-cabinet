import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'zh', 'ar'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  const lower = acceptLanguage.toLowerCase();
  if (lower.startsWith('zh')) return 'zh';
  if (lower.startsWith('ar')) return 'ar';
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin / panel 路由：强制 no-store，禁止浏览器缓存
  if (pathname.startsWith('/admin') || pathname.startsWith('/xiaozhouBackend') || pathname.startsWith('/panel')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // 静态资源 / API 直接放行
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return;
  }

  // 已经是 locale 前缀，直接放行
  const hasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (hasLocale) {
    // 产品列表页 HTML：禁止浏览器/代理缓存。分类排序等前端逻辑依赖最新 JS，
    // 旧的 HTML 缓存会让用户停留在旧包，导致「排序不生效」等回归问题。
    // 静态资源(_next/static)仍走长缓存，不受影响。
    if (pathname.endsWith('/products')) {
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      // 传递当前 pathname 给根布局，用于服务端渲染 <html lang/dir>
      response.headers.set('x-pathname', request.nextUrl.pathname);
      return response;
    }
    // 将当前 pathname 通过请求头传给根布局，使其可按 locale 渲染 <html lang/dir>
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', request.nextUrl.pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 重定向到对应语言的路径（显式 308 永久重定向）
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl, 308);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
