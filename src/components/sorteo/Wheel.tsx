'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WHEEL_COLORS, easeOutQuart, randomInt, sfx } from './lib';

export type WheelItem = { id: string; label: string; sub?: string };

type Props = {
  items: WheelItem[];
  /** Cuando cambia `nonce`, la ruleta gira hasta caer en `index` (decidido de antemano con azar seguro). */
  spinTo: { index: number; nonce: number } | null;
  onSpinEnd?: (index: number) => void;
  highlight?: number | null;
  size?: number;
};

const R = 190;
const C = 200;

function polar(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
}

function slicePath(start: number, end: number) {
  const a = polar(start, R);
  const b = polar(end, R);
  const large = end - start > 180 ? 1 : 0;
  return `M ${C} ${C} L ${a.x} ${a.y} A ${R} ${R} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export default function Wheel({ items, spinTo, onSpinEnd, highlight = null, size = 440 }: Props) {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const frame = useRef<number | null>(null);
  const lastNonce = useRef<number | null>(null);
  const onEndRef = useRef(onSpinEnd);
  useEffect(() => {
    onEndRef.current = onSpinEnd;
  }, [onSpinEnd]);

  const n = Math.max(items.length, 1);
  const seg = 360 / n;

  useEffect(() => {
    if (!spinTo || spinTo.nonce === lastNonce.current) return;
    lastNonce.current = spinTo.nonce;

    const from = rotationRef.current;
    // Punto aleatorio dentro del segmento ganador (sin caer en el borde)
    const jitter = seg * (0.15 + (randomInt(1000) / 1000) * 0.7);
    const targetMod = (((360 - (spinTo.index * seg + jitter)) % 360) + 360) % 360;
    const currentMod = ((from % 360) + 360) % 360;
    const delta = ((targetMod - currentMod + 360) % 360) + 360 * (6 + randomInt(3));
    const duration = 5200 + randomInt(1200);
    const t0 = performance.now();
    let lastSeg = Math.floor(from / seg);

    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const r = from + delta * easeOutQuart(p);
      rotationRef.current = r;
      setRotation(r);
      const s = Math.floor(r / seg);
      if (s !== lastSeg) {
        lastSeg = s;
        sfx.tick();
      }
      if (p < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        frame.current = null;
        onEndRef.current?.(spinTo.index);
      }
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [spinTo, seg]);

  const labelLen = n <= 4 ? 18 : n <= 8 ? 15 : 13;

  return (
    <div className="relative mx-auto" style={{ width: `min(${size}px, 100%, 62vh)`, aspectRatio: '1 / 1' }}>
      {/* halo */}
      <div className="absolute inset-[-6%] rounded-full bg-[radial-gradient(circle,rgba(239,27,119,0.35),transparent_65%)] blur-2xl" />
      {/* puntero */}
      <div className="absolute left-1/2 -top-3 z-20 -translate-x-1/2 drop-shadow-[0_4px_12px_rgba(255,147,67,0.8)]">
        <svg width="44" height="52" viewBox="0 0 44 52">
          <path d="M22 50 L4 10 Q22 -6 40 10 Z" fill="#F7C948" stroke="#0a0a0f" strokeWidth="3" />
        </svg>
      </div>

      <svg viewBox="0 0 400 400" className="relative z-10 h-full w-full">
        <circle cx={C} cy={C} r={R + 8} fill="#0a0a0f" stroke="url(#rim)" strokeWidth="8" />
        <defs>
          <linearGradient id="rim" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ef1b77" />
            <stop offset="100%" stopColor="#ff9343" />
          </linearGradient>
        </defs>
        <g transform={`rotate(${rotation} ${C} ${C})`}>
          {items.map((it, i) => {
            const start = i * seg;
            const mid = start + seg / 2;
            const isHi = highlight === i;
            const pos = polar(mid, R * 0.6);
            return (
              <g key={it.id}>
                <path
                  d={n === 1 ? `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R} Z` : slicePath(start, start + seg)}
                  fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
                  stroke="#0a0a0f"
                  strokeWidth="2"
                  opacity={highlight === null || isHi ? 1 : 0.35}
                />
                <g transform={`rotate(${mid - 90} ${pos.x} ${pos.y})`}>
                  <text
                    x={pos.x}
                    y={pos.y + (it.sub ? -2 : 4)}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={n <= 6 ? 15 : 12}
                    fontWeight={800}
                    style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.45)', strokeWidth: 3 }}
                  >
                    {truncate(it.label, labelLen)}
                  </text>
                  {it.sub && (
                    <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={9} fontWeight={600}>
                      {it.sub}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>
        <circle cx={C} cy={C} r={34} fill="#0a0a0f" stroke="url(#rim)" strokeWidth="5" />
      </svg>
      {/* logo al centro, no gira */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/sorteo/logo-perfil.png"
        alt=""
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[14%] w-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
    </div>
  );
}
