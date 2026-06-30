'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v169 — 商务专业蓝 · 适度动效版
// 设计理念：
//   - 深蓝渐变配合网站主色调(blue-600/700)
//   - 几何网格 + 光线流动 = 科技制造感
//   - 无卡通元素、无具象图案
//   - 动画克制但可见（光点漂浮 + 光线扫描 + 内容淡入）
// ============================================================

// ===== 主渐变 — 深邃专业蓝 =====
const HEADER_GRADIENT = `linear-gradient(180deg,
  #0f172a 0%,
  #1e3a5f 15%,
  #1e40af 35%,
  #2563eb 55%,
  #3b82f6 72%,
  #60a5fa 85%,
  #93c5fd 95%,
  #dbeafe 100%)`;

// ===== 配色常量 =====
const ACCENT_BLUE = 'rgba(96,165,250,0.35)';    // 浮点颜色
const LIGHT_RAY = 'rgba(147,197,253,0.12)';      // 扫描光线
const GRID_COLOR = 'rgba(148,163,184,0.06)';     // 网格线

interface OceanHeaderProps {
  title: string;
  subtitle?: string;
  description?: string; // alias for subtitle
  icon?: React.ReactNode;
  children?: React.ReactNode; // e.g. breadcrumb nav
  locale?: string;
}

export default function OceanHeader({ title, subtitle, description, icon, children, locale }: OceanHeaderProps) {
  const desc = description || subtitle;
  return (
    <section
      className="relative text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        minHeight: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: HEADER_GRADIENT,
      }}
    >
      {/* Layer 1: 几何网格背景 — 营造科技/制造感 */}
      <GridBackground />

      {/* Layer 2: 缓慢移动的光线束 */}
      <LightRays />

      {/* Layer 3: 漂浮光点 — 增加层次和生命感 */}
      <FloatingDots />

      {/* Layer 4: 底部高光过渡 — 平滑融入页面内容 */}
      <BottomGlow />

      {/* Layer 5: 文字内容 — 带入场动画 */}
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {icon && (
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {icon}
            </motion.div>
          </div>
        )}

        {/* Children (e.g. breadcrumb) — render before title if present */}
        {children}

        {title && (
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.15)' }}
          >
            {title}
          </h1>
        )}
        {desc && (
          <p className="text-base sm:text-lg text-blue-100/85 max-w-2xl mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.1)' }}
          >
            {desc}
          </p>
        )}
      </motion.div>

      {/* 全局 CSS 动画定义 */}
      <style>{keyframeStyles}</style>
    </section>
  );
}

// ============================================================
// Layer 1: 几何网格 — 点阵 + 斜线，非常淡，营造精密制造氛围
// ============================================================
function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* SVG 点阵网格 */}
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={GRID_COLOR} />
          </pattern>
          <pattern id="line-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0L0 80M0 0L80 80" stroke={GRID_COLOR} strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" opacity="0.6" />
        <rect width="100%" height="100%" fill="url(#line-grid)" opacity="0.4" />
      </svg>

      {/* 左侧大面积柔和光晕 — 增加深度 */}
      <div
        className="absolute -top-[20%] -left-[15%] w-[550px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* 右下角微弱对比色光晕 */}
      <div
        className="absolute -bottom-[10%] -right-[10%] w-[450px] h-[320px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}

// ============================================================
// Layer 2: 光线束 — 从右上到左下的缓慢扫描光线
// ============================================================
function LightRays() {
  const [rays, setRays] = useState<Array<{
    id: number; top: string; width: string; angle: number;
    duration: number; delay: number; opacity: number;
  }>>([]);

  useEffect(() => {
    setRays([
      { id: 0, top: '-8%', width: '280px', angle: -28, duration: 14, delay: 0, opacity: 0.08 },
      { id: 1, top: '12%', width: '200px', angle: -22, duration: 18, delay: 4, opacity: 0.06 },
      { id: 2, top: '35%', width: '320px', angle: -32, duration: 22, delay: 9, opacity: 0.05 },
    ]);
  }, []);

  if (rays.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {rays.map((r) => (
        <div key={r.id} style={{ position: 'absolute', top: r.top, right: '-15%' }}>
          <div
            style={{
              width: r.width,
              height: '500px',
              background: `linear-gradient(${r.angle}deg,
                transparent 0%,
                ${LIGHT_RAY} 30%,
                ${LIGHT_RAY} 55%,
                transparent 100%)`,
              transformOrigin: 'top right',
              animation: `ray-sweep ${r.duration}s ease-in-out infinite`,
              animationDelay: `${r.delay}s`,
              opacity: r.opacity,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Layer 3: 漂浮光点 — 不同大小/速度/透明度，自然随机分布
// ============================================================
function FloatingDots() {
  const [dots, setDots] = useState<Array<{
    id: number; x: number; y: number; size: number;
    duration: number; delay: number; opacity: number;
  }>>([]);

  useEffect(() => {
    setDots(Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 4 + Math.random() * 92,
      y: 4 + Math.random() * 88,
      size: 2 + Math.random() * 4,
      duration: 10 + Math.random() * 14,
      delay: Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.45,
    })));
  }, []);

  if (dots.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {dots.map(d => (
        <div
          key={d.id}
          className="rounded-full"
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: `radial-gradient(circle, ${ACCENT_BLUE}, transparent)`,
            boxShadow: `0 0 ${d.size * 3}px ${ACCENT_BLUR}`,
            animation: `dot-float-up ${d.duration}s ease-in-out infinite`,
            animationDelay: `${d.delay}s`,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}

const ACCENT_BLUR = 'rgba(96,165,250,0.08)';

// ============================================================
// Layer 4: 底部高光过渡 — 渐变淡出融入下方白色内容区
// ============================================================
function BottomGlow() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 pointer-events-none"
      aria-hidden="true"
      style={{
        height: '120px',
        background: 'linear-gradient(to top, rgba(219,234,254,0.95), transparent)',
      }}
    />
  );
}

// ============================================================
// Keyframes — 所有动画定义
// ============================================================
const keyframeStyles = `
  /* 光线扫描 — 从右上缓慢滑过 */
  @keyframes ray-sweep {
    0% { transform: translateX(0) scaleX(0.6); opacity: 0; }
    25% { opacity: 1; transform: translateX(-40vw) scaleX(1); }
    75% { transform: translateX(-90vw) scaleX(1); opacity: 0.8; }
    100% { transform: translateX(-140vw) scaleX(0.4); opacity: 0; }
  }

  /* 光点漂浮 — 缓慢上升 + 轻微横向漂移 */
  @keyframes dot-float-up {
    0% { transform: translate(0, 0); opacity: var(--start-opacity, 0.3); }
    30% { transform: translate(12px, -25px); opacity: calc(var(--start-opacity, 0.3) * 1.2); }
    60% { transform: translate(-8px, -50px); opacity: var(--start-opacity, 0.3); }
    100% { transform: translate(6px, -80px); opacity: 0; }
  }
`;
