'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v200 — WebGL Shader 流体极光 (Fluid Aurora)
//
// 彻底换方向：放弃 Canvas 2D，改用 WebGL + GLSL Fragment Shader
//
// 为什么 WebGL 能做到 Canvas 2D 做不到的：
//   ✅ 逐像素计算（GPU并行），可以做多层嵌套噪声
//   ✅ Domain Warping（域扭曲）：噪声驱动噪声 = 真正的液体流动
//   ✅ 每帧全屏重绘 60fps 无压力
//   ✅ 颜色插值/混合在像素级别，不是模糊色斑叠加
//
// 技术方案：
//   - 原生 WebGL（无 Three.js 依赖）
//   - Vertex Shader: 全屏四边形（pass-through）
//   - Fragment Shader: Simplex Noise + Domain Warping + 色彩映射
//   - 色域锁定：天青(195°) → 蓝(215°) → 靛(238°)
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
// WebGLFluidAurora — WebGL + GLSL Fragment Shader 流体极光
//
// 核心技术：
//   1. Simplex Noise (GLSL内联实现)
//   2. Domain Warping（域扭曲）= 真正液体流动
//   3. Fractal Brownian Motion (FbM) 多层叠加
//   4. HSL→RGB 色彩映射（天青蓝靛色域）
//   5. 时间驱动的动态动画
// ============================================================
function WebGLFluidAurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    let animId = 0;
    const startTime = Date.now();

    // ── Vertex Shader：全屏四边形 ──
    const vsSource = [
      'attribute vec2 a_position;',
      'varying vec2 v_uv;',
      'void main() {',
      '  gl_Position = vec4(a_position, 0.0, 1.0);',
      '  v_uv = a_position * 0.5 + 0.5;', // [-1,1] → [0,1]
      '}'
    ].join('\n');

    // ── Fragment Shader：流体极光核心 ──
    const fsSource = [
      'precision mediump float;',
      'varying vec2 v_uv;',
      'uniform float u_time;',
      'uniform vec2 u_resolution;',
      'uniform vec2 u_aspect;',

      // ── Simplex 2D Noise ──
      // Stefan Gustavson 的经典实现（精简版）
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

      // ── FBM (Fractal Brownian Motion)：多层噪声叠加 ──
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

      // ── HSL → RGB 转换 ──
      'vec3 hsl2rgb(float h, float s, float l) {',
      '  vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);',
      '  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));',
      '}',

      // ── 主渲染逻辑 ──
      'void main() {',
      '  vec2 uv = v_uv;',
      '  float t = u_time * 0.15;', // 整体速度控制

      // 修正宽高比
      '  uv.x *= u_aspect.x / u_aspect.y;',

      // ── Domain Warping（核心！噪声扭曲坐标）──
      '  vec2 q = vec2(',
      '    fbm(uv + vec2(0.0, 0.0) + t * 0.3),',
      '    fbm(uv + vec2(5.2, 1.3) + t * 0.2)',
      '  );',

      '  vec2 r = vec2(',
      '    fbm(uv + q * 1.5 + vec2(1.7, 9.2) + t * 0.15),',
      '    fbm(uv + q * 1.2 + vec2(8.3, 2.8) + t * 0.12)',
      '  );',

      // ── 最终噪声值 ──
      '  float f = fbm(uv + r * 1.7);',

      // ── 色彩映射（天青蓝靛色域）──
      // 用 f 和 r 分量来混合颜色
      '  float hueMix = f * 0.55 + r.x * 0.25 + r.y * 0.20;',
      '  hueMix = clamp(hueMix, 0.0, 1.0);',

      // 色相范围：天青(195°) ~ 靛(240°) = HSL 0.54~0.67
      '  float hue = mix(0.54, 0.67, hueMix);',
      '  hue += sin(t * 0.3 + f * 2.0) * 0.03;', // 微妙色相漂移 ±3%

      // 饱和度：流动区域更饱和
      '  float sat = mix(0.52, 0.78, smoothstep(-0.3, 0.5, f));',

      // 亮度：核心区域亮，边缘暗（但整体偏亮！）
      '  float brightness = mix(0.38, 0.65, smoothstep(-0.5, 0.6, f));',
      '  brightness += r.x * 0.08;', // 扭曲增加高光
      '  brightness = clamp(brightness, 0.28, 0.72);',

      '  vec3 col = hsl2rgb(hue, sat, brightness);',

      // ── 高光点缀（最亮的"光斑"）──
      '  float highlight = smoothstep(0.45, 0.75, f) * smoothstep(0.75, 0.45, f);',
      '  highlight *= smoothstep(0.3, 0.7, r.x);',
      '  vec3 highlightCol = hsl2rgb(0.53, 0.65, 0.78);', // 天青高光
      '  col = mix(col, highlightCol, highlight * 0.45);',

      // ── 暗角效果（聚焦视觉中心）──
      '  vec2 centerUV = v_uv - 0.5;',
      '  float vignette = 1.0 - dot(centerUV, centerUV) * 0.5;',
      '  vignette = smoothstep(0.3, 0.9, vignette);',
      '  col *= 0.65 + vignette * 0.35;',

      // ── 细微颗粒感（增加质感，避免太"塑料"）──
      '  float grain = snoise(uv * 200.0 + t * 50.0) * 0.015;',
      '  col += grain;',

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
