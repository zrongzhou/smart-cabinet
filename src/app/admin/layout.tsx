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
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function navClass(path: string, currentPath: string): string {
  const base = 'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden';
  if (path === currentPath) {
    return base + ' bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-white shadow-lg shadow-blue-500/10';
  }
  return base + ' text-gray-400 hover:text-white hover:bg-white/5';
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const auth = typeof window !== 'undefined' && window.localStorage
        ? localStorage.getItem('admin_authenticated') === 'true'
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
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
      if (window.localStorage) {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_user');
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
    { href: '/admin/contact-messages', label: '联系消息', icon: MessageSquare },
  ];

  const adminUser = typeof window !== 'undefined' && window.localStorage
    ? (localStorage.getItem('admin_user') || 'Admin')
    : 'Admin';

  return (
    <>
      {/* Global Admin Styles */}
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

      <div className="min-h-screen bg-slate-950 flex">
        {/* Desktop Sidebar - Modern Industrial Gradient */}
        <aside className={`hidden md:flex ${isCollapsed ? 'md:w-20' : 'md:w-64'} bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl flex-col fixed h-full z-30 border-r border-slate-700/50 transition-all duration-300 ease-in-out`}>
          {/* Logo area */}
          <div className="h-17 flex items-center border-b border-slate-700/50 px-5 bg-slate-900/80 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 animate-fade-in">
                <span className="font-bold text-white text-base block leading-tight">管理后台</span>
                <span className="text-xs text-slate-500 block">Smart Cabinet Pro</span>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="ml-auto p-1.5 rounded-lg hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* Collapse Toggle (when collapsed) */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="mx-auto mt-3 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-4 h-4 text-slate-500" />
            </button>
          )}

          {/* Navigation */}
          <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-3'} py-5 space-y-1 overflow-y-auto admin-scrollbar`}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === pathname;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navClass(link.href, pathname)}
                  title={isCollapsed ? link.label : undefined}
                >
                  {/* Active indicator - left border glow */}
                  {isActive && (
                    <>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full shadow-lg shadow-blue-500/50" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl" />
                    </>
                  )}

                  {/* Hover effect - subtle background slide */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-400 drop-shadow-lg drop-shadow-cyan-500/50' : 'text-slate-500 group-hover:text-blue-400 transition-colors duration-300'}`} />
                  {!isCollapsed && (
                    <span className="font-medium text-sm relative z-10">{link.label}</span>
                  )}

                  {/* Active arrow indicator */}
                  {isActive && !isCollapsed && (
                    <ChevronRight className="w-4 h-4 text-cyan-400 ml-auto animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-700/50">
            {!isCollapsed ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2 mb-3 group cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/25 flex-shrink-0 group-hover:shadow-blue-500/50 transition-shadow duration-300">
                    {adminUser[0] || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{adminUser}</p>
                    <p className="text-xs text-slate-500 truncate">系统管理员</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-300 w-full transition-all duration-200 text-sm font-medium group"
                >
                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  <span>退出登录</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {adminUser[0] || 'A'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl flex-col transform transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex items-center justify-between border-b border-slate-700/50 px-5 bg-slate-900/80">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 font-bold text-white text-lg">管理后台</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-800 transition-colors duration-200">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto admin-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === pathname;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={navClass(link.href, pathname)}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full shadow-lg shadow-blue-500/50" />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="font-medium text-sm">{link.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-cyan-400 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center space-x-3 px-3 py-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {adminUser[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{adminUser}</p>
                <p className="text-xs text-slate-500 truncate">系统管理员</p>
              </div>
            </div>
            <button
              onClick={() => { handleLogout(); setSidebarOpen(false); }}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400/80 hover:bg-red-500/10 w-full transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>退出登录</span>
            </button>
          </div>
        </aside>

        {/* Main content - Clean Light Theme */}
        <div className={`flex-1 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
          {/* Header - Enhanced White Header */}
          <header className="h-16 bg-white/80 backdrop-blur-xl shadow-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 border-b border-slate-200/80">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 md:hidden transition-colors duration-200">
                <Menu className="w-6 h-5 text-slate-600" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-base font-semibold text-slate-800">
                  {navLinks.find(l => l.href === pathname)?.label || '管理后台'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Notification bell could go here */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300">
                {adminUser[0] || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-slate-700 font-medium">{adminUser}</p>
                <p className="text-xs text-slate-500">在线</p>
              </div>
            </div>
          </header>

          {/* Main content area - Subtle gradient background */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 min-h-screen">
            <div className="admin-fade-in">
              {children}
            </div>
          </main>

          {/* Optional Footer */}
          <footer className="px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-slate-200/50">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>© 2024 Smart Cabinet Pro. All rights reserved.</span>
              <span>v2.0.0</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
