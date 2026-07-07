'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
  ImageIcon,
  Tag,
  Edit3,
  MessageSquare,
  ChevronRight,
  Users,
  ShoppingCart,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  getAdminLocale,
  adminT,
  adminLocales,
  type AdminLocale,
} from '@/lib/admin-i18n';

export const dynamic = 'force-dynamic';

type AdminPrefix = 'admin' | 'xiaozhouBackend';

interface AdminShellProps {
  /** Which backend console is rendering: `admin` or `xiaozhouBackend`. */
  prefix: AdminPrefix;
  children: React.ReactNode;
}

interface NavItem {
  key: string;
  /** Sub-path appended to the prefix; empty string means the dashboard root. */
  path: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', path: '', icon: LayoutDashboard },
  { key: 'products', path: '/products', icon: Package },
  { key: 'categories', path: '/categories', icon: Tag },
  { key: 'blog', path: '/blog', icon: FileText },
  { key: 'faq', path: '/faqs', icon: HelpCircle },
  { key: 'media', path: '/media', icon: ImageIcon },
  { key: 'editor', path: '/editor', icon: Edit3 },
  { key: 'settings', path: '/settings', icon: Settings },
  { key: 'messages', path: '/contact-messages', icon: MessageSquare },
  { key: 'users', path: '/users', icon: Users },
  { key: 'orders', path: '/orders', icon: ShoppingCart },
  { key: 'services', path: '/services', icon: Wrench },
];

const LOCALE_LABELS: Record<AdminLocale, string> = {
  en: 'EN',
  zh: '中文',
  ar: 'العربية',
};

/**
 * Shared admin console shell used by both `/admin` and `/xiaozhouBackend`.
 *
 * Extracts the previously duplicated layout markup, design tokens and styles
 * from the two legacy layout files. Navigation labels are resolved through the
 * admin i18n dictionaries (`src/lib/admin-i18n`) so the console is no longer
 * hardcoded to Chinese. A client-side locale switcher (cookie `admin_locale`)
 * drives `dir="rtl"` for Arabic.
 *
 * Security note: the `admin_authenticated` localStorage flag is a *UX* guard
 * only (avoid flashing the console before redirect). Real authorization is
 * enforced server-side by `requireAdmin` on every `/api/admin/*` route.
 */
export default function AdminShell({ prefix, children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locale, setLocale] = useState<AdminLocale>('en');

  const loginPath = `/${prefix}/login`;

  useEffect(() => {
    setMounted(true);
    try {
      const auth =
        typeof window !== 'undefined' && window.localStorage
          ? localStorage.getItem('admin_authenticated') === 'true'
          : false;
      setIsAuthenticated(auth);
    } catch {
      setIsAuthenticated(false);
    }
    try {
      setLocale(getAdminLocale());
    } catch {
      setLocale('en');
    }
  }, []);

  // UX redirect guard (non-security): bounce to login if not "authenticated".
  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated && pathname !== loginPath) {
      router.push(loginPath);
    }
  }, [isAuthenticated, mounted, pathname, loginPath]);

  // Close the user dropdown whenever the route changes.
  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  // Don't render until client-side mount to prevent hydration mismatch.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // The login page renders its own full-screen UI.
  if (pathname === loginPath) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
    }
    // Clear the httpOnly auth cookie (client can only expire it).
    document.cookie = 'admin_auth=;path=/;max-age=0';
    router.push(loginPath);
  };

  const handleLocaleChange = (loc: AdminLocale) => {
    if (typeof document !== 'undefined') {
      document.cookie = `admin_locale=${loc};path=/;max-age=${60 * 60 * 24 * 365}`;
    }
    setLocale(loc);
  };

  const adminUser =
    typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem('admin_user') || 'Admin'
      : 'Admin';

  const t = (key: string) => adminT(key, locale);

  const navLinks = NAV_ITEMS.map((item) => ({
    ...item,
    // V8.3 fix: bug 4 — build an ABSOLUTE href (leading slash). The previous
    // `${prefix}${item.path}` produced a relative URL that resolved against the
    // current path, yielding doubled prefixes like
    // `/xiaozhouBackend/xiaozhouBackend/products` which 404.
    href: `/${prefix}${item.path}`,
    label: t(`nav.${item.key}`),
  }));

  const isRtl = locale === 'ar';

  return (
    <>
      {/* Global Admin Styles (shared design tokens extracted from the legacy layouts) */}
      <style jsx global>{`
        /* Admin Design System Variables - Enhanced */
        :root {
          --admin-primary: #3b82f6;
          --admin-primary-dark: #1d4ed8;
          --admin-primary-light: #60a5fa;
          --admin-secondary: #06b6d4;
          --admin-accent: #8b5cf6;
          --admin-success: #10b981;
          --admin-warning: #f59e0b;
          --admin-danger: #ef4444;
          --admin-surface: #ffffff;
          --admin-surface-hover: #f8fafc;
          --admin-bg: #f8fafc;
          --admin-border: #e2e8f0;
          --admin-text-primary: #0f172a;
          --admin-text-secondary: #475569;
          --admin-text-muted: #94a3b8;
          --admin-sidebar-bg: #0f172a;
          --admin-sidebar-surface: #1e293b;
          --admin-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.08);
          --admin-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.08), 0 1px 3px -1px rgb(0 0 0 / 0.08);
          --admin-shadow-md: 0 8px 16px -2px rgb(0 0 0 / 0.1), 0 4px 8px -2px rgb(0 0 0 / 0.08);
          --admin-shadow-lg: 0 16px 24px -4px rgb(0 0 0 / 0.12), 0 8px 12px -4px rgb(0 0 0 / 0.08);
          --admin-radius: 1rem;
          --admin-radius-sm: 0.75rem;
          --admin-radius-lg: 1.25rem;
          --admin-radius-xl: 1.5rem;
        }

        /* Card Styles - Enhanced */
        .admin-card {
          background: var(--admin-surface);
          border-radius: var(--admin-radius-lg);
          box-shadow: var(--admin-shadow);
          border: 1px solid var(--admin-border);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 2rem;
        }

        .admin-card:hover {
          box-shadow: var(--admin-shadow-md);
          border-color: var(--admin-primary-light);
          transform: translateY(-2px);
        }

        .admin-card-elevated {
          background: var(--admin-surface);
          border-radius: var(--admin-radius-xl);
          box-shadow: var(--admin-shadow-lg);
          border: 1px solid var(--admin-border);
          padding: 2rem;
        }

        /* Stat Card Specific Styles */
        .admin-stat-card {
          background: var(--admin-surface);
          border-radius: var(--admin-radius-lg);
          box-shadow: var(--admin-shadow);
          border: 1px solid var(--admin-border);
          padding: 2rem;
          min-height: 140px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-stat-card:hover {
          box-shadow: var(--admin-shadow-md);
          transform: translateY(-4px);
          border-color: var(--admin-primary-light);
        }

        /* Icon Container */
        .admin-icon-container {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: var(--admin-radius);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .admin-icon-container:hover {
          transform: scale(1.05);
        }

        .admin-icon-container svg {
          width: 1.75rem;
          height: 1.75rem;
        }

        /* Table Styles - Enhanced */
        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .admin-table thead tr {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .admin-table thead th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--admin-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--admin-border);
        }

        .admin-table tbody tr {
          transition: all 0.2s ease;
        }

        .admin-table tbody tr:nth-child(odd) {
          background: var(--admin-surface);
        }

        .admin-table tbody tr:nth-child(even) {
          background: rgba(248, 250, 252, 0.8);
        }

        .admin-table tbody tr:hover {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .admin-table tbody td {
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          color: var(--admin-text-primary);
          border-bottom: 1px solid var(--admin-border);
        }

        /* Button Styles - Enhanced */
        .admin-btn-primary {
          background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--admin-radius-sm);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          height: 2.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .admin-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
        }

        .admin-btn-secondary {
          background: var(--admin-surface);
          color: var(--admin-text-primary);
          padding: 0.75rem 1.5rem;
          border-radius: var(--admin-radius-sm);
          font-weight: 500;
          font-size: 0.875rem;
          border: 1px solid var(--admin-border);
          transition: all 0.2s ease;
          height: 2.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .admin-btn-secondary:hover {
          background: var(--admin-surface-hover);
          border-color: var(--admin-primary);
          color: var(--admin-primary);
        }

        .admin-btn-danger {
          background: linear-gradient(135deg, var(--admin-danger) 0%, #dc2626 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--admin-radius-sm);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
          height: 2.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .admin-btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4);
        }

        /* Alias classes used across admin pages (kept in sync with admin-btn-*) */
        .btn-primary {
          background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%);
          color: #ffffff;
          padding: 0.75rem 1.5rem;
          border-radius: var(--admin-radius-sm);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          height: 2.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary {
          background: var(--admin-surface);
          color: var(--admin-text-primary);
          padding: 0.75rem 1.5rem;
          border-radius: var(--admin-radius-sm);
          font-weight: 500;
          font-size: 0.875rem;
          border: 1px solid var(--admin-border);
          transition: all 0.2s ease;
          height: 2.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-secondary:hover {
          background: var(--admin-surface-hover);
          border-color: var(--admin-primary);
          color: var(--admin-primary);
        }

        /* Action Button Styles - Soft Background */
        .admin-btn-action-edit {
          padding: 0.5rem;
          border-radius: var(--admin-radius-sm);
          color: #2563eb;
          background: rgba(37, 99, 235, 0.08);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .admin-btn-action-edit:hover {
          background: rgba(37, 99, 235, 0.15);
          transform: scale(1.05);
        }

        .admin-btn-action-delete {
          padding: 0.5rem;
          border-radius: var(--admin-radius-sm);
          color: #dc2626;
          background: rgba(220, 38, 38, 0.08);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .admin-btn-action-delete:hover {
          background: rgba(220, 38, 38, 0.15);
          transform: scale(1.05);
        }

        /* Badge Styles - Enhanced */
        .admin-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 1rem;
          border-radius: 9999px;
          font-size: 0.8125rem;
          font-weight: 500;
          gap: 0.375rem;
        }

        .admin-badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .admin-badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .admin-badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .admin-badge-info {
          background: #dbeafe;
          color: #1e40af;
        }

        /* Input Styles - Enhanced */
        .admin-input {
          width: 100%;
          padding: 0.75rem 1.25rem;
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-sm);
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: var(--admin-surface);
          height: 2.75rem;
        }

        .admin-input:focus {
          outline: none;
          border-color: var(--admin-primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        /* Form Input Class */
        .admin-form-input {
          width: 100%;
          padding: 0.75rem 1.25rem;
          border: 1px solid var(--admin-border);
          border-radius: var(--admin-radius-sm);
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: var(--admin-surface);
        }

        .admin-form-input:focus {
          outline: none;
          border-color: var(--admin-primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        /* Scrollbar Styles */
        .admin-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .admin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .admin-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .admin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Animation Utilities */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .admin-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .admin-slide-in-left {
          animation: slideInLeft 0.3s ease-out;
        }

        .admin-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        /* Spacing Utilities */
        .admin-section-gap {
          gap: 1.5rem;
        }

        .admin-mb-6 {
          margin-bottom: 1.5rem;
        }

        /* Page Header Styles */
        .admin-page-header {
          margin-bottom: 2rem;
        }

        .admin-page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--admin-text-primary);
          line-height: 1.2;
        }

        .admin-page-subtitle {
          font-size: 0.875rem;
          color: var(--admin-text-secondary);
          margin-top: 0.25rem;
        }
      `}</style>

      <div
        className={`min-h-screen flex flex-col bg-slate-50 ${isRtl ? 'rtl' : 'ltr'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* ===== Top navigation bar (sticky) ===== */}
        <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm flex items-center justify-between px-4 sm:px-6 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/${prefix}`} className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-base whitespace-nowrap">
                {t('common.appName')}
              </span>
            </Link>

            {/* Desktop horizontal nav links */}
            <nav className="hidden lg:flex items-center h-16">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.href === pathname;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center h-16 gap-2 px-3 text-sm font-medium transition-all duration-200 ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Locale switcher */}
            <div className="hidden sm:flex items-center gap-1 px-1 border-l border-slate-200 mr-1">
              {adminLocales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocaleChange(loc)}
                  aria-label={`Switch language to ${loc}`}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${locale === loc ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {LOCALE_LABELS[loc]}
                </button>
              ))}
            </div>

            {/* Right side - user dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full hover:bg-slate-100 transition-colors duration-200"
                aria-label="Account menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {adminUser[0] || 'A'}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-700">{adminUser}</span>
                <ChevronRight
                  className="w-4 h-4 text-slate-400 transition-transform duration-200"
                  style={{ transform: userMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-800 truncate">{adminUser}</p>
                    <p className="text-xs text-slate-500">{t('common.adminRole')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile nav - horizontal scroll */}
        <nav className="lg:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 bg-white/80 border-b border-slate-200/70">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main content area - full width, subtle gradient */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          <div className="admin-fade-in">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-slate-200/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>© 2024 {t('common.appName')}. All rights reserved.</span>
            <span>v2.0.0</span>
          </div>
        </footer>
      </div>
    </>
  );
}
