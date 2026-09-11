'use client';

import React, { useState } from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Plus, Star, Crown, Megaphone, Shirt, Award, Gift } from 'lucide-react';

function getRewardIcon(category: string) {
  switch (category) {
    case 'ROLE':
      return <Crown className="w-5 h-5 text-amber-400" />;
    case 'SHOUTOUT':
      return <Megaphone className="w-5 h-5 text-[#E91E8C]" />;
    case 'MERCH':
      return <Shirt className="w-5 h-5 text-cyan-400" />;
    case 'BADGE':
      return <Award className="w-5 h-5 text-yellow-400" />;
    default:
      return <Gift className="w-5 h-5 text-emerald-400" />;
  }
}

export default function AdminShop() {
  const { shopItems, addShopItem } = useCommunityStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePoints, setPricePoints] = useState(1000);
  const [category, setCategory] = useState<'ROLE' | 'BADGE' | 'SHOUTOUT' | 'DIGITAL' | 'MERCH'>('ROLE');
  const [icon, setIcon] = useState('GIFT');
  const [stock] = useState(-1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addShopItem({
      name,
      description,
      pricePoints: Number(pricePoints),
      category,
      icon,
      stock: Number(stock),
    });

    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Tienda & Canje de Recompensas</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Define los premios físicos o digitales que los miembros pueden reclamar con sus puntos.
        </p>
      </div>

      {/* Item Creator */}
      <form
        onSubmit={handleAdd}
        className="bg-[#12121c] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4"
      >
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" /> Añadir Artículo Canjeable
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Nombre del Premio *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Saludo de Cumpleaños en Directo"
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Precio en Puntos *</label>
            <input
              type="number"
              required
              min={50}
              value={pricePoints}
              onChange={(e) => setPricePoints(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Emoji / Ícono</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="ml-auto block px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 transition-all shadow-lg"
        >
          Guardar Premio
        </button>
      </form>

      {/* Items list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopItems.map((item) => (
          <div key={item.id} className="bg-[#12121c] border border-white/[0.08] rounded-2xl p-4 space-y-2">
            <div className="p-2 rounded-xl bg-white/[0.04] inline-block border border-white/[0.06]">{getRewardIcon(item.category)}</div>
            <h4 className="text-sm font-bold text-white">{item.name}</h4>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
              <span className="text-amber-400 font-black flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {item.pricePoints.toLocaleString()} pts
              </span>
              <span className="text-zinc-500">{item.stock === -1 ? 'Ilimitado' : `Stock: ${item.stock}`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}