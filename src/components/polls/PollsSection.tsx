'use client';

import React from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Vote, BarChart3 } from 'lucide-react';

export default function PollsSection() {
  const { polls, votePoll } = useCommunityStore();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#E91E8C]/15 border border-[#E91E8C]/30 text-[#E91E8C] text-xs font-extrabold uppercase tracking-wider mb-2">
            <Vote className="w-4 h-4" /> Votaciones Comunitarias
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Tú Decides el Contenido del Stream
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Tu voto cuenta. Cada vez que votas ganas +10 puntos de experiencia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="bg-[#11111a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-md bg-white/[0.05] text-[#F5A623] uppercase border border-white/[0.08]">
                  {poll.category}
                </span>
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  {poll.totalVotes} votos registrados
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {poll.question}
                </h3>
                {poll.description && (
                  <p className="text-xs text-zinc-400 mt-1.5">{poll.description}</p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {poll.options.map((option) => {
                  const isSelected = poll.userVotedOptionId === option.id;
                  const hasVoted = Boolean(poll.userVotedOptionId);

                  return (
                    <button
                      key={option.id}
                      onClick={() => !hasVoted && votePoll(poll.id, option.id)}
                      disabled={hasVoted}
                      className={`w-full relative overflow-hidden text-left p-4 rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? 'border-[#E91E8C] bg-[#E91E8C]/10 shadow-[0_0_20px_rgba(233,30,140,0.2)]'
                          : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      {/* Animated Progress Bar Fill */}
                      {hasVoted && (
                        <div
                          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#E91E8C]/25 to-[#F5A623]/25 transition-all duration-700 pointer-events-none rounded-2xl"
                          style={{ width: `${option.percentage}%` }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#E91E8C] bg-[#E91E8C]'
                                : 'border-zinc-600'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="text-sm font-bold text-zinc-200 truncate">
                            {option.text}
                          </span>
                        </div>

                        {hasVoted && (
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-white">
                              {option.percentage}%
                            </span>
                            <span className="text-[11px] font-medium text-zinc-500 block">
                              {option.votesCount} votos
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}