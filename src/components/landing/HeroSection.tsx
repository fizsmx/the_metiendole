'use client';

import React from 'react';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import {
  Sparkles,
  Gift,
  Vote,
  QrCode,
  Users,
  Flame,
  ChevronRight,
} from 'lucide-react';

export default function HeroSection() {
  const { setActiveTab, setIsWhatsAppQROpen, setIsWheelOpen, giveaways } = useCommunityStore();

  return (
    <div className="relative overflow-hidden py-3 sm:py-5">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-[#E91E8C]/15 via-purple-600/10 to-[#F5A623]/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Stream Live Alert Ticker (Compact & Mobile Friendly) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white/[0.03] border border-white/[0.08] px-3.5 py-2.5 sm:px-4 sm:py-2 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-white leading-snug">
              Directo: Lunes, Miércoles y Viernes 21:00 a 23:00 (BO) • ¡En Vivo en YouTube!
            </span>
          </div>

          <button
            onClick={() => setActiveTab('calendario')}
            className="text-xs font-black text-[#F5A623] hover:underline flex items-center gap-0.5 shrink-0 self-end sm:self-auto"
          >
            <span>Ver Horario</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hero Card Container */}
        <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-white/[0.1] bg-[#101018]/95 shadow-2xl p-4 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#E91E8C]/15 to-[#F5A623]/15 border border-[#E91E8C]/30 text-[#F5A623] text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#E91E8C]" />
                Comunidad Oficial • @MeteleNomas
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                ¡Bienvenido a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E8C] via-[#F7C948] to-[#F5A623] drop-shadow-[0_0_20px_rgba(233,30,140,0.35)]">
                  Metele Nomás
                </span>!
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                El podcast y stream más metedor de Bolivia. Vota en vivo los temas de cada episodio, acumula puntos con tu racha de directos y participa por auriculares gamer, merch oficial y premios en la ruleta en directo.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                <button
                  onClick={() => setActiveTab('sorteos')}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] shadow-lg shadow-[#E91E8C]/25 hover:scale-105 transition-all"
                >
                  <Gift className="w-4 h-4" />
                  <span>Participar en Sorteos</span>
                </button>

                <button
                  onClick={() => setActiveTab('votaciones')}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-black text-xs text-zinc-200 bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:text-white transition-all"
                >
                  <Vote className="w-4 h-4 text-amber-400" />
                  <span>Votar Temas</span>
                </button>

                <button
                  onClick={() => setIsWhatsAppQROpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-black text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Stats Ticker */}
              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-6 pt-2 border-t border-white/[0.06] text-xs text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E91E8C]" />
                  <span className="font-black text-white text-xs sm:text-sm">7.39K+</span>
                  <span className="text-[10px] sm:text-xs text-zinc-400">Subs</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5A623]" />
                  <span className="font-black text-white text-xs sm:text-sm">{giveaways.length}</span>
                  <span className="text-[10px] sm:text-xs text-zinc-400">Sorteos</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span className="font-black text-white text-xs sm:text-sm">840+</span>
                  <span className="text-[10px] sm:text-xs text-zinc-400">Votos</span>
                </div>
              </div>
            </div>

            {/* Right Brand Card with Ruleta Trigger */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] shadow-xl group">
                <div className="relative h-44 sm:h-52 lg:h-48 w-full">
                  <Image
                    src="/images/brand/banner.jpg"
                    alt="Metele Nomas Banner"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                </div>

                {/* Floating Live Wheel Bar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/[0.1]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#E91E8C] to-[#F5A623] flex items-center justify-center text-white">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white leading-tight">Ruleta en Vivo</p>
                      <p className="text-[9px] text-zinc-400">Sorteo en directo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsWheelOpen(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 transition-all shadow-md"
                  >
                    Girar Ruleta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}