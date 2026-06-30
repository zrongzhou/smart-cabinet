'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v208 — 蓝色液体瓶 (Blue Liquid Bottle)
//
// v207 问题诊断（用户截图确认：几乎全白）：
//   ❌ 根因：三层"漂白机制"叠加把蓝色冲成白色
//      1. Caustics焦散 → mix(col, WHITE, 50%) ← 往白混！
//      2. Specular高光  → mix(col, WHITE, 58%) ← 往白混！
//      3. 边缘提亮     → col *= 1.10            ← 整体提亮！
//   即使 baseL=0.30~0.54，经过三层漂白后 ≈ 白色
//
// v208 核心修正：
//   ✅ 所有高光颜色从 WHITE 改为 LIGHT_BLUE
//   ✅ 漂白强度大幅降低 (caustics 50%→22%, spec 58%→30%)
//   ✅ 底色加深到能承受漂白的程度
//   ✅ 删除边缘提亮和脉动
// ============================================================

function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = [
      'precision mediump float;',
      'varying vec2 v_uv;',
      'uniform vec2 u_res;',
      'uniform float u_time;',
      'uniform vec2 u_aspect;',

      // ── Simplex Noise ──
      'vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
      'vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
      'vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }',

      'float snoise(vec2 v) {',
      '  const vec4 C = vec4(0.2118644, 0.3660254, -0.5773503, 0.0243919);',
      '  vec2 i  = floor(v + dot(v, C.yy));',
      '  vec2 x0 = v - i + dot(i, C.xx);',
      '  vec2 i1;',
      '  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
      '  vec4 x12 = x0.xyxy + C.xxzz;',
      '  x12.xy -= i1;',
      '  i = mod(i, 289.0);',
      '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));',
      '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
      '  m = m*m ; m = m*m;',
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

      // ── FBM (5 octaves) ──
      'float fbm(vec2 p) {',
      '  float f = 0.0; float w = 0.5;',
      '  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);',
      '  for (int i = 0; i < 5; i++) {',
      '    f += w * snoise(p);',
      '    p = rot * p * 2.03; w *= 0.5;',
      '  }',
      '  return f;',
      '}',

      // ── HSL→RGB ──
      'vec3 hsl2rgb(float h, float s, float l) {',
      '  vec3 rgb = clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);',
      '  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));',
      '}',

      'void main() {',
      '  vec2 uv = v_uv;',
      '  float t = u_time * 0.04;',          // 缓流：25秒一周期
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

      // ══════════════════════════════════════════════
      // ★★★ v208 色彩系统 — 绝不漂白！★★★
      // 铁律：所有mix的目标色必须是蓝色系，禁止纯白色！
      // ══════════════════════════════════════════════

      // 【底色】中深蓝 — 必须够深才能承受后续的提亮操作
      // L=0.26 是安全底线：即使被提亮20%也还是看得见蓝
      '  float baseL = 0.32 + f * 0.14;',
      '  baseL += q.x * 0.04;',
      '  baseL = clamp(baseL, 0.26, 0.46);',     // 硬上限0.46！

      // 【色相】天青195° ~ 宝蓝215°（纯蓝域，零紫零绿）
      '  float hue = mix(0.542, 0.597, f * 0.50 + r.x * 0.30 + r.y * 0.20);',
      '  hue += sin(t * 0.06 + q.x * 2.0) * 0.006;', // ±0.6度微漂移

      // 【饱和度】中高 — 液体感但不刺眼
      '  float sat = mix(0.55, 0.78, smoothstep(-0.25, 0.50, f));',
      '  sat += r.y * 0.04;',
      '  sat = clamp(sat, 0.52, 0.80);',

      // 【基础色】— 这一次是真正可见的蓝色
      '  vec3 col = hsl2rgb(hue, sat, baseL);',

      // ════════════════════════════════════════
      // Caustics焦散 — 光穿过液体的折射图案
      // ⚠️ 颜色用浅蓝(0.72,0.86,1.0)，不用白色！
      // ⚠️ 强度从50%砍到22%！
      // ════════════════════════════════════════
      '  vec2 causticUV = suv * 4.0 + r * 2.5 + q * 1.8;',
      '  float c1 = sin(causticUV.x * 14.0 + sin(causticUV.y * 10.0 + t * 0.35) * 2.8);',
      '  float c2 = sin(causticUV.y * 12.0 + sin(causticUV.x * 9.0 - t * 0.28) * 2.8);',
      '  float c3 = sin((causticUV.x + causticUV.y) * 8.0 + t * 0.22);',
      '  float caustics = (c1 * c2 * c3 + 1.0) * 0.5;',
      '  caustics = pow(caustics, 2.5);',               // 更集中
      '  caustics *= smoothstep(0.10, 0.60, f);',       // 只在亮区显示
      '  vec3 causticCol = vec3(0.72, 0.86, 1.0);',     // ★ 浅蓝色！(不是白色)
      '  col = mix(col, causticCol, caustics * 0.22);',  // ★ 最大22%(不是50%)

      // ════════════════════════════════════════
      // Specular高光 — 玻璃表面反光点
      // ⚠️ 颜色用近白蓝(0.85,0.92,1.0)
      // ⚠️ 强度从58%砍到30%，pow提高让它更锐利
      // ════════════════════════════════════════
      '  vec2 lightDir = normalize(vec2(-0.4, -0.6));',
      '  vec2 normal = vec2(ddx(f) * 55.0, ddy(f) * 55.0);',
      '  normal = normalize(normal + vec2(0.001));',
      '  float spec = max(0.0, dot(normalize(normal), lightDir));',
      '  spec = pow(spec, 36.0);',                       // 更尖锐
      '  spec *= smoothstep(0.25, 0.75, f) * 0.30;',    // ★ 最大30%
      '  vec3 specCol = vec3(0.85, 0.92, 1.0);',        // ★ 近白蓝(不是纯白)
      '  col = mix(col, specCol, spec);',

      // ════════════════════════════════════════
      // 液体厚度 — 体积感（厚处深蓝，薄处透亮）
      // 增强到45%让明暗对比更明显
      // ════════════════════════════════════════
      '  float thickness = smoothstep(-0.45, 0.55, r.y);',
      '  thickness = pow(thickness, 0.70);',
      '  vec3 deepColor = hsl2rgb(0.56, 0.62, 0.30);',   // 厚处: 深邃蓝
      '  col = mix(col, deepColor, (1.0 - thickness) * 0.45);', // ★ 45%

      // ════════════════════════════════════════
      // 微妙的环境光遮蔽（中心略亮）
      // 不再整体提亮！只做极轻微暗角反向
      // ════════════════════════════════════════
      '  vec2 centerUV = v_uv - 0.5;',
      '  float vignette = 1.0 - dot(centerUV, centerUV) * 0.18;',
      '  vignette = smoothstep(0.25, 0.80, vignette);',
      '  col *= 0.94 + vignette * 0.06;',                // 最大+6%

      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[OceanHeader] Shader error:', gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[OceanHeader] Link error:', gl.getProgramInfoLog(prog));
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    const resLoc = gl.getUniformLocation(prog, 'u_res');
    const timeLoc = gl.getUniformLocation(prog, 'u_time');
    const aspectLoc = gl.getUniformLocation(prog, 'u_aspect');

    gl.useProgram(prog);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resize = () => {
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    let animId: number;
    const render = (t: number) => {
      resize();
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, t * 0.001);
      gl.uniform2f(aspectLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }} />;
}

export default memo(function OceanHeader({ title, subtitle, children, icon }: { title: string; subtitle?: string; children?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden" style={{ background: 'transparent' }}>
      <FluidBackground />
      {/* 星光点缀 */}
      {[{x:'15%',y:'22%'},{x:'82%',y:'15%'},{x:'72%',y:'78%'},{x:'18%',y:'70%'},{x:'48%',y:'12%'}].map((s,i)=>(
        <div key={i} className="absolute pointer-events-none rounded-full" style={{
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
        {children}
      </div>
    </header>
  );
});
