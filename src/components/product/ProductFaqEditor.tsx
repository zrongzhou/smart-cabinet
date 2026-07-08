'use client';

/**
 * ProductFaqEditor
 * ----------------
 * Controlled, dynamic editor for a product's FAQ list (V8.5, bug 1).
 *
 * Data shape (matches `Product.faq` Json column + the `normalizeFaq` helper in
 * the edit page):
 *   FaqItem[] = [{ question: { en, zh, ar }, answer: { en, zh, ar } }, ...]
 *
 * Each FAQ entry supports three languages (English / 中文 / العربية). Labels are
 * written in Chinese with an English hint so the backend editor stays consistent
 * with the rest of the Chinese-only admin UI.
 */

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

/** A single translatable string across the three supported locales. */
export interface FaqLang {
  en: string;
  zh: string;
  ar: string;
}

/** One FAQ entry: a trilingual question + a trilingual answer. */
export interface FaqItem {
  question: FaqLang;
  answer: FaqLang;
}

interface ProductFaqEditorProps {
  /** Current FAQ list (controlled). */
  value: FaqItem[];
  /** Called with the next FAQ list on every change. */
  onChange: (items: FaqItem[]) => void;
}

const EMPTY_LANG: FaqLang = { en: '', zh: '', ar: '' };

/** Build a fresh, empty FAQ entry. */
function newFaqItem(): FaqItem {
  return {
    question: { ...EMPTY_LANG },
    answer: { ...EMPTY_LANG },
  };
}

/** Locale metadata for rendering the three input columns. */
const LOCALES: { key: keyof FaqLang; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'ar', label: 'العربية' },
];

/**
 * ProductFaqEditor — renders a list of FAQ rows with add / remove / reorder,
 * each row exposing trilingual question + answer fields.
 */
export default function ProductFaqEditor({ value, onChange }: ProductFaqEditorProps) {
  const items: FaqItem[] = Array.isArray(value) ? value : [];

  /** Commit a new array immutably. */
  const commit = (next: FaqItem[]) => onChange(next);

  const addItem = () => commit([...items, newFaqItem()]);

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
    field: 'question' | 'answer',
    lang: keyof FaqLang,
    text: string
  ) => {
    const next = items.map((it, i) =>
      i === idx
        ? { ...it, [field]: { ...it[field], [lang]: text } }
        : it
    );
    commit(next);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          暂无 FAQ，点击下方按钮添加第一条常见问题。
        </p>
      )}

      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-gray-200 bg-gray-50/60 p-4"
        >
          {/* Row header: index + reorder / delete controls */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              FAQ #{idx + 1}
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

          {/* Question (trilingual) */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              问题 Question
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {LOCALES.map(({ key, label }) => (
                <input
                  key={key}
                  type="text"
                  dir={key === 'ar' ? 'rtl' : 'ltr'}
                  value={item.question[key]}
                  onChange={(e) => setLang(idx, 'question', key, e.target.value)}
                  placeholder={label}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              ))}
            </div>
          </div>

          {/* Answer (trilingual) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              回答 Answer
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {LOCALES.map(({ key, label }) => (
                <textarea
                  key={key}
                  dir={key === 'ar' ? 'rtl' : 'ltr'}
                  rows={2}
                  value={item.answer[key]}
                  onChange={(e) => setLang(idx, 'answer', key, e.target.value)}
                  placeholder={label}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-blue-300 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        添加 FAQ
      </button>
    </div>
  );
}
