'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FloatingParticles } from './Fx';
import { Phase } from './lib';

type Palette = [string, string, string];

const PALETTES: Record<'brand' | 'red' | 'green' | 'gold', Palette> = {
  brand: ['#ef1b77', '#ff9343', '#7C3AED'],
  red: ['#EF4444', '#ef1b77', '#7F1D1D'],
  green: ['#10B981', '#06B6D4', '#7C3AED'],
  gold: ['#F7C948', '#ff9343', '#ef1b77'],
};

export function paletteFor(phase: Phase): keyof typeof PALETTES {
  if (phase === 'purga' || phase === 'final') return 'red';
  if (phase === 'votacion') return 'green';
  if (phase === 'ganador') return 'gold';
  return 'brand';
}

/** Fondo animado: aurora + piso de cuadrícula + estrellas con fugaces + partículas. Reacciona a la etapa. */
export default function Background({ phase }: { phase: Phase }) {
  const pal = PALETTES[paletteFor(phase)];

  return (
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden bg-[#05050a]">
      <Starfield />

      {/* Aurora: manchas de color enormes que se mueven y cambian según la etapa */}
      <div className="absolute inset-0 opacity-70 mix-blend-screen">
        {pal.map((c, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[110px]"
            style={{ width: '55vmax', height: '55vmax', left: `${[-10, 45, 15][i]}%`, top: `${[-25, -10, 35][i]}%` }}
            animate={{
              backgroundColor: c,
              x: [0, i % 2 ? -120 : 140, 0],
              y: [0, i % 2 ? 90 : -70, 0],
              scale: [1, 1.18, 1],
            }}
            transition={{
              backgroundColor: { duration: 1.6 },
              x: { repeat: Infinity, duration: 18 + i * 5, ease: 'easeInOut' },
              y: { repeat: Infinity, duration: 22 + i * 4, ease: 'easeInOut' },
              scale: { repeat: Infinity, duration: 14 + i * 3, ease: 'easeInOut' },
            }}
            initial={{ opacity: 0.35 }}
          />
        ))}
      </div>

      {/* Piso de cuadrícula en perspectiva que avanza hacia la cámara */}
      <div className="absolute inset-x-0 bottom-0 h-[30vh] [perspective:500px]">
        <motion.div
          className="absolute -inset-x-1/2 bottom-0 h-[200%] origin-bottom"
          style={{
            transform: 'rotateX(68deg)',
            backgroundImage: `linear-gradient(${pal[0]}66 1.5px, transparent 1.5px), linear-gradient(90deg, ${pal[0]}66 1.5px, transparent 1.5px)`,
            backgroundSize: '70px 70px',
            maskImage: 'linear-gradient(to top, black 10%, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 75%)',
          }}
          animate={{ backgroundPositionY: ['0px', '70px'] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
        />
        {/* línea del horizonte */}
        <motion.div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          animate={{ backgroundColor: pal[1], boxShadow: `0 0 30px 6px ${pal[1]}` }}
          transition={{ duration: 1.6 }}
        />
      </div>

      <FloatingParticles count={30} />

      {/* Viñeta para que el contenido resalte */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
    </div>
  );
}

/* Estrellas titilando + estrellas fugaces ocasionales (canvas, liviano) */
function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const c = canvas?.getContext('2d');
    if (!canvas || !c) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 170 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.7,
      r: Math.random() * 1.3 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = performance.now() + 2500;

    let raf = 0;
    const draw = (t: number) => {
      c.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t / 1000 * s.speed + s.phase));
        c.globalAlpha = a;
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        c.fill();
      }
      if (!shooting && t > nextShoot) {
        shooting = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.3, vx: 9 + Math.random() * 6, vy: 3 + Math.random() * 3, life: 1 };
        nextShoot = t + 3500 + Math.random() * 5000;
      }
      if (shooting) {
        const s = shooting;
        const grad = c.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        c.globalAlpha = 1;
        c.strokeStyle = grad;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(s.x, s.y);
        c.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
        c.stroke();
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.015;
        if (s.life <= 0 || s.x > w || s.y > h) shooting = null;
      }
      c.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
