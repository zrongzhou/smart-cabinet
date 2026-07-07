'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Truck,
  CreditCard,
  Package,
  Save,
} from 'lucide-react';
import {
  listOrders,
  getOrder,
  updateOrder,
  type AdminOrderListItem,
  type AdminOrderDetail,
  type OrderStatus,
} from '@/lib/admin/orders';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * Client-side mirror of the server transition map (see
 * src/app/api/admin/orders/[id]/route.ts). Forward-only; `delivered` and
 * `cancelled` are terminal.
 */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: '待处理 Pending',
  processing: '处理中 Processing',
  shipped: '已发货 Shipped',
  delivered: '已送达 Delivered',
  cancelled: '已取消 Cancelled',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: '未支付 Unpaid',
  pending: '支付中 Pending',
  paid: '已支付 Paid',
  failed: '失败 Failed',
  refunded: '已退款 Refunded',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: 'Stripe',
  paypal: 'PayPal',
  wechat: '微信 WeChat',
  alipay: '支付宝 Alipay',
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function statusBadge(status: string): string {
  switch (status) {
    case 'delivered':
      return 'admin-badge admin-badge-success';
    case 'shipped':
    case 'processing':
      return 'admin-badge admin-badge-info';
    case 'pending':
      return 'admin-badge admin-badge-warning';
    case 'cancelled':
      return 'admin-badge admin-badge-danger';
    default:
      return 'admin-badge admin-badge-info';
  }
}

function paymentBadge(p: string): string {
  switch (p) {
    case 'paid':
      return 'admin-badge admin-badge-success';
    case 'unpaid':
      return 'admin-badge admin-badge-warning';
    case 'pending':
      return 'admin-badge admin-badge-info';
    case 'failed':
      return 'admin-badge admin-badge-danger';
    case 'refunded':
      return 'admin-badge admin-badge-info';
    default:
      return 'admin-badge admin-badge-info';
  }
}

function localizedName(name: any): string {
  if (!name) return '—';
  if (typeof name === 'string') return name;
  if (typeof name === 'object') {
    return name.en || name.zh || name.ar || Object.values(name)[0] || '—';
  }
  return String(name);
}

function paymentMethodLabel(method?: string | null): string {
  if (!method) return '—';
  return PAYMENT_METHOD_LABELS[method] || method;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Drawer state
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState<OrderStatus | ''>('');
  const [noteDraft, setNoteDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p: number, size: number, status: string, pay: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await listOrders({
        page: p,
        pageSize: size,
        status: status || undefined,
        paymentStatus: pay || undefined,
      });
      setOrders(res.data);
      setTotal(res.total);
      setTotalPages(Math.max(1, Math.ceil(res.total / size)));
    } catch (err: any) {
      setError(err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, pageSize, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (status: string, pay: string) => {
    setStatusFilter(status);
    setPaymentFilter(pay);
    setPage(1);
    load(1, pageSize, status, pay);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    load(p, pageSize, statusFilter, paymentFilter);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    load(1, size, statusFilter, paymentFilter);
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setError('');
    try {
      const o = await getOrder(id);
      setDetail(o);
      setStatusDraft(o.status);
      setNoteDraft(o.adminNote || '');
    } catch (err: any) {
      setError(err?.message || 'Failed to load order detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setStatusDraft('');
    setNoteDraft('');
  };

  const saveDetail = async () => {
    if (!detail) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateOrder(detail.id, {
        status: (statusDraft || detail.status) as OrderStatus,
        adminNote: noteDraft,
      });
      setDetail(updated);
      // Refresh the row in the list (capture latest values for the closure)
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updated.id
            ? {
                ...o,
                status: updated.status,
                adminNote: updated.adminNote,
                paymentStatus: updated.paymentStatus,
                paymentMethod: updated.paymentMethod,
                paidAt: updated.paidAt,
                transactionId: updated.transactionId,
                updatedAt: updated.updatedAt,
              }
            : o
        )
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions: string[] = detail
    ? [detail.status, ...(ALLOWED_TRANSITIONS[detail.status] || [])]
    : [];

  return (
    <div className="admin-fade-in">
      {/* Page header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">订单管理 · Orders</h1>
        <p className="admin-page-subtitle">
          View, filter and fulfil customer orders.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="admin-card !p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="admin-input pl-10"
            value={statusFilter}
            onChange={(e) => handleFilter(e.target.value, paymentFilter)}
          >
            <option value="">全部履约状态 · All fulfilment</option>
            {Object.keys(STATUS_LABELS).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="admin-input pl-10"
            value={paymentFilter}
            onChange={(e) => handleFilter(statusFilter, e.target.value)}
          >
            <option value="">全部支付状态 · All payment</option>
            {Object.keys(PAYMENT_STATUS_LABELS).map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table card */}
      <div className="admin-card !p-0 overflow-hidden">
        <div className="overflow-x-auto admin-scrollbar">
          <table className="admin-table">
            <thead>
              <tr>
                <th>订单号 · Order</th>
                <th>客户 · Customer</th>
                <th>金额 · Total</th>
                <th>履约 · Fulfilment</th>
                <th>支付状态 · Payment</th>
                <th>方式 · Method</th>
                <th>支付时间 · Paid at</th>
                <th>创建 · Created</th>
                <th className="text-right">操作 · Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Loader2 className="inline-block w-6 h-6 animate-spin text-blue-500" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    无订单 · No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className="font-mono text-xs text-slate-700">
                        {o.id.slice(-8)}
                      </span>
                    </td>
                    <td>
                      <div className="font-medium text-slate-800">
                        {o.user?.name || '—'}
                      </div>
                      <div className="text-xs text-slate-500">{o.user?.email}</div>
                    </td>
                    <td className="font-medium text-slate-800">
                      ${Number(o.total || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={statusBadge(o.status)}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td>
                      <span className={paymentBadge(o.paymentStatus)}>
                        {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                      </span>
                    </td>
                    <td className="text-slate-600">
                      {paymentMethodLabel(o.paymentMethod)}
                    </td>
                    <td className="text-slate-500">{formatDate(o.paidAt)}</td>
                    <td className="text-slate-500">{formatDate(o.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => openDetail(o.id)}
                          className="admin-btn-action-edit"
                          title="查看详情 View detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>每页 · Rows</span>
            <select
              className="admin-input !w-auto !h-9"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>· 共 {total} 条</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="admin-btn-secondary !h-9 !px-3"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="admin-btn-secondary !h-9 !px-3"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeDetail}
            aria-hidden
          />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto admin-scrollbar shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  订单详情 · Order Detail
                </h3>
                <p className="text-xs font-mono text-slate-500">{detail.id}</p>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">客户 · Customer</p>
                    <p className="font-medium text-slate-800">
                      {detail.user?.name || '—'}
                    </p>
                    <p className="text-xs text-slate-500">{detail.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">金额 · Total</p>
                    <p className="font-medium text-slate-800">
                      ${Number(detail.total || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">支付状态 · Payment</p>
                    <span className={paymentBadge(detail.paymentStatus)}>
                      {PAYMENT_STATUS_LABELS[detail.paymentStatus] ||
                        detail.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">方式 · Method</p>
                    <p className="font-medium text-slate-800">
                      {paymentMethodLabel(detail.paymentMethod)}
                    </p>
                    {detail.transactionId && (
                      <p className="text-xs text-slate-500 font-mono">
                        {detail.transactionId}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">支付时间 · Paid at</p>
                    <p className="text-sm text-slate-700">
                      {formatDate(detail.paidAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">创建 · Created</p>
                    <p className="text-sm text-slate-700">
                      {formatDate(detail.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" /> 商品 · Items
                  </p>
                  <div className="space-y-2">
                    {detail.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {localizedName(it.name)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {it.quantity} × ${Number(it.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          ${(it.quantity * Number(it.price || 0)).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fulfilment status edit */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> 履约状态 · Fulfilment
                  </p>
                  <select
                    className="admin-input"
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s] || s}
                        {s === detail.status ? ' (当前 current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Admin note */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> 备注 · Admin Note
                  </p>
                  <textarea
                    className="admin-form-input min-h-[96px]"
                    placeholder="履约/客服备注 · Internal note"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="admin-btn-secondary"
                  >
                    关闭 Close
                  </button>
                  <button
                    type="button"
                    onClick={saveDetail}
                    disabled={saving}
                    className="admin-btn-primary"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    保存 Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
