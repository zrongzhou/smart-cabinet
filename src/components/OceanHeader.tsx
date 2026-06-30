'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v209 — 诊断版 (Diagnostic)
//
// 目的：确认 WebGL Canvas 是否真的能渲染颜色到屏幕上
// 方法：画一个毫无争议的深蓝色，如果还显示白色→CSS/布局问题
// 如果显示深蓝→Shader参数问题（回到调参）
// ============================================================

function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    if (!gl) {
      console.error('[OceanHeader] WebGL not supported!');
      return;
    }

    console.log('[OceanHeader] WebGL context acquired, rendering diagnostic blue...');

    // ── 最简单的 Shader：输出固定深蓝色 ──
    const vsSource = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.15, 0.35, 0.60, 1.0);  // #265999 深蓝色 - 无可争议的颜色！
      }
    `;

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
        console.log(`[OceanHeader] Canvas resized: ${w}x${h}`);
      }
    };

    resize();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    console.log('[OceanHeader] Deep blue rendered! If you see white, there is a CSS/overlay issue.');
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
