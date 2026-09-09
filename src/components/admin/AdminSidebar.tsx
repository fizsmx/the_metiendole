'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import {
  LayoutDashboard,
  Gift,
  Vote,
  Users,
  MessageSquare,
  Radio,
  ShoppingBag,
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function AdminSidebar() {
  const { adminTab, setAdminTab } = useCommunityStore();

  const navItems: Array<{
    id: 'overview' | 'giveaways' | 'polls' | 'users' | 'feed' | 'streams' | 'shop';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'overview', label: 'Resumen Global', icon: LayoutDashboard },
    { id: 'giveaways', label: 'Sorteos & Ruleta', icon: Gift, badge: 'HOT' },
    { id: 'polls', label: 'Votaciones Podcast', icon: Vote },
    { id: 'users', label: 'Usuarios & Roles', icon: Users },
    { id: 'feed', label: 'Moderación Muro', icon: MessageSquare },
    { id: 'streams', label: 'En Vivo & YouTube', icon: Radio },
    { id: 'shop', label: 'Tienda & Premios', icon: ShoppingBag },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#0d0d15] border-b lg:border-b-0 lg:border-r border-white/[0.08] p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#E91E8C] to-[#F5A623]">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
                <Image
                  src="/images/brand/logo-icon.png"
                  alt="MN"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <h2 className="font-black text-sm text-white flex items-center gap-1.5">
                <span>METELE NOMÁS</span>
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Panel Admin
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E91E8C] to-[#F5A623] text-white shadow-lg shadow-[#E91E8C]/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Utilities */}
      <div className="pt-6 border-t border-white/[0.08] space-y-2 mt-6">
        {/* OBS Ruleta Source Link */}
        <a
          href="/obs/ruleta"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Overlay OBS Ruleta</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Back to Public Web */}
        <Link
          href="/"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Web</span>
        </Link>
      </div>
    </aside>
  );
}