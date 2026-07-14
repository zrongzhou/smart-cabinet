import { useId } from 'react';

interface LogoProps {
  className?: string;
  /** Pixel size of the double-star mark (width & height of the SVG). */
  size?: number;
  /** Render only the mark (no wordmark). */
  markOnly?: boolean;
  /** Text color of the wordmark ("Qtech"). */
  textClassName?: string;
  /** Color of the "Tool Cabinet" subtitle. */
  subTextColor?: string;
}

/**
 * Qtech brand mark — 蓝紫水晶菱形包围双星 + 竖排 Qtech / Tool Cabinet。
 * 菱形用蓝紫渐变，星用亮白渐变在水晶中发光。
 */
export default function Logo({
  className = '',
  size = 44,
  markOnly = false,
  textClassName = 'text-slate-900',
  subTextColor = '#2563eb',
}: LogoProps) {
  const uid = useId().replace(/:/g, '');
  const crystalId = `cr-${uid}`;
  const starId = `st-${uid}`;

  return (
    <span className={`inline-flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          {/* 深蓝水晶渐变 — 从极深蓝到鲜亮蓝，无紫色 */}
          <linearGradient id={crystalId} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0a1a4f" />
            <stop offset="0.35" stopColor="#1e40af" />
            <stop offset="0.7" stopColor="#2563eb" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
          {/* 双星亮白渐变 */}
          <linearGradient id={starId} x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#c7d2fe" />
          </linearGradient>
        </defs>

        {/* 蓝紫水晶菱形 — 包围双星 */}
        <polygon
          points="24,3 45,24 24,45 3,24"
          fill={`url(#${crystalId})`}
          stroke="#3b82f6"
          strokeWidth="0.8"
          strokeOpacity="0.7"
        />
        {/* 水晶切面高光线 */}
        <path d="M24 3 L24 45" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.6" />
        <path d="M3 24 L45 24" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.6" />
        {/* 顶部光泽 */}
        <path d="M24 3 L33 12 L15 12 Z" fill="#ffffff" fillOpacity="0.22" />

        {/* 双星 — 亮白渐变，居中包在菱形内 */}
        <path
          d="M19 13 L21.8 23.6 L31 26.4 L21.8 29.2 L19 39.5 L16.2 29.2 L6.5 26.4 L16.2 23.6 Z"
          fill={`url(#${starId})`}
        />
        <path
          d="M33 8 L34 12 L38 13 L34 14 L33 18 L32 14 L28 13 L32 12 Z"
          fill={`url(#${starId})`}
          opacity="0.75"
        />
      </svg>

      {!markOnly && (
        <span className="flex flex-col leading-none ml-2">
          <span className={`text-[12px] font-semibold tracking-tight ${textClassName}`}>Qtech</span>
          <span
            style={{
              marginTop: 1,
              fontSize: '7px',
              fontWeight: 400,
              letterSpacing: '0.6px',
              color: subTextColor,
              textTransform: 'uppercase',
            }}
          >
            Tool Cabinet
          </span>
        </span>
      )}
    </span>
  );
}
