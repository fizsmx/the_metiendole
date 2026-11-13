'use client';

import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Loader2, ShieldAlert } from 'lucide-react';
import dynamic from 'next/dynamic';
import { isSuperAdminEmail } from '@/lib/constants';

// Solo cliente: el estado del sorteo se guarda en localStorage para sobrevivir a una recarga en pleno stream
const SorteoApp = dynamic(() => import('@/components/sorteo/SorteoApp'), { ssr: false });

export default function SorteoPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070c] text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSuperAdminEmail(session?.user?.email)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] p-6 text-center">
        <div className="mb-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-black text-white">Acceso restringido</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">El sorteo solo lo puede operar el administrador de Metele Nomás.</p>
        {status === 'authenticated' ? (
          <>
            <p className="mt-4 text-xs text-zinc-500">
              Entraste como <b className="text-zinc-300">{session?.user?.email}</b>, que no es administrador.
            </p>
            <button
              onClick={() => void signOut({ callbackUrl: '/sorteo' })}
              className="mt-4 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white"
            >
              Cambiar de cuenta
            </button>
          </>
        ) : (
          <button
            onClick={() => void signIn('google', { callbackUrl: '/sorteo' })}
            className="mt-6 rounded-xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-6 py-3 text-sm font-black text-white"
          >
            Entrar con Google (admin)
          </button>
        )}
        <a href="/votar" className="mt-6 text-xs text-zinc-500 underline">
          ¿Vienes a votar? Ir a la votación
        </a>
      </div>
    );
  }

  return <SorteoApp />;
}
