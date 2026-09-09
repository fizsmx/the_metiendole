'use client';

import React from 'react';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Video, Heart, Play, Sparkles } from 'lucide-react';

export default function ClipsSection() {
  const { clips, toggleClipLike } = useCommunityStore();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Video className="w-4 h-4" /> Galería de Momentos Épicos
          </div>
          <h2 className="text-3xl font-black text-white">
            Clips & Mejores Jugadas
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Los mejores recortes del podcast y streams comunitarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="bg-[#12121c] border border-white/[0.08] rounded-3xl overflow-hidden shadow-xl group flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                <Image
                  src={clip.thumbnail}
                  alt={clip.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {clip.isStaffPick && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> STAFF PICK
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {clip.title}
                  </h3>
                  {clip.description && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{clip.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                  <span className="text-zinc-500">Por @{clip.creatorName}</span>
                  <button
                    onClick={() => toggleClipLike(clip.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition-all ${
                      clip.userLiked
                        ? 'border-red-500/50 bg-red-500/20 text-red-400'
                        : 'border-white/[0.08] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${clip.userLiked ? 'fill-red-400' : ''}`} />
                    <span>{clip.likesCount}</span>
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