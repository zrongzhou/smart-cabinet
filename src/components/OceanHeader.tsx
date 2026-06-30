'use client';
import { memo } from 'react';

// ============================================================
// OceanHeader v212 — 玻璃瓶晶莹液体 (Crystal Liquid in Glass)
//
// 基于 v211 的成功经验（硬编码 hex = 不漂白），增强晶莹质感
//
// "玻璃瓶液体" 视觉公式:
//   1. 深蓝底色（容器/瓶子感觉）
//   2. 多个半透明色斑叠加（液体体积感，不同深度=不同亮度）
//   3. 明亮的 caustics 光斑（光线穿过液体折射形成的高亮点）
//   4. 表面反射条（玻璃曲面反光）
//   5. 缓慢的有机运动（黏稠液体晃动）
//
// ★ 所有颜色硬编码 hex/rgba — 绝不依赖运行时计算 ★
// ============================================================

function CrystalLiquid() {
  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0c2d4a 0%, #15466f 30%, #1a4e78 55%, #123b5e 80%, #0a2340 100%)' }}>

      {/* ══════════════════════════════════
          第一层：大型液体色斑（体积感底色）
          半透明叠加 = 液体厚薄不同 = 亮度不同
         ══════════════════════════════════ */}

      {/* 色斑 A：主液体团（中央偏左，最大最亮） */}
      <div className="absolute rounded-full animate-blobA"
        style={{
          width: '95%', height: '85%', top: '-18%', left: '-22%',
          background: 'radial-gradient(ellipse at center, rgba(44,130,200,0.55) 0%, rgba(32,105,175,0.38) 28%, rgba(22,80,150,0.18) 52%, transparent 72%)',
          filter: 'blur(65px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* 色斑 B：右侧液体（稍暗，增加层次） */}
      <div className="absolute rounded-full animate-blobB"
        style={{
          width: '80%', height: '95%', top: '-25%', right: '-25%',
          background: 'radial-gradient(ellipse at 60% 40%, rgba(35,100,180,0.48) 0%, rgba(25,75,145,0.30) 32%, rgba(15,55,120,0.12) 58%, transparent 75%)',
          filter: 'blur(70px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* 色斑 C：底部暗区（液体较厚的位置） */}
      <div className="absolute rounded-full animate-blobC"
        style={{
          width: '90%', height: '65%', bottom: '-20%', left: '-12%',
          background: 'radial-gradient(ellipse at 50% 70%, rgba(20,70,140,0.42) 0%, rgba(14,50,110,0.25) 35%, transparent 65%)',
          filter: 'blur(50px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* 色斑 D：顶部亮区（光线射入处，最"晶莹"的区域） */}
      <div className="absolute rounded-full animate-blobD"
        style={{
          width: '60%', height: '48%', top: '8%', left: '20%',
          background: 'radial-gradient(ellipse at 45% 35%, rgba(100,185,245,0.42) 0%, rgba(65,155,225,0.26) 35%, rgba(40,125,200,0.10) 60%, transparent 75%)',
          filter: 'blur(40px)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* ══════════════════════════════════
          第二层：Caustics 光斑（晶莹的核心！）
          模拟光线穿过弯曲玻璃+液体形成的网状高亮
          这是"晶莹"感的最大来源
         ══════════════════════════════════ */}
      <div className="absolute inset-0 animate-caustics"
        style={{
          background:
            'radial-gradient(ellipse 45% 30% at 25% 30%, rgba(150,210,255,0.28) 0%, transparent 60%),' +
            'radial-gradient(ellipse 35% 40% at 68% 25%, rgba(135,205,255,0.24) 0%, transparent 58%),' +
            'radial-gradient(ellipse 40% 28% at 55% 62%, rgba(145,215,255,0.22) 0%, transparent 55%),' +
            'radial-gradient(ellipse 28% 35% at 20% 70%, rgba(130,200,250,0.18) 0%, transparent 52%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ══════════════════════════════════
          第三层：玻璃表面反射（锐利高光条）
          模拟光滑玻璃曲面对环境光的反射
         ══════════════════════════════════ */}
      {/* 反光条 1：左上斜向 */}
      <div className="absolute animate-gloss1"
        style={{
          width: '55%', height: '3px', top: '18%', left: '8%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(220,240,255,0.45) 15%, rgba(255,255,255,0.60) 35%, rgba(220,240,255,0.35) 55%, transparent 80%)',
          filter: 'blur(3px)',
          transform: 'rotate(-12deg)',
          borderRadius: '999px',
        }}
      />

      {/* 反光条 2：右上水平短 */}
      <div className="absolute animate-gloss2"
        style={{
          width: '28%', height: '2px', top: '26%', right: '12%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(200,230,255,0.35) 20%, rgba(255,255,255,0.50) 50%, transparent 85%)',
          filter: 'blur(2px)',
          borderRadius: '999px',
        }}
      />

      {/* ══════════════════════════════════
          第四层：闪烁亮点（光线折射焦点）
          小而亮的点，模拟液体中的闪光
         ══════════════════════════════════ */}
      {[
        { x: '22%', y: '28%', size: 4, delay: 0 },
        { x: '65%', y: '22%', size: 3, delay: 1.3 },
        { x: '48%', y: '55%', size: 5, delay: 2.6 },
        { x: '28%', y: '68%', size: 3, delay: 0.7 },
        { x: '76%', y: '58%', size: 4, delay: 3.1 },
        { x: '54%', y: '33%', size: 3, delay: 1.9 },
        { x: '36%', y: '42%', size: 4, delay: 4.0 },
      ].map((pt, i) => (
        <div key={i} className="absolute rounded-full animate-sparkle"
          style={{
            left: pt.x, top: pt.y,
            width: pt.size, height: pt.size,
            background: `radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(200,235,255,0.55) 30%, rgba(150,210,255,0) 70%)`,
            boxShadow: `0 0 ${pt.size * 2}px rgba(150,210,255,0.5), 0 0 ${pt.size * 4}px rgba(100,180,255,0.25)`,
            animationDelay: `${pt.delay}s`,
          }}
        />
      ))}

      {/* ══════════════════════════════════
          第五层：细微波纹纹理（液体表面张力）
         ══════════════════════════════════ */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.10]" viewBox="0 0 800 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(170,215,255,0.5)" />
            <stop offset="60%" stopColor="rgba(170,215,255,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="rgba(190,225,255,0.4)" />
            <stop offset="70%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d="M-30,140 Q180,90 380,165 T840,115" fill="none" stroke="url(#wg1)" strokeWidth="2" strokeLinecap="round" className="animate-wv1" />
        <path d="M-30,260 Q180,310 400,235 T840,275" fill="none" stroke="url(#wg2)" strokeWidth="1.5" strokeLinecap="round" className="animate-wv2" />
        <path d="M-30,195 Q200,155 420,215 T840,178" fill="none" stroke="rgba(180,220,255,0.25)" strokeWidth="1" strokeLinecap="round" className="animate-wv3" />
      </svg>

      {/* ── Animations ── */}
      <style>{`
        @keyframes blobA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, 4%) scale(1.04); }
          66% { transform: translate(2%, 7%) scale(0.97); }
        }
        @keyframes blobB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          37% { transform: translate(-6%, 5%) scale(1.05); }
          73% { transform: translate(-4%, -3%) scale(0.96); }
        }
        @keyframes blobC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          43% { transform: translate(4%, -5%) scale(1.03); }
          78% { transform: translate(-2%, -6%) scale(0.98); }
        }
        @keyframes blobD {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.42; }
          50% { transform: translate(-5%, 6%) scale(1.09); opacity: 0.56; }
        }
        @keyframes caustics {
          0%, 100% { opacity: 1; transform: translateY(0) scale(1); }
          25% { opacity: 0.82; transform: translateY(-8px) scale(1.02); }
          50% { opacity: 1; transform: translateY(4px) scale(0.99); }
          75% { opacity: 0.88; transform: translateY(-5px) scale(1.01); }
        }
        @keyframes gloss1 {
          0%, 100% { opacity: 0.60; transform: rotate(-12deg) translateX(0); }
          50% { opacity: 0.88; transform: rotate(-12deg) translateX(12px); }
        }
        @keyframes gloss2 {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.75; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.15; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.7); }
        }
        @keyframes wv1 {
          0%, 100% { d: path('M-30,140 Q180,90 380,165 T840,115'); opacity: 0.10; }
          50% { d: path('M-30,158 Q180,118 380,142 T840,135'); opacity: 0.16; }
        }
        @keyframes wv2 {
          0%, 100% { d: path('M-30,260 Q180,310 400,235 T840,275'); opacity: 0.07; }
          50% { d: path('M-30,242 Q180,280 400,255 T840,260'); opacity: 0.13; }
        }
        @keyframes wv3 {
          0%, 100% { d: path('M-30,195 Q200,155 420,215 T840,178'); opacity: 0.05; }
          50% { d: path('M-30,208 Q200,178 420,198 T840,188'); opacity: 0.10; }
        }

        .animate-blobA { animation: blobA 20s ease-in-out infinite; will-change: transform; }
        .animate-blobB { animation: blobB 24s ease-in-out infinite; will-change: transform; }
        .animate-blobC { animation: blobC 21s ease-in-out infinite; will-change: transform; }
        .animate-blobD { animation: blobD 17s ease-in-out infinite; will-change: transform, opacity; }
        .animate-caustics { animation: caustics 11s ease-in-out infinite; will-change: transform, opacity; }
        .animate-gloss1 { animation: gloss1 7s ease-in-out infinite; will-change: transform, opacity; }
        .animate-gloss2 { animation: gloss2 9s ease-in-out infinite; will-change: opacity; }
        .animate-sparkle { animation: sparkle ease-in-out infinite; animation-duration: 4s; will-change: transform, opacity; }
        .animate-wv1 { animation: wv1 16s ease-in-out infinite; }
        .animate-wv2 { animation: wv2 19s ease-in-out infinite; }
        .animate-wv3 { animation: wv3 22s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default memo(function OceanHeader({ title, subtitle, children, icon }: { title: string; subtitle?: string; children?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden" style={{ background: '#0c2d4a' }}>
      <CrystalLiquid />

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
