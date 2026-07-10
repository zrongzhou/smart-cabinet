'use client';

/**
 * ProductSpecsBlock — admin editor for the canonical product `specs` field.
 *
 * `specs` is the V8.6 shape `[{ param: string, value: string }]` that the
 * frontend detail page renders as a spec table (see ProductDetailView /
 * ProductDetailClient). This block lets an admin add, edit and remove spec
 * rows in the add / edit product forms.
 *
 * Design:
 *  - Controlled component: parent owns the array via `value` / `onChange`.
 *  - No API calls here — specs are saved together with the rest of the form
 *    (decoupled from the per-row FAQ saving used by ProductFaqBlock).
 *  - Styling mirrors ProductFaqBlock for a consistent admin look.
 */

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface SpecRow {
  param: string;
  value: string;
}

interface ProductSpecsBlockProps {
  value: SpecRow[];
  onChange: (next: SpecRow[]) => void;
}

export default function ProductSpecsBlock({ value, onChange }: ProductSpecsBlockProps) {
  const rows = Array.isArray(value) ? value : [];

  const updateRow = (index: number, patch: Partial<SpecRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    onChange([...rows, { param: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= rows.length) return;
    const next = rows.slice();
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
          规格参数 (Specs)
        </h2>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> 添加规格
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        产品技术参数（参数 / 数值）。保存后即时以表格形式展示在前台详情页。
      </p>

      {rows.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
          <p className="text-sm">暂无规格参数，点击「添加规格」创建第一条。</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3">参数 (Param)</th>
                <th className="px-4 py-3">数值 (Value)</th>
                <th className="px-4 py-3 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, index) => (
                <tr key={index} className="align-top">
                  <td className="px-4 py-3 text-center text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.param}
                      onChange={(e) => updateRow(index, { param: e.target.value })}
                      placeholder="Model"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => updateRow(index, { value: e.target.value })}
                      placeholder="800x600x450mm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveRow(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"
                        title="上移"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(index, 'down')}
                        disabled={index === rows.length - 1}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"
                        title="下移"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
