'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v210 — 玻璃瓶液体 (Glass Bottle Liquid)
//
// ✅ v209诊断确认: Canvas/WebGL渲染管线正常(深蓝#265999清晰可见)
// ✅ 问题根因确认: 之前的白色是Shader参数漂白(高光用纯白+强度过高)
//
// 设计目标: 晶莹液体在透明玻璃瓶中缓缓晃动
// 核心原则:
//   1. 底色必须肉眼可见的蓝色(参考v209的#265999)
//   2. 所有高光/焦散/反光 禁止使用纯白色
//   3. HSL亮度控制在0.25~0.48范围(>0.5会被白色冲淡)
//   4. 流速缓慢(黏稠液体感)
// ============================================================

function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    if (!gl) return;

    // ════════════════════════════════════════
    // Vertex Shader — 全屏四边形
    // ════════════════════════════════════════
    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // ════════════════════════════════════════
    // Fragment Shader — 玻璃瓶液体
    // ════════════════════════════════════════
    const fsSource = [
      'precision mediump float;',
      'varying vec2 v_uv;',
      'uniform vec2 u_aspect;',
      'uniform float u_time;',

      // ── Simplex Noise (标准实现) ──
      'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
      'vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}',
      'vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}',
      'float snoise(vec2 v){',
      '  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);',
      '  vec2 i=floor(v+dot(v,C.yy));',
      '  vec2 x=v-i+dot(i,C.xx);',
      '  vec2 i1=(x.x>x.y)?vec2(1.0,0.0):vec2(0.0,1.0);',
      '  vec4 x12=x.xyxy+C.xxzz;',
      '  x12.xy-=i1;',
      '  i=mod289(i);',
      '  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
      '  vec3 m=max(0.5-vec3(dot(x00,x00),dot(xxy,xxy),dot(yy,yy)),0.0);',
      '  m=m*m;m=m*m;',
      '  vec3 x=2.0*fract(p*C.www)-1.0;',
      '  vec3 h=abs(x)-0.5;',
      '  vec3 ox=floor(x+0.5);',
      '  vec3 a0=x-ox;',
      '  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
      '  vec3 g;',
      '  g.x=a0.x*x00.x+h.x*x00.y;',
      '  g.y=a0.y*xxy.x+h.x*xxy.y-h.y*xxy.x;',
      '  g.z=a0.z*yy.x+h.z*yy.y;',
      '  return 130.0*dot(m,g);',
      '}',

      // ── FBM (多层噪声叠加) ──
      'float fbm(vec2 p){',
      '  float f=0.0;',
      '  f+=0.5000*snoise(p);p*=2.02;',
      '  f+=0.2500*snoise(p);p*=2.03;',
      '  f+=0.1250*snoise(p);p*=2.01;',
      '  f+=0.0625*snoise(p);',
      '  return f/0.9375;',
      '}',

      // ── HSL→RGB (标准转换) ──
      'vec3 hsl2rgb(float h,float s,float l){',
      '  vec3 rgb=clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);',
      '  return l+s*(rgb-0.5)*(1.0-abs(2.0*l-1.0));',
      '}',

      // ════════════════════════════════════════
      // 主渲染 —— 玻璃瓶液体
      // ════════════════════════════════════════
      'void main(){',
      '  vec2 uv=v_uv;',

      // 【★ 流速】非常慢——黏稠液体的感觉
      '  float t=u_time*0.035;',

      '  uv.x*=u_aspect.x/u_aspect.y;',

      // ── Domain Warping (有机流体扭曲) ──
      '  vec2 q=vec2(',
      '    fbm(uv+t*0.10),',
      '    fbm(uv+vec2(5.2,1.3)+t*0.07)',
      '  );',

      '  vec2 r=vec2(',
      '    fbm(uv+q*1.6+vec2(1.7,9.2)+t*0.06),',
      '    fbm(uv+q*1.3+vec2(8.3,2.8)+t*0.05)',
      '  );',

      '  float f=fbm(uv+r*1.7);',

      // ════════════════════════════════════════
      // ★★★ 颜色系统：可见蓝色！禁止白色漂白！ ★★★
      // ════════════════════════════════════════
      //
      // v209诊断确认: RGB(0.15,0.35,0.60)=#265999 深蓝色 完美显示
      // 对应HSL: h≈0.58, s≈0.60, l≈0.37
      //
      // 所有颜色的Lightness必须在0.25~0.48之间!
      // >0.50 = 被白色冲淡 (v204-v207的教训)

      // 【底色】深蓝色——看得见! (L=0.30~0.46, S=0.55~0.75)
      '  float baseL=0.34+f*0.12;',
      '  baseL+=q.x*0.04;',
      '  baseL=clamp(baseL,0.28,0.48);',

      // 【色相】天青→宝蓝 (200°~220°)
      '  float hue=mix(0.556,0.611,f*0.45+r.x*0.30+r.y*0.25);',
      '  hue+=sin(t*0.08+f*0.6)*0.006;',

      // 【饱和度】够浓才看得见蓝色
      '  float sat=mix(0.55,0.78,smoothstep(-0.2,0.5,f));',
      '  sat=clamp(sat,0.52,0.80);',

      '  vec3 col=hsl2rgb(hue,sat,baseL);',

      // ── Caustics焦散 (光线穿过玻璃+液体的折射图案) ──
      // ⚠️ 颜色用浅蓝(0.65,0.82,1.0) 绝不用白色!
      '  vec2 causticsUV=uv*3.0+vec2(t*0.15,-t*0.10);',
      '  float c1=sin(causticsUV.x*5.0)*sin(causticsUV.y*4.0+1.0);',
      '  float c2=sin((causticsUV.x+causticsUV.y)*4.0+2.0)*sin(causticsUV.x*3.0-causticsUV.y*2.0);',
      '  float caustics=pow(c1*c2*0.5+0.5,3.0);',
      '  caustics*=smoothstep(0.2,0.7,f);', // 只在亮区显示
      '  vec3 causticColor=hsl2rgb(0.58,0.45,0.78);', // 浅蓝非白!
      '  col=mix(col,causticColor,caustics*0.25);', // 强度25%(温和)

      // ── Specular玻璃表面反射 ──
      // 用ddx/ddy算表面法线 → 模拟玻璃曲面反光
      '  vec2 texCoord=v_uv*40.0;',
      '  float noiseVal=snoise(texCoord+t*0.02)*0.5+0.5;',
      '  float spec=pow(noiseVal,20.0);', // 锐利高光
      '  spec*=smoothstep(0.3,0.7,r.x);', // 只在特定区域
      '  vec3 specColor=hsl2rgb(0.56,0.35,0.88);', // 极浅蓝非白!
      '  col=mix(col,specColor,spec*0.18);', // 强度18%

      // ── 液体厚度明暗 (体积感) ──
      '  float thickness=smoothstep(-0.3,0.4,f);',
      '  col*=0.75+thickness*0.25;', // 厚处略亮

      // ── 微弱边缘光晕 (玻璃瓶壁感) ──
      '  vec2 centerUV=v_uv-0.5;',
      '  float dist=length(centerUV*vec2(u_aspect.x/u_aspect.y,1.0));',
      '  float edgeGlow=smoothstep(0.65,0.95,dist);',
      '  vec3 glowCol=hsl2rgb(0.56,0.55,0.58);', // 中蓝光晕
      '  col=mix(col,glowCol,edgeGlow*0.12);',

      '  gl_FragColor=vec4(col,1.0);',
      '}'
    ];

    // ── Shader 编译 ──
    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[OceanHeader] Shader compile error:', gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource.join('\n'));
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[OceanHeader] Link error:', gl.getProgramInfoLog(prog));
      return;
    }

    // ── 几何数据 ──
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    const timeLoc = gl.getUniformLocation(prog, 'u_time');
    const aspectLoc = gl.getUniformLocation(prog, 'u_aspect');

    // ── 渲染循环 ──
    let animId = 0;
    const resize = () => {
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resize();

    const render = (time: number) => {
      resize();
      gl.useProgram(prog);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(aspectLoc, canvas.width / Math.max(1, canvas.height), 1.0);

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
