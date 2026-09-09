'use client';

import React from 'react';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Trophy, Flame, Crown, Medal } from 'lucide-react';

export default function LeaderboardSection() {
  const { leaderboard } = useCommunityStore();

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" /> Hall of Fame
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Tabla de Clasificación de la Comunidad
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Los miembros con mayor lealtad, racha de asistencia y participación en el canal.
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 items-end">
          {/* Rank 2 - Silver */}
          {top3[1] && (
            <div className="bg-[#12121c] border border-zinc-400/30 rounded-3xl p-6 text-center shadow-xl order-2 md:order-1 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-zinc-300 text-zinc-950 font-black text-xs flex items-center gap-1 shadow-lg">
                <Medal className="w-3.5 h-3.5" /> #2 PLATA
              </div>
              <div className="relative w-20 h-20 mx-auto my-3 rounded-2xl overflow-hidden border-2 border-zinc-400">
                <Image src={top3[1].image} alt={top3[1].name} fill sizes="80px" className="object-cover" />
              </div>
              <h3 className="font-extrabold text-white text-base">{top3[1].name}</h3>
              <p className="text-xs text-zinc-400">@{top3[1].nickname}</p>
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/[0.04] text-amber-400 text-xs font-bold">
                <span>{top3[1].points.toLocaleString()} pts</span>
              </div>
            </div>
          )}

          {/* Rank 1 - Gold (Center) */}
          {top3[0] && (
            <div className="bg-gradient-to-b from-[#1c1810] to-[#12121c] border-2 border-amber-400/60 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(245,166,35,0.2)] order-1 md:order-2 relative scale-105">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-xl">
                <Crown className="w-4 h-4 fill-zinc-950" /> #1 CAMPEÓN
              </div>
              <div className="relative w-24 h-24 mx-auto my-3 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl">
                <Image src={top3[0].image} alt={top3[0].name} fill sizes="96px" className="object-cover" />
              </div>
              <h3 className="font-black text-white text-lg">{top3[0].name}</h3>
              <p className="text-xs text-amber-400 font-bold">@{top3[0].nickname}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-black border border-amber-500/30">
                <span>★ {top3[0].points.toLocaleString()} pts</span>
              </div>
            </div>
          )}

          {/* Rank 3 - Bronze */}
          {top3[2] && (
            <div className="bg-[#12121c] border border-amber-700/30 rounded-3xl p-6 text-center shadow-xl order-3 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-700 text-white font-black text-xs flex items-center gap-1 shadow-lg">
                <Medal className="w-3.5 h-3.5" /> #3 BRONCE
              </div>
              <div className="relative w-20 h-20 mx-auto my-3 rounded-2xl overflow-hidden border-2 border-amber-700">
                <Image src={top3[2].image} alt={top3[2].name} fill sizes="80px" className="object-cover" />
              </div>
              <h3 className="font-extrabold text-white text-base">{top3[2].name}</h3>
              <p className="text-xs text-zinc-400">@{top3[2].nickname}</p>
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/[0.04] text-amber-400 text-xs font-bold">
                <span>{top3[2].points.toLocaleString()} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Remaining Users Table */}
        <div className="max-w-4xl mx-auto bg-[#101018] border border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
          <div className="divide-y divide-white/[0.06]">
            {rest.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 text-center font-black text-sm text-zinc-500">
                    #{user.rank}
                  </span>
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/[0.1]">
                    <Image src={user.image} alt={user.name} fill sizes="40px" className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{user.name}</h4>
                    <p className="text-xs text-zinc-500">@{user.nickname}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-orange-400 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span>{user.streak}d racha</span>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white/[0.04] text-amber-400">
                    {user.points.toLocaleString()} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}