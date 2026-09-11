'use client';

import React from 'react';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { getLevel } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import { X, Trophy, Flame, Star, Award, ShieldCheck, CheckCircle2, LogOut } from 'lucide-react';

export default function ProfileModal() {
  const { isProfileOpen, setIsProfileOpen, currentUser, achievements } = useCommunityStore();
  const { data: session } = useSession();

  if (!isProfileOpen) return null;

  const levelInfo = getLevel(currentUser.points);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#11111a] border border-white/[0.1] rounded-3xl shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={() => setIsProfileOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-zinc-400 hover:text-white hover:bg-black/90 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Banner */}
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-[#E91E8C]/30 via-zinc-900 to-[#F5A623]/30">
          <Image
            src={currentUser.banner || '/images/brand/banner.jpg'}
            alt="Profile Banner"
            fill
            sizes="672px"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11111a] via-transparent to-transparent" />
        </div>

        {/* Profile Info Header */}
        <div className="px-6 pb-6 relative -mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-[#E91E8C] to-[#F5A623] shadow-xl">
                <div className="w-full h-full bg-[#0a0a0f] rounded-[12px] overflow-hidden relative">
                  <Image
                    src={currentUser.image}
                    alt={currentUser.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E91E8C]/20 text-[#E91E8C] border border-[#E91E8C]/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {currentUser.role}
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-400">@{currentUser.nickname}</p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] p-2 rounded-2xl">
              <div className="text-center px-3 py-1">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-lg">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>{currentUser.streak}</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Días Racha</p>
              </div>
              <div className="h-8 w-[1px] bg-white/[0.1]" />
              <div className="text-center px-3 py-1">
                <div className="flex items-center justify-center gap-1 text-yellow-400 font-extrabold text-lg">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span>{currentUser.points.toLocaleString()}</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Puntos Totales</p>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-6 bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <div className="flex items-center gap-2 text-white">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Nivel {levelInfo.level} — {levelInfo.name}</span>
              </div>
              <span className="text-zinc-400">
                {currentUser.points} / {levelInfo.nextLevelPoints} pts para el siguiente nivel
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#E91E8C] to-[#F5A623] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,166,35,0.5)]"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="mt-6">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F5A623]" />
              Insignias & Logros Desbloqueados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                    ach.unlocked
                      ? 'bg-gradient-to-r from-white/[0.04] to-white/[0.01] border-white/[0.1]'
                      : 'bg-black/40 border-white/[0.03] opacity-40'
                  }`}
                >
                  <div className="text-2xl p-2 rounded-xl bg-black/60 border border-white/[0.08]">
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{ach.title}</h4>
                      {ach.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{ach.description}</p>
                    <span className="inline-block text-[10px] font-extrabold text-amber-400 mt-1">
                      +{ach.pointsReward} pts recompensa
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign Out Button */}
          {session && (
            <div className="mt-6 pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}