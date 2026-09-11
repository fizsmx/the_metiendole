'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminGiveaways from '@/components/admin/AdminGiveaways';
import AdminPolls from '@/components/admin/AdminPolls';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminStreams from '@/components/admin/AdminStreams';
import AdminShop from '@/components/admin/AdminShop';
import CommunityFeedSection from '@/components/feed/CommunityFeedSection';
import GiveawayWheelModal from '@/components/giveaways/GiveawayWheelModal';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useSession } from 'next-auth/react';
import { isSuperAdminEmail } from '@/lib/constants';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { adminTab } = useCommunityStore();

  const isSuperAdmin = status === 'authenticated' && isSuperAdminEmail(session?.user?.email);

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-black text-white">Acceso Restringido</h1>
        <p className="text-sm text-zinc-400 max-w-sm mt-2">
          Este panel de control es exclusivo para Fisbert (creador y único administrador oficial de Metele Nomás).
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#E91E8C] to-[#F5A623]"
        >
          Volver a la Página Principal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090e] text-[#f0f0f5] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Admin Content Body */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full">
        {adminTab === 'overview' && <AdminOverview />}
        {adminTab === 'giveaways' && <AdminGiveaways />}
        {adminTab === 'polls' && <AdminPolls />}
        {adminTab === 'users' && <AdminUsers />}
        {adminTab === 'feed' && <CommunityFeedSection />}
        {adminTab === 'streams' && <AdminStreams />}
        {adminTab === 'shop' && <AdminShop />}
      </main>

      {/* Giveaway Wheel Modal */}
      <GiveawayWheelModal />
    </div>
  );
}