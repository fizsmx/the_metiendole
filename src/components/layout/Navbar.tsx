'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCommunityStore } from '@/stores/useCommunityStore';
import {
  Flame,
  Gift,
  Vote,
  Trophy,
  MessageSquare,
  Video,
  ShoppingBag,
  Calendar,
  Sparkles,
  Menu,
  X,
  QrCode,
  Radio,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    dailyClaimed,
    claimDailyReward,
    setIsProfileOpen,
    setIsWhatsAppQROpen,
  } = useCommunityStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  const navItems: Array<{
    id: 'home' | 'sorteos' | 'votaciones' | 'leaderboard' | 'muro' | 'clips' | 'tienda' | 'calendario';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'home', label: 'Inicio', icon: Sparkles },
    { id: 'sorteos', label: 'Sorteos', icon: Gift, badge: 'HOT' },
    { id: 'votaciones', label: 'Votaciones', icon: Vote },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'muro', label: 'Muro', icon: MessageSquare },
    { id: 'clips', label: 'Clips', icon: Video },
    { id: 'tienda', label: 'Tienda', icon: ShoppingBag },
    { id: 'calendario', label: 'En Vivo', icon: Calendar },
  ];

  const handleClaim = () => {
    const res = claimDailyReward();
    if (res.success) {
      setClaimToast(`+${res.points} Pts!`);
      setTimeout(() => setClaimToast(null), 3000);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a0a0f]/90 border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Brand */}
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none shrink-0"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#E91E8C] to-[#F5A623] shadow-[0_0_20px_rgba(233,30,140,0.4)] group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] overflow-hidden flex items-center justify-center">
                  <Image
                    src="/images/brand/logo-icon.png"
                    alt="Metele Nomas Icon"
                    width={40}
                    height={40}
                    className="object-contain w-8 h-8 sm:w-10 sm:h-10"
                    priority
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-base sm:text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#E91E8C] group-hover:to-[#F5A623] transition-colors">
                    METELE NOMÁS
                  </span>
                  <span className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    <span className="hidden xs:inline">Directo</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wide hidden sm:block">
                  Comunidad Oficial • Podcast & Stream
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.06]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] shadow-lg shadow-[#E91E8C]/20'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User Controls & Daily Claim */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* WhatsApp Community Button (Tablet/Desktop) */}
              <button
                onClick={() => setIsWhatsAppQROpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all hover:scale-105"
                title="Grupo de WhatsApp"
              >
                <QrCode className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* Daily Login Claim Button */}
              <div className="relative">
                <button
                  onClick={handleClaim}
                  disabled={dailyClaimed}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    dailyClaimed
                      ? 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/40 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:scale-105 animate-bounce'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${dailyClaimed ? 'text-zinc-500' : 'text-yellow-200 fill-yellow-200'}`} />
                  <span className="hidden sm:inline">
                    {dailyClaimed ? `Racha: ${currentUser.streak}d` : 'Reclamar'}
                  </span>
                  <span className="sm:hidden">
                    {dailyClaimed ? `${currentUser.streak}d` : '+Pts'}
                  </span>
                </button>
                {claimToast && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-amber-300 bg-[#12121a] px-2 py-0.5 rounded-md border border-amber-500/40 shadow-xl whitespace-nowrap z-50">
                    {claimToast}
                  </div>
                )}
              </div>

              {/* Admin Panel Link */}
              {currentUser.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:scale-105 transition-all shadow-md"
                  title="Panel de Administrador"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden lg:inline">Panel Admin</span>
                </Link>
              )}

              {/* User Profile Pill */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#E91E8C]/50 hover:bg-white/[0.08] transition-all group"
              >
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-[#E91E8C]/40">
                  <Image
                    src={currentUser.image}
                    alt={currentUser.name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-[#F5A623] transition-colors">
                      {currentUser.nickname}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-gradient-to-r from-[#E91E8C] to-[#F5A623] text-white">
                      Nv.{currentUser.level}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                    <span>★</span>
                    <span>{currentUser.points.toLocaleString()} pts</span>
                  </div>
                </div>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] border border-white/[0.08]"
                aria-label="Menú móvil"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0e0e16]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-4 space-y-3 animate-slide-down">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E91E8C] to-[#F5A623] text-white shadow-md'
                        : 'text-zinc-300 bg-white/[0.02] hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2">
              {currentUser.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Entrar al Panel de Administrador</span>
                </Link>
              )}
              <button
                onClick={() => {
                  setIsWhatsAppQROpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              >
                <QrCode className="w-4 h-4" />
                <span>WhatsApp QR</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-zinc-200 bg-white/[0.05] border border-white/[0.08]"
              >
                <span>Mi Perfil ({currentUser.points} pts)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Floating Bottom Navigation Bar for Mobile (Mobile-first app experience) */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c14]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-2 shadow-2xl">
        <div className="flex items-center justify-around">
          {[
            { id: 'home' as const, label: 'Inicio', icon: Sparkles },
            { id: 'sorteos' as const, label: 'Sorteos', icon: Gift },
            { id: 'votaciones' as const, label: 'Votar', icon: Vote },
            { id: 'leaderboard' as const, label: 'Ranking', icon: Trophy },
            { id: 'muro' as const, label: 'Muro', icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#E91E8C] to-[#F5A623] font-black scale-105'
                    : 'text-zinc-400 hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#E91E8C]' : 'text-zinc-400'}`} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}