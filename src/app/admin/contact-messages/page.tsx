'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  MailOpen,
  Trash2,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  Phone,
  Globe,
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

export default function AdminContactMessagesPage() {
  // State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<MessageStats>({ total: 0, unread: 0, today: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeFilter, setActiveFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Detail modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        isRead: activeFilter,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/contact-messages?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, searchQuery]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      // Get all messages for stats
      const response = await fetch('/api/admin/contact-messages?limit=1000', {
        credentials: 'include',
      });

      if (!response.ok) return;

      const data = await response.json();
      const allMessages = data.data;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        total: data.total,
        unread: allMessages.filter((m: ContactMessage) => !m.isRead).length,
        today: allMessages.filter((m: ContactMessage) => new Date(m.createdAt) >= todayStart).length,
        thisWeek: allMessages.filter((m: ContactMessage) => new Date(m.createdAt) >= weekStart).length,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchQuery]);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedIds(messages.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  }, [selectAll, messages]);

  // Handle bulk actions
  const handleBulkAction = async (action: 'mark-read' | 'mark-unread' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      const confirmed = window.confirm(`确定要删除选中的 ${selectedIds.length} 条消息吗？`);
      if (!confirmed) return;
    }

    try {
      const response = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Bulk action failed');

      await loadMessages();
      await loadStats();
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err: any) {
      setError(err.message || '操作失败');
    }
  };

  // Handle single delete
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('确定要删除这条消息吗？');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Delete failed');

      await loadMessages();
      await loadStats();
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  // Handle view message
  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowDetail(true);

    // Mark as read if unread
    if (!message.isRead) {
      try {
        await fetch(`/api/admin/contact-messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
          credentials: 'include',
        });

        // Update local state
        setMessages(prev =>
          prev.map(m => m.id === message.id ? { ...m, isRead: true } : m)
        );
        await loadStats();
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  // Subject label mapping (Chinese only for admin interface)
  const subjectLabels: Record<string, string> = {
    general: '一般咨询',
    sales: '销售咨询',
    support: '技术支持',
    customization: '定制需求',
    partnership: '商务合作',
  };

  const getSubjectLabel = (subject: string) => {
    return subjectLabels[subject] || subject;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate message
  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 text-base">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回仪表盘
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            联系消息管理
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            查看和管理客户联系消息
          </p>
        </div>
      </div>

      {/* Statistics Cards - Enhanced Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: '总消息数',
            value: stats.total,
            icon: MessageSquare,
            bgGradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-100',
          },
          {
            label: '未读消息',
            value: stats.unread,
            icon: Mail,
            bgGradient: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-50',
            textColor: 'text-orange-600',
            borderColor: 'border-orange-100',
          },
          {
            label: '今日新增',
            value: stats.today,
            icon: Calendar,
            bgGradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600',
            borderColor: 'border-green-100',
          },
          {
            label: '本周新增',
            value: stats.thisWeek,
            icon: Clock,
            bgGradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-100',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`admin-stat-card border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-5xl font-bold bg-gradient-to-r ${stat.bgGradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-base text-gray-500 mt-2">{stat.label}</div>
                </div>
                <div className={`admin-icon-container ${stat.bgLight}`}>
                  <Icon className={`${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="admin-card mb-8 p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1.5 rounded-xl">
            {([
              { key: 'all', label: '全部', count: stats.total },
              { key: 'unread', label: '未读', count: stats.unread },
              { key: 'read', label: '已读', count: stats.total - stats.unread },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeFilter === tab.key
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`text-sm px-2.5 py-0.5 rounded-full ${
                  activeFilter === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索姓名、邮箱或消息内容..."
                className="admin-form-input w-full pl-12 py-3.5 text-base"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <span className="text-base text-gray-600 font-medium">
              已选择 {selectedIds.length} 条
            </span>
            <button
              onClick={() => handleBulkAction('mark-read')}
              className="btn-secondary text-base py-2.5 px-5"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              标记已读
            </button>
            <button
              onClick={() => handleBulkAction('mark-unread')}
              className="btn-secondary text-base py-2.5 px-5"
            >
              <Mail className="w-5 h-5 mr-2" />
              标记未读
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn-danger text-base py-2.5 px-5"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              删除
            </button>
          </div>
        )}
      </div>

      {/* Messages Table with Horizontal Scroll */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <span className="ml-4 text-gray-600 text-lg">加载中...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <p className="text-gray-500 text-xl">暂无消息</p>
            <p className="text-gray-400 text-base mt-3">
              {searchQuery
                ? '尝试调整搜索条件'
                : '当客户提交联系表单时，消息将显示在这里'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table with Horizontal Scroll */}
            <div className="hidden md:block overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => setSelectAll(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                      姓名
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                      邮箱
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                      主题
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[250px]">
                      消息
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                      状态
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                      日期
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr
                      key={message.id}
                      className={`${messages.indexOf(message) % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'} hover:bg-blue-50/50 transition-colors ${
                        !message.isRead ? 'border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(message.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, message.id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== message.id));
                            }
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {!message.isRead && (
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0" title="未读" />
                          )}
                          <span className={`font-medium text-base ${!message.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                            {message.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-base text-gray-600">{message.email}</td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          {getSubjectLabel(message.subject)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-base text-gray-600 max-w-sm">
                        <div className="truncate" title={message.message}>
                          {truncateMessage(message.message, 80)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {message.isRead ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                            <MailOpen className="w-4 h-4" />
                            已读
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                            <Mail className="w-4 h-4" />
                            未读
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-base text-gray-500 whitespace-nowrap">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewMessage(message)}
                            className="admin-btn-action-edit"
                            title="查看详情"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {!message.isRead && (
                            <button
                              onClick={async () => {
                                await fetch(`/api/admin/contact-messages/${message.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ isRead: true }),
                                  credentials: 'include',
                                });
                                await loadMessages();
                                await loadStats();
                              }}
                              className="p-2.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              title="标记已读"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="admin-btn-action-delete"
                            title="删除"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border border-gray-200 rounded-xl ${!message.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(message.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, message.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== message.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          {!message.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                          <span className={`font-medium ${!message.isRead ? 'font-semibold' : ''}`}>
                            {message.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{message.email}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getSubjectLabel(message.subject)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {message.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!message.isRead && (
                        <button
                          onClick={async () => {
                            await fetch(`/api/admin/contact-messages/${message.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isRead: true }),
                              credentials: 'include',
                            });
                            await loadMessages();
                            await loadStats();
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  第 {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} 条，共 {total} 条
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 px-3">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDetail(false)}>
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">消息详情</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">姓名</label>
                  <p className="text-gray-900 font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">邮箱</label>
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">电话</label>
                    <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">主题</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {getSubjectLabel(selectedMessage.subject)}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">消息内容</label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(selectedMessage.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>{selectedMessage.locale.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  {selectedMessage.isRead ? (
                    <>
                      <MailOpen className="w-4 h-4" />
                      <span>已读</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>未读</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${getSubjectLabel(selectedMessage.subject)}`}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  回复邮件
                </a>
                <button
                  onClick={() => {
                    handleDelete(selectedMessage.id);
                    setShowDetail(false);
                  }}
                  className="btn-danger"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
