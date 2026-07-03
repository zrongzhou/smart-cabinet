'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowLeft, Save, Loader2, AlertCircle, X, CheckCircle } from 'lucide-react';
import MediaPicker from '@/components/admin/MediaPicker';
import { SettingsErrorBoundary, UseSettingsReturn } from '@/lib/admin-settings-common';

interface SettingsPageFrameProps {
  hook: UseSettingsReturn;
  title: string;
  description?: string;
  /** Link target for the back button (e.g. /admin/settings or /admin). */
  backHref: string;
  children: ReactNode;
}

/**
 * Shared chrome for every settings sub-page: back link, title, save button, error
 * banner, loading state, saved toast and the media picker modal. Each sub-page only
 * supplies its form content as `children` plus its own group of fields via the hook.
 */
export default function SettingsPageFrame({ hook, title, description, backHref, children }: SettingsPageFrameProps) {
  const {
    loading,
    saving,
    error,
    setError,
    saved,
    handleSave,
    showMediaPicker,
    setShowMediaPicker,
    mediaPickerTarget,
    setMediaPickerTarget,
    handleMediaSelect,
  } = hook;

  return (
    <div>
      {/* Error banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <Link href={backHref} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回设置
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn-primary flex items-center space-x-2 disabled:opacity-60"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? '保存中...' : '保存设置'}</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      ) : (
        <>
          <div className="admin-card p-6 animate-fade-in">
            <fieldset disabled={saving} className="border-0 m-0 p-0 min-w-0">
              {children}
            </fieldset>
          </div>

          {/* Saved toast */}
          {saved && (
            <div className="fixed bottom-8 right-8 p-4 bg-green-500 text-white rounded-xl shadow-lg z-50 animate-fade-in flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium">设置已保存！</p>
            </div>
          )}
        </>
      )}

      {/* Media picker modal */}
      {showMediaPicker && (
        <SettingsErrorBoundary
          fallback={
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => {
                setShowMediaPicker(false);
                setMediaPickerTarget(null);
              }}
            >
              <div className="bg-white rounded-2xl p-8 max-w-md">
                <p className="text-red-600">媒体库加载失败，请刷新页面后重试。</p>
                <button
                  onClick={() => {
                    setShowMediaPicker(false);
                    setMediaPickerTarget(null);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  关闭
                </button>
              </div>
            </div>
          }
        >
          <MediaPicker
            isOpen={showMediaPicker}
            onClose={() => {
              setShowMediaPicker(false);
              setMediaPickerTarget(null);
            }}
            onSelect={handleMediaSelect}
            fileType="image"
          />
        </SettingsErrorBoundary>
      )}
    </div>
  );
}
