'use client';

import React, { useState } from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Calendar } from 'lucide-react';

export default function AdminStreams() {
  const { streamEvents, toggleStreamLive, addStreamEvent } = useCommunityStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gameTitle, setGameTitle] = useState('Podcast & Debate');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/@MeteleNomas');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addStreamEvent({
      title,
      description,
      gameTitle,
      youtubeUrl,
      scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    });

    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Transmisiones en Vivo & YouTube</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Programa los directos del canal y activa el aviso de &quot;EN VIVO&quot; en la cabecera de la web.
        </p>
      </div>

      {/* Stream Form */}
      <form
        onSubmit={handleAdd}
        className="bg-[#12121c] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4"
      >
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-red-400" /> Programar Nuevo Directo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-zinc-300 block mb-1">Título del Stream *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Metele Nomás #49 — Debate con Invitado Especial"
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Temática o Juego</label>
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Enlace del Live en YouTube</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="ml-auto block px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-red-600 to-orange-600 hover:scale-105 transition-all shadow-lg"
        >
          Guardar Directo
        </button>
      </form>

      {/* Stream Events List */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Directos Programados ({streamEvents.length})
        </h3>

        <div className="space-y-3">
          {streamEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#12121c] border border-white/[0.08] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                    evt.isLive
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {evt.isLive ? '🔴 EMITIENDO EN VIVO' : 'PROGRAMADO'}
                  </span>
                  <span className="text-xs text-zinc-400">{evt.gameTitle}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{evt.title}</h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleStreamLive(evt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    evt.isLive
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse'
                  }`}
                >
                  {evt.isLive ? 'Desactivar En Vivo' : '¡Activar En Vivo!'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}