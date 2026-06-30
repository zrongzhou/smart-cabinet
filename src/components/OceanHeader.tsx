'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v201 — WebGL Shader 流体极光 (Fluid Aurora) 颜色精修
//
// v200 问题诊断（用户截图确认）：
//   ❌ 色相范围 0.54~0.67 (195°~240°) — 低端 195° 偏青绿 = 整体发绿
//   ❌ 亮度下限 0.28 — 深色区域太暗 = "污渍"感
//   ❌ grain 颗粒 + 暗角过强 = 更脏
//
// v201 颜色修复：
//   ✅ 色相收窄到 0.57~0.69 (205°~248°) — 纯天青→蓝→靛，去掉青绿
//   ✅ 亮度提到底 0.42~0.70 — 不再有深色污渍
//   ✅ 去掉 grain 颗粒 — 干净高级感
//   ✅ 高光改为宝石蓝 — 更协调
//   ✅ 暗角减弱 — 保持整体明亮
// ============================================================

interface OceanHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  locale?: string;
}

export default function OceanHeader({ title, subtitle, description, icon, children }: OceanHeaderProps) {
  return (
    <section className="relative text-white py-[120px] px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* WebGL Shader 层 */}
      <WebGLFluidAurora />

      {/* 底部过渡到白色内容区 */}
      <div className="absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.55) 55%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* 内容区 */}
      <motion.div className="relative z-10 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {icon && (
          <motion.div className="flex justify-center mb-5"
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="w-[58px] h-[58px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.28)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.22)',
              }}
            >{icon}</div>
          </motion.div>
        )}

        {children}

        {title && (
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight leading-tight mb-5"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.15)' }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >{title}</motion.h1>
        )}

        {(description || subtitle) && (
          <motion.p
            className="text-base sm:text-lg text-white/88 max-w-xl mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >{description || subtitle}</motion.p>
        )}
      </motion.div>
    </section>
  );
}

// ============================================================
// WebGLFluidAurora — WebGL + GLSL Fragment Shader 流体极光 (v201颜色精修)
//
// 核心技术不变（v200已验证有效）：
//   1. Simplex Noise (GLSL内联)
//   2. Domain Warping（域扭曲）= 真正液体流动 ✅ 用户确认！
//   3. FBM 多层叠加
//   4. HSL→RGB 色彩映射（v201重调参数）
// ============================================================
function WebGLFluidAurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return;

    let animId = 0;
    const startTime = Date.now();

    // ── Vertex Shader：全屏四边形 ──
    const vsSource = [
      'attribute vec2 a_position;',
      'varying vec2 v_uv;',
      'void main() {',
      '  gl_Position = vec4(a_position, 0.0, 1.0);',
      '  v_uv = a_position * 0.5 + 0.5;',
      '}'
    ].join('\n');

    // ── Fragment Shader：流体极光 v201 颜色精修版 ──
    const fsSource = [
      'precision mediump float;',
      'varying vec2 v_uv;',
      'uniform float u_time;',
      'uniform vec2 u_resolution;',
      'uniform vec2 u_aspect;',

      // ── Simplex 2D Noise ──
      'vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }',

      'float snoise(vec2 v) {',
      '  const vec4 C = vec4(0.211324865405187, 0.366025403784439,',
      '                       -0.577350269189626, 0.024390243902439);',
      '  vec2 i  = floor(v + dot(v, C.yy));',
      '  vec2 x0 = v - i + dot(i, C.xx);',
      '  vec2 i1;',
      '  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
      '  vec4 x12 = x0.xyxy + C.xxzz;',
      '  x12.xy -= i1;',
      '  i = mod(i, 289.0);',
      '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))',
      '    + i.x + vec3(0.0, i1.x, 1.0));',
      '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),',
      '    dot(x12.zw,x12.zw)), 0.0);',
      '  m = m*m ;',
      '  m = m*m ;',
      '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
      '  vec3 h = abs(x) - 0.5;',
      '  vec3 ox = floor(x + 0.5);',
      '  vec3 a0 = x - ox;',
      '  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);',
      '  vec3 g;',
      '  g.x  = a0.x  * x0.x  + h.x  * x0.y;',
      '  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
      '  return 130.0 * dot(m, g);',
      '}',

      // ── FBM ──
      'float fbm(vec2 p) {',
      '  float f = 0.0;',
      '  float w = 0.5;',
      '  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);',
      '  for (int i = 0; i < 5; i++) {',
      '    f += w * snoise(p);',
      '    p = rot * p * 2.0;',
      '    w *= 0.5;',
      '  }',
      '  return f;',
      '}',

      // ── HSL → RGB ──
      'vec3 hsl2rgb(float h, float s, float l) {',
      '  vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);',
      '  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));',
      '}',

      // ══════════════════════════════════════════════
      // 主渲染逻辑 —— v201 颜色精修
      // ══════════════════════════════════════════════
      'void main() {',
      '  vec2 uv = v_uv;',
      '  float t = u_time * 0.15;',

      // 修正宽高比
      '  uv.x *= u_aspect.x / u_aspect.y;',

      // ── Domain Warping（核心！保持v200的流动算法不变）──
      '  vec2 q = vec2(',
      '    fbm(uv + vec2(0.0, 0.0) + t * 0.3),',
      '    fbm(uv + vec2(5.2, 1.3) + t * 0.2)',
      '  );',

      '  vec2 r = vec2(',
      '    fbm(uv + q * 1.5 + vec2(1.7, 9.2) + t * 0.15),',
      '    fbm(uv + q * 1.2 + vec2(8.3, 2.8) + t * 0.12)',
      '  );',

      '  float f = fbm(uv + r * 1.7);',

      // ══════════════════════════════════════════════
      // ★★★ v201 颜色映射修改区域 ★★★
      // ══════════════════════════════════════════════

      // 色相混合权重
      '  float hueMix = f * 0.50 + r.x * 0.30 + r.y * 0.20;',
      '  hueMix = clamp(hueMix, 0.0, 1.0);',

      // 【修改1】色相范围：0.57~0.69 (205°~248°)
      // v200 是 0.54~0.67 (195°~240°) — 低端偏青绿
      // 现在收窄到纯正天青蓝→宝石蓝→靛蓝，不再有绿色
      '  float hue = mix(0.57, 0.69, hueMix);',
      '  hue += sin(t * 0.25 + f * 1.5) * 0.02;', // 色相漂移缩小到 ±2%

      // 【修改2】饱和度：微降，更高级不艳俗
      // v200: 0.52~0.78 → v201: 0.48~0.72
      '  float sat = mix(0.48, 0.72, smoothstep(-0.2, 0.5, f));',

      // 【修改3】亮度：大幅提亮！去掉深色污渍
      // v200: 0.38~0.65, 下限0.28 → v201: 0.45~0.70, 下限0.42
      '  float brightness = mix(0.45, 0.70, smoothstep(-0.4, 0.55, f));',
      '  brightness += r.x * 0.06;', // 高光点缀（降低强度）
      '  brightness = clamp(brightness, 0.42, 0.72);', // 下限从0.28提到0.42！

      '  vec3 col = hsl2rgb(hue, sat, brightness);',

      // 【修改4】高光：用宝石蓝(0.61=220°)而不是天青(0.53=191°)
      // 天青偏绿，宝石蓝更纯净协调
      '  float highlight = smoothstep(0.42, 0.72, f) * smoothstep(0.72, 0.42, f);',
      '  highlight *= smoothstep(0.35, 0.70, r.x);',
      '  vec3 highlightCol = hsl2rgb(0.61, 0.62, 0.80);', // 宝石蓝高光
      '  col = mix(col, highlightCol, highlight * 0.38);',

      // 【修改5】暗角：减弱，保持整体明亮
      // v200: 0.65+0.35*vignette → v201: 0.78+0.22*vignette
      '  vec2 centerUV = v_uv - 0.5;',
      '  float vignette = 1.0 - dot(centerUV, centerUV) * 0.4;',
      '  vignette = smoothstep(0.25, 0.85, vignette);',
      '  col *= 0.78 + vignette * 0.22;',

      // 【修改6】删除 grain 颗粒！v200 的颗粒增加脏感

      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    // ── 编译 Shader ──
    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    // ── 创建程序 ──
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // ── 全屏四边形顶点数据 ──
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // ── Uniform 位置 ──
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const aspectLoc = gl.getUniformLocation(program, 'u_aspect');

    // ── Resize & Render ──
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      const t = (Date.now() - startTime) * 0.001;

      gl.uniform1f(timeLoc, t);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(aspectLoc, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true"
      style={{ width: '100%', height: '100%' }} />
  );
}
