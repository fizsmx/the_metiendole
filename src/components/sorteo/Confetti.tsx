'use client';

import React, { useEffect, useRef } from 'react';
import { WHEEL_COLORS } from './lib';

/** Lluvia de confeti en canvas. Cambia `burst` para disparar otra ráfaga. */
export default function Confetti({ burst, duration = 7000 }: { burst: number; duration?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!burst) return;
    const canvas = ref.current;
    const c = canvas?.getContext('2d');
    if (!canvas || !c) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;
    const parts = Array.from({ length: 260 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? 0 : W(),
        y: H() * (0.55 + Math.random() * 0.3),
        vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 12) * dpr,
        vy: -(14 + Math.random() * 16) * dpr,
        w: (6 + Math.random() * 8) * dpr,
        h: (8 + Math.random() * 10) * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: WHEEL_COLORS[i % WHEEL_COLORS.length],
      };
    });

    const t0 = performance.now();
    let raf = 0;
    const draw = (t: number) => {
      const elapsed = t - t0;
      c.clearRect(0, 0, W(), H());
      c.globalAlpha = elapsed > duration - 1500 ? Math.max(0, (duration - elapsed) / 1500) : 1;
      for (const p of parts) {
        p.vy += 0.35 * dpr;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.color;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
        c.restore();
      }
      if (elapsed < duration) raf = requestAnimationFrame(draw);
      else c.clearRect(0, 0, W(), H());
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [burst, duration]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
}
