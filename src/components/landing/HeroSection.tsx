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
    <div className="relative overflow-hidden pt-8 pb-16">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#E91E8C]/20 via-purple-600/15 to-[#F5A623]/20 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stream Status Banner */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              Próximo Stream: Viernes 20:00 • ¡Debate & Sorteo en Vivo!
            </span>
            <button
              onClick={() => setActiveTab('calendario')}
              className="text-xs font-extrabold text-[#F5A623] hover:underline flex items-center gap-0.5"
            >
              Ver Horario <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Main Card with 3D Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.12] bg-[#101018]/90 shadow-2xl p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E91E8C]/15 to-[#F5A623]/15 border border-[#E91E8C]/30 text-[#F5A623] text-xs font-black tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-[#E91E8C]" />
                La Comunidad Más Fiel de YouTube
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                ¡Bienvenido a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E8C] via-[#F7C948] to-[#F5A623] drop-shadow-[0_0_25px_rgba(233,30,140,0.3)]">
                  Metele Nomás
                </span>!
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Tu punto de encuentro oficial. Vota en vivo los temas de cada episodio del podcast, acumula puntos con tu racha de directos y participa por auriculares gamer, merch oficial y experiencias VIP.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => setActiveTab('sorteos')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] shadow-xl shadow-[#E91E8C]/25 hover:scale-105 transition-all duration-300"
                >
                  <Gift className="w-5 h-5" />
                  <span>Participar en Sorteos</span>
                </button>

                <button
                  onClick={() => setActiveTab('votaciones')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-sm text-zinc-200 bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:text-white transition-all duration-200"
                >
                  <Vote className="w-5 h-5 text-amber-400" />
                  <span>Votar Temas del Podcast</span>
                </button>

                <button
                  onClick={() => setIsWhatsAppQROpen(true)}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-2xl font-black text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-200"
                  title="Unirse a la Comunidad de WhatsApp"
                >
                  <QrCode className="w-5 h-5" />
                  <span className="hidden sm:inline">Grupo WhatsApp</span>
                </button>
              </div>

              {/* Quick Community Stats Ticker */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/[0.08] max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-2xl font-black text-white">
                    <Users className="w-5 h-5 text-[#E91E8C]" />
                    <span>1.4K+</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">Metedores Fieles</p>
                </div>
                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-2xl font-black text-[#F5A623]">
                    <Gift className="w-5 h-5 text-[#F5A623]" />
                    <span>{giveaways.length}</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">Sorteos Activos</p>
                </div>
                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-2xl font-black text-amber-400">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <span>840+</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">Votos en Directo</p>
                </div>
              </div>
            </div>

            {/* Right Brand Showcase Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.15] shadow-2xl group">
                <Image
                  src="/images/brand/banner.jpg"
                  alt="Metele Nomas Banner"
                  width={600}
                  height={340}
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Floating Live Wheel Overlay Button */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/[0.1]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#E91E8C] to-[#F5A623] flex items-center justify-center text-white">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Ruleta de Sorteos en Vivo</p>
                      <p className="text-[10px] text-zinc-400">Para girar durante el directo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsWheelOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 transition-all shadow-md"
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