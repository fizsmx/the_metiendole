'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomeDashboard from '@/components/landing/HomeDashboard';
import GiveawaysSection from '@/components/giveaways/GiveawaysSection';
import PollsSection from '@/components/polls/PollsSection';
import LeaderboardSection from '@/components/leaderboard/LeaderboardSection';
import CommunityFeedSection from '@/components/feed/CommunityFeedSection';
import ClipsSection from '@/components/clips/ClipsSection';
import ShopSection from '@/components/shop/ShopSection';
import CalendarSection from '@/components/calendar/CalendarSection';
import ProfileModal from '@/components/profile/ProfileModal';
import WhatsAppQRModal from '@/components/whatsapp/WhatsAppQRModal';
import GiveawayWheelModal from '@/components/giveaways/GiveawayWheelModal';
import AuthModal from '@/components/auth/AuthModal';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useCommunityStore } from '@/stores/useCommunityStore';

export default function HomePage() {
  const { activeTab } = useCommunityStore();

  return (
    <main className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#f0f0f5] pb-16 lg:pb-0">
      {/* Header Bar */}
      <Navbar />

      {/* Main Dynamic View */}
      <div className="flex-1">
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'sorteos' && <GiveawaysSection />}
        {activeTab === 'votaciones' && <PollsSection />}
        {activeTab === 'leaderboard' && <LeaderboardSection />}
        {activeTab === 'muro' && <CommunityFeedSection />}
        {activeTab === 'clips' && <ClipsSection />}
        {activeTab === 'tienda' && <ShopSection />}
        {activeTab === 'calendario' && <CalendarSection />}
      </div>

      {/* Interactive Modals */}
      <ProfileModal />
      <WhatsAppQRModal />
      <GiveawayWheelModal />
      <AuthModal />

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </main>
  );
}