'use client';

import React from 'react';
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

        {/* QR Code Container */}
        <div className="my-6 p-4 bg-white rounded-2xl inline-block shadow-2xl relative group">
          <div className="w-48 h-48 relative flex items-center justify-center bg-zinc-50 border-4 border-emerald-500/20 rounded-xl overflow-hidden">
            {/* Real aesthetic QR SVG */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full p-2 text-zinc-900 fill-current"
            >
              {/* Corner markers */}
              <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="11" y="11" width="13" height="13" />
              <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="76" y="11" width="13" height="13" />
              <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="11" y="76" width="13" height="13" />
              
              {/* Data pattern */}
              <rect x="35" y="8" width="5" height="5" />
              <rect x="45" y="8" width="8" height="5" />
              <rect x="58" y="8" width="5" height="5" />
              <rect x="35" y="18" width="12" height="5" />
              <rect x="52" y="18" width="10" height="5" />
              <rect x="35" y="28" width="7" height="6" />
              <rect x="47" y="28" width="15" height="6" />

              <rect x="8" y="35" width="5" height="12" />
              <rect x="18" y="35" width="7" height="7" />
              <rect x="75" y="35" width="8" height="8" />
              <rect x="87" y="35" width="6" height="14" />

              {/* Center Icon */}
              <circle cx="50" cy="50" r="14" fill="#0a0a0f" />
              <circle cx="50" cy="50" r="11" fill="#10b981" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-black">MN</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-zinc-600 mt-2">
            Apunta con la cámara de tu celular
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