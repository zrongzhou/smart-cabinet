'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v205 — 玻璃瓶液体平衡版 (Balanced Glass Liquid)
//
// v204 问题诊断（用户截图确认）：
//   ❌ 底色 76~93% 太亮 = 几乎全白，什么都看不见
//   ❌ 饱和度 0.10~0.28 太低 = 看不出蓝色
//   ❌ Caustics 0.38 + Specular 都太弱 = 白上加白无变化
//
// v205 目标：看得见的蓝色透光液体 + 明显的焦散+反光
//   ✅ 底色 62~78% (比v204暗14%，但比v203亮20%)
//   ✅ 饱和度 0.32~0.54 (能看出蓝色！但不会艳俗)
//   ✅ Caustics 焦散加强到 0.55 (明显可见的光斑网纹)
//   ✅ Specular 反光加强 (pow24锐利, 65%强度)
//   ✅ 液体厚度明暗加大 (厚处暗/薄处亮, 反差22%)
//   ✅ 保持缓流 u_time*0.04
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

    // ── Fragment Shader: v205 Balanced Glass Bottle Liquid ──
    const fsSource = [
      'precision highp float;',
      'varying vec2 v_uv;',
      'uniform float u_time;',
      'uniform vec2 u_resolution;',
      'uniform vec2 u_aspect;',

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

      'vec3 hsl2rgb(float h, float s, float l) {',
      '  vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);',
      '  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));',
      '}',

      'void main() {',
      '  vec2 uv = v_uv;',

      // 缓慢时间 — 黏稠液体
      '  float t = u_time * 0.04;',

      '  uv.x *= u_aspect.x / u_aspect.y;',

      // ── 大尺度扭曲（玻璃瓶形变）──
      '  vec2 shapeWarp = vec2(',
      '    snoise(uv * 1.2 + t * 0.08) * 0.35,',
      '    snoise(uv * 1.2 + 100.0 + t * 0.06) * 0.35',
      '  );',
      '  vec2 suv = uv + shapeWarp;',

      // ── Domain Warping（液体流动）──
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
      // ★★★ v205 平衡色彩系统 ★★★
      // ════════════════════════════════════════

      // 【底层】明亮但可见的基色
      // 62%~78% = 能看出是浅蓝色背景，不是白色！
      '  float baseL = 0.66 + f * 0.12;',
      '  baseL += q.x * 0.05;',
      '  baseL = clamp(baseL, 0.60, 0.80);',  // v204: 0.76~0.93 ❌ | v205: 0.60~0.80 ✅

      // 【色调】清晰的天蓝染色
      // 198°=淡天青 ~ 214°=中天蓝
      // 饱和度 0.32~0.54 = 明显是蓝色液体！
      '  float hue = mix(0.550, 0.594, f * 0.48 + r.x * 0.30 + r.y * 0.22);',
      '  hue += sin(t * 0.06 + q.x * 2.0) * 0.008;',

      // ★ 饱和度大幅提高 ★
      // v204: 0.10~0.28 (看不见蓝色) ❌
      // v205: 0.32~0.54 (清楚的天蓝色) ✅
      '  float sat = mix(0.32, 0.54, smoothstep(-0.25, 0.50, f));',
      '  sat += r.y * 0.06;',
      '  sat = clamp(sat, 0.28, 0.58);',

      // 【基础色】
      '  vec3 col = hsl2rgb(hue, sat, baseL);',

      // ════════════════════════════════════════
      // Caustics焦散 — 加强版！
      // ════════════════════════════════════════
      '  vec2 causticUV = suv * 3.8 + r * 2.2 + q * 1.6;',
      '  float c1 = sin(causticUV.x * 13.0 + sin(causticUV.y * 9.0 + t * 0.35) * 2.5);',
      '  float c2 = sin(causticUV.y * 11.0 + sin(causticUV.x * 8.0 - t * 0.28) * 2.5);',
      '  float c3 = sin((causticUV.x + causticUV.y) * 7.0 + t * 0.20);',
      '  float caustics = (c1 * c2 * c3 + 1.0) * 0.5;',
      '  caustics = pow(caustics, 2.5);',         // 锐化成亮斑
      '  caustics *= smoothstep(0.08, 0.58, f);',  // 只在液体区域显示

      // ★ 焦散强度从0.38提高到0.55 ★
      '  vec3 causticCol = vec3(0.92, 0.96, 1.0);', // 冷白光
      '  col = mix(col, causticCol, caustics * 0.55);', // v204: 0.38 ❌ | v205: 0.55 ✅

      // ════════════════════════════════════════
      // 玻璃表面反射 — 加强版！
      // ════════════════════════════════════════
      '  vec2 lightDir = normalize(vec2(-0.4, -0.6));',
      '  vec2 normal = vec2(',
      '    ddx(f) * 55.0,',
      '    ddy(f) * 55.0',
      '  );',
      '  normal = normalize(normal + vec2(0.001));',
      '  float spec = max(0.0, dot(normalize(normal), lightDir));',
      '  spec = pow(spec, 24.0);',               // v204: 32 → v205: 24 (更宽的高光区)
      '  spec *= smoothstep(0.25, 0.72, f) * 0.65;', // v204: 0.55 → v205: 0.65

      // 高光颜色
      '  vec3 specCol = vec3(0.95, 0.98, 1.0);',
      '  col = mix(col, specCol, spec);',

      // ════════════════════════════════════════
      // 液体厚度变化 — 加大反差！
      // 厚的地方深蓝，薄的地方亮白
      // ════════════════════════════════════════
      '  float thickness = smoothstep(-0.45, 0.55, r.y);',
      '  thickness = pow(thickness, 0.75);',
      '  vec3 deepColor = hsl2rgb(0.56, 0.38, 0.62);',  // 厚处: 中等深度天蓝
      '  col = mix(col, deepColor, (1.0 - thickness) * 0.28);', // v204: 0.18 → v205: 0.28

      // ════════════════════════════════════════
      // 边缘光晕（瓶壁）
      // ════════════════════════════════════════
      '  vec2 centerUV = v_uv - 0.5;',
      '  float dist = length(centerUV);',
      '  float rimLight = smoothstep(0.60, 0.95, dist);',
      '  rimLight *= 0.22;',                          // v204: 0.15 → v205: 0.22
      '  vec3 rimCol = vec3(0.84, 0.92, 1.0);',
      '  col = mix(col, rimCol, rimLight);',

      // 整体微提亮
      '  col *= 1.04;',

      // 极轻柔脉动
      '  col *= 0.97 + sin(t * 0.12) * 0.03;',

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
