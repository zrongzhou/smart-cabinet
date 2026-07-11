'use client';

/**
 * ProductSpecsEditor
 * ------------------
 * Controlled, dynamic editor for a product's canonical `specs` field.
 *
 * Data shape (the V8.6 canonical form persisted to `Product.specs` and
 * rendered by the detail page):
 *   SpecItem[] = [{ param: { en, zh, ar }, value: { en, zh, ar } }, ...]
 *
 * i.e. EVERY spec row carries a fully trilingual `param` and `value` so the
 * detail page can render the correct locale without per-row fallbacks.
 *
 * The component mirrors the UX of ProductFaqEditor (add / remove / reorder),
 * but with two trilingual fields per row (param + value).
 */

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

/** A single translatable string across the three supported locales. */
export interface SpecLang {
  en: string;
  zh: string;
  ar: string;
}

/** One canonical spec row: a trilingual param + a trilingual value. */
export interface SpecItem {
  param: SpecLang;
  value: SpecLang;
}

interface ProductSpecsEditorProps {
  /** Current specs list (controlled). */
  value: SpecItem[];
  /** Called with the next specs list on every change. */
  onChange: (items: SpecItem[]) => void;
}

const EMPTY_LANG: SpecLang = { en: '', zh: '', ar: '' };

/** Build a fresh, empty spec row. */
function newSpecItem(): SpecItem {
  return {
    param: { ...EMPTY_LANG },
    value: { ...EMPTY_LANG },
  };
}

/** Locale metadata for rendering the three input columns. */
const LOCALES: { key: keyof SpecLang; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'ar', label: 'العربية' },
];

/**
 * ProductSpecsEditor — renders a list of spec rows with add / remove / reorder,
 * each row exposing trilingual param + value fields.
 */
export default function ProductSpecsEditor({ value, onChange }: ProductSpecsEditorProps) {
  const items: SpecItem[] = Array.isArray(value) ? value : [];

  /** Commit a new array immutably. */
  const commit = (next: SpecItem[]) => onChange(next);

  const addItem = () => commit([...items, newSpecItem()]);

  const removeItem = (idx: number) => commit(items.filter((_, i) => i !== idx));

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
  };

  const setLang = (
    idx: number,
    field: 'param' | 'value',
    lang: keyof SpecLang,
    text: string
  ) => {
    const next = items.map((it, i) =>
      i === idx ? { ...it, [field]: { ...it[field], [lang]: text } } : it
    );
    commit(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          结构化规格参数（canonical <code className="px-1 rounded bg-gray-100 text-[12px]">specs</code>）：每个参数 / 数值支持
          英文 / 中文 / 阿拉伯语三语，保存后以表格形式展示在前台详情页。
        </p>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> 添加规格
        </button>
      </div>

      {items.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
          <p className="text-sm">暂无结构化规格，点击「添加规格」创建第一条。</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 bg-gray-50/60 p-4"
          >
            {/* Row header: index + reorder / delete controls */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                Spec #{idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  title="上移"
                  aria-label="上移"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  title="下移"
                  aria-label="下移"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  title="删除"
                  aria-label="删除"
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Param (trilingual) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  参数 Param
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LOCALES.map(({ key, label }) => (
                    <input
                      key={key}
                      type="text"
                      dir={key === 'ar' ? 'rtl' : 'ltr'}
                      value={item.param[key]}
                      onChange={(e) => setLang(idx, 'param', key, e.target.value)}
                      placeholder={label}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  ))}
                </div>
              </div>

              {/* Value (trilingual) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  数值 Value
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LOCALES.map(({ key, label }) => (
                    <input
                      key={key}
                      type="text"
                      dir={key === 'ar' ? 'rtl' : 'ltr'}
                      value={item.value[key]}
                      onChange={(e) => setLang(idx, 'value', key, e.target.value)}
                      placeholder={label}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
