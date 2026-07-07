/**
 * Admin order management client service (V8 / T4).
 *
 * Wraps the new `/api/admin/orders` endpoints (list / detail / update). Shared
 * by the `admin` and `xiaozhouBackend` consoles — they both call the same
 * global `/api/admin/orders` routes.
 */

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';
export type PaymentMethod = 'stripe' | 'paypal' | 'wechat' | 'alipay' | null;

export interface OrderUser {
  id: string;
  name: string;
  email: string;
}

export interface AdminOrderListItem {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: OrderUser | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: any; // { zh, en, ar } snapshot
  product?: { id: string; slug: string; name: any; images: string[] };
}

export interface AdminOrderDetail extends AdminOrderListItem {
  shippingAddress: any;
  items: OrderItem[];
  payments: any[];
  adminNote: string | null;
}

export interface ListOrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
  paymentStatus?: string;
}

export interface ListOrdersResult {
  data: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response): Promise<Error> {
  let message = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (body?.error) message = body.error;
    else if (body?.message) message = body.message;
  } catch {
    /* ignore parse errors, keep default message */
  }
  return new Error(message);
}

/** GET /api/admin/orders?page=&pageSize=&status=&paymentStatus= */
export async function listOrders(
  params: ListOrdersParams = {}
): Promise<ListOrdersResult> {
  const { page = 1, pageSize = 20, status, paymentStatus } = params;
  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) search.set('status', status);
  if (paymentStatus) search.set('paymentStatus', paymentStatus);

  const res = await fetch(`/api/admin/orders?${search.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return {
    data: data.data ?? [],
    total: data.total ?? 0,
    page: data.page ?? page,
    pageSize: data.pageSize ?? pageSize,
  };
}

/** GET /api/admin/orders/[id] */
export async function getOrder(id: string): Promise<AdminOrderDetail> {
  const res = await fetch(`/api/admin/orders/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return data.order as AdminOrderDetail;
}

/** PATCH /api/admin/orders/[id] { status?, note?, adminNote? } */
export async function updateOrder(
  id: string,
  patch: { status?: OrderStatus; note?: string; adminNote?: string }
): Promise<AdminOrderDetail> {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return data.order as AdminOrderDetail;
}
