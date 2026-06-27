'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/components/AuthProvider';
import FavoritesList from '@/components/account/FavoritesList';
import OrdersList from '@/components/account/OrdersList';

type TabKey = 'profile' | 'orders' | 'favorites' | 'password';

export default function AccountPage() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    avatar: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Favorites and Orders state
  const [favorites, setFavorites] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Tabs configuration
  const tabs = [
    { 
      key: 'profile' as TabKey, 
      label: { en: 'Profile', zh: '个人信息', ar: 'الملف الشخصي' } 
    },
    { 
      key: 'orders' as TabKey, 
      label: { en: 'Orders', zh: '订单', ar: 'الطلبات' } 
    },
    { 
      key: 'favorites' as TabKey, 
      label: { en: 'Favorites', zh: '收藏', ar: 'المفضلة' } 
    },
    { 
      key: 'password' as TabKey, 
      label: { en: 'Password', zh: '密码', ar: 'كلمة المرور' } 
    },
  ];

  // Check authentication and load profile
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=/${locale}/account`);
      return;
    }

    loadProfile();
  }, [isAuthenticated, locale, router]);

  // Load favorites and orders when tab changes
  useEffect(() => {
    if (activeTab === 'favorites') {
      loadFavorites();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const userData = data.user;
        setFormData({
          name: userData.name || '',
          company: userData.company || '',
          phone: userData.phone || '',
          avatar: userData.avatar || '',
        });
        updateUser(userData);
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Load profile error:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setDataLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/user/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Load favorites error:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setDataLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/user/favorites?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setFavorites(favorites.filter(f => f.productId !== productId));
      }
    } catch (error) {
      console.error('Remove favorite error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess(
          locale === 'zh'
            ? '资料更新成功！'
            : locale === 'ar'
            ? 'تم تحديث الملف الشخصي بنجاح!'
            : 'Profile updated successfully!'
        );
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError(
        locale === 'zh'
          ? '更新失败，请重试'
          : locale === 'ar'
          ? 'فشل التحديث، يرجى المحاولة مرة أخرى'
          : 'Update failed. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(
        locale === 'zh'
          ? '新密码和确认密码不匹配'
          : locale === 'ar'
          ? 'كلمة المرور الجديدة وتأكيدها غير متطابقين'
          : 'New password and confirm password do not match'
      );
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(
        locale === 'zh'
          ? '新密码至少6个字符'
          : locale === 'ar'
          ? 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'
          : 'New password must be at least 6 characters'
      );
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (res.ok) {
        setPasswordSuccess(
          locale === 'zh'
            ? '密码修改成功！'
            : locale === 'ar'
            ? 'تم تغيير كلمة المرور بنجاح!'
            : 'Password changed successfully!'
        );
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        const data = await res.json();
        setPasswordError(data.error || 'Password change failed');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordError('Password change failed');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, avatar: data.url }));
        setSuccess('Avatar uploaded successfully');
      } else {
        setError('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setError('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push(`/${locale}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-blue-100">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm text-white">
                  {user.role === 'admin' ? (locale === 'zh' ? '管理员' : locale === 'ar' ? 'مدير' : 'Admin') : locale === 'zh' ? '用户' : locale === 'ar' ? 'مستخدم' : 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label[locale as keyof typeof tab.label] || tab.label.en}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('auth.name') || 'Name'}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    {t('auth.company') || 'Company'}
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    {t('auth.phone') || 'Phone'}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {locale === 'zh' ? '退出登录' : locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {locale === 'zh' ? '保存中...' : locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                      </span>
                    ) : (
                      (locale === 'zh' ? '保存修改' : locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'zh' ? '我的订单' : locale === 'ar' ? 'طلباتي' : 'My Orders'}
              </h2>
              {dataLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <OrdersList locale={locale} orders={orders} />
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'zh' ? '我的收藏' : locale === 'ar' ? 'مفضلتي' : 'My Favorites'}
              </h2>
              {dataLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <FavoritesList
                  locale={locale}
                  favorites={favorites}
                  onRemove={handleRemoveFavorite}
                />
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'zh' ? '修改密码' : locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </h2>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    {locale === 'zh' ? '当前密码' : locale === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    {locale === 'zh' ? '新密码' : locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {locale === 'zh' ? '确认新密码' : locale === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {locale === 'zh' ? '修改密码' : locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
