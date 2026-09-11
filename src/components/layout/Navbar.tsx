'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
  ChevronDown,
  User,
} from 'lucide-react';
import { isSuperAdminEmail } from '@/lib/constants';

export default function Navbar() {
  const { data: session, status } = useSession();
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    syncFromDatabase,
    dailyClaimed,
    claimDailyReward,
    setIsProfileOpen,
    setIsWhatsAppQROpen,
    setIsAuthModalOpen,
  } = useCommunityStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Synchronize store data from database on mount
  useEffect(() => {
    syncFromDatabase();
  }, [syncFromDatabase]);

  // Synchronize authenticated session user into community store
  useEffect(() => {
    if (session?.user) {
      setCurrentUser({
        id: session.user.id,
        name: session.user.name || 'Metedor',
        nickname: session.user.nickname || session.user.name || 'Metedor',
        email: session.user.email || '',
        image: session.user.image || '/images/brand/logo-circle.png',
        role: (session.user.role as 'ADMIN' | 'MODERATOR' | 'VIP' | 'MEMBER') || 'MEMBER',
        points: session.user.points ?? 150,
        level: session.user.level ?? 1,
        streak: session.user.streak ?? 1,
      });
    }
  }, [session, setCurrentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary visible tabs in center navbar (compact width)
  const primaryNavItems: Array<{
    id: 'home' | 'sorteos' | 'votaciones' | 'leaderboard' | 'muro';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'home', label: 'Inicio', icon: Sparkles },
    { id: 'sorteos', label: 'Sorteos', icon: Gift, badge: 'HOT' },
    { id: 'votaciones', label: 'Votaciones', icon: Vote },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'muro', label: 'Muro', icon: MessageSquare },
  ];

  // Secondary items placed inside clean "Más" dropdown
  const secondaryNavItems: Array<{
    id: 'clips' | 'tienda' | 'calendario';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'clips', label: 'Clips Épicos', icon: Video },
    { id: 'tienda', label: 'Tienda de Puntos', icon: ShoppingBag },
    { id: 'calendario', label: 'Directos en Vivo', icon: Calendar },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const handleClaim = () => {
    if (status !== 'authenticated') {
      setIsAuthModalOpen(true);
      return;
    }
    const res = claimDailyReward();
    if (res.success) {
      setClaimToast(`+${res.points} Pts!`);
      setTimeout(() => setClaimToast(null), 3000);
    }
  };

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);
  const isAuthenticated = status === 'authenticated';
  const isSuperAdmin = isAuthenticated && isSuperAdminEmail(session?.user?.email);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#09090f]/90 border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* 1. Logo Brand */}
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none shrink-0"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#E91E8C] to-[#F5A623] shadow-[0_0_15px_rgba(233,30,140,0.35)] group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] overflow-hidden flex items-center justify-center">
                  <Image
                    src="/images/brand/logo-icon.png"
                    alt="Metele Nomas"
                    width={36}
                    height={36}
                    className="object-contain w-7 h-7 sm:w-8 sm:h-8"
                    priority
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm sm:text-base tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#E91E8C] group-hover:to-[#F5A623] transition-colors">
                    METELE NOMÁS
                  </span>
                  <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    <Radio className="w-2 h-2 animate-pulse" />
                    <span className="hidden xs:inline">Directo</span>
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium tracking-wide hidden 2xl:block">
                  Comunidad Oficial • @MeteleNomas
                </p>
              </div>
            </button>

            {/* 2. Desktop Navigation (Compact & Streamlined) */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] shadow-md shadow-[#E91E8C]/25'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-red-500 text-white font-black px-1.5 py-0.1 rounded-full uppercase leading-none">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Más Dropdown Menu */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSecondaryActive
                      ? 'text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span>Más</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-44 bg-[#12121c] border border-white/[0.1] rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-scale-in">
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMoreDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-[#E91E8C] to-[#F5A623] text-white'
                              : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* 3. User Controls & Quick Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* WhatsApp Community Button */}
              <button
                onClick={() => setIsWhatsAppQROpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all hover:scale-105"
                title="Grupo de WhatsApp"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              {/* Daily Login Claim Button */}
              <div className="relative">
                <button
                  onClick={handleClaim}
                  disabled={isAuthenticated && dailyClaimed}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-300 ${
                    isAuthenticated && dailyClaimed
                      ? 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/40 cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:scale-105 animate-bounce'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${isAuthenticated && dailyClaimed ? 'text-zinc-500' : 'text-yellow-200 fill-yellow-200'}`} />
                  <span className="hidden md:inline">
                    {isAuthenticated && dailyClaimed ? `Racha: ${currentUser.streak}d` : 'Reclamar'}
                  </span>
                  <span className="md:hidden">
                    {isAuthenticated && dailyClaimed ? `${currentUser.streak}d` : '+Pts'}
                  </span>
                </button>
                {claimToast && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-amber-300 bg-[#12121a] px-2 py-0.5 rounded-md border border-amber-500/40 shadow-xl whitespace-nowrap z-50 animate-fade-in">
                    {claimToast}
                  </div>
                )}
              </div>

              {/* Admin Panel Link (Only for the Super Admin Fisbert) */}
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:scale-105 transition-all shadow-sm"
                  title="Panel de Administrador"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden md:inline">Admin</span>
                </Link>
              )}

              {/* Authenticated User Profile Pill */}
              {isAuthenticated ? (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#E91E8C]/50 hover:bg-white/[0.08] transition-all group shrink-0"
                >
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-[#E91E8C]/40 shrink-0">
                    <Image
                      src={currentUser.image}
                      alt={currentUser.name}
                      width={28}
                      height={28}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white group-hover:text-[#F5A623] transition-colors">
                        {currentUser.nickname}
                      </span>
                      <span className="text-[9px] font-black px-1 rounded bg-gradient-to-r from-[#E91E8C] to-[#F5A623] text-white leading-tight">
                        Nv.{currentUser.level}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold text-amber-400 leading-none">
                      ★ {currentUser.points.toLocaleString()} pts
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623] hover:scale-105 shadow-md shadow-[#E91E8C]/25 transition-all shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Entrar con Google</span>
                  <span className="sm:hidden">Entrar</span>
                </button>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] border border-white/[0.08]"
                aria-label="Menú móvil"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0e0e16]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-4 space-y-3 animate-slide-down">
            <div className="grid grid-cols-2 gap-2">
              {allNavItems.map((item) => {
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
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Panel de Administrador (Fisbert)</span>
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

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsProfileOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-zinc-200 bg-white/[0.05] border border-white/[0.08]"
                >
                  <span>Mi Perfil ({currentUser.points} pts)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623]"
                >
                  <User className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c14]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 shadow-2xl">
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
                className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#E91E8C] to-[#F5A623] font-black scale-105'
                    : 'text-zinc-400 hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E91E8C]' : 'text-zinc-400'}`} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
