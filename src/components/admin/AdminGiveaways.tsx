'use client';

import React, { useState } from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Plus, Trash2, Sparkles, Clock, Users } from 'lucide-react';

export default function AdminGiveaways() {
  const { giveaways, createGiveaway, deleteGiveaway, setIsWheelOpen } = useCommunityStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prize, setPrize] = useState('');
  const [costPoints, setCostPoints] = useState(50);
  const [minLevel, setMinLevel] = useState(1);
  const [winnersCount] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [createdToast, setCreatedToast] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prize.trim()) return;

    createGiveaway({
      title,
      description,
      prize,
      costPoints: Number(costPoints),
      minLevel: Number(minLevel),
      winnersCount: Number(winnersCount),
      endsAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
    });

    setTitle('');
    setDescription('');
    setPrize('');
    setImageUrl('');
    setCreatedToast(true);
    setTimeout(() => setCreatedToast(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Gestión de Sorteos & Giveaways</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Crea nuevos sorteos y ejecuta la ruleta animada para elegir a los ganadores en vivo.
        </p>
      </div>

      {/* Creation Form */}
      <form
        onSubmit={handleCreate}
        className="bg-[#12121c] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4"
      >
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#E91E8C]" /> Crear Nuevo Sorteo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Título del Sorteo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Auriculares Logitech G Pro + Merch"
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E91E8C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Premio Principal *</label>
            <input
              type="text"
              required
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              placeholder="Ej: Auriculares Logitech G Pro"
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E91E8C]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-zinc-300 block mb-1">Descripción</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre las reglas del sorteo o envío del premio..."
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E91E8C] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Costo en Puntos (0 = Gratis)</label>
            <input
              type="number"
              min={0}
              value={costPoints}
              onChange={(e) => setCostPoints(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E91E8C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Nivel Mínimo Requerido</label>
            <input
              type="number"
              min={1}
              max={5}
              value={minLevel}
              onChange={(e) => setMinLevel(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E91E8C]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {createdToast ? (
            <span className="text-xs font-black text-emerald-400">¡Sorteo publicado con éxito! 🎉</span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] hover:scale-105 transition-all shadow-lg"
          >
            Publicar Sorteo
          </button>
        </div>
      </form>

      {/* Giveaways List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Sorteos Registrados ({giveaways.length})
          </h3>
          <button
            onClick={() => setIsWheelOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Girar Ruleta de Sorteo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {giveaways.map((gw) => (
            <div
              key={gw.id}
              className="bg-[#12121c] border border-white/[0.08] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {gw.status}
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {gw.costPoints === 0 ? 'GRATIS' : `${gw.costPoints} PTS`}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{gw.title}</h4>
                <p className="text-xs text-zinc-400 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#E91E8C]" /> {gw.participantsCount} participantes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {gw.winnersCount} ganador(es)
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsWheelOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 transition-all"
                >
                  Girar Ganador
                </button>
                <button
                  onClick={() => deleteGiveaway(gw.id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Eliminar Sorteo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}