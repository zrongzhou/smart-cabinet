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
  if (pathname.startsWith('/admin') || pathname.startsWith('/panel')) {
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
  if (hasLocale) return;

  // 重定向到对应语言的路径
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
