'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, FileText, HelpCircle, MessageSquare, Plus, ArrowRight, Settings, TrendingUp, TrendingDown, Clock, Calendar, User, ArrowUpRight, Loader2 } from 'lucide-react';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalProducts: number;
  totalBlogs: number;
  totalFaqs: number;
  totalMessages: number;
  totalCategories: number;
  productTrend: number;
  blogTrend: number;
  faqTrend: number;
  messageTrend: number;
}

interface Activity {
  type: 'product' | 'blog' | 'faq';
  action: string;
  name: string;
  time: string;
  color: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on mount
  useEffect(() => {
    loadData();
    setCurrentTime(new Date().toLocaleString('zh-CN'));
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/stats', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();

      setStats({
        totalProducts: data.totalProducts || 0,
        totalBlogs: data.totalBlogs || 0,
        totalFaqs: data.totalFaqs || 0,
        totalMessages: data.totalMessages || 0,
        totalCategories: data.totalCategories || 0,
        productTrend: data.productTrend || 0,
        blogTrend: data.blogTrend || 0,
        faqTrend: data.faqTrend || 0,
        messageTrend: data.messageTrend || 0,
      });

      if (data.recentActivities) {
        setRecentActivities(data.recentActivities);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load data');
      
      // Fallback to localStorage if API fails
      if (typeof window !== 'undefined') {
        const savedProducts = localStorage.getItem('admin_products');
        const products = savedProducts ? JSON.parse(savedProducts) : [];
        
        const savedBlogs = localStorage.getItem('admin_blogs');
        const blogs = savedBlogs ? JSON.parse(savedBlogs) : [];
        
        const savedFaqs = localStorage.getItem('admin_faqs');
        const faqs = savedFaqs ? JSON.parse(savedFaqs) : [];
        
        setStats({
          totalProducts: products.length,
          totalBlogs: blogs.length,
          totalFaqs: faqs.length,
          totalMessages: 0,
          totalCategories: 0,
          productTrend: 0,
          blogTrend: 0,
          faqTrend: 0,
          messageTrend: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { 
      label: '产品总数', 
      value: stats.totalProducts, 
      icon: Package, 
      color: 'blue', 
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/admin/products',
      trend: stats.productTrend,
    },
    { 
      label: '博客文章', 
      value: stats.totalBlogs, 
      icon: FileText, 
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      href: '/admin/blog',
      trend: stats.blogTrend,
    },
    { 
      label: 'FAQ数量', 
      value: stats.totalFaqs, 
      icon: HelpCircle, 
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/admin/faqs',
      trend: stats.faqTrend,
    },
    { 
      label: '消息数量', 
      value: stats.totalMessages, 
      icon: MessageSquare, 
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
      href: '/admin/contact-messages',
      trend: stats.messageTrend,
    },
  ] : [];

  const quickActions = [
    { 
      label: '添加产品', 
      description: '创建新的智能柜产品',
      href: '/admin/products', 
      icon: Plus, 
      bgGradient: 'from-blue-500 to-blue-600',
      hoverBg: 'hover:from-blue-600 hover:to-blue-700',
      textColor: 'text-white',
      shadowColor: 'shadow-blue-200',
    },
    { 
      label: '写文章', 
      description: '发布博客技术文章',
      href: '/admin/blog', 
      icon: FileText, 
      bgGradient: 'from-green-500 to-green-600',
      hoverBg: 'hover:from-green-600 hover:to-green-700',
      textColor: 'text-white',
      shadowColor: 'shadow-green-200',
    },
    { 
      label: '添加FAQ', 
      description: '创建常见问题解答',
      href: '/admin/faqs', 
      icon: HelpCircle, 
      bgGradient: 'from-purple-500 to-purple-600',
      hoverBg: 'hover:from-purple-600 hover:to-purple-700',
      textColor: 'text-white',
      shadowColor: 'shadow-purple-200',
    },
    { 
      label: '站点设置', 
      description: '配置系统参数',
      href: '/admin/settings', 
      icon: Settings, 
      bgGradient: 'from-gray-600 to-gray-700',
      hoverBg: 'hover:from-gray-700 hover:to-gray-800',
      textColor: 'text-white',
      shadowColor: 'shadow-gray-200',
    },
  ];

  const getTimeAgo = (timeStr: string) => {
    if (typeof window === 'undefined') return '';
    const now = new Date();
    const time = new Date(timeStr);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${diffDays}天前`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来！这是您的系统概览。</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <span className="text-yellow-700 text-sm">{error}（已切换到本地数据）</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositiveTrend = stat.trend >= 0;
          return (
            <Link
              key={index}
              href={stat.href}
              className="group block"
            >
              <div className="admin-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgLight} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveTrend ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{isPositiveTrend ? '+' : ''}{stat.trend}%</span>
                  </div>
                </div>
                <div className={`text-4xl font-bold mb-1 bg-gradient-to-r ${stat.bgGradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mb-3">{stat.label}</div>
                <div className="flex items-center text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>查看详情</span>
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activities */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">最近活动</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0 pl-3 border-l-4 ${activity.color} hover:bg-gray-50 rounded-r-lg transition-colors -ml-3`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    activity.type === 'product' ? 'bg-blue-50' :
                    activity.type === 'blog' ? 'bg-green-50' :
                    'bg-purple-50'
                  }`}>
                    {activity.type === 'product' && <Package className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'blog' && <FileText className="w-4 h-4 text-green-600" />}
                    {activity.type === 'faq' && <HelpCircle className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.action}</span>: <span className="truncate">{activity.name}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTimeAgo(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">暂无活动记录</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">快捷操作</h2>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`p-5 bg-gradient-to-r ${action.bgGradient} ${action.hoverBg} rounded-xl transition-all duration-300 flex flex-col items-start justify-center text-left transform hover:scale-105 hover:shadow-xl ${action.shadowColor}`}
                >
                  <Icon className={`w-8 h-8 ${action.textColor} mb-3`} />
                  <span className={`text-base font-bold ${action.textColor} mb-1`}>
                    {action.label}
                  </span>
                  <span className={`text-xs ${action.textColor} opacity-80`}>
                    {action.description}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Info Bar */}
      <div className="admin-card bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <span>版本: <span className="font-semibold text-gray-900">v34.0</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>用户: <span className="font-semibold text-gray-900">{typeof window !== 'undefined' ? localStorage.getItem('admin_user') || 'admin' : 'admin'}</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>时间: <span className="font-semibold text-gray-900">{currentTime}</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>系统运行正常</span>
          </div>
        </div>
      </div>
    </div>
  );
}
