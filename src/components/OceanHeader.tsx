'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v203 — 晶莹流光 (Crystal Fluid Aurora)
//
// v202 问题：饱和度0.30~0.52 = 灰蓝浑水，无晶莹感
//
// v203 目标：晶莹剔透的液体流动
//   ✅ 饱和度 0.50~0.72（高饱和 = 晶莹）
//   ✅ 亮度 0.54~0.80（透光液体感）
//   ✅ 明暗反差34%（暗48% vs 亮82%）
//   ✅ Caustics光折射高光（45%强度，像光线穿过水/冰晶）
//   ✅ 细碎闪烁微光（水面/晶体表面反射）
//   ✅ 缓流速度（用户要求不快）
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

    // ── Fragment Shader: v203 Crystal Fluid Aurora ──
    const fsSource = [
      'precision mediump float;',
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
      '    p = rot * p * 2.0;',
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
      '  float t = u_time * 0.07;',

      '  uv.x *= u_aspect.x / u_aspect.y;',

      '  vec2 q = vec2(',
      '    fbm(uv + vec2(0.0, 0.0) + t * 0.15),',
      '    fbm(uv + vec2(5.2, 1.3) + t * 0.10)',
      '  );',

      '  vec2 r = vec2(',
      '    fbm(uv + q * 1.5 + vec2(1.7, 9.2) + t * 0.08),',
      '    fbm(uv + q * 1.2 + vec2(8.3, 2.8) + t * 0.06)',
      '  );',

      '  float f = fbm(uv + r * 1.7);',

      // ── v203 晶莹色彩映射 ──
      '  float hueMix = f * 0.42 + r.x * 0.32 + r.y * 0.26;',
      '  hueMix = clamp(hueMix, 0.0, 1.0);',

      // 色相: 195~225度 (天青→宝石蓝→靛蓝)
      '  float hue = mix(0.542, 0.625, hueMix);',
      '  hue += sin(t * 0.12 + f * 1.2) * 0.012;',

      // 饱和度: 高! 晶莹需要高饱和
      '  float sat = mix(0.50, 0.72, smoothstep(-0.2, 0.5, f));',
      '  sat += r.y * 0.05;',
      '  sat = clamp(sat, 0.48, 0.75);',

      // 亮度: 明亮透光 (像光线穿过水/冰晶)
      '  float brightness = mix(0.54, 0.78, smoothstep(-0.4, 0.55, f));',
      '  brightness += r.x * 0.07;',
      '  brightness = clamp(brightness, 0.46, 0.82);',

      '  vec3 col = hsl2rgb(hue, sat, brightness);',

      // Caustics光折射高光 — 晶莹感的核心!
      '  float caustics = smoothstep(0.35, 0.75, f) * smoothstep(0.82, 0.35, f);',
      '  caustics *= smoothstep(0.25, 0.70, r.x) * smoothstep(0.20, 0.60, r.y);',
      '  caustics = pow(caustics, 1.5);',
      '  vec3 causticCol = hsl2rgb(0.55, 0.35, 0.92);',
      '  col = mix(col, causticCol, caustics * 0.45);',

      // 细碎闪烁微光 (水面/晶体表面反射)
      '  float sparkle = smoothstep(0.55, 0.90, r.x * r.y);',
      '  sparkle *= smoothstep(-0.1, 0.4, f);',
      '  vec3 sparkCol = hsl2rgb(0.53, 0.28, 0.96);',
      '  col = mix(col, sparkCol, sparkle * 0.25);',

      // 极轻柔边缘过渡
      '  vec2 centerUV = v_uv - 0.5;',
      '  float edge = 1.0 - dot(centerUV, centerUV) * 0.25;',
      '  edge = smoothstep(0.15, 0.85, edge);',
      '  col *= 0.90 + edge * 0.10;',

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
