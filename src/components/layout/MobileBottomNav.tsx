'use client';

import React from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import {
  Sparkles,
  Gift,
  Vote,
  Trophy,
  MessageSquare,
} from 'lucide-react';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab } = useCommunityStore();

  const navItems = [
    { id: 'home' as const, label: 'Inicio', icon: Sparkles },
    { id: 'sorteos' as const, label: 'Sorteos', icon: Gift, badge: 'HOT' },
    { id: 'votaciones' as const, label: 'Votar', icon: Vote },
    { id: 'muro' as const, label: 'Muro', icon: MessageSquare },
    { id: 'leaderboard' as const, label: 'Top', icon: Trophy },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c14]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive ? 'text-[#F5A623]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {item.badge && (
                <span className="absolute top-0 right-2 text-[8px] font-black px-1 rounded-full bg-red-500 text-white leading-tight animate-pulse">
                  {item.badge}
                </span>
              )}
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-[#E91E8C]/20 to-[#F5A623]/20 shadow-sm border border-[#E91E8C]/30'
                    : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5A623]' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isActive ? 'text-white font-black' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
