'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, RotateCcw, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';
import Proof from './Proof';
import Background from './Background';
import { Countdown, Splash, StageIntro, Sticker, TiltCard, stageInfo, stickerFor, useMainHotkey } from './Fx';
import { PREMIO, PrizeImage } from './premio';
import RoundOne, { Purge } from './RoundOne';
import { Brackets, FinalElimination } from './Stages';
import { Voting, WinnerScreen } from './Finale';
import {
  GroupProof,
  Participant,
  Phase,
  SorteoState,
  TARGET_FIRST_ROUND,
  initialState,
  listFingerprint,
  loadState,
  nowIso,
  sample,
  saveState,
  setMuted,
} from './lib';

type ApiData = {
  participants: Participant[];
  groups: GroupProof[];
  stats: { total: number; withoutPhone: number; excluded: number };
};

const STEPS: { phase: Phase[]; label: string; count: (s: SorteoState, total: number) => number }[] = [
  { phase: ['intro', 'ronda1'], label: 'Participantes', count: (_s, t) => t },
  { phase: ['purga'], label: 'Preseleccionados', count: () => TARGET_FIRST_ROUND },
  { phase: ['llaves'], label: 'Llaves', count: () => 10 },
  { phase: ['final', 'votacion'], label: 'Finalistas', count: () => 2 },
  { phase: ['ganador'], label: 'Ganador', count: () => 1 },
];

export default function SorteoApp() {
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Este componente se renderiza solo en el cliente (ver app/sorteo/page.tsx), así que localStorage está disponible
  const [state, setState] = useState<SorteoState | null>(() => loadState() ?? initialState());
  const [reveal, setReveal] = useState(false);
  const [mute, setMute] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  // etapas cuya presentación animada ya se mostró en esta sesión
  const [seen, setSeen] = useState<Set<Phase>>(() => new Set());
  const [splash, setSplash] = useState(true);
  const markSeen = useCallback((p: Phase) => setSeen((s) => new Set(s).add(p)), []);
  useMainHotkey();

  useEffect(() => {
    fetch('/api/sorteo/participants', { cache: 'no-store' })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'No se pudo cargar la lista');
        setData(j);
        setHash(await listFingerprint((j as ApiData).participants.map((p) => p.id)));
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => setMuted(mute), [mute]);

  const update = useCallback((fn: (s: SorteoState) => SorteoState) => {
    setState((prev) => {
      const next = fn(prev ?? initialState());
      saveState(next);
      return next;
    });
  }, []);

  const byId = useMemo(() => new Map((data?.participants ?? []).map((p) => [p.id, p])), [data]);
  const poolIds = useMemo(() => (data?.participants ?? []).map((p) => p.id), [data]);

  const start = () => {
    if (!data || !hash) return;
    update(() => ({
      ...initialState(),
      phase: 'ronda1',
      startedAt: nowIso(),
      poolSize: poolIds.length,
      listHash: hash,
      top100: sample(poolIds, Math.min(TARGET_FIRST_ROUND, poolIds.length)),
      log: [{ at: nowIso(), msg: `Inicio del sorteo con ${poolIds.length} participantes · huella ${hash}` }],
    }));
  };

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setConfirmReset(false);
    update(() => initialState());
  };

  if (error) {
    return (
      <Shell phase="intro">
        <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">{error}</div>
      </Shell>
    );
  }
  if (!data || !state) {
    return (
      <Shell phase="intro">
        <div className="flex justify-center py-24 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Shell>
    );
  }

  const stepIdx = STEPS.findIndex((s) => s.phase.includes(state.phase));
  const total = state.poolSize || poolIds.length;
  const info = stageInfo(state.phase, total);
  const showIntro = !!info && !seen.has(state.phase);
  const showCountdown = state.phase === 'ganador' && !seen.has('ganador');

  return (
    <Shell phase={state.phase}>
      {/* Cabecera */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/sorteo/logo-perfil.png" alt="Metele Nomás" className="h-12 w-12 rounded-full" />
          <div>
            <h1 className="font-heading text-xl font-black leading-tight text-white sm:text-2xl">Gran Sorteo Metele Nomás</h1>
            <p className="text-xs text-zinc-500">Comunidad oficial · azar verificable</p>
          </div>
        </div>

        <ol className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex items-center gap-1">
              <div
                className={`relative flex flex-col items-center rounded-xl px-3 py-1.5 transition-colors ${
                  i === stepIdx ? 'text-white' : i < stepIdx ? 'bg-white/5 text-zinc-400' : 'text-zinc-600'
                }`}
              >
                {i === stepIdx && (
                  <motion.span
                    layoutId="step-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] shadow-[0_0_24px_rgba(239,27,119,0.55)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="font-heading text-base font-black tabular-nums leading-none">{s.count(state, total).toLocaleString('es')}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <span className="text-zinc-700">›</span>}
            </li>
          ))}
        </ol>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProof(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-2 text-xs font-bold text-[#34d399] hover:bg-[#10B981]/20"
          >
            <ShieldCheck className="h-4 w-4" /> Participantes
          </button>
          <IconBtn onClick={() => setMute((m) => !m)} title={mute ? 'Activar sonido' : 'Silenciar'}>
            {mute ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </IconBtn>
          <IconBtn onClick={() => setReveal((r) => !r)} title={reveal ? 'Ocultar números' : 'Mostrar números completos'} active={reveal}>
            {reveal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </IconBtn>
          {state.phase !== 'intro' && (
            <button
              onClick={reset}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                confirmReset ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-[#2a2a3e] bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" /> {confirmReset ? '¿Seguro? Toca otra vez' : 'Reiniciar'}
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {splash && state.phase === 'intro' && <Splash key="splash" onEnter={() => setSplash(false)} />}
        {showIntro && info && (
          <StageIntro key={state.phase} info={info} sticker={stickerFor(state.phase)} onGo={() => markSeen(state.phase)} />
        )}
        {showCountdown && <Countdown key="countdown" onDone={() => markSeen('ganador')} />}
      </AnimatePresence>

      <AnimatePresence>
        {showProof && (
          <Proof
            groups={data.groups}
            byId={byId}
            total={poolIds.length}
            hash={state.listHash ?? hash}
            reveal={reveal}
            onClose={() => setShowProof(false)}
          />
        )}
      </AnimatePresence>

      {state.listHash && hash && state.listHash !== hash && (
        <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          La lista de participantes cambió desde que empezó este sorteo. Reinicia para usar la lista nueva.
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={state.phase}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          {state.phase === 'intro' && (
            <Intro total={poolIds.length} groups={data.groups} stats={data.stats} onStart={start} onProof={() => setShowProof(true)} ready={!!hash} />
          )}
          {state.phase === 'ronda1' && <RoundOne state={state} update={update} byId={byId} poolIds={poolIds} reveal={reveal} />}
          {state.phase === 'purga' && <Purge state={state} update={update} byId={byId} poolIds={poolIds} reveal={reveal} />}
          {state.phase === 'llaves' && <Brackets state={state} update={update} byId={byId} reveal={reveal} />}
          {state.phase === 'final' && <FinalElimination state={state} update={update} byId={byId} reveal={reveal} />}
          {state.phase === 'votacion' && <Voting state={state} update={update} byId={byId} reveal={reveal} />}
          {state.phase === 'ganador' && !showCountdown && <WinnerScreen state={state} update={update} byId={byId} reveal={reveal} />}
        </motion.main>
      </AnimatePresence>
    </Shell>
  );
}

function Shell({ children, phase }: { children: React.ReactNode; phase: Phase }) {
  return (
    <div className="relative min-h-screen overflow-clip px-4 py-5 text-[#f0f0f5] sm:px-8">
      <Background phase={phase} />
      <div className="relative z-10 mx-auto max-w-[1500px]">{children}</div>
    </div>
  );
}

function IconBtn({ children, onClick, title, active }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`rounded-xl border p-2.5 transition ${
        active ? 'border-[#ff9343] bg-[#ff9343]/15 text-[#ff9343]' : 'border-[#2a2a3e] bg-white/5 text-zinc-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function Intro({
  total,
  groups,
  stats,
  onStart,
  onProof,
  ready,
}: {
  total: number;
  groups: GroupProof[];
  stats: ApiData['stats'];
  onStart: () => void;
  onProof: () => void;
  ready: boolean;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 1800);
      setN(Math.round(total * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  const stages = [
    { n: '1', t: 'Preselección', d: `La ruleta gira entre todos y saca ${TARGET_FIRST_ROUND}. El resto queda eliminado.` },
    { n: '2', t: 'Llaves', d: 'Los 100 se reparten en 10 llaves de 10. De cada llave pasa 1.' },
    { n: '3', t: 'Gran final', d: 'Entre los 10, la ruleta elimina uno por uno hasta que quedan 2.' },
    { n: '4', t: 'Votación', d: 'Llamamos a los 2 finalistas y la comunidad vota al ganador.' },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 py-2 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(239,27,119,0.25)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/sorteo/banner.jpg" alt="Metele Nomás Podcast" className="w-full" />
        <motion.div
          className="pointer-events-none absolute -inset-y-10 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          animate={{ left: ['-30%', '130%'] }}
          transition={{ repeat: Infinity, duration: 3.5, repeatDelay: 3, ease: 'easeInOut' }}
        />
        <p className="absolute bottom-3 left-0 right-0 font-roca text-[10px] font-bold uppercase text-white/70 sm:text-xs">Gran sorteo de la comunidad</p>
      </motion.div>
      <div className="relative grid w-full items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Sticker name="aplaude" delay={0.8} rotate={10} className="absolute -right-4 -top-6 hidden w-32 lg:block" />
        <motion.div initial={{ opacity: 0, rotate: -3, scale: 0.9 }} animate={{ opacity: 1, rotate: -2, scale: 1 }} className="mx-auto w-full max-w-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] font-roca text-[#F7C948]">Se sortea</p>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
            <TiltCard>
              <PrizeImage className="aspect-[3/4] w-full" />
            </TiltCard>
          </motion.div>
          <p className="mt-3 font-heading text-2xl font-black text-white">{PREMIO.titulo}</p>
          <p className="text-xs text-zinc-500">{PREMIO.descripcion}</p>
        </motion.div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.4em] font-roca text-[#ff9343]">En juego</p>
          <div className="gradient-text font-heading text-8xl font-black tabular-nums sm:text-9xl">{n.toLocaleString('es')}</div>
          <p className="text-xl font-bold text-white">metedores de la comunidad</p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {groups.map((g) => (
              <span key={g.label} className="rounded-full border border-[#2a2a3e] bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-300">
                {g.label} · <b className="text-white">{g.participa.toLocaleString('es')}</b>
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Todos los miembros de los {groups.length} grupos, sin repetir. Fuera: admins y contactos sin número ({stats.withoutPhone + stats.excluded}).
          </p>
          <button
            onClick={onProof}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2 text-sm font-bold text-[#34d399] hover:bg-[#10B981]/20"
          >
            <ShieldCheck className="h-4 w-4" /> Ver pruebas: lista completa por grupo
          </button>
        </div>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-4">
        {stages.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            className="rounded-2xl border border-[#2a2a3e] bg-white/[0.03] p-4 text-left"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ef1b77] to-[#ff9343] font-black text-white">
              {s.n}
            </div>
            <div className="font-heading font-black text-white">{s.t}</div>
            <div className="mt-1 text-xs leading-relaxed text-zinc-400">{s.d}</div>
          </motion.div>
        ))}
      </div>

      <motion.button
        data-main
        onClick={onStart}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        disabled={!ready || total < TARGET_FIRST_ROUND}
        className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-14 py-5 text-2xl font-black text-white shadow-[0_0_50px_rgba(239,27,119,0.4)] transition hover:scale-[1.04] disabled:opacity-50"
      >
        <Sparkles className="h-7 w-7" /> Comenzar el sorteo
      </motion.button>
    </div>
  );
}
