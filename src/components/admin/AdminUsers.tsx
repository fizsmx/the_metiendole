'use client';

import React from 'react';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Plus, Minus } from 'lucide-react';
import { UserRole } from '@/types';

export default function AdminUsers() {
  const { leaderboard, updateUserRole, adjustUserPoints } = useCommunityStore();

  const roles: UserRole[] = ['ADMIN', 'MODERATOR', 'VIP', 'MEMBER'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Comunidad & Roles de Usuario</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Asigna roles de moderación, premia seguidores con puntos de fidelidad o ajusta sus rachas.
        </p>
      </div>

      <div className="bg-[#12121c] border border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
        <div className="divide-y divide-white/[0.06]">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/[0.1] shrink-0">
                  <Image src={user.image} alt={user.name} fill sizes="44px" className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{user.name}</h4>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#E91E8C]/20 text-[#E91E8C]">
                      Nv.{user.level}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">@{user.nickname}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Role Selector */}
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                  className="bg-black/60 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#E91E8C]"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      Rol: {r}
                    </option>
                  ))}
                </select>

                {/* Points Modifier */}
                <div className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-xl border border-white/[0.06]">
                  <button
                    onClick={() => adjustUserPoints(user.id, -100)}
                    className="p-1 rounded text-zinc-400 hover:text-red-400"
                    title="-100 puntos"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-amber-400 px-1">
                    {user.points.toLocaleString()} pts
                  </span>
                  <button
                    onClick={() => adjustUserPoints(user.id, 100)}
                    className="p-1 rounded text-zinc-400 hover:text-emerald-400"
                    title="+100 puntos"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}