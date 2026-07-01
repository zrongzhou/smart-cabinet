'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, ArrowLeft, Upload, Copy, Search, X,
  Image as ImageIcon, FileText, File, Video, Music, Archive,
  Grid, List, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}

type ViewMode = 'grid' | 'list';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const API_BASE = '/api/admin/media';

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  // ==================== Toast Helpers ====================
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // ==================== Load Media List (from server) ====================
  const loadMediaList = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/list?page=${page}&limit=${ITEMS_PER_PAGE}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMediaItems(data.files || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load media list:', err);
      showToast('加载媒体列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMediaList(currentPage);
  }, [loadMediaList]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ==================== File Upload (via API to server filesystem) ====================
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    let successCount = 0;
    let errorCount = 0;

    // Get auth token for upload request
    const getAuthHeaders = () => {
      const headers: Record<string, string> = {};
      // Try localStorage token first (for authFetch compatibility)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('admin_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return headers;
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i, total: files.length });

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders(),
          body: formData,
          // Don't set Content-Type header for FormData - browser will set it with boundary
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          errorCount++;
          showToast(`${file.name}: ${result.error || '上传失败'}`, 'error');
        } else {
          successCount++;
        }
      } catch (err) {
        console.error('Upload error:', err);
        errorCount++;
        showToast(`${file.name}: 网络错误，上传失败`, 'error');
      }

      setUploadProgress({ current: i + 1, total: files.length });
    }

    if (successCount > 0) {
      showToast(`成功上传 ${successCount} 个文件！${errorCount > 0 ? `（${errorCount} 个失败）` : ''}`, 'success');
      await loadMediaList(); // refresh list
    } else if (errorCount > 0) {
      showToast(`上传失败，请检查网络连接和服务器状态`, 'error');
    }

    setUploading(false);
    setShowUploadModal(false);
    setUploadProgress({ current: 0, total: 0 });
    
    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ==================== Drag & Drop ====================
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    handleFileUpload(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.add('border-blue-500', 'bg-blue-50');
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.remove('border-blue-500', 'bg-blue-50');
  };

  // ==================== Delete (via API) ====================
  const handleDelete = async (filename: string) => {
    if (typeof window !== 'undefined' && !confirm('确定要删除这个文件吗？')) return;

    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const result = await res.json();

      if (result.success) {
        showToast('删除成功', 'success');
        setMediaItems(prev => prev.filter(item => item.id !== filename));
        setSelectedItems(prev => prev.filter(id => id !== filename));
        if (previewImage?.id === filename) setPreviewImage(null);
      } else {
        showToast(result.error || '删除失败', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('网络错误，删除失败', 'error');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return;
    if (typeof window !== 'undefined' && !confirm(`确定要删除选中的 ${selectedItems.length} 个文件吗？`)) return;

    let deleted = 0;
    for (const filename of selectedItems) {
      try {
        const res = await fetch(`${API_BASE}/delete`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename }),
        });
        const result = await res.json();
        if (result.success) deleted++;
      } catch (err) {
        console.error('Batch delete error for', filename, err);
      }
    }

    if (deleted > 0) {
      showToast(`已删除 ${deleted}/${selectedItems.length} 个文件`, deleted === selectedItems.length ? 'success' : 'warning');
      await loadMediaList();
    }
    setSelectedItems([]);
  };

  // ==================== Copy URL ====================
  const copyUrl = (url: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => showToast('URL 已复制！', 'success'),
        () => showToast('复制失败', 'error')
      );
    }
  };

  // ==================== Helpers ====================
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Infer MIME type from file extension (since server list doesn't return type)
  const inferMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon',
      mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
      pdf: 'application/pdf',
      doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      zip: 'application/zip', rar: 'application/x-rar', '7z:': 'application/x-7z-compressed',
    };
    return mimeMap[ext] || 'application/octet-stream';
  };

  const getFileIcon = (type?: string, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-16 h-16' : 'w-8 h-8';
    if (!type || !type.startsWith) return <File className={`${sizeClass} text-gray-400`} />;
    if (type.startsWith('image/')) return <ImageIcon className={`${sizeClass} text-blue-500`} />;
    if (type.startsWith('video/')) return <Video className={`${sizeClass} text-purple-500`} />;
    if (type.startsWith('audio/')) return <Music className={`${sizeClass} text-pink-500`} />;
    if (type.includes('pdf')) return <FileText className={`${sizeClass} text-red-500`} />;
    if (type.includes('word') || type.includes('document')) return <FileText className={`${sizeClass} text-blue-600`} />;
    if (type.includes('zip') || type.includes('compressed')) return <Archive className={`${sizeClass} text-yellow-600`} />;
    return <File className={`${sizeClass} text-gray-400`} />;
  };

  const filteredItems = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==================== Render ====================
  return (
    <div>
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
                t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-amber-500'
              }`}
            >
              {t.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 text-base">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回仪表盘
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">媒体库管理</h1>
          <p className="text-gray-600 mt-2 text-lg">管理系统中的所有媒体文件。文件存储在服务器上，无空间限制。</p>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => { loadMediaList(); }} className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2.5 text-base font-medium shadow-sm" title="刷新列表">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          {selectedItems.length > 0 && (
            <button onClick={handleBatchDelete} className="px-6 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2.5 text-base font-medium shadow-lg shadow-red-200">
              <Trash2 className="w-5 h-5" />
              <span>删除选中 ({selectedItems.length})</span>
            </button>
          )}
          <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center space-x-2.5 text-base py-3.5 px-6">
            <Plus className="w-5 h-5" />
            <span>上传文件</span>
          </button>
        </div>
      </div>

      {/* Search + View Toggle */}
      <div className="admin-card mb-8 p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索文件名..."
              className="w-full pl-12 pr-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none admin-form-input transition-all text-base"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1.5">
            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
              <Grid className="w-6 h-6" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
              <List className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="admin-card p-8">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <RefreshCw className="w-16 h-16 mx-auto mb-6 animate-spin text-blue-500" />
              <p className="text-lg">加载中...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`relative group border-2 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${
                    selectedItems.includes(item.id) ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedItems(prev => [...prev, item.id]);
                        else setSelectedItems(prev => prev.filter(id => id !== item.id));
                      }}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 shadow-lg"
                    />
                  </div>
                  <div className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer" onClick={() => setPreviewImage(item)}>
                    {inferMimeType(item.name).startsWith('image/') ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
                        {getFileIcon(inferMimeType(item.name), 'lg')}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button onClick={e => { e.stopPropagation(); copyUrl(item.url); }} className="p-3 bg-white/90 rounded-xl hover:bg-white transition-colors shadow-lg" title="复制URL">
                      <Copy className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }} className="p-3 bg-white/90 rounded-xl hover:bg-white transition-colors shadow-lg" title="删除">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 truncate font-medium" title={item.name}>{item.name}</p>
                    <p className="text-sm text-gray-400 mt-1.5">{formatFileSize(item.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <p className="text-lg">{searchQuery ? '没有找到匹配的文件' : '暂无媒体文件，点击"上传文件"按钮添加。'}</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="admin-card overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <RefreshCw className="w-16 h-16 mx-auto mb-6 animate-spin text-blue-500" />
              <p className="text-lg">加载中...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-900 w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={e => {
                        if (e.target.checked) setSelectedItems(filteredItems.map(item => item.id));
                        else setSelectedItems([]);
                      }}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-900">文件</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-900">类型</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-900">大小</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-900">上传时间</th>
                  <th className="px-6 py-5 text-right text-xs font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'} hover:bg-blue-50/50 transition-colors duration-150`}>
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedItems(prev => [...prev, item.id]);
                          else setSelectedItems(prev => prev.filter(id => id !== item.id));
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getFileIcon(inferMimeType(item.name))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900 truncate">{item.name}</p>
                          <button onClick={() => copyUrl(item.url)} className="text-sm text-blue-500 hover:text-blue-700 truncate block mt-1" title={item.url}>
                            {item.url.substring(0, 80)}...
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">{item.type.split('/')[0]}</span></td>
                    <td className="px-6 py-5 text-base text-gray-600">{formatFileSize(item.size)}</td>
                    <td className="px-6 py-5 text-base text-gray-600">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => copyUrl(item.url)} className="admin-btn-action-edit" title="复制URL"><Copy className="w-5 h-5" /></button>
                        <button onClick={() => { if (inferMimeType(item.name).startsWith('image/')) setPreviewImage(item); else window.open(item.url, '_blank'); }} className="p-2.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" title="预览"><ImageIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(item.id)} className="admin-btn-action-delete" title="删除"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <ImageIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <p className="text-lg">暂无媒体文件，点击"上传文件"按钮添加。</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-card mt-6 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              共 {totalItems} 个文件，第 {currentPage}/{totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadMediaList(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => loadMediaList(pageNum)}
                    disabled={loading}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => loadMediaList(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">上传文件</h2>

            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 mb-2">拖拽文件到此处或点击上传</p>
              <p className="text-sm text-gray-400">支持 JPG、PNG、GIF、PDF、MP4 等格式，单个文件最大 50MB</p>
              <p className="text-sm text-blue-500 mt-2 font-medium">📁 文件存储在服务器上，无空间限制</p>
            </div>

            <input
              ref={fileInputRef}
              type="file" multiple
              accept="image/*,.pdf,.doc,.docx,.zip,.mp4,.mp3,.webp,.gif,.svg"
              className="hidden"
              onChange={e => handleFileUpload(e.target.files)}
            />

            {uploading && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 font-medium">正在上传... ({uploadProgress.current}/{uploadProgress.total})</span>
                  <span className="text-gray-500">{uploadProgress.total > 0 ? Math.round(uploadProgress.current / uploadProgress.total * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-all transition-all duration-300" style={{ width: `${uploadProgress.total > 0 ? uploadProgress.current / uploadProgress.total * 100 : 0}%` }} />
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-6">
              <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary flex-1" disabled={uploading}>
                {uploading ? '上传中...' : '取消'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={previewImage.url} alt={previewImage.name} className="w-full h-auto max-h-[70vh] object-contain bg-gray-100" />
              <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{previewImage.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div><span className="font-medium">文件大小：</span>{formatFileSize(previewImage.size)}</div>
                <div><span className="font-medium">上传时间：</span>{new Date(previewImage.createdAt).toLocaleString('zh-CN')}</div>
                <div className="col-span-2"><span className="font-medium">URL：</span><code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">{previewImage.url}</code></div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button onClick={() => copyUrl(previewImage.url)} className="btn-primary flex items-center space-x-2"><Copy className="w-4 h-4" /><span>复制URL</span></button>
                <button onClick={() => { handleDelete(previewImage.id); setPreviewImage(null); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"><Trash2 className="w-4 h-4" /><span>删除</span></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
