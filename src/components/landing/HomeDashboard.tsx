'use client';

import React from 'react';
import Image from 'next/image';
import HeroSection from '@/components/landing/HeroSection';
import { useCommunityStore } from '@/stores/useCommunityStore';
import {
  Gift,
  Vote,
  Trophy,
  Crown,
  Medal,
  Radio,
  ExternalLink,
  ChevronRight,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  QrCode,
} from 'lucide-react';
import { YoutubeIcon } from '@/components/ui/Icons';

export default function HomeDashboard() {
  const {
    giveaways,
    enterGiveaway,
    setIsWheelOpen,
    polls,
    votePoll,
    leaderboard,
    streamEvents,
    posts,
    setActiveTab,
    setIsWhatsAppQROpen,
  } = useCommunityStore();

  const nextStream = streamEvents[0];
  const featuredPoll = polls[0];
  const top3 = leaderboard.slice(0, 3);
  const recentPosts = posts.slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 space-y-6">
      {/* 1. Compact Hero Banner */}
      <HeroSection />

      {/* 2. Bento Grid (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* === LEFT COLUMN (7 COLS): Core Interactive Engagement === */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. Sorteos Activos */}
          <div className="bg-[#101018] border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Sorteos Activos en Vivo
                  </h3>
                  <p className="text-[11px] text-zinc-400">Participa con tus puntos acumulados</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWheelOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ruleta OBS</span>
                </button>
                <button
                  onClick={() => setActiveTab('sorteos')}
                  className="text-xs font-bold text-[#F5A623] hover:underline flex items-center gap-0.5"
                >
                  <span>Ver todos</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Giveaways Mini Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {giveaways.slice(0, 2).map((gw) => (
                <div
                  key={gw.id}
                  className="bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 rounded-xl overflow-hidden p-3.5 flex flex-col justify-between space-y-3 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="relative h-28 w-full rounded-lg overflow-hidden bg-zinc-900">
                      {gw.imageUrl && (
                        <Image
                          src={gw.imageUrl}
                          alt={gw.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white">
                        ACTIVO
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#E91E8C] text-white">
                        {gw.costPoints === 0 ? 'GRATIS' : `${gw.costPoints} PTS`}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                      {gw.title}
                    </h4>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#E91E8C]" /> {gw.participantsCount} inscritos
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> 3 días
                      </span>
                    </div>

                    <button
                      onClick={() => enterGiveaway(gw.id)}
                      disabled={gw.isEntered}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        gw.isEntered
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-gradient-to-r from-[#E91E8C] to-[#F5A623] text-white hover:scale-[1.02] shadow-md'
                      }`}
                    >
                      {gw.isEntered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Inscrito</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-3.5 h-3.5" />
                          <span>Inscribirme ({gw.costPoints} pts)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. Votaciones en Tiempo Real */}
          {featuredPoll && (
            <div className="bg-[#101018] border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#E91E8C]/15 text-[#E91E8C]">
                    <Vote className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Votación Comunitaria del Podcast
                    </h3>
                    <p className="text-[11px] text-zinc-400">Gana +10 puntos al votar</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('votaciones')}
                  className="text-xs font-bold text-[#F5A623] hover:underline flex items-center gap-0.5"
                >
                  <span>Ver todas ({polls.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                  {featuredPoll.question}
                </h4>

                {/* Options List */}
                <div className="space-y-2">
                  {featuredPoll.options.map((option) => {
                    const isSelected = featuredPoll.userVotedOptionId === option.id;
                    const hasVoted = Boolean(featuredPoll.userVotedOptionId);

                    return (
                      <button
                        key={option.id}
                        onClick={() => !hasVoted && votePoll(featuredPoll.id, option.id)}
                        disabled={hasVoted}
                        className={`w-full relative overflow-hidden text-left p-3 rounded-xl border transition-all duration-300 ${
                          isSelected
                            ? 'border-[#E91E8C] bg-[#E91E8C]/10 shadow-[0_0_15px_rgba(233,30,140,0.2)]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                      >
                        {hasVoted && (
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#E91E8C]/20 to-[#F5A623]/20 transition-all duration-700 pointer-events-none rounded-xl"
                            style={{ width: `${option.percentage}%` }}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-[#E91E8C] bg-[#E91E8C]'
                                  : 'border-zinc-600'
                              }`}
                            >
                              {isSelected && <span className="w-1 h-1 bg-white rounded-full" />}
                            </div>
                            <span className="font-bold text-zinc-200 truncate">
                              {option.text}
                            </span>
                          </div>

                          {hasVoted && (
                            <span className="font-black text-white shrink-0">
                              {option.percentage}% ({option.votesCount})
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === RIGHT COLUMN (5 COLS): Live Broadcast, Leaderboard & Social Pulse === */}
        <div className="lg:col-span-5 space-y-6">
          {/* A. Próximo Directo Card */}
          {nextStream && (
            <div className="bg-gradient-to-br from-[#161220] via-[#12121c] to-[#181310] border border-white/[0.1] rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>DIRECTO PRONTO</span>
                </span>
                <span className="text-xs text-zinc-400 font-bold">Viernes 20:00</span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white leading-snug">
                  {nextStream.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {nextStream.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <a
                  href={nextStream.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
                >
                  <YoutubeIcon className="w-4 h-4 text-white" />
                  <span>Ver en YouTube</span>
                  <ExternalLink className="w-3 h-3 text-red-200" />
                </a>

                <button
                  onClick={() => setIsWhatsAppQROpen(true)}
                  className="p-2 rounded-xl text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                  title="Aviso en WhatsApp"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* B. Leaderboard Top 3 (Hall of Fame Compact Podium) */}
          <div className="bg-[#101018] border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-yellow-500/15 text-yellow-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Top 3 Metedores
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className="text-xs font-bold text-[#F5A623] hover:underline flex items-center gap-0.5"
              >
                <span>Ver ranking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top 3 Compact List */}
            <div className="space-y-2">
              {top3.map((user, idx) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 text-center font-black text-xs">
                      {idx === 0 ? (
                        <Crown className="w-4 h-4 text-amber-400 mx-auto fill-amber-400" />
                      ) : idx === 1 ? (
                        <Medal className="w-4 h-4 text-zinc-300 mx-auto" />
                      ) : (
                        <Medal className="w-4 h-4 text-amber-700 mx-auto" />
                      )}
                    </span>
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/[0.1] shrink-0">
                      <Image src={user.image} alt={user.name} fill sizes="32px" className="object-cover" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">@{user.nickname}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-400">
                      {user.points.toLocaleString()} pts
                    </span>
                    <span className="text-[10px] font-bold text-orange-400 block">
                      🔥 {user.streak}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Muro Comunitario Preview */}
          <div className="bg-[#101018] border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E91E8C]/15 text-[#E91E8C]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Muro de la Comunidad
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('muro')}
                className="text-xs font-bold text-[#F5A623] hover:underline flex items-center gap-0.5"
              >
                <span>Ver muro</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{post.userName}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-white/[0.06] text-zinc-400">
                        {post.userRole}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">{post.createdAt}</span>
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400">
                    <span>🔥 {post.reactions[0]?.count || 0}</span>
                    <span>💬 {post.comments.length} respuestas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}