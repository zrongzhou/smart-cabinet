'use client';
import { memo } from 'react';

// ============================================================
// OceanHeader v211 — CSS 蓝色流场 (Blue Fluid Field)
//
// ❌ 放弃 WebGL/GLSL 方案（v200-v210 共11版，全部漂白成白色）
// ✅ 回到纯 CSS 动画——所有颜色硬编码 hex/rgba，不可能漂白
//
// 技术方案：
//   - 底层：深蓝渐变（参考 v209 的 #265999）
//   - 中层：3-5 个巨大的径向渐变色斑（blur + CSS 动画漂移）
//   - 表层：细微的高光斑点（模拟光线折射）
//   - 叠加模式：mix-blend-mode: screen / overlay
// ============================================================

function BlueFluidField() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #143d59 0%, #1a4f7a 35%, #0f3460 70%, #163b65 100%)' }}>
      {/* ── 色斑 1：主天青斑（左上→右下缓慢移动）── */}
      <div className="absolute rounded-full animate-blob1"
        style={{
          width: '85%', height: '75%', top: '-10%', left: '-15%',
          background: 'radial-gradient(circle, rgba(52,152,219,0.50) 0%, rgba(41,128,185,0.30) 30%, rgba(30,100,170,0.10) 55%, transparent 70%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── 色斑 2：宝石蓝斑（右侧）── */}
      <div className="absolute rounded-full animate-blob2"
        style={{
          width: '70%', height: '90%', top: '-20%', right: '-20%',
          background: 'radial-gradient(circle, rgba(93,173,226,0.42) 0%, rgba(66,153,225,0.25) 35%, rgba(40,120,200,0.08) 60%, transparent 75%)',
          filter: 'blur(70px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── 色斑 3：靛蓝底斑（底部中央）── */}
      <div className="absolute rounded-full animate-blob3"
        style={{
          width: '90%', height: '65%', bottom: '-15%', left: '-10%',
          background: 'radial-gradient(circle, rgba(44,82,160,0.45) 0%, rgba(36,68,140,0.28) 35%, rgba(28,55,120,0.10) 58%, transparent 72%)',
          filter: 'blur(55px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── 色斑 4：浅青高光斑（中央偏上）── */}
      <div className="absolute rounded-full animate-blob4"
        style={{
          width: '55%', height: '50%', top: '18%', left: '22%',
          background: 'radial-gradient(circle, rgba(133,193,233,0.38) 0%, rgba(100,165,220,0.20) 40%, transparent 70%)',
          filter: 'blur(45px)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* ── 流动波纹线条（SVG）── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.15]" viewBox="0 0 800 400" preserveAspectRatio="none">
        <path d="M-50,150 Q200,80 400,180 T850,120" fill="none" stroke="rgba(130,195,255,0.6)" strokeWidth="2" strokeLinecap="round"
          className="animate-wave1" />
        <path d="M-50,250 Q200,320 400,220 T850,280" fill="none" stroke="rgba(130,195,255,0.4)" strokeWidth="1.5" strokeLinecap="round"
          className="animate-wave2" />
        <path d="M-50,200 Q200,150 400,250 T850,180" fill="none" stroke="rgba(160,215,255,0.3)" strokeWidth="1" strokeLinecap="round"
          className="animate-wave3" />
      </svg>

      {/* ── 光折射亮点（模拟 caustics）── */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute rounded-full animate-shimmer"
          style={{
            width: `${3 + (i % 3) * 2}px`,
            height: `${3 + (i % 3) * 2}px`,
            left: `${12 + i * 12 + (i % 3) * 5}%`,
            top: `${15 + ((i * 7) % 60)}%`,
            background: 'radial-gradient(circle, rgba(200,230,255,0.9) 0%, rgba(140,200,255,0.4) 40%, transparent 70%)',
            boxShadow: '0 0 8px rgba(140,200,255,0.4)',
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${4 + (i % 3)}s`,
          }}
        />
      ))}

      {/* CSS Animations */}
      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(6%, 4%) scale(1.05); }
          50% { transform: translate(3%, 8%) scale(0.97); }
          75% { transform: translate(-4%, 5%) scale(1.03); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-5%, 6%) scale(1.06) rotate(1deg); }
          66% { transform: translate(-8%, -3%) scale(0.95) rotate(-1deg); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(5%, -4%) scale(1.04); }
          70% { transform: translate(-3%, -7%) scale(0.96); }
        }
        @keyframes blob4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.38; }
          50% { transform: translate(-4%, 5%) scale(1.08); opacity: 0.52; }
        }
        @keyframes wave1 {
          0%, 100% { d: path('M-50,150 Q200,80 400,180 T850,120'); opacity: 0.15; }
          50% { d: path('M-50,170 Q200,110 400,150 T850,150'); opacity: 0.22; }
        }
        @keyframes wave2 {
          0%, 100% { d: path('M-50,250 Q200,320 400,220 T850,280'); opacity: 0.10; }
          50% { d: path('M-50,230 Q200,270 400,250 T850,260'); opacity: 0.17; }
        }
        @keyframes wave3 {
          0%, 100% { d: path('M-50,200 Q200,150 400,250 T850,180'); opacity: 0.07; }
          50% { d: path('M-50,220 Q200,190 400,220 T850,200'); opacity: 0.13; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.6); }
        }
        .animate-blob1 { animation: blob1 18s ease-in-out infinite; will-change: transform; }
        .animate-blob2 { animation: blob2 22s ease-in-out infinite; will-change: transform; }
        .animate-blob3 { animation: blob3 20s ease-in-out infinite; will-change: transform; }
        .animate-blob4 { animation: blob4 16s ease-in-out infinite; will-change: transform, opacity; }
        .animate-wave1 { animation: wave1 14s ease-in-out infinite; }
        .animate-wave2 { animation: wave2 17s ease-in-out infinite; }
        .animate-wave3 { animation: wave3 19s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer ease-in-out infinite; will-change: transform, opacity; }
      `}</style>
    </div>
  );
}

export default memo(function OceanHeader({ title, subtitle, children, icon }: { title: string; subtitle?: string; children?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden" style={{ background: '#143d59' }}>
      <BlueFluidField />
      {/* 星光点缀 */}
      {[{x:'15%',y:'22%'},{x:'82%',y:'15%'},{x:'72%',y:'78%'},{x:'18%',y:'70%'},{x:'48%',y:'12%'}].map((s,i)=>(
        <div key={i} className="absolute pointer-events-none z-10 rounded-full" style={{
          left:s.x,top:s.y,
          width:i===2?4:3,height:i===2?4:3,
          background:'radial-gradient(circle,rgba(255,255,255,0.85) 0%,rgba(180,220,255,0.35) 40%,rgba(180,220,255,0) 70%)',
          boxShadow:'0 0 6px rgba(160,210,255,0.45)',
          animation:`twinkle ${2+i*0.4}s ease-in-out infinite`,
          animationDelay:`${i*0.5}s`
        }} />
      ))}
      <style>{`@keyframes twinkle{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}`}</style>
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8" style={{ minHeight: '320px', paddingTop: '80px', paddingBottom: '48px' }}>
        {icon && <div className="mb-4">{icon}</div>}
        {children}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 max-w-4xl leading-tight tracking-tight"
            style={{ color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.15)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed opacity-90"
             style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 12px rgba(0,0,0,0.25)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
});
