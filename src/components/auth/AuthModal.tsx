'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { X, Sparkles, ShieldCheck } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useCommunityStore();
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
      setError('No se pudo conectar con Google. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
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

        {/* Benefits List */}
        <div className="mt-5 space-y-2.5 text-left bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl">
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              ✓
            </div>
            <span>Participa en sorteos de auriculares y merch oficial</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <div className="w-5 h-5 rounded-full bg-[#E91E8C]/10 text-[#E91E8C] flex items-center justify-center shrink-0">
              ✓
            </div>
            <span>Vota en directo los temas de cada episodio del podcast</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <div className="w-5 h-5 rounded-full bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center shrink-0">
              ✓
            </div>
            <span>Acumula puntos de fidelidad y sube en el ranking de metedores</span>
          </div>
        </div>

        {/* Security & Privacy Assurance */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Acceso seguro vía Google • Sin contraseñas ni spam</span>
        </div>
      </div>
    </div>
  );
}
