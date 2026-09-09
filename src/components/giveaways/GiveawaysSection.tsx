'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Gift, Sparkles, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GiveawaysSection() {
  const { giveaways, enterGiveaway, setIsWheelOpen } = useCommunityStore();
  const [toast, setToast] = useState<{ id: string; message: string; success: boolean } | null>(null);

  const handleEnter = (id: string) => {
    const res = enterGiveaway(id);
    setToast({ id, message: res.message, success: res.success });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Gift className="w-4 h-4" /> Giveaways & Sorteos
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Sorteos Activos de la Comunidad
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Participa con tus puntos acumulados en la plataforma. Los ganadores se eligen en vivo por la ruleta.
            </p>
          </div>

          <button
            onClick={() => setIsWheelOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] hover:scale-105 transition-all shadow-lg shadow-[#E91E8C]/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Abrir Ruleta de Ganadores</span>
          </button>
        </div>

        {/* Giveaways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {giveaways.map((giveaway) => (
            <div
              key={giveaway.id}
              className="bg-[#12121c] border border-white/[0.08] hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col group"
            >
              {/* Image Preview */}
              <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                {giveaway.imageUrl && (
                  <Image
                    src={giveaway.imageUrl}
                    alt={giveaway.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#12121c] via-transparent to-black/40" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    ACTIVO
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-zinc-300 backdrop-blur-md border border-white/[0.1]">
                    {giveaway.winnersCount} {giveaway.winnersCount === 1 ? 'Ganador' : 'Ganadores'}
                  </span>
                </div>

                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black bg-[#E91E8C] text-white shadow-lg">
                  {giveaway.costPoints === 0 ? 'GRATIS' : `${giveaway.costPoints} PTS`}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                    {giveaway.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    {giveaway.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Termina en 3 días</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                      <Users className="w-4 h-4 text-[#E91E8C]" />
                      <span>{giveaway.participantsCount} participantes</span>
                    </div>
                  </div>

                  {toast && toast.id === giveaway.id && (
                    <div
                      className={`text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-fade-in ${
                        toast.success
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {toast.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{toast.message}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleEnter(giveaway.id)}
                    disabled={giveaway.isEntered}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      giveaway.isEntered
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-gradient-to-r from-[#E91E8C] to-[#F5A623] text-white hover:scale-[1.02] shadow-xl shadow-[#E91E8C]/20'
                    }`}
                  >
                    {giveaway.isEntered ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>¡Ya estás participando!</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        <span>Entrar al Sorteo ({giveaway.costPoints} Puntos)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}