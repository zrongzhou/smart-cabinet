/**
 * Admin user management client service (V8 / T4).
 *
 * Thin wrappers around the existing `/api/admin/users` endpoints. Both the
 * `admin` and `xiaozhouBackend` consoles share these API routes, so the two
 * page implementations stay DRY by importing this module.
 *
 * NOTE: This module references `localStorage`/`fetch` and is intended to be
 * imported from client components only. It does not need a `'use client'`
 * directive itself — that is inherited from the importing component.
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  company?: string;
  phone?: string;
  role: string; // 'user' | 'admin'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersResult {
  users: AdminUser[];
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

/** GET /api/admin/users?page=&pageSize=&search= */
export async function listUsers(
  page = 1,
  pageSize = 20,
  search?: string
): Promise<ListUsersResult> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.set('search', search);

  const res = await fetch(`/api/admin/users?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return {
    users: data.users ?? [],
    total: data.total ?? 0,
    page: data.page ?? page,
    pageSize: data.pageSize ?? pageSize,
  };
}

/** PATCH /api/admin/users/[id] { isActive } */
export async function updateUserStatus(
  id: string,
  isActive: boolean
): Promise<AdminUser> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return data.user as AdminUser;
}

/** PATCH /api/admin/users/[id] { role } */
export async function updateUserRole(
  id: string,
  role: string
): Promise<AdminUser> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw await parseError(res);
  const data = await res.json();
  return data.user as AdminUser;
}

/** DELETE /api/admin/users/[id] */
export async function removeUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
}

/** POST /api/admin/users/[id]/reset-password { newPassword } */
export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) throw await parseError(res);
}
