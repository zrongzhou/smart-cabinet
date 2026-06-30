'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v204 — 玻璃瓶液体 (Glass Bottle Liquid)
//
// 用户明确描述："晶莹液体在透明玻璃瓶里面缓缓晃动"
//
// 核心视觉特征：
//   ✅ 透光度高 — 光线穿过液体和玻璃，不是不透明的纹理
//   ✅ 浅亮底色 — 像光线从背后照进玻璃瓶的效果
//   ✅ Caustics焦散 — 光线经玻璃+液体的折射形成的光斑图案
//   ✅ 黏稠缓流 — 像蜂蜜/油在水中缓慢旋转扩散
//   ✅ 玻璃质感 — 边缘微光、表面反射、轻微色散
//   ✅ 色调：极淡的青蓝染色的透明液体
//
// 技术方案：
//   - 底层：明亮近白基色(亮度78~92%)
//   - 中层：Caustics焦散图案(光线折射)
//   - 上层：缓慢Domain Warping(液体内部流动)
//   - 高光：玻璃表面反射(specular)
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
      <WebGLFluidAurora />

      <div className="absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.55) 55%, transparent 100%)',
        }}
        aria-hidden="true"
      />

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

function WebGLFluidAurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return;

    let animId = 0;
    const startTime = Date.now();

    const vsSource = [
      'attribute vec2 a_position;',
      'varying vec2 v_uv;',
      'void main() {',
      '  gl_Position = vec4(a_position, 0.0, 1.0);',
      '  v_uv = a_position * 0.5 + 0.5;',
      '}'
    ].join('\n');

    // ── Fragment Shader: v204 Glass Bottle Liquid ──
    const fsSource = [
      'precision highp float;',
      'varying vec2 v_uv;',
      'uniform float u_time;',
      'uniform vec2 u_resolution;',
      'uniform vec2 u_aspect;',

      // ═══ Simplex Noise ═══
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

      // FBM - 5层细节
      'float fbm(vec2 p) {',
      '  float f = 0.0;',
      '  float w = 0.5;',
      '  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);',
      '  for (int i = 0; i < 5; i++) {',
      '    f += w * snoise(p);',
      '    p = rot * p * 2.03;',
      '    w *= 0.5;',
      '  }',
      '  return f;',
      '}',

      // HSL→RGB
      'vec3 hsl2rgb(float h, float s, float l) {',
      '  vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);',
      '  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));',
      '}',

      'void main() {',
      '  vec2 uv = v_uv;',

      // ★★★ 极慢的时间流速 — 像黏稠液体 ★★★
      '  float t = u_time * 0.04;',

      '  uv.x *= u_aspect.x / u_aspect.y;',

      // ════════════════════════════════════════
      // 第一层：超大尺度慢速扭曲（瓶子形状感）
      // ════════════════════════════════════════
      '  vec2 shapeWarp = vec2(',
      '    snoise(uv * 1.2 + t * 0.08) * 0.35,',
      '    snoise(uv * 1.2 + 100.0 + t * 0.06) * 0.35',
      '  );',
      '  vec2 suv = uv + shapeWarp;',

      // ════════════════════════════════════════
      // 第二层：Domain Warping — 液体内部流动
      // （非常慢！像黏稠液体）
      // ════════════════════════════════════════
      '  vec2 q = vec2(',
      '    fbm(suv * 1.0 + t * 0.06),',
      '    fbm(suv * 1.0 + vec2(7.3, 2.1) + t * 0.04)',
      '  );',

      '  vec2 r = vec2(',
      '    fbm(suv * 1.2 + q * 1.6 + vec2(2.9, 8.4) + t * 0.035),',
      '    fbm(suv * 1.2 + q * 1.3 + vec2(5.1, 3.7) + t * 0.028)',
      '  );',

      '  float f = fbm(suv * 0.8 + r * 1.4 + t * 0.02);',

      // ════════════════════════════════════════
      // ★★★ 核心：玻璃瓶液体颜色系统 ★★★
      // ════════════════════════════════════════

      // 【底层】极亮的基色 — 像光照进玻璃瓶
      // 80%~92% 亮度 = 接近白色但带一点蓝调
      '  float baseL = 0.80 + f * 0.08;',
      '  baseL += q.x * 0.04;',
      '  baseL = clamp(baseL, 0.76, 0.93);',

      // 【色调】极淡的青蓝染色
      // 198度=淡天青 ~ 212度=天空蓝
      // 饱和度只有 0.12~0.28 — 几乎是透明液体！
      '  float hue = mix(0.550, 0.589, f * 0.5 + r.x * 0.3 + r.y * 0.2);',
      '  hue += sin(t * 0.05 + q.x * 2.0) * 0.006;',
      '  float sat = mix(0.10, 0.28, smoothstep(-0.3, 0.5, f));',

      // 【基础色】
      '  vec3 col = hsl2rgb(hue, sat, baseL);',

      // ════════════════════════════════════════
      // Caustics焦散效果
      // 模拟光线穿过弯曲玻璃+液体后的聚焦图案
      // 这是"晶莹"感的最大来源！
      // ════════════════════════════════════════

      // 用高频噪声模拟焦散网状结构
      '  vec2 causticUV = uv * 3.5 + r * 2.0 + q * 1.5;',
      '  float c1 = sin(causticUV.x * 12.0 + sin(causticUV.y * 8.0 + t * 0.3) * 2.0);',
      '  float c2 = sin(causticUV.y * 10.0 + sin(causticUV.x * 7.0 - t * 0.25) * 2.0);',
      '  float c3 = sin((causticUV.x + causticUV.y) * 6.0 + t * 0.18);',
      '  float caustics = (c1 * c2 * c3 + 1.0) * 0.5;',
      '  caustics = pow(caustics, 3.0);',       // 锐化成明显的亮斑
      '  caustics *= smoothstep(0.1, 0.6, f);',  // 只在有液体区域显示

      // 焦散颜色：近白色（光线本身）
      '  vec3 causticCol = vec3(0.94, 0.97, 1.0);',
      '  col = mix(col, causticCol, caustics * 0.38);',

      // ════════════════════════════════════════
      // 玻璃表面反射 (Specular Highlights)
      // 模拟玻璃瓶表面的反光点
      // ════════════════════════════════════════

      // 主光源反射 — 左上角方向的主光源
      '  vec2 lightDir = normalize(vec2(-0.4, -0.6));',
      '  vec2 normal = vec2(',
      '    ddx(f) * 50.0,',
      '    ddy(f) * 50.0',
      '  );',
      '  normal = normalize(normal + vec2(0.001));',
      '  float spec = max(0.0, dot(normalize(normal), lightDir));',
      '  spec = pow(spec, 32.0);',               // 锐利的高光
      '  spec *= smoothstep(0.3, 0.7, f) * 0.55;',

      // 高光颜色：冷白色
      '  vec3 specCol = vec3(0.96, 0.98, 1.0);',
      '  col = mix(col, specCol, spec);',

      // ════════════════════════════════════════
      // 内部光影变化 — 液体厚度不同导致的明暗
      // ════════════════════════════════════════

      // 模拟液体厚的地方暗、薄的地方亮
      '  float thickness = smoothstep(-0.5, 0.5, r.y);',
      '  thickness = pow(thickness, 0.8);',
      '  vec3 depthColor = hsl2rgb(0.55, 0.20, 0.72);', // 厚处略深
      '  col = mix(col, depthColor, (1.0 - thickness) * 0.18);',

      // ════════════════════════════════════════
      // 微妙的边缘光晕（玻璃瓶壁感）
      // ════════════════════════════════════════
      '  vec2 centerUV = v_uv - 0.5;',
      '  float dist = length(centerUV);',
      '  float rimLight = smoothstep(0.65, 0.95, dist);',
      '  rimLight *= 0.15;',
      '  vec3 rimCol = vec3(0.88, 0.94, 1.0);',
      '  col = mix(col, rimCol, rimLight);',

      // 整体提亮 — 保证不会太暗
      '  col = col * 1.06;',

      // 非常轻微的全局脉动（像液体呼吸）
      '  col *= 0.97 + sin(t * 0.15) * 0.03;',

      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

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

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const aspectLoc = gl.getUniformLocation(program, 'u_aspect');

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
