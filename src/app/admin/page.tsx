'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  FileText,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Settings,
  Tags,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  User,
  Loader2,
  Star,
  Edit3,
  CreditCard,
  Users,
  ShoppingCart,
  Wrench,
} from 'lucide-react';

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
    const tick = () => setCurrentTime(new Date().toLocaleString('zh-CN'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
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

      // API failed — show empty stats (no localStorage fallback by design).
      setStats({
        totalProducts: 0,
        totalBlogs: 0,
        totalFaqs: 0,
        totalMessages: 0,
        totalCategories: 0,
        productTrend: 0,
        blogTrend: 0,
        faqTrend: 0,
        messageTrend: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          label: '产品总数',
          value: stats.totalProducts,
          icon: Package,
          color: 'blue',
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
          bgLight: 'bg-orange-50',
          textColor: 'text-orange-600',
          href: '/admin/contact-messages',
          trend: stats.messageTrend,
        },
      ]
    : [];

  // Feature navigation cards
  const featureCards = [
    {
      title: '产品管理',
      description: '管理、添加与编辑产品',
      href: '/admin/products',
      icon: Package,
      accent: 'blue' as const,
    },
    {
      title: '博客文章',
      description: '发布与管理博客内容',
      href: '/admin/blog',
      icon: FileText,
      accent: 'green' as const,
    },
    {
      title: 'FAQ管理',
      description: '维护常见问题解答',
      href: '/admin/faqs',
      icon: HelpCircle,
      accent: 'purple' as const,
    },
    {
      title: '联系消息',
      description: '查看客户留言反馈',
      href: '/admin/contact-messages',
      icon: MessageSquare,
      accent: 'orange' as const,
    },
    {
      title: '分类管理',
      description: '产品分类与标签设置',
      href: '/admin/categories',
      icon: Tags,
      accent: 'teal' as const,
    },
    {
      title: '媒体库',
      description: '上传与图片/视频管理',
      href: '/admin/media',
      icon: ImageIcon,
      accent: 'pink' as const,
    },
    {
      title: '站点设置',
      description: '公司信息 / SEO / 通知',
      href: '/admin/settings',
      icon: Settings,
      accent: 'gray' as const,
      featured: true,
    },
    {
      title: '评论审核',
      description: '客户评论审核管理',
      href: '/admin/reviews',
      icon: MessageSquare,
      accent: 'indigo' as const,
    },
    // V8.4 fix: bug 7 — expose every console module as a dashboard card now that
    // the top text-nav has been removed (users / services were previously unreachable).
    {
      title: '富文本编辑器',
      description: '页面装修与内容编辑',
      href: '/admin/editor',
      icon: Edit3,
      accent: 'teal' as const,
    },
    {
      title: '支付配置',
      description: 'Stripe / PayPal / 微信 / 支付宝',
      href: '/admin/settings/payment',
      icon: CreditCard,
      accent: 'green' as const,
    },
    {
      title: '用户管理',
      description: '查看、启用与角色管理',
      href: '/admin/users',
      icon: Users,
      accent: 'indigo' as const,
    },
    {
      title: '订单管理',
      description: '查看与处理客户订单',
      href: '/admin/orders',
      icon: ShoppingCart,
      accent: 'orange' as const,
    },
    {
      title: '服务管理',
      description: '重启应用 / Nginx / SSL 等',
      href: '/admin/services',
      icon: Wrench,
      accent: 'purple' as const,
    },
  ];

  const accentStyles: Record<
    string,
    { iconBg: string; iconColor: string; chip: string; ring: string; arrow: string }
  > = {
    blue: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600', chip: 'bg-blue-50 text-blue-600', ring: 'group-hover:border-blue-300', arrow: 'group-hover:text-blue-600' },
    green: { iconBg: 'bg-green-50', iconColor: 'text-green-600', chip: 'bg-green-50 text-green-600', ring: 'group-hover:border-green-300', arrow: 'group-hover:text-green-600' },
    purple: { iconBg: 'bg-purple-50', iconColor: 'text-purple-600', chip: 'bg-purple-50 text-purple-600', ring: 'group-hover:border-purple-300', arrow: 'group-hover:text-purple-600' },
    orange: { iconBg: 'bg-orange-50', iconColor: 'text-orange-600', chip: 'bg-orange-50 text-orange-600', ring: 'group-hover:border-orange-300', arrow: 'group-hover:text-orange-600' },
    teal: { iconBg: 'bg-teal-50', iconColor: 'text-teal-600', chip: 'bg-teal-50 text-teal-600', ring: 'group-hover:border-teal-300', arrow: 'group-hover:text-teal-600' },
    pink: { iconBg: 'bg-pink-50', iconColor: 'text-pink-600', chip: 'bg-pink-50 text-pink-600', ring: 'group-hover:border-pink-300', arrow: 'group-hover:text-pink-600' },
    gray: { iconBg: 'bg-gray-100', iconColor: 'text-gray-700', chip: 'bg-gray-100 text-gray-700', ring: 'group-hover:border-gray-400', arrow: 'group-hover:text-gray-700' },
    indigo: { iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', chip: 'bg-indigo-50 text-indigo-600', ring: 'group-hover:border-indigo-300', arrow: 'group-hover:text-indigo-600' },
  };

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
      {/* ===== 欢迎横幅 ===== */}
      <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-8 sm:p-10">
        <div className="absolute inset-0 opacity-20" style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.25) 0%, transparent 45%)',
        }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">欢迎回来 👋</h1>
            <p className="text-blue-50 text-lg">这是您的智能柜后台管理概览。</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <span className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white text-sm font-medium">系统运行正常</span>
            </div>
            <div className="inline-flex items-center gap-2 text-white/90 text-sm font-mono bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <Clock className="w-4 h-4" />
              {currentTime}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <span className="text-yellow-700 text-sm">{error}（已切换到本地数据）</span>
        </div>
      )}

      {/* ===== 统计概览行 ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositiveTrend = stat.trend >= 0;
          return (
            <Link key={index} href={stat.href} className="group block">
              <div className="admin-stat-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-5">
                  <div className={`admin-icon-container ${stat.bgLight}`}>
                    <Icon className={stat.textColor} />
                  </div>
                  <div className={`flex items-center space-x-1.5 text-sm font-medium ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveTrend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isPositiveTrend ? '+' : ''}{stat.trend}%</span>
                  </div>
                </div>
                <div className="text-5xl font-bold mb-2 text-gray-900">
                  {stat.value}
                </div>
                <div className="text-base text-gray-500 mb-4">{stat.label}</div>
                <div className="flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span>查看详情</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ===== 功能卡片导航网格 ===== */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">管理功能</h2>
        <p className="text-gray-500 text-sm">选择一个功能模块开始管理</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {featureCards.map((card) => {
          const Icon = card.icon;
          const a = accentStyles[card.accent];
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative flex flex-col bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 ${a.ring}`}
            >
              {card.featured && (
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                  <Star className="w-3 h-3" /> 推荐
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${a.iconBg}`}>
                <Icon className={`w-6 h-6 ${a.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{card.description}</p>
              <div className={`mt-4 flex items-center justify-end text-gray-400 ${a.arrow} transition-colors`}>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ===== 最近活动 ===== */}
      <div className="admin-card mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">最近活动</h2>
          <Clock className="w-6 h-6 text-gray-400" />
        </div>
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 pl-4 border-l-4 ${activity.color} hover:bg-gray-50 rounded-r-lg transition-colors -ml-4`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  activity.type === 'product' ? 'bg-blue-50' : activity.type === 'blog' ? 'bg-green-50' : 'bg-purple-50'
                }`}>
                  {activity.type === 'product' && <Package className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'blog' && <FileText className="w-5 h-5 text-green-600" />}
                  {activity.type === 'faq' && <HelpCircle className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base text-gray-800">
                    <span className="font-medium">{activity.action}</span>: <span className="truncate">{activity.name}</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {getTimeAgo(activity.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-base">暂无活动记录</p>
          </div>
        )}
      </div>

      {/* ===== 系统信息栏 ===== */}
      <div className="admin-card bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-8 text-base text-gray-600">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <span>版本: <span className="font-semibold text-gray-900">v34.0</span></span>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <span>用户: <span className="font-semibold text-gray-900">{typeof window !== 'undefined' ? localStorage.getItem('admin_user') || 'admin' : 'admin'}</span></span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>时间: <span className="font-semibold text-gray-900">{currentTime}</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span>系统运行正常</span>
          </div>
        </div>
      </div>
    </div>
  );
}
