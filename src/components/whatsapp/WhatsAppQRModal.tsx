'use client';

import React from 'react';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { X, MessageCircle, CheckCircle, ExternalLink } from 'lucide-react';

export default function WhatsAppQRModal() {
  const { isWhatsAppQROpen, setIsWhatsAppQROpen } = useCommunityStore();

  if (!isWhatsAppQROpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#12121c] border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center animate-scale-in">
        <button
          onClick={() => setIsWhatsAppQROpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.05] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-lg">
          <MessageCircle className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">
          Comunidad de WhatsApp
        </h3>
        <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">
          Grupo Oficial • Metele Nomás
        </p>

        <p className="text-sm text-zinc-300 mt-3 max-w-xs mx-auto">
          Entérate primero que nadie cuando estemos en vivo, participa en dinámicas secretas y habla directo con Fisbert.
        </p>

        {/* Real QR Code Container */}
        <div className="my-5 p-4 bg-white rounded-2xl inline-block shadow-[0_0_30px_rgba(16,185,129,0.25)] relative group">
          <div className="w-56 h-56 sm:w-64 sm:h-64 relative flex items-center justify-center bg-white rounded-xl overflow-hidden p-2">
            <Image
              src="/images/brand/whatsapp-qr.jpeg"
              alt="Código QR Comunidad WhatsApp Metele Nomás"
              width={256}
              height={256}
              className="object-contain w-full h-full rounded-lg group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          <p className="text-[11px] font-black text-zinc-700 mt-2 flex items-center justify-center gap-1.5">
            <span>📷 Escanea con WhatsApp en tu celular</span>
          </p>
        </div>

        {/* Benefits List */}
        <div className="text-left space-y-2 mb-6 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Avisos inmediatos 15 min antes de cada stream</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Códigos secretos para multiplicar puntos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Reglas de respeto y cero spam</span>
          </div>
        </div>

        {/* Direct Link Button */}
        <a
          href="https://chat.whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
        >
          <span>Unirme al Grupo Directo</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}