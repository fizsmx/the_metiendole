'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Crown, Download, Eye, EyeOff, Phone, Trophy } from 'lucide-react';
import Confetti from './Confetti';
import { PREMIO, PrizeImage } from './premio';
import { Sticker, TiltCard } from './Fx';
import { Participant, SorteoState, displayName, formatPhone, maskPhone, nowIso, sfx, shownPhone, whoIs } from './lib';
import LivePoll, { leaderOf } from './LivePoll';

type Props = {
  state: SorteoState;
  update: (fn: (s: SorteoState) => SorteoState) => void;
  byId: Map<string, Participant>;
  reveal: boolean;
};

/* =================== Votación: se espera el resultado =================== */

export function Voting({ state, update, byId }: Props) {
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const copy = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(phone);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* sin permiso de portapapeles */
    }
  };

  const webPoll = !!state.pollId;
  const leader = leaderOf(state);

  const declare = (id: string) => {
    if (confirming !== id) {
      setConfirming(id);
      return;
    }
    update((s) => ({
      ...s,
      phase: 'ganador',
      winner: id,
      log: [...s.log, { at: nowIso(), msg: `Ganador por votación: ${id.slice(-3)}` }],
    }));
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] font-roca text-[#ff9343]">Ronda final · Votación</p>
        <h2 className="font-heading text-4xl font-black text-white sm:text-5xl">
          ¡A <span className="gradient-text">votar</span>, metedores!
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Llamamos a los dos finalistas y la comunidad decide quién se lleva <b className="text-white">{PREMIO.titulo}</b>
        </p>
      </div>

      <div className="grid w-full items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        {state.finalists2.map((id, i) => {
          const p = byId.get(id);
          const isShown = !!shown[id];
          return (
            <React.Fragment key={id}>
              {i === 1 && (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="font-heading text-6xl font-black text-[#ef1b77] drop-shadow-[0_0_20px_rgba(239,27,119,0.7)]"
                >
                  VS
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="rounded-3xl border border-[#2a2a3e] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f18] p-6 shadow-[0_0_50px_rgba(239,27,119,0.12)]"
              >
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ef1b77] to-[#ff9343] font-heading text-3xl font-black text-white">
                  {i === 0 ? 'A' : 'B'}
                </div>
                <div className="font-heading text-3xl font-black text-white">{displayName(p)}</div>
                <div className="mt-1 font-mono text-xl text-zinc-300">{p ? (isShown ? formatPhone(p.phone) : maskPhone(p.phone)) : ''}</div>
                {whoIs(p) && <div className="mx-auto mt-1 max-w-xs truncate text-sm text-zinc-400">{whoIs(p)}</div>}
                {leader === id && (
                  <div className="mx-auto mt-2 w-fit rounded-full bg-[#ff9343]/20 px-3 py-1 text-xs font-black uppercase text-[#ffb37a]">Va ganando</div>
                )}

                {p && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setShown((s) => ({ ...s, [id]: !s[id] }))}
                      className="flex items-center gap-1.5 rounded-xl border border-[#2a2a3e] bg-white/5 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-white/10"
                    >
                      {isShown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {isShown ? 'Ocultar' : 'Ver número'}
                    </button>
                    <a
                      href={`tel:${p.phone}`}
                      className="flex items-center gap-1.5 rounded-xl bg-[#10B981] px-3 py-2 text-xs font-bold text-white hover:brightness-110"
                    >
                      <Phone className="h-3.5 w-3.5" /> Llamar
                    </a>
                    <button
                      onClick={() => void copy(p.phone)}
                      className="flex items-center gap-1.5 rounded-xl border border-[#2a2a3e] bg-white/5 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-white/10"
                    >
                      {copied === p.phone ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copiar
                    </button>
                  </div>
                )}

                <div className="mt-5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {webPoll ? 'Votos (en vivo desde la web)' : 'Votos (opcional)'}
                  </label>
                  <input
                    inputMode="numeric"
                    readOnly={webPoll}
                    value={state.votes[id] ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 7);
                      update((s) => ({ ...s, votes: { ...s.votes, [id]: v } }));
                    }}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-[#2a2a3e] bg-black/40 px-3 py-2 text-center font-heading text-2xl font-black text-white outline-none focus:border-[#ef1b77]"
                  />
                </div>

                <button
                  onClick={() => declare(id)}
                  onBlur={() => setConfirming((c) => (c === id ? null : c))}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-black text-white transition ${
                    confirming === id
                      ? 'animate-pulse bg-gradient-to-r from-[#10B981] to-[#06B6D4]'
                      : 'bg-gradient-to-r from-[#ef1b77] to-[#ff9343] hover:scale-[1.02]'
                  }`}
                >
                  <Trophy className="h-5 w-5" /> {confirming === id ? 'Toca otra vez para confirmar' : 'Ganó la votación'}
                </button>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      <LivePoll state={state} update={update} />

      <VoteBar state={state} byId={byId} />

      <p className="text-xs text-zinc-500">
        {webPoll
          ? 'Cuando cierres la votación, marca al más votado como ganador (se pide confirmar dos veces).'
          : 'Esperando el resultado de la votación. Cuando lo tengas, marca al ganador (se pide confirmar dos veces).'}
      </p>
    </div>
  );
}

function VoteBar({ state, byId }: { state: SorteoState; byId: Map<string, Participant> }) {
  const [a, b] = state.finalists2;
  const va = Number(state.votes[a] || 0);
  const vb = Number(state.votes[b] || 0);
  const sum = va + vb;
  if (!sum) return null;
  const pa = Math.round((va / sum) * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
      <div className="mb-1.5 flex justify-between text-sm font-black text-white">
        <span>{displayName(byId.get(a))} · {pa}%</span>
        <span>{100 - pa}% · {displayName(byId.get(b))}</span>
      </div>
      <div className="relative flex h-6 overflow-hidden rounded-full bg-white/5">
        <motion.div className="h-full bg-gradient-to-r from-[#ef1b77] to-[#ff9343]" animate={{ width: `${pa}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
        <motion.div className="h-full flex-1 bg-gradient-to-r from-[#06B6D4] to-[#10B981]" />
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/40" />
      </div>
      <p className="mt-1 text-center text-[11px] text-zinc-500">{sum.toLocaleString('es')} {sum === 1 ? 'voto' : 'votos'} en total</p>
    </motion.div>
  );
}

/* =================== Ganador =================== */

export function WinnerScreen({ state, byId, reveal }: Props) {
  const [burst, setBurst] = useState(1);
  const winner = state.winner ? byId.get(state.winner) : undefined;
  const runnerUp = state.finalists2.find((id) => id !== state.winner);
  const runner = runnerUp ? byId.get(runnerUp) : undefined;

  useEffect(() => {
    sfx.fanfare();
    const t = setTimeout(() => setBurst(2), 2500);
    return () => clearTimeout(t);
  }, []);

  const downloadActa = () => {
    const row = (id: string | null | undefined) => {
      const p = id ? byId.get(id) : undefined;
      return p ? { alias: displayName(p), nombreWhatsApp: p.name || null, descripcion: p.about || null, telefono: p.phone } : null;
    };
    const acta = {
      sorteo: 'Gran Sorteo Metele Nomás',
      inicio: state.startedAt,
      fin: nowIso(),
      premio: PREMIO.titulo,
      participantes: state.poolSize,
      huellaListaSha256: state.listHash,
      metodo: 'crypto.getRandomValues (sin sesgo) · ronda 1 → 100, 10 llaves → 10, eliminación → 2, votación → 1',
      ganador: row(state.winner),
      votos: Object.fromEntries(state.finalists2.map((id) => [id, state.votes[id] ?? null])),
      segundo: row(runnerUp),
      finalistas: state.finalists10.map(row),
      eliminadosFinal: state.eliminated.map((id, i) => ({ puesto: state.finalists10.length - i, ...row(id) })),
      preseleccionados: state.top100.map(row),
      registro: state.log,
    };
    const blob = new Blob([JSON.stringify(acta, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `acta-sorteo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 py-6 text-center">
      <Confetti burst={burst} />
      <Sticker name="baila" delay={1.4} rotate={-10} className="absolute left-0 top-24 hidden w-40 md:block" />
      <Sticker name="aplaude" delay={1.6} rotate={10} className="absolute right-0 top-24 hidden w-40 md:block" />
      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
        <Crown className="h-24 w-24 text-[#F7C948] drop-shadow-[0_0_30px_rgba(247,201,72,0.8)]" />
      </motion.div>
      <p className="text-sm font-bold uppercase tracking-[0.4em] font-roca text-[#ff9343]">El ganador del sorteo es</p>
      <motion.h1
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        className="gradient-text font-heading text-6xl font-black leading-tight sm:text-8xl"
      >
        {displayName(winner)}
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="font-mono text-2xl text-zinc-300">
        {shownPhone(winner, reveal)}
      </motion.p>
      {whoIs(winner) && <p className="-mt-3 text-base text-zinc-400">{whoIs(winner)}</p>}
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 2 }}
        transition={{ delay: 1.2, type: 'spring' }}
        className="flex flex-col items-center gap-2"
      >
        <TiltCard>
          <PrizeImage className="aspect-[3/4] w-44 sm:w-56" />
        </TiltCard>
        <p className="text-sm font-bold text-[#F7C948]">Se lleva {PREMIO.titulo}</p>
      </motion.div>
      {state.winner && state.votes[state.winner] && (
        <p className="text-lg font-bold text-white">
          {state.votes[state.winner]} votos
          {runnerUp && state.votes[runnerUp] ? <span className="text-zinc-500"> vs {state.votes[runnerUp]}</span> : null}
        </p>
      )}

      <div className="mt-4 grid w-full gap-3 sm:grid-cols-3">
        <Stat label="Participaron" value={state.poolSize.toLocaleString('es')} />
        <Stat label="Segundo lugar" value={displayName(runner)} />
        <Stat label="Llegaron a la final" value={String(state.finalists10.length)} />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          data-main
          onClick={() => setBurst((b) => b + 1)}
          className="rounded-2xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-6 py-3 font-black text-white hover:scale-[1.03]"
        >
          ¡Más confeti!
        </button>
        <button
          onClick={downloadActa}
          className="flex items-center gap-2 rounded-2xl border border-[#2a2a3e] bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10"
        >
          <Download className="h-4 w-4" /> Descargar acta
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#2a2a3e] bg-white/[0.03] p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="truncate font-heading text-xl font-black text-white">{value}</div>
    </div>
  );
}
