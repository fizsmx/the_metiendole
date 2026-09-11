'use client';

import React, { useState } from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { ShoppingBag, Star, CheckCircle2, AlertCircle, Crown, Megaphone, Shirt, Award, Gift } from 'lucide-react';

function getRewardIcon(category: string) {
  switch (category) {
    case 'ROLE':
      return <Crown className="w-8 h-8 text-amber-400" />;
    case 'SHOUTOUT':
      return <Megaphone className="w-8 h-8 text-[#E91E8C]" />;
    case 'MERCH':
      return <Shirt className="w-8 h-8 text-cyan-400" />;
    case 'BADGE':
      return <Award className="w-8 h-8 text-yellow-400" />;
    default:
      return <Gift className="w-8 h-8 text-emerald-400" />;
  }
}

export default function ShopSection() {
  const { shopItems, redeemItem, currentUser } = useCommunityStore();
  const [toast, setToast] = useState<{ id: string; message: string; success: boolean } | null>(null);

  const handleRedeem = (id: string) => {
    const res = redeemItem(id);
    setToast({ id, message: res.message, success: res.success });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-4 h-4" /> Tienda de Recompensas
          </div>
          <h2 className="text-3xl font-black text-white">
            Canjea tus Puntos por Premios
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Tienes <span className="text-amber-400 font-bold">{currentUser.points.toLocaleString()} puntos</span> disponibles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#12121c] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
            >
              <div>
                <div className="p-3 rounded-2xl bg-white/[0.04] inline-flex items-center justify-center mb-3 border border-white/[0.06]">
                  {getRewardIcon(item.category)}
                </div>
                <h3 className="text-base font-extrabold text-white">{item.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.pricePoints.toLocaleString()} pts
                  </span>
                  <span className="text-zinc-500">
                    {item.stock === -1 ? 'Ilimitado' : `${item.stock} disponibles`}
                  </span>
                </div>

                {toast && toast.id === item.id && (
                  <div
                    className={`text-[11px] font-bold p-2.5 rounded-xl flex items-center gap-1.5 ${
                      toast.success
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {toast.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{toast.message}</span>
                  </div>
                )}

                <button
                  onClick={() => handleRedeem(item.id)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 transition-all shadow-md"
                >
                  Canjear Ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}