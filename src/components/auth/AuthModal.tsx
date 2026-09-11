'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { X, Sparkles, ShieldCheck, UserCheck, Flame, ArrowRight, Info } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useCommunityStore();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con Google. Revisa tus credenciales en .env o usa acceso directo abajo.');
      setIsLoading(false);
    }
  };

  const handleDirectSignIn = async (email: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await signIn('credentials', {
        email,
        name,
        redirect: false,
        callbackUrl: '/',
      });
      if (res?.error) {
        setError('Error al iniciar sesión directa');
      } else {
        setIsAuthModalOpen(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con la base de datos local');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) {
      setError('Ingresa un correo electrónico');
      return;
    }
    handleDirectSignIn(customEmail, customName || customEmail.split('@')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#101018] border border-white/[0.12] rounded-3xl p-6 shadow-[0_0_50px_rgba(233,30,140,0.2)] text-center animate-scale-in">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.05] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Header */}
        <div className="flex justify-center mb-3">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#E91E8C] to-[#F5A623] shadow-lg">
            <div className="w-full h-full bg-[#0a0a0f] rounded-[14px] flex items-center justify-center">
              <Image
                src="/images/brand/logo-icon.png"
                alt="Metele Nomás"
                width={48}
                height={48}
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E91E8C]/15 border border-[#E91E8C]/30 text-[#E91E8C] text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Únete a la Comunidad
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">
          Iniciar Sesión
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          Participa en sorteos con tu cuenta real, vota en vivo los temas del podcast y acumula puntos.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 text-left">
            {error}
          </div>
        )}

        {/* 1. Google OAuth Button */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-black text-sm text-zinc-900 bg-white hover:bg-zinc-100 shadow-xl shadow-white/10 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-[#101018] px-3 text-zinc-500">
              o acceso rápido de desarrollo
            </span>
          </div>
        </div>

        {/* 2. Fast Dev / Test User Accounts (Persisted in dev.db) */}
        <div className="space-y-2 text-left">
          <p className="text-[11px] font-bold text-zinc-400 mb-1 flex items-center gap-1">
            <span>Cuentas de prueba en base de datos local:</span>
          </p>

          <button
            onClick={() => handleDirectSignIn('host@metelenomas.com', 'Fisbert Chávez')}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-xs text-amber-200 transition-all group"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-black text-white block">Fisbert Chávez (Host / Admin)</span>
                <span className="text-[10px] text-zinc-400">host@metelenomas.com • 9,999 pts</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleDirectSignIn('nico@example.com', 'Nico Gamer')}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] text-xs text-zinc-300 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#F5A623]" />
              <div>
                <span className="font-bold text-white block">Nico Gamer (Metedor VIP)</span>
                <span className="text-[10px] text-zinc-400">nico@example.com • 2,450 pts</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3. Custom Guest Sign In Form */}
        <form onSubmit={handleCustomSubmit} className="mt-4 pt-4 border-t border-white/[0.06] text-left space-y-2">
          <p className="text-[11px] font-bold text-zinc-400">
            O crea una cuenta con tu apodo:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Tu Apodo (ej: Metedor_99)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E91E8C]"
            />
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E91E8C]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Crear y Entrar a la Comunidad</span>
          </button>
        </form>

        {/* Help Tip */}
        <div className="mt-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-zinc-400 flex items-start gap-2 text-left">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-zinc-300">Nota para Google OAuth:</span> Las credenciales reales se configuran en el archivo <code className="text-amber-400 font-mono">.env</code> de tu servidor (<code className="text-zinc-300">GOOGLE_CLIENT_ID</code> y <code className="text-zinc-300">GOOGLE_CLIENT_SECRET</code>).
          </div>
        </div>
      </div>
    </div>
  );
}
