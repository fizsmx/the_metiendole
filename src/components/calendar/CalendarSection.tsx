'use client';

import React from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Calendar, Radio, ExternalLink } from 'lucide-react';
import { YoutubeIcon } from '@/components/ui/Icons';

export default function CalendarSection() {
  const { streamEvents } = useCommunityStore();

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" /> Calendario de Directos
          </div>
          <h2 className="text-3xl font-black text-white">
            Próximas Transmisiones en Vivo
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Activa las notificaciones en YouTube para no perderte el debate semanal.
          </p>
        </div>

        <div className="space-y-4">
          {streamEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#12121c] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5" /> EN VIVO PRONTO
                  </span>
                  <span className="text-xs font-bold text-zinc-400">
                    {evt.gameTitle}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{evt.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{evt.description}</p>
              </div>

              <a
                href={evt.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg"
              >
                <YoutubeIcon className="w-4 h-4" />
                <span>Ver en YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}