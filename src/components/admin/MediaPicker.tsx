'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Image, Video, File, ExternalLink, Loader2 } from 'lucide-react';

export interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  fileType?: 'all' | 'image' | 'video';
}

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string; // MIME type from server
  createdAt: string;
}

const API_LIST = '/api/admin/media/list';

export default function MediaPicker({ isOpen, onClose, onSelect, fileType = 'all' }: MediaPickerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>(fileType);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load media from SERVER API on open
  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(API_LIST, { headers });
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data.files || []);
      } else if (res.status === 401) {
        console.error('Unauthorized: Please log in again');
        setMediaItems([]);
      }
    } catch (e) {
      console.error('Failed to load media from server:', e);
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    loadMedia();
    setSelectedUrl(null);
    setSearchQuery('');
    setActiveTab(fileType);
  }, [isOpen, fileType, loadMedia]);

  // Filter items based on search and tab
  useEffect(() => {
    let filtered = [...mediaItems];

    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type?.startsWith(activeTab + '/'));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [mediaItems, searchQuery, activeTab]);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">选择媒体文件</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文件名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <File className="w-4 h-4 inline-block mr-1" />
                全部
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'image'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Image className="w-4 h-4 inline-block mr-1" />
                图片
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'video'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Video className="w-4 h-4 inline-block mr-1" />
                视频
              </button>
            </div>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-16 text-gray-500">
                <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-blue-500" />
                <p>加载媒体库中...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">暂无媒体文件</p>
                <p className="text-sm text-gray-400 mb-4">请先在媒体库管理页面上传文件</p>
                <a
                  href="/admin/media"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  前往媒体库上传
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedUrl === item.url
                        ? 'border-blue-600 shadow-lg scale-105'
                        : 'border-transparent hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {item.type?.startsWith('image/') || (!item.type && item.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.classList.add('bg-gray-200');
                            const icon = document.createElement('div');
                            icon.className = 'flex items-center justify-center h-full text-gray-400';
                            icon.innerHTML = '<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                            parent.appendChild(icon);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-900 flex items-center justify-center">
                        <Video className="w-12 h-12 text-white/70" />
                      </div>
                    )}

                    {/* Selection indicator */}
                    {selectedUrl === item.url && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* File name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs truncate">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="text-sm text-gray-600">
              {selectedUrl ? (
                <span>已选: <code className="text-xs bg-gray-200 px-2 py-1 rounded max-w-[200px] inline-block truncate align-middle">{selectedUrl}</code></span>
              ) : (
                <span>未选择任何文件</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedUrl}
                className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
                  selectedUrl
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                确认选择
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
