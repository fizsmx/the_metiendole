'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Crown, Skull, Sparkles, Swords } from 'lucide-react';
import Wheel, { WheelItem } from './Wheel';
import Confetti from './Confetti';
import { ScreenFlash, Sticker } from './Fx';
import PhoneActions from './PhoneActions';
import { FINALISTS, Participant, SorteoState, displayName, nowIso, randomInt, sfx, shownPhone, whoIs } from './lib';

type Props = {
  state: SorteoState;
  update: (fn: (s: SorteoState) => SorteoState) => void;
  byId: Map<string, Participant>;
  reveal: boolean;
};

const toItems = (ids: string[], byId: Map<string, Participant>, reveal: boolean): WheelItem[] =>
  ids.map((id) => {
    const p = byId.get(id);
    return { id, label: displayName(p), sub: shownPhone(p, reveal) };
  });

/* =================== Llaves: 100 → 10 =================== */

export function Brackets({ state, update, byId, reveal }: Props) {
  const current = state.groupWinners.findIndex((w) => w === null);
  const allDone = current === -1;
  const group = useMemo(() => (allDone ? [] : state.groups[current]), [allDone, state.groups, current]);

  const [spinTo, setSpinTo] = useState<{ index: number; nonce: number } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);

  const items = useMemo(() => toItems(group, byId, reveal), [group, byId, reveal]);

  const spin = () => {
    if (spinning || allDone) return;
    setLanded(null);
    setSpinning(true);
    setSpinTo({ index: randomInt(group.length), nonce: Date.now() });
  };

  const onEnd = (index: number) => {
    setSpinning(false);
    setLanded(index);
    sfx.pick();
    setBurst((b) => b + 1);
    const winnerId = group[index];
    // pequeña pausa para el festejo antes de pasar a la siguiente llave
    setTimeout(() => {
      setLanded(null);
      update((s) => {
        const gw = s.groupWinners.slice();
        gw[current] = winnerId;
        return { ...s, groupWinners: gw, log: [...s.log, { at: nowIso(), msg: `Llave ${current + 1}: ganó ${winnerId.slice(-3)}` }] };
      });
    }, 2600);
  };

  const landedP = landed !== null ? byId.get(group[landed]) : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <section className="flex flex-col items-center gap-5 text-center">
        <Confetti burst={burst} duration={3000} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] font-roca text-[#ff9343]">Ronda 2 · Eliminatoria por llaves</p>
          <h2 className="font-heading text-3xl font-black text-white sm:text-4xl">
            {allDone ? '¡Tenemos a los 10 finalistas!' : (
              <>Llave <span className="gradient-text">{current + 1}</span> de {state.groups.length}</>
            )}
          </h2>
          {!allDone && <p className="mt-1 text-sm text-zinc-400">De estos 10, solo 1 pasa a la gran final</p>}
        </div>

        {!allDone ? (
          <>
            <div className="relative w-full">
              <Wheel key={current} items={items} spinTo={spinTo} onSpinEnd={onEnd} highlight={landed} size={480} />
              <AnimatePresence>
                {landedP && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-4 z-30 mx-auto w-fit rounded-2xl border border-[#ff9343] bg-black/85 px-6 py-3 shadow-[0_0_40px_rgba(255,147,67,0.5)]"
                  >
                    <Sticker name="pulgar" rotate={-12} className="absolute -left-20 -top-14 w-24" />
                    <div className="text-xs font-bold uppercase tracking-widest text-[#ff9343]">Pasa a la final</div>
                    <div className="font-heading text-2xl font-black text-white">{displayName(landedP)}</div>
                    <div className="font-mono text-sm text-zinc-400">{shownPhone(landedP, reveal)}</div>
                    {whoIs(landedP) && <div className="max-w-xs truncate text-xs text-zinc-400">{whoIs(landedP)}</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              data-main
              onClick={spin}
              disabled={spinning || landed !== null}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-12 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.03] disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5" /> {spinning ? 'Girando…' : `Girar llave ${current + 1}`}
            </button>
          </>
        ) : (
          <>
            <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
              {state.groupWinners.map((id, i) => {
                const p = byId.get(id!);
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="rounded-2xl border border-[#ff9343]/40 bg-gradient-to-b from-[#ff9343]/15 to-transparent p-3"
                  >
                    <Crown className="mx-auto mb-1 h-5 w-5 text-[#ff9343]" />
                    <div className="truncate text-sm font-black text-white">{displayName(p)}</div>
                    <div className="truncate font-mono text-[10px] text-zinc-400">{shownPhone(p, reveal)}</div>
                  </motion.div>
                );
              })}
            </div>
            <button
              data-main
              onClick={() =>
                update((s) => ({
                  ...s,
                  phase: 'final',
                  finalists10: s.groupWinners.filter((w): w is string => !!w),
                  eliminated: [],
                  log: [...s.log, { at: nowIso(), msg: 'Inicio de la gran final (10 → 2)' }],
                }))
              }
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-10 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.03]"
            >
              <Swords className="h-5 w-5" /> Empezar la gran final
            </button>
          </>
        )}
      </section>

      {/* Cuadro de llaves */}
      <section className="grid grid-cols-2 gap-2.5 content-start">
        {state.groups.map((g, gi) => {
          const winner = state.groupWinners[gi];
          const isCurrent = gi === current;
          return (
            <div
              key={gi}
              className={`rounded-2xl border p-2.5 transition ${
                isCurrent
                  ? 'border-[#ef1b77] bg-[#ef1b77]/10 shadow-[0_0_24px_rgba(239,27,119,0.3)]'
                  : winner
                    ? 'border-[#ff9343]/30 bg-white/[0.02]'
                    : 'border-[#2a2a3e] bg-white/[0.02] opacity-70'
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Llave {gi + 1}</span>
                {winner && <Crown className="h-3.5 w-3.5 text-[#ff9343]" />}
              </div>
              {winner ? (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-lg bg-[#ff9343]/15 px-2 py-1.5">
                  <div className="truncate text-xs font-black text-white">{displayName(byId.get(winner))}</div>
                  <div className="font-mono text-[10px] text-zinc-400">{shownPhone(byId.get(winner), reveal)}</div>
                </motion.div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {g.map((id) => (
                    <span key={id} className="max-w-[48%] truncate rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-300">
                      {displayName(byId.get(id))}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

/* =================== Gran final: 10 → 2 =================== */

export function FinalElimination({ state, update, byId, reveal }: Props) {
  const remaining = useMemo(
    () => state.finalists10.filter((id) => !state.eliminated.includes(id)),
    [state.finalists10, state.eliminated],
  );
  const done = remaining.length <= FINALISTS;

  const [spinTo, setSpinTo] = useState<{ index: number; nonce: number } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const items = useMemo(() => toItems(remaining, byId, reveal), [remaining, byId, reveal]);

  const spin = () => {
    if (spinning || done) return;
    setLanded(null);
    setSpinning(true);
    setSpinTo({ index: randomInt(remaining.length), nonce: Date.now() });
  };

  const onEnd = (index: number) => {
    setSpinning(false);
    setLanded(index);
    setFlash((f) => f + 1);
    sfx.eliminate();
    const out = remaining[index];
    const place = remaining.length;
    setTimeout(() => {
      setLanded(null);
      update((s) => ({
        ...s,
        eliminated: [...s.eliminated, out],
        log: [...s.log, { at: nowIso(), msg: `Final: eliminado ${out.slice(-3)} (puesto ${place})` }],
      }));
    }, 2600);
  };

  const landedP = landed !== null ? byId.get(remaining[landed]) : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <section className="flex flex-col items-center gap-5 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] font-roca text-red-400">Ronda 3 · Gran final</p>
          <h2 className="font-heading text-3xl font-black text-white sm:text-4xl">
            {done ? (
              <>¡Los <span className="gradient-text">2 finalistas</span>!</>
            ) : (
              <>Quedan <span className="gradient-text">{remaining.length}</span> · ¿quién se va?</>
            )}
          </h2>
          {!done && <p className="mt-1 text-sm text-zinc-400">Donde caiga la ruleta, ese queda eliminado</p>}
        </div>

        {!done ? (
          <>
            <ScreenFlash color="#ef4444" trigger={flash} />
            <motion.div
              key={flash}
              className="relative w-full"
              animate={flash ? { x: [0, -14, 12, -9, 6, -3, 0] } : undefined}
              transition={{ duration: 0.5 }}
            >
              <Wheel items={items} spinTo={spinTo} onSpinEnd={onEnd} highlight={landed} size={480} />
              <AnimatePresence>
                {landedP && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.4, rotate: -4 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-4 z-30 mx-auto w-fit rounded-2xl border border-red-500 bg-black/90 px-6 py-3 shadow-[0_0_40px_rgba(239,68,68,0.5)]"
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-widest text-red-400">
                      <Skull className="h-3.5 w-3.5" /> Eliminado · puesto {remaining.length}
                    </div>
                    <div className="font-heading text-2xl font-black text-white line-through decoration-red-500 decoration-4">
                      {displayName(landedP)}
                    </div>
                    <Sticker name="pregunto" rotate={8} wiggle={false} className="absolute -right-60 top-1/2 w-56 -translate-y-1/2" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <button
              data-main
              onClick={spin}
              disabled={spinning || landed !== null}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-[#ef1b77] px-12 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.03] disabled:opacity-50"
            >
              <Skull className="h-5 w-5" /> {spinning ? 'Girando…' : 'Girar para eliminar'}
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {remaining.map((id, i) => {
                const p = byId.get(id);
                return (
                  <React.Fragment key={id}>
                    {i === 1 && <span className="font-heading text-5xl font-black text-[#ef1b77]">VS</span>}
                    <motion.div
                      initial={{ opacity: 0, x: i === 0 ? -60 : 60 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="min-w-[220px] rounded-3xl border border-[#ff9343]/50 bg-gradient-to-b from-[#ff9343]/20 to-transparent p-6"
                    >
                      <Crown className="mx-auto mb-2 h-8 w-8 text-[#ff9343]" />
                      <div className="font-heading text-2xl font-black text-white">{displayName(p)}</div>
                      <div className="font-mono text-sm text-zinc-400">{shownPhone(p, reveal)}</div>
                      {whoIs(p) && <div className="mt-1 max-w-[240px] truncate text-xs text-zinc-400">{whoIs(p)}</div>}
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>
            <button
              data-main
              onClick={() =>
                update((s) => ({
                  ...s,
                  phase: 'votacion',
                  finalists2: remaining,
                  log: [...s.log, { at: nowIso(), msg: 'Finalistas definidos, inicia la votación' }],
                }))
              }
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-10 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.03]"
            >
              Ir a la votación <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </section>

      {/* Tabla de la final */}
      <section className="flex flex-col gap-2">
        {state.finalists10.map((id) => {
          const p = byId.get(id);
          const outIdx = state.eliminated.indexOf(id);
          const out = outIdx !== -1;
          const place = out ? state.finalists10.length - outIdx : null;
          return (
            <motion.div
              layout
              key={id}
              className={`flex items-center justify-between rounded-xl border px-4 py-1.5 ${
                out ? 'border-red-900/40 bg-red-950/20 [&>div:first-child]:opacity-50' : 'border-[#2a2a3e] bg-white/[0.03]'
              }`}
            >
              <div className="min-w-0 text-left">
                <div className={`truncate text-sm font-bold ${out ? 'text-zinc-500 line-through' : 'text-white'}`}>{displayName(p)}</div>
                <div className="truncate text-[11px] text-zinc-500">
                  <span className="font-mono">{shownPhone(p, reveal)}</span>
                  {whoIs(p) && <> · {whoIs(p)}</>}
                </div>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-3">
                {p && <PhoneActions phone={p.phone} compact />}
                {out ? (
                  <span className="flex w-16 items-center justify-end gap-1 text-xs font-bold text-red-400">
                    <Skull className="h-3.5 w-3.5" /> #{place}
                  </span>
                ) : (
                  <span className="w-16 text-right text-xs font-bold text-[#10B981]">En juego</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
