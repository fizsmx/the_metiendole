'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Crown, Dices, Phone, Skull, Sparkles, Swords, Trophy, Users, Vote } from 'lucide-react';
import { Phase, sfx } from './lib';
import { PREMIO } from './premio';

/* =================== Presentación animada de cada etapa =================== */

type Step = { icon: React.ElementType; text: string };
type IntroInfo = { kicker: string; title: string; from: number; to: number; unit: string; steps: Step[]; tone: 'brand' | 'red' | 'green' };

export function stageInfo(phase: Phase, total: number): IntroInfo | null {
  switch (phase) {
    case 'ronda1':
      return {
        kicker: 'Ronda 1',
        title: 'La preselección',
        from: total,
        to: 100,
        unit: 'preseleccionados',
        tone: 'brand',
        steps: [
          { icon: Users, text: `La ruleta gira entre los ${total.toLocaleString('es')} metedores` },
          { icon: Dices, text: 'Cada giro saca a uno y lo pone en el tablero' },
          { icon: Sparkles, text: 'Cuando el tablero llega a 100, se cierra la ronda' },
        ],
      };
    case 'purga':
      return {
        kicker: 'Entre rondas',
        title: 'La purga',
        from: total,
        to: 100,
        unit: 'siguen en pie',
        tone: 'red',
        steps: [
          { icon: Skull, text: 'Los que no salieron en la ruleta se apagan' },
          { icon: Sparkles, text: 'Solo los 100 dorados siguen en carrera' },
        ],
      };
    case 'llaves':
      return {
        kicker: 'Ronda 2',
        title: 'Las llaves',
        from: 100,
        to: 10,
        unit: 'finalistas',
        tone: 'brand',
        steps: [
          { icon: Users, text: 'Los 100 se reparten al azar en 10 llaves de 10' },
          { icon: Dices, text: 'Cada llave tiene su propia ruleta' },
          { icon: Crown, text: 'El que sale en cada llave pasa a la gran final' },
        ],
      };
    case 'final':
      return {
        kicker: 'Ronda 3',
        title: 'La gran final',
        from: 10,
        to: 2,
        unit: 'finalistas',
        tone: 'red',
        steps: [
          { icon: Swords, text: 'Los 10 finalistas en una sola ruleta' },
          { icon: Skull, text: 'Donde cae la ruleta, ese queda eliminado' },
          { icon: Vote, text: 'Los 2 últimos pasan a la votación' },
        ],
      };
    case 'votacion':
      return {
        kicker: 'Ronda final',
        title: 'La votación',
        from: 2,
        to: 1,
        unit: 'ganador',
        tone: 'green',
        steps: [
          { icon: Phone, text: 'Llamamos a los 2 finalistas en vivo' },
          { icon: Vote, text: 'La comunidad vota por su favorito' },
          { icon: Trophy, text: `El más votado se lleva ${PREMIO.titulo}` },
        ],
      };
    default:
      return null;
  }
}

const TONES = {
  brand: { grad: 'from-[#ef1b77] to-[#ff9343]', glow: 'rgba(239,27,119,0.45)', text: 'text-[#ff9343]' },
  red: { grad: 'from-red-600 to-[#ef1b77]', glow: 'rgba(239,68,68,0.45)', text: 'text-red-400' },
  green: { grad: 'from-[#10B981] to-[#06B6D4]', glow: 'rgba(16,185,129,0.45)', text: 'text-[#34d399]' },
};

function useCountTo(from: number, to: number, delay: number, duration = 1600) {
  const [v, setV] = useState(from);
  useEffect(() => {
    let raf = 0;
    const t = setTimeout(() => {
      const t0 = performance.now();
      let last = from;
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const val = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (val !== last) {
          last = val;
          if (Math.abs(from - to) < 40 || val % 7 === 0) sfx.tick();
        }
        setV(val);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [from, to, delay, duration]);
  return v;
}

export function StageIntro({ info, onGo, sticker }: { info: IntroInfo; onGo: () => void; sticker?: StickerName }) {
  const tone = TONES[info.tone];
  const n = useCountTo(info.from, info.to, 900 + info.steps.length * 250);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      data-overlay
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-[#07070c]/95 px-4 backdrop-blur-md"
    >
      {/* rayos de fondo */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
        style={{ background: 'repeating-conic-gradient(from 0deg, #fff 0deg 6deg, transparent 6deg 18deg)' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
      />
      <div className="pointer-events-none absolute h-[600px] w-[600px] rounded-full blur-[140px]" style={{ background: tone.glow }} />
      {sticker && (
        <Sticker
          name={sticker}
          delay={0.9}
          rotate={sticker === 'pregunto' ? -10 : 8}
          className={`absolute bottom-6 right-6 hidden md:block ${sticker === 'pregunto' ? 'w-80' : 'w-52'}`}
        />
      )}

      <div className="relative flex max-w-3xl flex-col items-center text-center">
        <motion.p
          initial={{ y: -20, opacity: 0, letterSpacing: '1em' }}
          animate={{ y: 0, opacity: 1, letterSpacing: '0.4em' }}
          transition={{ duration: 0.6 }}
          className={`text-sm font-black uppercase ${tone.text}`}
        >
          {info.kicker}
        </motion.p>
        <motion.h2
          initial={{ scale: 2.4, opacity: 0, filter: 'blur(12px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.15 }}
          className={`bg-gradient-to-r ${tone.grad} bg-clip-text font-heading text-5xl font-black text-transparent sm:text-7xl`}
        >
          {info.title}
        </motion.h2>

        <div className="mt-8 flex w-full flex-col gap-3">
          {info.steps.map((s, i) => (
            <motion.div
              key={s.text}
              initial={{ x: i % 2 ? 80 : -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.25, type: 'spring', stiffness: 200, damping: 20 }}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-left"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tone.grad} text-white`}>
                <s.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-black text-zinc-500">{i + 1}</span>
              <span className="text-base font-semibold text-white sm:text-lg">{s.text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + info.steps.length * 0.25 }}
          className="mt-8 flex items-baseline gap-3"
        >
          <span className="font-heading text-2xl font-black text-zinc-600 line-through">{info.from.toLocaleString('es')}</span>
          <span className="text-zinc-600">→</span>
          <span className="font-heading text-7xl font-black tabular-nums text-white">{n.toLocaleString('es')}</span>
          <span className="text-sm font-bold text-zinc-400">{info.unit}</span>
        </motion.div>

        <motion.button
          data-main
          onClick={onGo}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: [1, 1.06, 1] }}
          transition={{ delay: 1.2 + info.steps.length * 0.25, scale: { repeat: Infinity, duration: 1.6, delay: 2 } }}
          className={`mt-8 rounded-3xl bg-gradient-to-r ${tone.grad} px-14 py-4 text-2xl font-black text-white shadow-2xl`}
          style={{ boxShadow: `0 0 50px ${tone.glow}` }}
        >
          ¡Vamos!
        </motion.button>
        <p className="mt-3 text-xs text-zinc-600">o presiona la barra espaciadora</p>
      </div>
    </motion.div>
  );
}

/* =================== Cuenta regresiva antes del ganador =================== */

export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    sfx.tick();
    if (n === 0) {
      const t = setTimeout(() => doneRef.current(), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-overlay
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black"
    >
      <p className="mb-6 text-sm font-black uppercase tracking-[0.5em] font-roca text-[#ff9343]">Redoble de tambores…</p>
      <motion.div
        key={n}
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="gradient-text font-heading text-[12rem] font-black leading-none"
      >
        {n === 0 ? '¡YA!' : n}
      </motion.div>
    </motion.div>
  );
}

/* =================== Partículas flotantes de fondo =================== */

export function FloatingParticles({ count = 26 }: { count?: number }) {
  // posiciones fijas por montaje (solo cliente)
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37.7) % 100,
        size: 3 + ((i * 7) % 6),
        dur: 14 + ((i * 5) % 12),
        delay: -((i * 3.3) % 20),
        color: i % 3 === 0 ? '#ff9343' : i % 3 === 1 ? '#ef1b77' : '#9333EA',
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: `${p.left}%`, bottom: -20, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}` }}
          animate={{ y: [0, -1400], opacity: [0, 0.7, 0.7, 0], x: [0, i % 2 ? 40 : -40, 0] }}
          transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

/* =================== Tarjeta que se inclina con el mouse + brillo =================== */

export function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 150, damping: 15 });

  return (
    <motion.div
      className={`relative [perspective:900px] ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="relative">
        {children}
        {/* brillo que barre la imagen */}
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          initial={false}
        >
          <motion.div
            className="absolute -inset-y-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ left: ['-40%', '140%'] }}
            transition={{ repeat: Infinity, duration: 2.8, repeatDelay: 2.5, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* =================== Barra espaciadora = botón principal =================== */

export function useMainHotkey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const visible = [...document.querySelectorAll<HTMLButtonElement>('[data-main]')].filter((b) => !b.disabled && b.offsetParent !== null);
      // primero las pantallas superpuestas (portada, presentación de etapa); si no hay, el botón de la etapa
      const inOverlay = visible.filter((b) => b.closest('[data-overlay]'));
      const target = (inOverlay.length ? inOverlay : visible).at(-1);
      if (target) {
        e.preventDefault();
        target.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/* =================== Destello de pantalla =================== */

export function ScreenFlash({ color, trigger }: { color: string; trigger: number }) {
  if (!trigger) return null;
  return (
    <motion.div
      key={trigger}
      className="pointer-events-none fixed inset-0 z-30"
      style={{ background: color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.45, 0] }}
      transition={{ duration: 0.7 }}
    />
  );
}

/* =================== Stickers de la marca =================== */

export const STICKERS = {
  pregunto: '/images/sorteo/stickers/mosca-pregunto.png',
  aplaude: '/images/sorteo/stickers/mosca-aplaude.png',
  pulgar: '/images/sorteo/stickers/mosca-pulgar.png',
  baila: '/images/sorteo/stickers/mosca-baila.png',
} as const;

export type StickerName = keyof typeof STICKERS;

/** Sticker que entra con rebote y queda moviéndose un poco */
export function Sticker({
  name,
  className = '',
  rotate = -8,
  delay = 0,
  wiggle = true,
}: {
  name: StickerName;
  className?: string;
  rotate?: number;
  delay?: number;
  wiggle?: boolean;
}) {
  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      initial={{ scale: 0, rotate: rotate - 40, opacity: 0 }}
      animate={{ scale: 1, rotate, opacity: 1 }}
      exit={{ scale: 0, rotate: rotate + 40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay }}
    >
      <motion.img
        src={STICKERS[name]}
        alt=""
        draggable={false}
        className="h-full w-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.55)]"
        animate={wiggle ? { rotate: [0, 4, -4, 0], y: [0, -6, 0] } : undefined}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: delay + 0.5 }}
      />
    </motion.div>
  );
}

export function stickerFor(phase: Phase): StickerName {
  if (phase === 'purga' || phase === 'final') return 'pregunto';
  if (phase === 'llaves') return 'pulgar';
  if (phase === 'votacion') return 'baila';
  return 'aplaude';
}

/* =================== Portada de bienvenida (pantalla del stream) =================== */

export function Splash({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      data-overlay
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      transition={{ duration: 0.6 }}
    >
      <motion.img
        src="/images/sorteo/portada-en-vivo.jpg"
        alt="Metele Nomás en vivo"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.15 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-4 pb-10 text-center">
        <div className="absolute inset-x-[8%] bottom-4 top-0 -z-0 rounded-[2.5rem] bg-black/55 backdrop-blur-md" />
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative mt-6 font-roca text-sm font-bold uppercase text-[#ff9343]"
        >
          Hoy en vivo
        </motion.p>
        <motion.h1
          initial={{ y: 40, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 140, damping: 14 }}
          className="relative font-heading text-5xl font-black text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)] sm:text-7xl"
        >
          Gran Sorteo de <span className="gradient-text">{PREMIO.titulo}</span>
        </motion.h1>
        <motion.button
          data-main
          onClick={onEnter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, scale: [1, 1.06, 1] }}
          transition={{ delay: 1.2, scale: { repeat: Infinity, duration: 1.6, delay: 2 } }}
          className="relative mt-2 rounded-3xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-12 py-4 text-xl font-black text-white shadow-[0_0_50px_rgba(239,27,119,0.6)]"
        >
          Entrar al sorteo
        </motion.button>
        <p className="relative text-xs text-white/50">o presiona la barra espaciadora</p>
      </div>
    </motion.div>
  );
}
