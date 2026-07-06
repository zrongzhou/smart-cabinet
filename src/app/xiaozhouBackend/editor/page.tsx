'use client';

import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft, GripVertical, X, Check, Image, Upload, Eye, EyeOff, ArrowUp, ArrowDown, Layers, AlertCircle, Save, Loader2, Sidebar, PanelLeftClose, PanelLeftOpen, MousePointerClick, Undo, Redo } from 'lucide-react';
import MediaPicker from '@/components/xiaozhouBackend/MediaPicker';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Error Boundary Component
class EditorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Editor page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">页面出现错误</h2>
            <p className="text-gray-600 mb-4 text-sm">
              编辑器页面遇到意外错误，请尝试刷新页面或联系管理员。
            </p>
            {this.state.error && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs text-gray-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={() => {
                  // Clear potentially corrupted localStorage
                  if (typeof window !== 'undefined') {
                    const keys = Object.keys(localStorage).filter(k => k.startsWith('admin_page_'));
                    keys.forEach(k => localStorage.removeItem(k));
                  }
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                清除缓存并刷新
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Page keys available for editing
const PAGE_KEYS = [
  { key: 'home', label: '首页 Hero', icon: '🏠' },
  { key: 'about', label: '关于我们', icon: '📖' },
  { key: 'products', label: '产品页', icon: '📦' },
  { key: 'faq', label: '常见问题', icon: '❓' },
  { key: 'contact', label: '联系我们', icon: '📞' },
];

// Image fields that should have a "pick image" button (module level for reuse)
const IMAGE_FIELDS = ['imageUrl', 'image', 'backgroundImage', 'bgImage', 'coverImage', 'logoUrl', 'thumbnail'];
  
// Field description mapping (for image position preview)
const FIELD_DESCRIPTIONS: Record<string, { zh: string; en: string }> = {
  imageUrl: { zh: '主图 / Hero背景', en: 'Main Image / Hero BG' },
  image: { zh: '图片', en: 'Image' },
  backgroundImage: { zh: '背景图', en: 'Background Image' },
  bgImage: { zh: '背景图', en: 'Background Image' },
  coverImage: { zh: '封面图', en: 'Cover Image' },
  logoUrl: { zh: 'Logo', en: 'Logo' },
  thumbnail: { zh: '缩略图', en: 'Thumbnail' },
};

// Helper: check if a value looks like an image URL
const isImageUrl = (val: any): boolean => {
  if (typeof val !== 'string' || !val) return false;
  // Check for http(s) URLs
  if (val.startsWith('http://') || val.startsWith('https://')) return true;
  // Check for relative paths to images
  if (val.startsWith('/') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(val)) return true;
  // Check for data URLs
  if (val.startsWith('data:image/')) return true;
  return false;
};

// ContentBlock interface
interface ContentBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'features' | 'cta' | 'stats';
  title?: { zh: string; en: string; ar: string };
  content: Record<string, string>;
  images?: Array<{ url: string; alt?: string; caption?: string }>;
  order: number;
  status: 'active' | 'inactive';
}

// Default blocks for each page (pre-loaded with actual frontend content fields)
const DEFAULT_BLOCKS: Record<string, ContentBlock[]> = {
  home: [
    { id: 'home-hero-1', type: 'hero', title: { zh: '首页 Hero 区域', en: 'Home Hero Section', ar: 'قسم البطل الرئيسي' }, content: { subtitle: '高效•安全•智能', subtitleEn: 'Efficient • Secure • Intelligent', subtitleAr: 'كفاءة • أمان • ذكي', description: '专业智能柜解决方案，为现代制造业提供智能化管理', descriptionEn: 'Professional smart cabinet solutions for modern manufacturing', descriptionAr: '', imageUrl: '' }, images: [], order: 0, status: 'active' },
    { id: 'home-features-1', type: 'features', title: { zh: '核心特性', en: 'Key Features', ar: 'الميزات الأساسية' }, content: { bodyZh: '', bodyEn: '', bodyAr: '' }, images: [], order: 1, status: 'active' },
    { id: 'home-cta-1', type: 'cta', title: { zh: '行动号召', en: 'Call to Action', ar: 'دعوة للعمل' }, content: { ctaTextZh: '立即联系我们获取方案', ctaTextEn: 'Contact us today for a solution', ctaTextAr: '', ctaLink: '/zh/contact' }, images: [], order: 2, status: 'active' },
    { id: 'home-stats-1', type: 'stats', title: { zh: '数据统计', en: 'Statistics', ar: 'إحصائيات' }, content: { stat1Label: '服务客户', stat1Value: '800+', stat2Label: '产品型号', stat2Value: '100+', stat3Label: '国家地区', stat3Value: '30+' }, images: [], order: 3, status: 'active' },
  ],
  about: [
    { id: 'about-intro-1', type: 'text', title: { zh: '公司简介', en: 'Company Intro', ar: 'مقدمة الشركة' }, content: { bodyZh: '广州秋彦科技有限公司专注于智能存储解决方案的研发与制造...', bodyEn: 'Guangzhou Qiuyan Technology specializes in R&D and manufacturing of intelligent storage solutions...', bodyAr: '' }, images: [], order: 0, status: 'active' },
    { id: 'about-image-1', type: 'image', title: { zh: '公司图片', en: 'Company Image', ar: 'صورة الشركة' }, content: { imageUrl: '', imageCaption: '' }, images: [], order: 1, status: 'active' },
  ],
  products: [
    { id: 'products-header-1', type: 'text', title: { zh: '产品页标题', en: 'Products Header', ar: 'رأس صفحة المنتجات' }, content: { titleZh: '智能工具柜产品线', titleEn: 'Smart Tool Cabinet Product Line', titleAr: '', subtitleZh: '覆盖全场景的智能化存储管理方案', subtitleEn: 'Comprehensive intelligent storage management solutions' }, images: [], order: 0, status: 'active' },
  ],
  faq: [
    { id: 'faq-header-1', type: 'text', title: { zh: 'FAQ 标题', en: 'FAQ Header', ar: 'رأس الأسئلة الشائعة' }, content: { titleZh: '常见问题解答', titleEn: 'Frequently Asked Questions', titleAr: '' }, images: [], order: 0, status: 'active' },
  ],
  contact: [
    { id: 'contact-info-1', type: 'text', title: { zh: '联系信息', en: 'Contact Info', ar: 'معلومات الاتصال' }, content: { addressZh: '中国广东省广州市番禺区', addressEn: 'Panyu District, Guangzhou, China', email: 'sabina@wstoolcabinet.com', phone: '+86 156 2216 0659' }, images: [], order: 0, status: 'active' },
  ],
};

export default function EditorPage() {
  const [activePage, setActivePage] = useState('home');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [editingImages, setEditingImages] = useState<string | null>(null); // block id
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ blockId: string; field?: string; index?: number }>({ blockId: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());

  // Issue 10: Editor enhancements
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  // Auto-save timer ref (debounce 1s)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // P0 Features: Sidebar & Inline Editing
  const [showSidebar, setShowSidebar] = useState(true);
  const [inlineEditing, setInlineEditing] = useState<{ blockId: string; field: string } | null>(null);
  const [inlineValue, setInlineValue] = useState('');
  
  // Inline editing save handler
  const saveInlineEdit = () => {
    if (!inlineEditing) return;
    const { blockId, field } = inlineEditing;
    const newBlocks = blocks.map(b => {
      if (b.id !== blockId) return b;
      return { ...b, content: { ...b.content, [field]: inlineValue } };
    });
    saveBlocks(newBlocks);
    setInlineEditing(null);
    setInlineValue('');
    showToastNotification('已更新', 'success');
  };
  
  // P1 Features: Undo/Redo & Preview
  const [history, setHistory] = useState<ContentBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Track unsaved changes
  const markChanged = () => setHasUnsavedChanges(true);
  const markSaved = () => setHasUnsavedChanges(false);

  // Save to server (silent=true: no toast/loading, for auto-save)
  const saveToServer = useCallback(async (silent: boolean = false) => {
    if (!silent) setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Get or create page in database
      const pageSlug = `page_${activePage}`;
      
      // First try to get existing page
      let existingPage = null;
      try {
        const getRes = await fetch(`/api/admin/pages/${pageSlug}`, { headers });
        if (getRes.ok) {
          existingPage = await getRes.json();
        }
      } catch (e) {
        // Page doesn't exist yet
      }

      const pageData = {
        title: PAGE_KEYS.find(p => p.key === activePage)?.label || activePage,
        blocks: blocksRef.current,
      };

      let res;
      if (existingPage) {
        // Update existing page
        res = await fetch(`/api/admin/pages/${pageSlug}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(pageData),
        });
      } else {
        // Create new page
        res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers,
          body: JSON.stringify({ slug: pageSlug, ...pageData }),
        });
      }

      if (res.ok) {
        markSaved();
        if (!silent) showToastNotification('页面已保存到服务器！', 'success');
      } else {
        const error = await res.json();
        
        // Handle P2021 error (table doesn't exist) gracefully
        if (error.code === 'P2021' || error.fallback === 'localStorage') {
          markSaved(); // Mark as saved since it's in localStorage
          if (!silent) showToastNotification('已保存到本地存储（数据库表尚未创建）', 'success');
          console.warn('[Editor] Database table does not exist. Content saved to localStorage.');
        } else {
          if (!silent) showToastNotification(`保存失败: ${error.error || '未知错误'}`, 'error');
        }
      }
    } catch (error: any) {
      console.error('Save to server error:', error);
      // Check if it's a network error but localStorage is OK
      markSaved();
      if (!silent) showToastNotification('已保存到本地存储（服务器连接失败）', 'success');
    } finally {
      if (!silent) setSaving(false);
    }
  }, [activePage]);

  // P1: Undo/Redo functions
  const saveToHistory = useCallback((newBlocks: ContentBlock[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newBlocks]);
      // Keep only last 50 actions
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousBlocks = history[newIndex];
      setBlocks([...previousBlocks]);
      localStorage.setItem(`admin_page_${activePage}`, JSON.stringify(previousBlocks));
      setHistoryIndex(newIndex);
      markChanged();
      showToastNotification('已撤销', 'success');
    }
  }, [historyIndex, history, activePage]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextBlocks = history[newIndex];
      setBlocks([...nextBlocks]);
      localStorage.setItem(`admin_page_${activePage}`, JSON.stringify(nextBlocks));
      setHistoryIndex(newIndex);
      markChanged();
      showToastNotification('已重做', 'success');
    }
  }, [historyIndex, history, activePage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Show toast notification
  const showToastNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的修改，确定要离开吗？';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load blocks from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `admin_page_${activePage}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBlocks(Array.isArray(parsed) ? parsed : (DEFAULT_BLOCKS[activePage] || []));
      } catch {
        setBlocks(DEFAULT_BLOCKS[activePage] || []);
      }
    } else {
      setBlocks(DEFAULT_BLOCKS[activePage] || []);
    }
  }, [activePage]);

  // Save blocks to localStorage + auto-save to server (debounced)
  const saveBlocks = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    localStorage.setItem(`admin_page_${activePage}`, JSON.stringify(newBlocks));
    // Also update unified data
    try {
      const allPages = JSON.parse(localStorage.getItem('admin_pages') || '{}');
      allPages[activePage] = newBlocks;
      localStorage.setItem('admin_pages', JSON.stringify(allPages));
    } catch {}
    // Mark as changed
    markChanged();
    // Save to history for undo/redo
    saveToHistory(newBlocks);

    // Auto-save to server (debounced 1s, silent)
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveToServer(true);
    }, 1000);
  };

  // Block CRUD
  const handleAddBlock = () => {
    setEditingBlock({
      id: `${activePage}-${Date.now()}`,
      type: 'text',
      title: { zh: '', en: '', ar: '' },
      content: {},
      images: [],
      order: blocks.length,
      status: 'active',
    });
    setShowBlockModal(true);
  };

  const handleEditBlock = (block: ContentBlock) => {
    setEditingBlock({ ...block });
    setShowBlockModal(true);
  };

  const handleDeleteBlock = (id: string) => {
    if (!confirm('确定要删除此内容块吗？')) return;
    saveBlocks(blocks.filter(b => b.id !== id));
  };

  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    newBlocks.forEach((b, i) => b.order = i);
    saveBlocks(newBlocks);
  };

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;
    const exists = blocks.some(b => b.id === editingBlock.id);
    let newBlocks;
    if (exists) {
      newBlocks = blocks.map(b => b.id === editingBlock.id ? editingBlock : b);
    } else {
      newBlocks = [...blocks, editingBlock];
    }
    newBlocks.sort((a, b) => a.order - b.order);
    saveBlocks(newBlocks);
    setShowBlockModal(false);
    setEditingBlock(null);
    // Mark as saved and show toast
    markSaved();
    showToastNotification('内容块已保存！', 'success');
  };

  // Image management
  const addImageToBlock = (blockId: string, url: string, field?: string) => {
    if (field) {
      // Set as content field value
      const newBlocks = blocks.map(b => {
        if (b.id !== blockId) return b;
        return { ...b, content: { ...b.content, [field]: url } };
      });
      saveBlocks(newBlocks);
    } else {
      // Add to images array
      const newBlocks = blocks.map(b => {
        if (b.id !== blockId) return b;
        return { ...b, images: [...(b.images || []), { url, alt: '', caption: '' }] };
      });
      saveBlocks(newBlocks);
    }
    setShowMediaPicker(false);
  };

  const removeImageFromBlock = (blockId: string, index: number) => {
    const newBlocks = blocks.map(b => {
      if (b.id !== blockId) return b;
      const newImages = [...(b.images || [])];
      newImages.splice(index, 1);
      return { ...b, images: newImages };
    });
    saveBlocks(newBlocks);
  };

  const clearContentImage = (blockId: string, field: string) => {
    const newBlocks = blocks.map(b => {
      if (b.id !== blockId) return b;
      const newContent = { ...b.content };
      delete newContent[field];
      return { ...b, content: newContent };
    });
    saveBlocks(newBlocks);
  };

  // Build image list for a block (from both images array and content fields)
  const getBlockImages = (block: ContentBlock) => {
    const result: Array<{ url: string; alt?: string; caption?: string; source: string; index?: number }> = [];
    // From images array
    (block.images || []).forEach((img, idx) => {
      result.push({ ...img, source: 'gallery', index: idx });
    });
    // From content fields
    IMAGE_FIELDS.forEach(field => {
      const val = block.content[field];
      if (val && typeof val === 'string' && isImageUrl(val)) {
        result.push({ url: val, alt: field, caption: `来自 ${field}`, source: `content.${field}` });
      }
    });
    return result;
  };

  return (
    <EditorErrorBoundary>
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Page Structure */}
      {showSidebar && (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              页面结构
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {blocks.map((block, idx) => (
              <button
                key={block.id}
                onClick={() => {
                  const element = document.getElementById(`block-${block.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
                    setTimeout(() => {
                      element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
                    }, 2000);
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white transition-colors border border-transparent hover:border-gray-200 group"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    block.type === 'hero' ? 'bg-purple-100 text-purple-700' :
                    block.type === 'text' ? 'bg-blue-100 text-blue-700' :
                    block.type === 'image' || block.type === 'gallery' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {block.type}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {block.title?.zh || block.title?.en || `Block ${idx + 1}`}
                </p>
              </button>
            ))}
            {blocks.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                暂无内容块
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'} overflow-hidden`}>
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-4 right-4 z-[100] animate-fade-in">
              <div className={`px-5 py-3 rounded-xl shadow-lg text-white font-medium flex items-center gap-2 ${
                showToast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {showToast.type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>{showToast.message}</span>
              </div>
            </div>
          )}

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          {/* Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 mt-8"
            title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
          >
            {showSidebar ? (
              <PanelLeftClose className="w-5 h-5 text-gray-600" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <div>
            <Link href="/xiaozhouBackend" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-1 text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回仪表盘
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">页面编辑器</h1>
            <p className="text-gray-500 mt-0.5 text-sm">编辑网站各页面的内容块，支持图片管理和多语言内容</p>
            {/* Issue 10: Help text */}
            <p className="text-xs text-blue-500 mt-1.5">
              💡 提示：每个页面由多个"内容块"组成。点击"添加内容块"创建，点击 ✏️ 编辑，拖拽 ⇅ 排序。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo/Redo Buttons */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded-lg transition-colors ${
              historyIndex > 0
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="撤销 (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded-lg transition-colors ${
              historyIndex < history.length - 1
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="重做 (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded-lg transition-colors ${
              showPreview
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={showPreview ? '关闭预览' : '实时预览'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Save to Server button */}
          <button
            onClick={() => saveToServer()}
            disabled={saving || !hasUnsavedChanges}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border flex items-center gap-2 ${
              hasUnsavedChanges
                ? 'text-white bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-sm'
                : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
            }`}
            title={hasUnsavedChanges ? '保存修改到服务器' : '没有未保存的修改'}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存更改
              </>
            )}
          </button>

          {/* Issue 10: Reset to default button */}
          <button
            onClick={() => {
              if (confirm('确定要恢复此页面的默认内容吗？当前修改将丢失。')) {
                localStorage.removeItem(`admin_page_${activePage}`);
                setBlocks(DEFAULT_BLOCKS[activePage] || []);
                markSaved();
                showToastNotification('已恢复为默认内容', 'success');
              }
            }}
            className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
            title="恢复此页面的默认内容"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            恢复默认
          </button>
        </div>
      </div>

      {/* Issue 10: Unsaved changes warning */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-amber-700">您有未保存的修改，离开页面前请确保已保存。</span>
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGE_KEYS.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePage(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activePage === p.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1.5">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Blocks List */}
      <div className="space-y-4 flex-1 overflow-y-auto p-6">
        {blocks.map((block, idx) => {
          const images = getBlockImages(block);
          return (
            <div key={block.id} id={`block-${block.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
              {/* Block Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-300" />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    block.type === 'hero' ? 'bg-purple-100 text-purple-700' :
                    block.type === 'text' ? 'bg-blue-100 text-blue-700' :
                    block.type === 'image' || block.type === 'gallery' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {block.type}
                  </span>
                  <span className="font-medium text-gray-900 text-sm">
                    {block.title?.zh || block.title?.en || block.id}
                  </span>
                  <span className="text-xs text-gray-400">#{idx + 1}</span>
                  {block.status === 'inactive' && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">隐藏</span>
                  )}
                  {images.length > 0 && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      {images.length} 图
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleMoveBlock(block.id, 'up')} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleMoveBlock(block.id, 'down')} disabled={idx === blocks.length - 1} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingImages(block.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="管理图片">
                    <Image className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEditBlock(block)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="编辑">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {/* Issue 10: Reset to default button */}
                  <button
                    onClick={() => {
                        if (confirm('确定要将此内容块恢复为默认内容吗？')) {
                          const defaultBlocks = DEFAULT_BLOCKS[activePage] || [];
                          const defaultBlock = defaultBlocks.find(b => b.id === block.id);
                          if (defaultBlock) {
                            const newBlocks = blocks.map(b => b.id === block.id ? { ...defaultBlock } : b);
                            saveBlocks(newBlocks);
                            showToastNotification('已恢复为默认内容', 'success');
                          }
                      }
                    }}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                    title="恢复默认内容"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteBlock(block.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="删除">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Block Preview */}
              <div className="px-5 py-4">
                {/* Title */}
                {(block.title?.zh || block.title?.en) && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-900">{block.title?.zh || block.title?.en}</span>
                    {block.title?.en && block.title?.zh && <span className="text-xs text-gray-400 ml-2">({block.title.en})</span>}
                  </div>
                )}

                {/* Content fields preview - with inline image thumbnails */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {Object.entries(block.content).filter(([k, v]) => typeof v === 'string' && v.length > 0 && !k.startsWith('__')).map(([key, val]) => (
                    <div key={key} className="text-sm bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-500 text-xs font-mono">{key}</span>
                        {IMAGE_FIELDS.includes(key) && (
                          <button
                            type="button"
                            onClick={() => { setMediaTarget({ blockId: block.id, field: key }); setShowMediaPicker(true); }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >更换</button>
                        )}
                      </div>
                      {IMAGE_FIELDS.includes(key) && isImageUrl(val) ? (
                        <div className="space-y-1">
                          <img src={val} alt="" className="w-full h-16 object-cover rounded border border-gray-200" />
                          <span className="text-blue-600 break-all text-xs">{String(val).substring(0, 80)}{String(val).length > 80 ? '...' : ''}</span>
                        </div>
                      ) : (
                        inlineEditing?.blockId === block.id && inlineEditing?.field === key ? (
                          <input
                            type="text"
                            value={inlineValue}
                            onChange={(e) => setInlineValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveInlineEdit();
                              if (e.key === 'Escape') { setInlineEditing(null); setInlineValue(''); }
                            }}
                            onBlur={saveInlineEdit}
                            autoFocus
                            className="w-full px-2 py-1 border-2 border-blue-500 rounded text-sm"
                          />
                        ) : (
                          <div
                            className="text-gray-700 line-clamp-3 cursor-pointer hover:bg-yellow-50 rounded p-1 -m-1 transition-colors"
                            onDoubleClick={() => {
                              setInlineEditing({ blockId: block.id, field: key });
                              setInlineValue(String(val));
                            }}
                            title="双击编辑"
                          >
                            {String(val).substring(0, 120)}{String(val).length > 120 ? '...' : ''}
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>

                {/* Images Preview */}
                {images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-gray-100">
                    {images.slice(0, 4).map((img, i) => (
                      <div key={i} className="w-20 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative group">
                        <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] px-1 py-0.5 bg-black/60 rounded">{img.source === 'gallery' ? '图库' : '字段'}</span>
                        </div>
                      </div>
                    ))}
                    {images.length > 4 && (
                      <div className="w-20 h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                        +{images.length - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state hint */}
                {Object.keys(block.content).length === 0 && images.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-3 bg-gray-50 rounded-lg">点击 ✏️ 编辑按钮添加内容</p>
                )}
              </div>
            </div>
          );
        })}

        {blocks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Layers className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p>此页面暂无内容块，点击"添加内容块"开始编辑。</p>
          </div>
        )}
      </div>

      {/* Add Block Button */}
      <div className="mt-6 px-6 pb-6">
        <button onClick={handleAddBlock} className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5">
          <Plus className="w-4 h-4" />
          添加内容块
        </button>
      </div>
    </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="w-1/2 border-l border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              实时预览
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <iframe
            ref={previewRef}
            src={`/${activePage}`}
            className="flex-1 w-full"
            title="页面预览"
          />
        </div>
      )}
    </div>

      {/* Block Edit Modal */}
      {showBlockModal && editingBlock && (
          <BlockEditModal
            block={editingBlock}
            onSave={(updatedBlock: ContentBlock) => {
              setEditingBlock(updatedBlock);
              handleBlockSubmit({ preventDefault: () => {} } as any);
            }}
          onClose={() => { setShowBlockModal(false); setEditingBlock(null); }}
          onPickImage={(field: string) => {
            setMediaTarget({ blockId: editingBlock.id, field });
            setShowMediaPicker(true);
          }}
        />
      )}

      {/* Image Management Modal */}
      {editingImages && (() => {
        const block = blocks.find(b => b.id === editingImages);
        if (!block) return null;
        const images = getBlockImages(block);
        return (
          <ImageManagementModal
            block={block}
            images={images}
            onAddImage={(url: string) => addImageToBlock(block.id, url)}
            onRemoveImage={(index: number) => removeImageFromBlock(block.id, index)}
            onClearField={(field: string) => clearContentImage(block.id, field)}
            onClose={() => setEditingImages(null)}
            onPickImage={() => {
              setMediaTarget({ blockId: block.id });
              setShowMediaPicker(true);
            }}
          />
        );
      })()}

      {/* MediaPicker */}
      {showMediaPicker && (
        <MediaPicker
          isOpen={showMediaPicker}
          onSelect={(url: string) => {
            if (mediaTarget.field) {
              addImageToBlock(mediaTarget.blockId, url, mediaTarget.field);
            } else {
              addImageToBlock(mediaTarget.blockId, url);
            }
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  </EditorErrorBoundary>
  );
}

// 安全读取三语字段的某语言值，避免把数组直接塞进 <input value> 触发 React "Expected value to be a string" 崩溃。
// 数组 -> 逗号分隔串；字符串 -> 原样；其它/缺失 -> 空串。
function mlFieldToStr(field: any, lang: 'en' | 'zh' | 'ar'): string {
  const v = field ? field[lang] : undefined;
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'string') return v;
  return '';
}

// Block Edit Modal Component
function BlockEditModal({ block, onSave, onClose, onPickImage }: any) {
  const [draft, setDraft] = useState<ContentBlock>({ ...block });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
  };

  const updateTitle = (lang: string, val: string) => {
    setDraft(prev => {
      const newTitle = { ...prev.title } as Record<string, string>;
      newTitle[lang] = val;
      return { ...prev, title: newTitle as { zh: string; en: string; ar: string } };
    });
  };

  const updateContent = (key: string, val: string) => {
    setDraft(prev => ({ ...prev, content: { ...prev.content, [key]: val } }));
  };

  const addContentField = () => {
    const key = prompt('请输入字段名（如: subtitle, description, bodyZh）:');
    if (key) updateContent(key, '');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {block.id.startsWith(block.type) || block.id.includes('-') ? '编辑内容块' : '新建内容块'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Block Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容块类型</label>
            <select
              value={draft.type}
              onChange={(e) => setDraft(prev => ({ ...prev, type: e.target.value as any }))}
              className="admin-form-input w-full"
            >
              <option value="hero">Hero 横幅</option>
              <option value="text">文本</option>
              <option value="image">单图</option>
              <option value="gallery">图片画廊</option>
              <option value="features">功能特性</option>
              <option value="cta">行动号召</option>
              <option value="stats">数据统计</option>
            </select>
          </div>

          {/* Title (3 languages) */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题（中文）</label>
              <input
                type="text"
                value={mlFieldToStr(draft.title, 'zh')}
                onChange={(e) => updateTitle('zh', e.target.value)}
                className="admin-form-input w-full"
                placeholder="中文标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
              <input
                type="text"
                value={mlFieldToStr(draft.title, 'en')}
                onChange={(e) => updateTitle('en', e.target.value)}
                className="admin-form-input w-full"
                placeholder="English title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان (العربية)</label>
              <input
                type="text"
                value={mlFieldToStr(draft.title, 'ar')}
                onChange={(e) => updateTitle('ar', e.target.value)}
                className="admin-form-input w-full text-right"
                placeholder="العنوان بالعربية"
                dir="rtl"
              />
            </div>
          </div>

          {/* Content Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">内容字段</label>
              <button type="button" onClick={addContentField} className="text-xs text-blue-600 hover:text-blue-700">
                + 添加字段
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(draft.content).map(([key, val]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-mono">{key}</span>
                      {/* Show field description for image fields */}
                      {IMAGE_FIELDS.includes(key) && FIELD_DESCRIPTIONS[key] && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {FIELD_DESCRIPTIONS[key].zh}
                        </span>
                      )}
                    </div>
                    {IMAGE_FIELDS.includes(key) && (
                      <button
                        type="button"
                        onClick={() => onPickImage(key)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Image className="w-3 h-3" />
                        选择图片
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={key.toLowerCase().includes('body') || key.toLowerCase().includes('description') ? 4 : 2}
                    value={val as string || ''}
                    onChange={(e) => updateContent(key, e.target.value)}
                    className="admin-form-input w-full resize-none font-mono text-sm"
                    placeholder={`${key} 的值...`}
                  />
                  {/* Show image preview if this is an image field with a URL */}
                  {IMAGE_FIELDS.includes(key) && isImageUrl(val) && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-2">
                        当前图片 ({FIELD_DESCRIPTIONS[key]?.zh || key})：
                      </p>
                      <div className="flex items-center gap-3">
                        <img src={val} alt="" className="w-32 h-20 object-cover rounded-lg border border-blue-300 shadow-sm" />
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-gray-500">前端位置：{FIELD_DESCRIPTIONS[key]?.en || key}</p>
                          <p className="text-xs text-gray-400 break-all">{val.substring(0, 60)}{val.length > 60 ? '...' : ''}</p>
                          <button
                            type="button"
                            onClick={() => updateContent(key, '')}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            清除图片
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {Object.keys(draft.content).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">暂无内容字段，点击"+ 添加字段"创建。</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={draft.status}
              onChange={(e) => setDraft(prev => ({ ...prev, status: e.target.value as any }))}
              className="admin-form-input w-full"
            >
              <option value="active">显示</option>
              <option value="inactive">隐藏</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">取消</button>
            <button type="submit" className="btn-primary flex-1">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Image Management Modal Component
function ImageManagementModal({ block, images, onAddImage, onRemoveImage, onClearField, onClose, onPickImage }: any) {
  const [urlInput, setUrlInput] = useState('');

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      onAddImage(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            图片管理 — {block.title?.zh || block.title?.en || block.id}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlAdd(); } }}
              placeholder="粘贴图片 URL，按 Enter 添加..."
              className="admin-form-input flex-1 text-sm"
            />
            <button
              onClick={onPickImage}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
            >
              <Image className="w-4 h-4" />
              从媒体库选择
            </button>
          </div>
        </div>

        {/* Images Grid */}
        {images.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>此内容块暂无图片</p>
            <p className="text-sm mt-1">使用上方输入框添加，或从媒体库选择</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img: any, idx: number) => (
              <div key={`${img.source}-${idx}`} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                {/* Source badge */}
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
                  {img.source === 'gallery' ? '📁 图库' : `📝 ${img.source.replace('content.', '')}`}
                </div>
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={img.url}
                    alt={img.alt || ''}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-xs">图片加载失败</div>';
                    }}
                  />
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => window.open(img.url, '_blank')}
                      className="p-1.5 bg-white/90 hover:bg-white rounded-md transition-colors"
                      title="查看原图"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    {img.source === 'gallery' && (
                      <button
                        onClick={() => onRemoveImage(img.index)}
                        className="p-1.5 bg-red-500/90 hover:bg-red-500 rounded-md transition-colors"
                        title="删除图片"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                    {img.source !== 'gallery' && (
                      <button
                        onClick={() => onClearField(img.source.replace('content.', ''))}
                        className="p-1.5 bg-red-500/90 hover:bg-red-500 rounded-md transition-colors"
                        title="清空此字段"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Caption */}
                <div className="px-3 py-2">
                  {img.source === 'gallery' ? (
                    <input
                      type="text"
                      value={img.caption || ''}
                      onChange={(e) => {
                        // Update caption in block images array
                        // This is a simplified version - in production you'd want a proper update function
                      }}
                      placeholder="图片说明（可选）"
                      className="w-full text-xs px-2 py-1 border-0 bg-transparent text-gray-600 placeholder:text-gray-400 focus:outline-none focus:bg-gray-100 rounded"
                    />
                  ) : (
                    <p className="text-xs text-gray-400 truncate" title={img.url}>{img.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">完成</button>
        </div>
      </div>
    </div>
  );
}
