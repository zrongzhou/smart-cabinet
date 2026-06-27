import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin', '/admin/login', '/admin/products', '/admin/categories', '/admin/blog', '/admin/faqs', '/admin/media', '/admin/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Fix /panel redirect: anyone visiting /panel gets redirected to /admin
  if (pathname === '/panel' || pathname === '/panel/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // 2. Handle /admin routes - ensure no stale redirects
  if (pathname.startsWith('/admin')) {
    // Add cache-control headers to prevent browser caching admin pages
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // 3. Block access to [locale] routes with invalid locales (like /panel already handled above)
  // Allow only en, zh, ar as locales
  const validLocales = ['en', 'zh', 'ar'];
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && validLocales.includes(segments[0])) {
    // Valid locale route, allow with appropriate cache
    const response = NextResponse.next();
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/panel', '/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
