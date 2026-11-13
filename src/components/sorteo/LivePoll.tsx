'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Globe, Loader2, Lock, LockOpen, Radio } from 'lucide-react';
import { SorteoState, nowIso, sfx } from './lib';

type PollData = {
  id: string;
  status: 'open' | 'closed';
  createdAt: string;
  options: { key: 'A' | 'B'; id: string; name: string; votes: number }[];
  total: number;
};

type Props = {
  state: SorteoState;
  update: (fn: (s: SorteoState) => SorteoState) => void;
};

/** Dirección pública de la votación. En el stream debe ser la del sitio publicado, no localhost. */
function voteUrl() {
  const env = process.env.NEXT_PUBLIC_VOTE_URL;
  if (env) return env;
  return typeof window !== 'undefined' ? `${window.location.origin}/votar` : '/votar';
}

export default function LivePoll({ state, update }: Props) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastTotal = useRef(0);
  const url = voteUrl();
  const isLocal = /localhost|127\.0\.0\.1/.test(url);

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#1D1D1B', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [url]);

  // conteo en vivo: lee la base cada 2 s y vuelca los votos al estado del sorteo (la barra se mueve sola)
  useEffect(() => {
    if (!state.pollId) return;
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/sorteo/poll?id=${state.pollId}`, { cache: 'no-store' });
        if (!r.ok) return;
        const p: PollData = await r.json();
        if (stop) return;
        setPoll(p);
        if (p.total > lastTotal.current) sfx.tick();
        lastTotal.current = p.total;
        update((s) => {
          const next = Object.fromEntries(p.options.map((o) => [o.id, String(o.votes)]));
          const same = p.options.every((o) => s.votes[o.id] === next[o.id]);
          return same ? s : { ...s, votes: { ...s.votes, ...next } };
        });
      } catch {
        /* reintenta en el próximo ciclo */
      }
    };
    void tick();
    const t = setInterval(() => void tick(), 2000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [state.pollId, update]);

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const [aId, bId] = state.finalists2;
      const r = await fetch('/api/sorteo/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aId, bId }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'No se pudo abrir la votación');
      setPoll(j);
      sfx.fanfare();
      update((s) => ({ ...s, pollId: j.id, log: [...s.log, { at: nowIso(), msg: `Votación web abierta (${j.id})` }] }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (action: 'close' | 'reopen') => {
    if (!state.pollId) return;
    setBusy(true);
    try {
      const r = await fetch('/api/sorteo/poll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: state.pollId, action }),
      });
      const j: PollData = await r.json();
      if (r.ok) {
        setPoll(j);
        if (action === 'close') sfx.eliminate();
        update((s) => ({
          ...s,
          log: [
            ...s.log,
            {
              at: nowIso(),
              msg:
                action === 'close'
                  ? `Votación cerrada: ${j.options.map((o) => `${o.key} ${o.votes}`).join(' · ')} (${j.total} votos)`
                  : 'Votación reabierta',
            },
          ],
        }));
      }
    } finally {
      setBusy(false);
    }
  };

  if (!state.pollId) {
    return (
      <div className="flex w-full max-w-3xl flex-col items-center gap-3 rounded-3xl border border-[#10B981]/30 bg-[#10B981]/5 p-5">
        <p className="text-sm text-zinc-300">
          La comunidad vota desde el celular: <b className="text-white">entra con Google + su número de WhatsApp</b>, un voto por persona.
        </p>
        <button
          data-main
          onClick={() => void open()}
          disabled={busy || state.finalists2.length !== 2}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] px-8 py-3.5 text-lg font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] transition hover:scale-[1.03] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Globe className="h-5 w-5" />} Abrir votación en la web
        </button>
        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>
    );
  }

  const live = poll?.status === 'open';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid w-full max-w-4xl items-center gap-5 rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm sm:grid-cols-[auto_1fr]"
    >
      <div className="mx-auto rounded-2xl bg-white p-2 shadow-[0_0_40px_rgba(255,147,67,0.35)]">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt={`Código QR para votar: ${url}`} className="h-44 w-44" />
        ) : (
          <div className="flex h-44 w-44 items-center justify-center text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 text-left">
        <div className="flex items-center gap-2">
          {live ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-black uppercase text-red-300">
              <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Radio className="h-3.5 w-3.5" />
              </motion.span>
              Votación en vivo
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-500/20 px-3 py-1 text-xs font-black uppercase text-zinc-300">
              <Lock className="h-3.5 w-3.5" /> Votación cerrada
            </span>
          )}
          <span className="font-heading text-lg font-black text-white tabular-nums">{(poll?.total ?? 0).toLocaleString('es')} {poll?.total === 1 ? 'voto' : 'votos'}</span>
        </div>
        <p className="font-roca text-[10px] font-bold uppercase text-zinc-500">Escanea o entra a</p>
        <p className="break-all font-heading text-2xl font-black text-white">{url.replace(/^https?:\/\//, '')}</p>
        {isLocal && (
          <p className="rounded-lg bg-[#ff9343]/15 px-3 py-1.5 text-xs text-[#ffb37a]">
            Esta dirección es local: el público no puede entrar. Configura NEXT_PUBLIC_VOTE_URL con la dirección del sitio publicado.
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-2">
          {live ? (
            <button
              onClick={() => void setStatus('close')}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:brightness-110 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" /> Cerrar votación
            </button>
          ) : (
            <button
              onClick={() => void setStatus('reopen')}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-white/10 disabled:opacity-50"
            >
              <LockOpen className="h-4 w-4" /> Reabrir
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** Quién va ganando según los votos (null si empate o sin votos) */
export function leaderOf(state: SorteoState): string | null {
  const [a, b] = state.finalists2;
  const va = Number(state.votes[a] || 0);
  const vb = Number(state.votes[b] || 0);
  if (va === vb) return null;
  return va > vb ? a : b;
}
