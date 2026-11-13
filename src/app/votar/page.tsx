'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, Lock, LogOut, Phone, ShieldCheck, Vote } from 'lucide-react';
import { PREMIO } from '@/components/sorteo/premio';

type PollInfo = {
  poll: { id: string; status: 'open' | 'closed'; options: { key: 'A' | 'B'; name: string }[] } | null;
  myVote: 'A' | 'B' | null;
  results: { A: number; B: number } | null;
};

const CHOICE_KEY = 'votar-eleccion';

export default function VotarPage() {
  const { data: session, status } = useSession();
  const [info, setInfo] = useState<PollInfo | null>(null);
  const [choice, setChoice] = useState<'A' | 'B' | null>(() => {
    try {
      const v = typeof window !== 'undefined' ? sessionStorage.getItem(CHOICE_KEY) : null;
      return v === 'A' || v === 'B' ? v : null;
    } catch {
      return null;
    }
  });
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/votar', { cache: 'no-store' });
      setInfo(await r.json());
    } catch {
      /* reintenta en el próximo ciclo */
    }
  }, []);

  // refresco en vivo: espera a que abra, y muestra resultados después de votar
  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    const t = setInterval(() => void load(), 5000); // cada 5 s: suficiente y liviano con cientos de personas
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load, status]);

  const pick = (c: 'A' | 'B') => {
    setChoice(c);
    setError(null);
    try {
      sessionStorage.setItem(CHOICE_KEY, c); // se recuerda al volver del login de Google
    } catch {
      /* sin almacenamiento */
    }
  };

  const vote = async () => {
    if (!info?.poll || !choice) return;
    setSending(true);
    setError(null);
    try {
      const r = await fetch('/api/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: info.poll.id, choice, phone }),
      });
      const j = await r.json();
      if (!r.ok) setError(j.error || 'No se pudo registrar el voto');
      else {
        try {
          sessionStorage.removeItem(CHOICE_KEY);
        } catch {
          /* */
        }
        await load();
      }
    } finally {
      setSending(false);
    }
  };

  const poll = info?.poll;
  const voted = info?.myVote;
  const closed = poll?.status === 'closed';
  const loggedIn = status === 'authenticated';
  const phoneOk = phone.replace(/\D/g, '').length >= 8;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0b10] px-4 pb-16 pt-6 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#ef1b77]/30 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#ff9343]/25 blur-[110px]" />

      <div className="relative mx-auto flex max-w-md flex-col gap-5">
        <header className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/sorteo/logo-perfil.png" alt="Metele Nomás" className="h-12 w-12 rounded-full" />
          <div>
            <p className="font-roca text-[10px] font-bold uppercase text-[#ff9343]">Gran sorteo · final</p>
            <h1 className="font-heading text-xl font-black leading-tight">¿Quién se lleva {PREMIO.titulo}?</h1>
          </div>
        </header>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PREMIO.imagen} alt={PREMIO.titulo} className="h-20 w-16 rounded-lg object-cover" />
          <p className="text-sm text-zinc-300">
            Elige entre los 2 finalistas. <b className="text-white">Un voto por persona</b>, solo miembros de la comunidad.
          </p>
        </div>

        {!info ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : !poll ? (
          <Card>
            <Lock className="mx-auto mb-2 h-8 w-8 text-zinc-500" />
            <p className="font-heading text-lg font-black">La votación todavía no abrió</p>
            <p className="mt-1 text-sm text-zinc-400">Quédate en el stream: cuando aparezcan los 2 finalistas, esta página se actualiza sola.</p>
          </Card>
        ) : (
          <>
            {/* Finalistas */}
            <div className="grid grid-cols-2 gap-3">
              {poll.options.map((o) => {
                const selected = (voted ?? choice) === o.key;
                const disabled = !!voted || closed;
                return (
                  <motion.button
                    key={o.key}
                    whileTap={disabled ? undefined : { scale: 0.95 }}
                    onClick={() => !disabled && pick(o.key)}
                    className={`relative flex flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition ${
                      selected
                        ? 'border-[#ff9343] bg-gradient-to-b from-[#ef1b77]/30 to-[#ff9343]/10 shadow-[0_0_30px_rgba(239,27,119,0.35)]'
                        : 'border-white/10 bg-white/5'
                    } ${disabled && !selected ? 'opacity-50' : ''}`}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ef1b77] to-[#ff9343] font-heading text-2xl font-black">
                      {o.key}
                    </span>
                    <span className="line-clamp-2 font-heading text-lg font-black leading-tight">{o.name}</span>
                    {selected && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-[#ff9343]" />}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {voted || closed ? (
                <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    {voted ? (
                      <>
                        <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-[#34d399]" />
                        <p className="font-heading text-xl font-black">¡Tu voto quedó registrado!</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          Votaste por <b className="text-white">{poll.options.find((o) => o.key === voted)?.name}</b>.
                        </p>
                      </>
                    ) : (
                      <p className="font-heading text-xl font-black">La votación cerró</p>
                    )}
                    {info.results && <Results results={info.results} options={poll.options} live={!closed} />}
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                  {!loggedIn ? (
                    <button
                      onClick={() => void signIn('google', { callbackUrl: '/votar' })}
                      disabled={!choice || status === 'loading'}
                      className="flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-4 text-base font-black text-zinc-900 disabled:opacity-40"
                    >
                      <GoogleIcon /> {choice ? 'Entrar con Google para votar' : 'Primero elige un finalista'}
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                        <span className="truncate text-zinc-300">
                          Votando como <b className="text-white">{session?.user?.email}</b>
                        </span>
                        <button onClick={() => void signOut({ callbackUrl: '/votar' })} className="ml-2 text-zinc-500" aria-label="Cambiar de cuenta">
                          <LogOut className="h-4 w-4" />
                        </button>
                      </div>
                      <label className="text-sm font-bold text-zinc-300">
                        Tu número de WhatsApp
                        <span className="block text-xs font-normal text-zinc-500">El mismo con el que estás en el grupo de la comunidad</span>
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.slice(0, 20))}
                          placeholder="7xxxxxxx o +591 7xxxxxxx"
                          className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-lg outline-none focus:border-[#ef1b77]"
                        />
                      </div>
                      <button
                        onClick={() => void vote()}
                        disabled={!choice || !phoneOk || sending}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-4 py-4 text-lg font-black disabled:opacity-40"
                      >
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Vote className="h-5 w-5" />}
                        {choice ? `Votar por ${poll.options.find((o) => o.key === choice)?.name}` : 'Elige un finalista'}
                      </button>
                    </>
                  )}
                  {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="flex items-start gap-2 text-xs text-zinc-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Tu número solo se usa para comprobar que eres de la comunidad y que nadie vote dos veces. No se muestra a nadie.{' '}
                <a href="/privacidad" className="underline">
                  Privacidad
                </a>
              </span>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">{children}</div>;
}

function Results({ results, options, live }: { results: { A: number; B: number }; options: { key: 'A' | 'B'; name: string }[]; live: boolean }) {
  const total = results.A + results.B;
  const pa = total ? Math.round((results.A / total) * 100) : 50;
  return (
    <div className="mt-5 text-left">
      <div className="mb-1.5 flex justify-between text-sm font-black">
        <span>
          {options[0].name} · {pa}%
        </span>
        <span>
          {100 - pa}% · {options[1].name}
        </span>
      </div>
      <div className="flex h-5 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full bg-gradient-to-r from-[#ef1b77] to-[#ff9343]" animate={{ width: `${pa}%` }} />
        <div className="h-full flex-1 bg-gradient-to-r from-[#06B6D4] to-[#10B981]" />
      </div>
      <p className="mt-1.5 text-center text-xs text-zinc-500">
        {total.toLocaleString('es')} {total === 1 ? 'voto' : 'votos'}{live ? ' · en vivo' : ''}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
