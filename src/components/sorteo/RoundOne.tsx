'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from './Confetti';
import { Sticker } from './Fx';
import { FastForward, Pause, Play, Skull, Sparkles, ChevronRight } from 'lucide-react';
import {
  GROUPS,
  Participant,
  SorteoState,
  TARGET_FIRST_ROUND,
  displayName,
  nowIso,
  whoIs,
  randomInt,
  sfx,
  shownPhone,
  shuffle,
} from './lib';

type Props = {
  state: SorteoState;
  update: (fn: (s: SorteoState) => SorteoState) => void;
  byId: Map<string, Participant>;
  poolIds: string[];
  reveal: boolean;
};

// Más dramático al inicio, más rápido después
const rollDuration = (i: number) => (i < 3 ? 2600 : i < 10 ? 1300 : i < 30 ? 600 : 260);

export default function RoundOne({ state, update, byId, poolIds, reveal }: Props) {
  const [rolling, setRolling] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const revealedRef = useRef(state.revealed100);
  const autoRef = useRef(auto);
  const cancelled = useRef(false);
  useEffect(() => {
    revealedRef.current = state.revealed100;
  }, [state.revealed100]);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  const done = state.revealed100 >= state.top100.length;
  const autoOn = auto && !done;
  useEffect(() => {
    autoRef.current = autoOn;
  }, [autoOn]);
  const selected = useMemo(() => new Set(state.top100.slice(0, state.revealed100)), [state.top100, state.revealed100]);

  const revealNext = useCallback(async () => {
    const i = revealedRef.current;
    if (i >= state.top100.length) return;
    setBusy(true);
    const dur = rollDuration(i);
    const t0 = performance.now();
    // rodillo que se va frenando
    while (performance.now() - t0 < dur && !cancelled.current) {
      setRolling(poolIds[randomInt(poolIds.length)]);
      const p = (performance.now() - t0) / dur;
      await new Promise((r) => setTimeout(r, 35 + p * p * 160));
    }
    if (cancelled.current) return;
    const id = state.top100[i];
    setRolling(id);
    sfx.pick();
    update((s) => ({
      ...s,
      revealed100: i + 1,
      log: i < 5 || i + 1 === s.top100.length ? [...s.log, { at: nowIso(), msg: `Ronda 1: salió #${i + 1}` }] : s.log,
    }));
    revealedRef.current = i + 1;
    setFlashKey((k) => k + 1);
    if ([10, 25, 50, 75, 100].includes(i + 1)) {
      setMilestone(i + 1);
      setBurst((b) => b + 1);
      sfx.fanfare();
      setTimeout(() => setMilestone(null), 2200);
    }
    setBusy(false);
  }, [poolIds, state.top100, update]);

  // modo automático
  useEffect(() => {
    if (!autoOn || busy) return;
    const t = setTimeout(() => autoRef.current && void revealNext(), revealedRef.current < 10 ? 700 : 120);
    return () => clearTimeout(t);
  }, [autoOn, busy, revealNext]);

  const revealAll = () => {
    setAuto(false);
    setRolling(state.top100[state.top100.length - 1] ?? null);
    sfx.fanfare();
    update((s) => ({
      ...s,
      revealed100: s.top100.length,
      log: [...s.log, { at: nowIso(), msg: 'Ronda 1: se revelaron todos los preseleccionados' }],
    }));
  };

  const rollingP = rolling ? byId.get(rolling) : undefined;
  const last = state.revealed100 > 0 ? byId.get(state.top100[state.revealed100 - 1]) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Rodillo */}
      <section className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-[#2a2a3e] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f18] p-6 text-center shadow-[0_0_60px_rgba(239,27,119,0.15)]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] font-roca text-[#ff9343]">Ronda 1 · Preselección</p>
          <p className="mt-1 text-sm text-zinc-400">
            La ruleta gira entre <b className="text-white">{poolIds.length.toLocaleString('es')}</b> metedores
          </p>

          <Confetti burst={burst} duration={3500} />
          <AnimatePresence>
            {milestone && (
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.6, opacity: 0 }}
                className="pointer-events-none fixed left-1/2 top-1/3 z-40 -translate-x-1/2 rounded-3xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-10 py-5 font-heading text-4xl font-black text-white shadow-[0_0_60px_rgba(239,27,119,0.6)]"
              >
                {milestone === 100 ? '¡Tablero completo!' : `¡Ya van ${milestone}!`}
                <Sticker name="aplaude" rotate={12} className="absolute -right-20 -top-16 w-28" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative my-6 rounded-2xl border-2 border-[#ef1b77]/60 bg-black/50 px-4 py-8">
            {flashKey > 0 && !busy && (
              <motion.div
                key={flashKey}
                className="pointer-events-none absolute -inset-1 rounded-2xl border-4 border-[#F7C948]"
                initial={{ opacity: 1, scale: 0.95 }}
                animate={{ opacity: 0, scale: 1.12 }}
                transition={{ duration: 0.8 }}
              />
            )}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/80 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent" />
            <motion.div
              key={busy ? 'rolling' : `landed-${state.revealed100}`}
              initial={busy ? false : { scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
              className={`font-heading text-3xl font-black sm:text-4xl ${busy ? 'text-white/90 blur-[0.4px]' : 'gradient-text'}`}
            >
              {rollingP ? displayName(rollingP) : '¿Quién sale?'}
            </motion.div>
            <div className="mt-2 font-mono text-lg text-zinc-400">{rollingP ? shownPhone(rollingP, reveal) : '+591 •••• ••••'}</div>
            {!busy && rollingP && whoIs(rollingP) && <div className="mt-1 truncate text-sm text-zinc-400">{whoIs(rollingP)}</div>}
          </div>

          <div className="mb-2 flex items-end justify-center gap-2">
            <span className="font-heading text-6xl font-black text-white tabular-nums">{state.revealed100}</span>
            <span className="pb-2 text-xl font-bold text-zinc-500">/ {TARGET_FIRST_ROUND}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ef1b77] to-[#ff9343]"
              animate={{ width: `${(state.revealed100 / state.top100.length) * 100}%` }}
            />
          </div>

          {!done ? (
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button
                data-main
                onClick={() => void revealNext()}
                disabled={busy || autoOn}
                className="col-span-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-6 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" /> {state.revealed100 === 0 ? '¡Girar!' : 'Sacar siguiente'}
              </button>
              <button
                onClick={() => setAuto((a) => !a)}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[#2a2a3e] bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                {autoOn ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoOn ? 'Pausar' : 'Automático'}
              </button>
              <button
                onClick={revealAll}
                disabled={busy}
                className="flex items-center justify-center gap-1 rounded-xl border border-[#2a2a3e] bg-white/5 px-3 py-3 text-xs font-bold text-zinc-300 hover:bg-white/10 disabled:opacity-50"
              >
                <FastForward className="h-4 w-4" /> Todos
              </button>
            </div>
          ) : (
            <button
              data-main
              onClick={() => update((s) => ({ ...s, phase: 'purga', log: [...s.log, { at: nowIso(), msg: 'Inicio de la purga' }] }))}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-[#ef1b77] px-6 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.02]"
            >
              <Skull className="h-5 w-5" /> Eliminar al resto
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {last && (
            <motion.div
              key={state.revealed100}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-2xl border border-[#ff9343]/40 bg-[#ff9343]/10 px-4 py-3 text-center text-sm"
            >
              Preseleccionado #{state.revealed100}: <b className="text-white">{displayName(last)}</b>{' '}
              <span className="font-mono text-zinc-400">{shownPhone(last, reveal)}</span>
              {whoIs(last) && <span className="block truncate text-xs text-zinc-400">{whoIs(last)}</span>}
            </motion.div>
          )}
        </AnimatePresence>

        <PoolWall poolIds={poolIds} selected={selected} purgeOrder={null} purged={0} />
      </section>

      {/* Tablero de 100 */}
      <section className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 xl:grid-cols-10 content-start">
        {state.top100.map((id, i) => {
          const shown = i < state.revealed100;
          const p = byId.get(id);
          return (
            <div
              key={i}
              className={`relative flex min-h-[48px] flex-col justify-center overflow-hidden rounded-lg border px-1.5 py-1 text-center transition-colors ${
                shown ? 'border-[#ef1b77]/50 bg-gradient-to-br from-[#ef1b77]/30 to-[#ff9343]/20 backdrop-blur-sm' : 'border-[#2a2a3e] bg-black/50 backdrop-blur-sm'
              }`}
            >
              <span className="absolute left-1 top-0.5 text-[9px] font-bold text-zinc-600">{i + 1}</span>
              {shown ? (
                <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
                  <div className="truncate text-[11px] font-bold leading-tight text-white" title={whoIs(p)}>{displayName(p)}</div>
                  <div className="truncate font-mono text-[9px] text-zinc-400">{shownPhone(p, reveal)}</div>
                </motion.div>
              ) : (
                <span className="text-lg font-black text-zinc-800">?</span>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

/* ---------- Muro con todos los participantes ---------- */

export function PoolWall({
  poolIds,
  selected,
  purgeOrder,
  purged,
  big = false,
}: {
  poolIds: string[];
  selected: Set<string>;
  purgeOrder: Map<string, number> | null;
  purged: number;
  big?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#2a2a3e] bg-black/30 p-3">
      <div className={`flex flex-wrap gap-[3px] ${big ? 'justify-center' : ''}`}>
        {poolIds.map((id) => {
          const isSel = selected.has(id);
          const out = purgeOrder ? (purgeOrder.get(id) ?? -1) < purged && !isSel : false;
          return (
            <span
              key={id}
              className={`${big ? 'h-3 w-3' : 'h-1.5 w-1.5'} rounded-[2px] transition-all duration-500 ${
                isSel
                  ? 'bg-[#ff9343] shadow-[0_0_6px_#ff9343]'
                  : out
                    ? 'scale-50 bg-red-900/30'
                    : 'bg-[#ef1b77]/40'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Purga: se eliminan todos los que no salieron ---------- */

export function Purge({ state, update, byId, poolIds }: Props) {
  const selected = useMemo(() => new Set(state.top100), [state.top100]);
  const order = useMemo(() => {
    const rest = shuffle(poolIds.filter((id) => !selected.has(id)));
    return new Map(rest.map((id, i) => [id, i]));
  }, [poolIds, selected]);
  const totalOut = order.size;
  const [purged, setPurged] = useState(0);
  const [running, setRunning] = useState(false);
  const finished = purged >= totalOut;

  const run = () => {
    if (running) return;
    setRunning(true);
    sfx.eliminate();
    const t0 = performance.now();
    const dur = 5000;
    let lastTick = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.round(totalOut * (1 - Math.pow(1 - p, 2)));
      setPurged(v);
      if (t - lastTick > 90) {
        lastTick = t;
        sfx.tick();
      }
      if (p < 1) requestAnimationFrame(step);
      else {
        sfx.fanfare();
        update((s) => ({ ...s, log: [...s.log, { at: nowIso(), msg: `Purga: ${totalOut} eliminados, quedan ${s.top100.length}` }] }));
      }
    };
    requestAnimationFrame(step);
  };

  const remaining = poolIds.length - purged;

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] font-roca text-red-400">La purga</p>
      <h2 className="relative font-heading text-4xl font-black text-white sm:text-5xl">
        Solo <span className="gradient-text">{state.top100.length}</span> siguen en pie
        {finished && <Sticker name="baila" rotate={8} className="absolute -right-36 -top-10 hidden w-28 md:block" />}
      </h2>
      <div className="flex items-baseline gap-3">
        <motion.span key={remaining} className="font-heading text-7xl font-black tabular-nums text-white">
          {remaining.toLocaleString('es')}
        </motion.span>
        <span className="text-lg font-bold text-zinc-500">metedores en juego</span>
      </div>

      <PoolWall poolIds={poolIds} selected={selected} purgeOrder={order} purged={purged} big />

      {!finished ? (
        <button
          data-main
          onClick={run}
          disabled={running}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-[#ef1b77] px-10 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.03] disabled:opacity-60"
        >
          <Skull className="h-5 w-5" /> {running ? 'Eliminando…' : `Eliminar a ${totalOut.toLocaleString('es')}`}
        </button>
      ) : (
        <>
          <div className="flex max-w-4xl flex-wrap justify-center gap-1.5">
            {state.top100.map((id) => {
              const p = byId.get(id);
              return (
                <span key={id} className="rounded-full border border-[#ff9343]/30 bg-[#ff9343]/10 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {displayName(p)}
                </span>
              );
            })}
          </div>
          <button
            data-main
            onClick={() =>
              update((s) => {
                const mixed = shuffle(s.top100);
                const size = Math.ceil(mixed.length / GROUPS);
                const groups = Array.from({ length: GROUPS }, (_, g) => mixed.slice(g * size, g * size + size)).filter((g) => g.length);
                return {
                  ...s,
                  phase: 'llaves',
                  groups,
                  groupWinners: groups.map(() => null),
                  log: [...s.log, { at: nowIso(), msg: 'Se armaron 10 llaves de 10 al azar' }],
                };
              })
            }
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-10 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.03]"
          >
            Armar las 10 llaves <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
