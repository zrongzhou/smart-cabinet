'use client';

import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    if ('preventDefault' in e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('[LOGIN] Submitting login form...');
      // Call server-side login API (sets httpOnly cookie)
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await response.json();
      console.log('[LOGIN] Response:', data);

      if (response.ok && data.success) {
        // Set localStorage for layout auth check (persists across page refreshes)
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_authenticated', 'true');
          localStorage.setItem('admin_user', username.trim());
          // Store the real signed JWT returned by the login API so admin API
          // calls (Bearer) pass the requireAdmin() server-side guard.
          localStorage.setItem('admin_token', data.token);
          // First-time env-bootstrap login requires setting a real password.
          if (data.mustChangePassword) {
            localStorage.setItem('admin_must_change_password', 'true');
          } else {
            localStorage.removeItem('admin_must_change_password');
          }
        }
        // If the password still uses the insecure default, force the admin to
        // set a new one before reaching the dashboard.
        const target = data.mustChangePassword ? '/xiaozhouBackend/settings/security' : '/xiaozhouBackend';
        window.location.href = target;
      } else {
        setError(data.error || '登录失败 / Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError('网络错误，请重试 / Network error, please retry');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">智能柜管理系统</h1>
          <p className="text-gray-600 mt-2">Smart Cabinet Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名 / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码 / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => { console.log('[LOGIN] Button clicked!'); handleSubmit(e); }}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '登录中... / Logging in...' : '登录 / Login'}
            </button>
          </form>

          {/* Security note — never expose credentials here */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>请使用您的管理员账号登录</p>
          </div>
        </div>
      </div>
    </div>
  );
}
