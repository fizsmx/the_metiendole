'use client';

import React from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import {
  Users,
  Gift,
  Vote,
  Radio,
  Star,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminOverview() {
  const {
    giveaways,
    polls,
    leaderboard,
    setAdminTab,
  } = useCommunityStore();

  const totalPointsCirculating = leaderboard.reduce((acc, u) => acc + u.points, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1c1224] via-[#151522] to-[#1a1410] border border-white/[0.1] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ★ Panel de Control de Creador
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            ¡Hola, Fisbert! Controla la comunidad de Metele Nomás
          </h1>
          <p className="text-sm text-zinc-300">
            Aquí gestionas sorteos en tiempo real, creas encuestas antes del directo, asignas roles y moderas el muro social.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#12121c] border border-white/[0.08] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span>Comunidad Activa</span>
            <Users className="w-4 h-4 text-[#E91E8C]" />
          </div>
          <p className="text-2xl font-black text-white">1,420+</p>
          <p className="text-[11px] text-zinc-500">{leaderboard.length} miembros en leaderboard</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12121c] border border-white/[0.08] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span>Sorteos Activos</span>
            <Gift className="w-4 h-4 text-[#F5A623]" />
          </div>
          <p className="text-2xl font-black text-amber-400">{giveaways.length}</p>
          <p className="text-[11px] text-zinc-500">Listos para girar ruleta en OBS</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12121c] border border-white/[0.08] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span>Votos en Encuestas</span>
            <Vote className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {polls.reduce((acc, p) => acc + p.totalVotes, 0)}
          </p>
          <p className="text-[11px] text-zinc-500">{polls.length} encuestas creadas</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12121c] border border-white/[0.08] shadow-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
            <span>Puntos Repartidos</span>
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-black text-yellow-400">
            {totalPointsCirculating.toLocaleString()} pts
          </p>
          <p className="text-[11px] text-zinc-500">En balances de usuarios</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#12121c] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-black text-white">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setAdminTab('giveaways')}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#E91E8C]/20 to-transparent border border-[#E91E8C]/30 text-white font-bold text-xs hover:bg-[#E91E8C]/30 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#E91E8C]" />
            <span>Crear Nuevo Sorteo</span>
          </button>

          <button
            onClick={() => setAdminTab('polls')}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#F5A623]/20 to-transparent border border-[#F5A623]/30 text-white font-bold text-xs hover:bg-[#F5A623]/30 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#F5A623]" />
            <span>Lanzar Encuesta en Vivo</span>
          </button>

          <a
            href="/obs/ruleta"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-transparent border border-amber-500/30 text-white font-bold text-xs hover:bg-amber-500/30 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Abrir Ruleta para Stream</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>
      </div>
    </div>
  );
}