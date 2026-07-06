'use client';

/**
 * JsonTrilingualInput — 三语 Json 输入共享组件（P1-5 抽取）
 * 用于后台 FAQ 的 question / answer 三语录入。
 * - 统一渲染 中文(zh) / 英文(en) / 阿拉伯语(ar) 三个输入框
 * - 阿拉伯语输入框默认 dir="rtl"（rtlAr 可关闭）
 * - 英文默认必填（requireEn），中文可按需必填（requireZh）
 * - 暴露受控 value: { zh?, en?, ar? } 与 onChange 回调
 *
 * 全局 add 页与产品 FAQ 区块共用本组件，保证录入行为一致。
 */

export interface TrilingualValue {
  zh?: string;
  en?: string;
  ar?: string;
}

interface JsonTrilingualInputProps {
  label: string;
  value: TrilingualValue;
  onChange: (next: TrilingualValue) => void;
  /** 是否以多行 textarea 渲染（答案用 true，问题用 false） */
  multiline?: boolean;
  /** 中文是否必填（全局 add 页用） */
  requireZh?: boolean;
  /** 英文是否必填（新增/编辑校验用） */
  requireEn?: boolean;
  /** 阿拉伯语是否右向排版，默认 true */
  rtlAr?: boolean;
}

const LANG_FIELDS: { key: keyof TrilingualValue; text: string }[] = [
  { key: 'zh', text: '中文 (ZH)' },
  { key: 'en', text: '英文 (EN)' },
  { key: 'ar', text: '阿拉伯语 (AR)' },
];

export default function JsonTrilingualInput({
  label,
  value,
  onChange,
  multiline = false,
  requireZh = false,
  requireEn = false,
  rtlAr = true,
}: JsonTrilingualInputProps) {
  const handleChange = (key: keyof TrilingualValue, v: string) => {
    onChange({ ...value, [key]: v });
  };

  const baseInputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">
        {label}
        {(requireZh || requireEn) && <span className="text-red-500"> *</span>}
      </h4>

      {LANG_FIELDS.map(({ key, text }) => {
        const isRequired = (key === 'zh' && requireZh) || (key === 'en' && requireEn);
        const dir = key === 'ar' && rtlAr ? 'rtl' : 'ltr';
        const placeholder = key === 'ar' ? 'الرجاء إدخال المحتوى باللغة العربية' : `请输入${text}`;

        return (
          <div key={key}>
            <label className="block text-xs text-gray-500 mb-1">
              {text}
              {isRequired && <span className="text-red-500"> *</span>}
            </label>
            {multiline ? (
              <textarea
                rows={4}
                required={isRequired}
                value={value[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                dir={dir}
                className={`${baseInputClass} resize-none`}
                placeholder={placeholder}
              />
            ) : (
              <input
                type="text"
                required={isRequired}
                value={value[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                dir={dir}
                className={baseInputClass}
                placeholder={placeholder}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
