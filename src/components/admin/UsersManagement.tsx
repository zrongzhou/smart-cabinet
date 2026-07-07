'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  User as UserIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  listUsers,
  updateUserStatus,
  updateUserRole,
  removeUser,
  type AdminUser,
} from '@/lib/admin/users';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function roleBadgeClass(role: string): string {
  return role === 'admin'
    ? 'admin-badge admin-badge-success'
    : 'admin-badge admin-badge-info';
}

function activeBadgeClass(active: boolean): string {
  return active
    ? 'admin-badge admin-badge-success'
    : 'admin-badge admin-badge-danger';
}

export default function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async (p: number, size: number, q: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await listUsers(p, size, q || undefined);
      setUsers(res.users);
      setTotal(res.total);
      setTotalPages(Math.max(1, Math.ceil(res.total / size)));
    } catch (err: any) {
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, pageSize, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    load(1, pageSize, value);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    load(p, pageSize, search);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    load(1, size, search);
  };

  const toggleActive = async (u: AdminUser) => {
    setBusyId(u.id);
    setError('');
    try {
      const updated = await updateUserStatus(u.id, !u.isActive);
      setUsers((prev) =>
        prev.map((x) => (x.id === updated.id ? { ...x, isActive: updated.isActive } : x))
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const toggleRole = async (u: AdminUser) => {
    setBusyId(u.id);
    setError('');
    try {
      const newRole = u.role === 'admin' ? 'user' : 'admin';
      const updated = await updateUserRole(u.id, newRole);
      setUsers((prev) =>
        prev.map((x) => (x.id === updated.id ? { ...x, role: updated.role } : x))
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to update role');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusyId(deleteId);
    setError('');
    try {
      await removeUser(deleteId);
      setUsers((prev) => prev.filter((x) => x.id !== deleteId));
      setTotal((t) => Math.max(0, t - 1));
      setDeleteId(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-fade-in">
      {/* Page header */}
      <div className="admin-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="admin-page-title">用户管理 · Users</h1>
          <p className="admin-page-subtitle">
            Manage registered users, roles and access status.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索用户名/邮箱 · Search name or email"
            className="admin-input pl-10"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="admin-card !p-0 overflow-hidden">
        <div className="overflow-x-auto admin-scrollbar">
          <table className="admin-table">
            <thead>
              <tr>
                <th>用户名 · Name</th>
                <th>邮箱 · Email</th>
                <th>角色 · Role</th>
                <th>状态 · Status</th>
                <th>注册时间 · Registered</th>
                <th className="text-right">操作 · Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="inline-block w-6 h-6 animate-spin text-blue-500" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    无用户 · No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-600">{u.email}</td>
                    <td>
                      <span className={roleBadgeClass(u.role)}>
                        {u.role === 'admin' ? '管理员 Admin' : '用户 User'}
                      </span>
                    </td>
                    <td>
                      <span className={activeBadgeClass(u.isActive)}>
                        {u.isActive ? '启用 Active' : '停用 Disabled'}
                      </span>
                    </td>
                    <td className="text-slate-500">{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(u)}
                          disabled={busyId === u.id}
                          title={u.isActive ? '停用 Disable' : '启用 Enable'}
                          className="admin-btn-action-edit"
                        >
                          {busyId === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : u.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRole(u)}
                          disabled={busyId === u.id}
                          title="切换角色 Toggle role"
                          className="admin-btn-action-edit"
                        >
                          {busyId === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(u.id)}
                          disabled={busyId === u.id}
                          title="删除 Delete"
                          className="admin-btn-action-delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="admin-card !p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              确认删除 · Confirm Delete
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              确定要删除该用户吗？此操作不可恢复。
              <br />
              Are you sure you want to delete this user? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="admin-btn-secondary"
              >
                取消 Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="admin-btn-danger"
              >
                <Trash2 className="w-4 h-4" />
                删除 Delete
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
