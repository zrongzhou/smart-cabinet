'use client';

/**
 * ChangePasswordForm — admin password-change console (shared by both
 * `/admin` and `/xiaozhouBackend`). Renders a small form (current / new /
 * confirm) and POSTs to /api/admin/change-password with the signed JWT.
 *
 * SECURITY: passwords are never written to the log, console, or any visible
 * field beyond the masked input boxes. On success the
 * `admin_must_change_password` localStorage flag (set by the login fallback)
 * is cleared so the operator is no longer forced to this page.
 */

import { useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, XCircle, KeyRound } from 'lucide-react';

interface ChangePasswordFormProps {
  /** Which backend console is hosting the form. */
  prefix: 'admin' | 'xiaozhouBackend';
}

export default function ChangePasswordForm({ prefix }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const adminUser =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('admin_user') || ''
      : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword.length < 8) {
      setError('新密码长度至少为 8 位。');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致。');
      setLoading(false);
      return;
    }

    try {
      const token =
        typeof window !== 'undefined' ? window.localStorage.getItem('admin_token') || '' : '';
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message || '密码修改成功。');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('admin_must_change_password');
        }
      } else {
        setError(data.error || '修改失败 / Failed to change password');
      }
    } catch {
      setError('网络错误，请重试 / Network error, please retry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="admin-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">修改管理员密码</h2>
            <p className="text-sm text-gray-500">Change Admin Password</p>
          </div>
        </div>

        {adminUser && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-gray-600">
            <KeyRound className="h-4 w-4 text-gray-400" />
            <span>
              当前账号 / Current account: <span className="font-semibold text-gray-800">{adminUser}</span>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-gray-700">
              当前密码 / Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="admin-input"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">
              新密码 / New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="admin-input"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
              确认新密码 / Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="admin-input"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                提交中…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                修改密码 / Change Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
