'use client';

import React from 'react';
import Image from 'next/image';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { QrCode, MessageCircle, Heart, Gift, Vote, Trophy, ShoppingBag, Video } from 'lucide-react';
import { YoutubeIcon } from '@/components/ui/Icons';

export default function Footer() {
  const { setIsWhatsAppQROpen, setActiveTab } = useCommunityStore();

  return (
    <footer className="w-full bg-[#07070b] border-t border-white/[0.06] text-zinc-400 py-12 mt-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-r from-[#E91E8C]/20 to-[#F5A623]/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#E91E8C] to-[#F5A623]">
                <Image
                  src="/images/brand/logo-icon.png"
                  alt="Metele Nomas"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain bg-black rounded-[10px]"
                />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                METELE NOMÁS
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              La casa oficial de la comunidad de streaming y podcast más leal. Participa en votaciones en vivo, llévate premios en los sorteos semanales y acumula puntos con tu racha de directos.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.youtube.com/@MeteleNomas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 text-xs font-bold transition-all"
              >
                <YoutubeIcon className="w-4 h-4 text-red-500" />
                <span>Canal YouTube</span>
              </a>
              <button
                onClick={() => setIsWhatsAppQROpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Comunidad WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase">Plataforma</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setActiveTab('sorteos')}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Sorteos Activos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('votaciones')}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Vote className="w-4 h-4 text-[#E91E8C]" />
                  <span>Votaciones del Podcast</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Tabla de Clasificación</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tienda')}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Tienda de Recompensas</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('clips')}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Video className="w-4 h-4 text-red-400" />
                  <span>Momentos Épicos</span>
                </button>
              </li>
            </ul>
          </div>

          {/* WhatsApp QR Highlight */}
          <div className="bg-gradient-to-b from-[#161622] to-[#0f0f18] p-5 rounded-2xl border border-white/[0.08] text-center space-y-3 shadow-xl">
            <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-7 h-7" />
            </div>
            <h4 className="text-white font-bold text-sm">¿Aún no estás en el grupo?</h4>
            <p className="text-xs text-zinc-400">
              Escanea el QR o haz click para unirte a las charlas previas al directo.
            </p>
            <button
              onClick={() => setIsWhatsAppQROpen(true)}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 transition-opacity"
            >
              Ver QR de WhatsApp
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Metele Nomás Podcast & Stream. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1 text-zinc-500">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-[#E91E8C] fill-[#E91E8C]" />
            <span>para la mejor comunidad de streamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}