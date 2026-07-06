'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { adminApi } from '@/data/unified-data';
import { FAQ_CATEGORIES, PRODUCT_FAQ_STATUS_OPTIONS, ProductFaqStatus } from '@/data/faq-constants';
import JsonTrilingualInput, { TrilingualValue } from './JsonTrilingualInput';

/**
 * ProductFaqBlock — 编辑页「产品 FAQ」区块（T02 / P0）
 *
 * 职责：
 * - 挂载时按 productId 从 adminApi 加载该产品的 FAQ 并回填
 * - 支持逐条「即时保存/删除」（POST/PUT/DELETE），不并入主「更新产品」按钮（解耦）
 * - 支持三语录入、分类(11 枚举)、状态(active/draft)、排序(数字 + 上移/下移)、空状态引导
 *
 * 设计约束：
 * - productId 写入 FAQ.productId（Prisma 直接写 FK 标量，无需 connect）
 * - status 仅 active 前台可见；区块用 active/draft
 * - AR 缺省回退 EN
 */

interface TrilingualText {
  zh: string;
  en: string;
  ar: string;
}

interface FaqDraft {
  id: string;
  question: TrilingualText;
  answer: TrilingualText;
  category: string;
  status: ProductFaqStatus;
  order: number;
  _isNew: boolean;
  _saving: boolean;
  _deleting: boolean;
}

interface ProductFaqBlockProps {
  productId: string;
}

function normalizeTrilingual(input: any): TrilingualText {
  return {
    zh: input?.zh || '',
    en: input?.en || '',
    ar: input?.ar || '',
  };
}

function mapApiFaqToDraft(faq: any): FaqDraft {
  return {
    id: faq.id,
    question: normalizeTrilingual(faq.question),
    answer: normalizeTrilingual(faq.answer),
    category: faq.category || FAQ_CATEGORIES[0].value,
    status: faq.status === 'draft' ? 'draft' : 'active',
    order: typeof faq.order === 'number' ? faq.order : 0,
    _isNew: false,
    _saving: false,
    _deleting: false,
  };
}

export default function ProductFaqBlock({ productId }: ProductFaqBlockProps) {
  const [faqRows, setFaqRows] = useState<FaqDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const updateRow = useCallback((id: string, updater: (row: FaqDraft) => FaqDraft) => {
    setFaqRows((prev) => prev.map((r) => (r.id === id ? updater(r) : r)));
  }, []);

  // 组装提交数据（AR 缺省回退 EN）
  const buildPayload = (row: FaqDraft) => ({
    question: {
      en: row.question.en,
      zh: row.question.zh,
      ar: row.question.ar || row.question.en,
    },
    answer: {
      en: row.answer.en,
      zh: row.answer.zh,
      ar: row.answer.ar || row.answer.en,
    },
    category: row.category,
    status: row.status,
    order: row.order,
  });

  // 挂载加载该产品 FAQ
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const faqs = await adminApi.fetchAdminFaqs(productId);
        if (cancelled) return;
        setFaqRows(faqs.map(mapApiFaqToDraft));
      } catch (err: any) {
        if (!cancelled) setError(err.message || '加载产品 FAQ 失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // 新增草稿行
  const addRow = () => {
    setFaqRows((prev) => {
      const maxOrder = prev.reduce((max, r) => Math.max(max, r.order), 0);
      const newRow: FaqDraft = {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        question: { zh: '', en: '', ar: '' },
        answer: { zh: '', en: '', ar: '' },
        category: FAQ_CATEGORIES[0].value,
        status: 'active',
        order: maxOrder + 1,
        _isNew: true,
        _saving: false,
        _deleting: false,
      };
      return [...prev, newRow];
    });
  };

  // 保存单行（新行 POST 带 productId；旧行 PUT）
  const saveRow = async (row: FaqDraft) => {
    if (row._saving || row._deleting) return;
    // 新行校验：英文问题 / 答案必填
    if (row._isNew && (!row.question.en.trim() || !row.answer.en.trim())) {
      setError('英文问题与答案为必填项');
      return;
    }
    updateRow(row.id, (r) => ({ ...r, _saving: true }));
    setError('');
    try {
      if (row._isNew) {
        const created = await adminApi.createFaq({ ...buildPayload(row), productId });
        updateRow(row.id, () => ({
          ...mapApiFaqToDraft(created),
          _isNew: false,
          _saving: false,
        }));
      } else {
        const updated = await adminApi.updateFaq(row.id, buildPayload(row));
        updateRow(row.id, () => ({
          ...mapApiFaqToDraft(updated),
          _isNew: false,
          _saving: false,
        }));
      }
    } catch (err: any) {
      updateRow(row.id, (r) => ({ ...r, _saving: false }));
      setError(err.message || '保存 FAQ 失败');
    }
  };

  // 删除单行（新行仅本地移除；旧行二次确认后 DELETE）
  const deleteRow = async (row: FaqDraft) => {
    if (row._deleting || row._saving) return;
    if (row._isNew) {
      setFaqRows((prev) => prev.filter((r) => r.id !== row.id));
      return;
    }
    const confirmed = window.confirm('确认删除该 FAQ？此操作不可撤销。');
    if (!confirmed) return;

    updateRow(row.id, (r) => ({ ...r, _deleting: true }));
    setError('');
    try {
      await adminApi.deleteFaq(row.id);
      setFaqRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err: any) {
      updateRow(row.id, (r) => ({ ...r, _deleting: false }));
      setError(err.message || '删除 FAQ 失败');
    }
  };

  // 上移 / 下移（交换 order 并即时持久化两条非新行）
  const moveRow = async (rowId: string, direction: 'up' | 'down') => {
    const sorted = [...faqRows].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((r) => r.id === rowId);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx === -1 || targetIdx < 0 || targetIdx >= sorted.length) return;

    const current = sorted[idx];
    const neighbor = sorted[targetIdx];
    const newCurrentOrder = neighbor.order;
    const newNeighborOrder = current.order;
    const affected = new Set([current.id, neighbor.id]);

    setFaqRows((prev) => prev.map((r) => (affected.has(r.id) ? { ...r, _saving: true } : r)));
    setError('');
    try {
      if (!current._isNew) {
        await adminApi.updateFaq(current.id, buildPayload({ ...current, order: newCurrentOrder }));
      }
      if (!neighbor._isNew) {
        await adminApi.updateFaq(neighbor.id, buildPayload({ ...neighbor, order: newNeighborOrder }));
      }
      setFaqRows((prev) =>
        prev.map((r) => {
          if (r.id === current.id) return { ...r, order: newCurrentOrder, _saving: false };
          if (r.id === neighbor.id) return { ...r, order: newNeighborOrder, _saving: false };
          return r;
        }),
      );
    } catch (err: any) {
      setFaqRows((prev) => prev.map((r) => (affected.has(r.id) ? { ...r, _saving: false } : r)));
      setError(err.message || '排序保存失败');
    }
  };

  const sortedRows = [...faqRows].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
          产品 FAQ
        </h2>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> 添加 FAQ
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        为该产品单独维护三语 FAQ，保存后即时在前台详情页生效（仅 active 状态可见，draft 不展示）。
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : sortedRows.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
          <p className="text-sm">暂无产品 FAQ，点击「添加 FAQ」创建第一条。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRows.map((row) => (
            <div key={row.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">
                  顺序 #{row.order}
                  {row._isNew && <span className="ml-2 text-indigo-500">（未保存）</span>}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveRow(row.id, 'up')}
                    disabled={row._saving || row._deleting}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-40"
                    title="上移"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRow(row.id, 'down')}
                    disabled={row._saving || row._deleting}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-40"
                    title="下移"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRow(row)}
                    disabled={row._deleting || row._saving}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-40"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <JsonTrilingualInput
                label="问题"
                requireEn
                value={row.question}
                onChange={(next: TrilingualValue) =>
                  updateRow(row.id, (r) => ({
                    ...r,
                    question: { en: next.en || '', zh: next.zh || '', ar: next.ar || '' },
                  }))
                }
              />

              <div className="mt-3">
                <JsonTrilingualInput
                  label="答案"
                  multiline
                  requireEn
                  value={row.answer}
                  onChange={(next: TrilingualValue) =>
                    updateRow(row.id, (r) => ({
                      ...r,
                      answer: { en: next.en || '', zh: next.zh || '', ar: next.ar || '' },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">分类</label>
                  <select
                    value={row.category}
                    onChange={(e) => updateRow(row.id, (r) => ({ ...r, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {FAQ_CATEGORIES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">状态</label>
                  <select
                    value={row.status}
                    onChange={(e) =>
                      updateRow(row.id, (r) => ({ ...r, status: e.target.value as ProductFaqStatus }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {PRODUCT_FAQ_STATUS_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">排序</label>
                  <input
                    type="number"
                    min={0}
                    value={row.order}
                    onChange={(e) =>
                      updateRow(row.id, (r) => ({ ...r, order: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => saveRow(row)}
                  disabled={
                    row._saving ||
                    row._deleting ||
                    (row._isNew && (!row.question.en.trim() || !row.answer.en.trim()))
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {row._saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {row._isNew ? '保存' : '更新'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
