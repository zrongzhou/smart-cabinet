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
  Menu,
  X,
  LogOut,
  ImageIcon,
  FolderOpen,
  Tag,
  Edit3,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function navClass(path: string, currentPath: string): string {
  const base = 'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative';
  if (path === currentPath) {
    return base + ' bg-gradient-to-r from-blue-600/20 to-transparent text-white border-l-3 border-blue-500';
  }
  return base + ' text-gray-400 hover:text-white hover:bg-gray-800/60';
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const auth = typeof window !== 'undefined' && window.sessionStorage
        ? sessionStorage.getItem('admin_authenticated') === 'true'
        : false;
      setIsAuthenticated(auth);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, mounted, pathname]);

  // Don't render anything until client-side mount to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      if (window.sessionStorage) {
        sessionStorage.removeItem('admin_authenticated');
        sessionStorage.removeItem('admin_user');
      }
      if (window.localStorage) {
        localStorage.removeItem('admin_token');
      }
      // Clear auth cookie
      document.cookie = 'admin_auth=;path=/;max-age=0';
    }
    router.push('/admin/login');
  };

  const navLinks = [
    { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
    { href: '/admin/products', label: '产品管理', icon: Package },
    { href: '/admin/categories', label: '分类/标签', icon: Tag },
    { href: '/admin/blog', label: '博客管理', icon: FileText },
    { href: '/admin/faqs', label: 'FAQ管理', icon: HelpCircle },
    { href: '/admin/media', label: '媒体库', icon: ImageIcon },
    { href: '/admin/editor', label: '页面编辑', icon: Edit3 },
    { href: '/admin/settings', label: '站点设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar - Dark with gradient */}
      <aside className="hidden md:flex md:w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 shadow-xl flex-col fixed h-full z-30 border-r border-gray-700/50">
        {/* Logo area */}
        <div className="h-17 flex items-center border-b border-gray-700/50 px-5 bg-gray-900/80 backdrop-blur-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <span className="font-bold text-white text-base block leading-tight">管理后台</span>
            <span className="text-xs text-gray-500 block">Smart Cabinet v2.0</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={navClass(link.href, pathname)}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="font-medium text-sm">{link.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-blue-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-3 px-3 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {(sessionStorage?.getItem('admin_user') || 'A')[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {sessionStorage?.getItem('admin_user') || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-300 w-full transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-950 shadow-xl flex-col transform transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between border-b border-gray-700/50 px-5">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 font-bold text-white text-lg">管理后台</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={navClass(link.href, pathname)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={() => { handleLogout(); setSidebarOpen(false); }}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400/80 hover:bg-red-500/10 w-full transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main content - Light theme for professionalism */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header - White clean header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 md:hidden transition-colors">
              <Menu className="w-6 h-5 text-gray-600" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-base font-semibold text-gray-800">
                {navLinks.find(l => l.href === pathname)?.label || '管理后台'}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              {(sessionStorage?.getItem('admin_user') || 'A')[0] || 'A'}
            </div>
            <span className="text-sm text-gray-600 font-medium hidden sm:inline">
              {sessionStorage?.getItem('admin_user') || 'Admin'}
            </span>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
