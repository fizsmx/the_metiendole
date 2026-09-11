'use client';

import React, { useState } from 'react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { X, Sparkles, Trophy, RefreshCw } from 'lucide-react';

export default function GiveawayWheelModal() {
  const { isWheelOpen, setIsWheelOpen, giveaways } = useCommunityStore();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [namesInput, setNamesInput] = useState('Chat en Vivo, Metedores, Metele Nomás, YouTube Live');
  const [showConfig, setShowConfig] = useState(false);

  if (!isWheelOpen) return null;

  const parsedNames = namesInput
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
  const participants = parsedNames.length > 0 ? parsedNames : ['Comunidad', 'Metele Nomás'];

  const colors = [
    '#E91E8C',
    '#F5A623',
    '#9333EA',
    '#10B981',
    '#3B82F6',
    '#EF4444',
    '#F97316',
    '#06B6D4',
  ];

  const handleSpin = () => {
    if (spinning) return;
    setWinner(null);
    setSpinning(true);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = rotation + extraSpins * 360 + randomAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      const randomIndex = Math.floor(Math.random() * participants.length);
      setWinner(participants[randomIndex]);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#101018] border border-amber-500/30 rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(245,166,35,0.2)] animate-scale-in">
        <button
          onClick={() => {
            setIsWheelOpen(false);
            setWinner(null);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.05] text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Ruleta en Vivo de Sorteos
        </div>

        <h3 className="text-2xl font-black text-white">
          ¡Hora de Sacar al Ganador!
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
          Gira la ruleta en directo durante el stream para sortear los auriculares o premios oficiales.
        </p>

        {/* The Wheel Container */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto my-4 flex items-center justify-center">
          {/* Wheel Pointer Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,166,35,0.8)]" />

          {/* Rotating Wheel Disc */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(245,166,35,0.4)] relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15,0.9,0.25,1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {participants.map((name, idx) => {
              const angle = (360 / participants.length) * idx;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  <div
                    className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-wide text-white uppercase"
                    style={{
                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                    }}
                  >
                    {name}
                  </div>
                </div>
              );
            })}

            {/* Colorful Pie Segments SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {participants.map((_, idx) => {
                const total = participants.length;
                const startAngle = (idx * 360) / total;
                const endAngle = ((idx + 1) * 360) / total;
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                return (
                  <path
                    key={idx}
                    d={pathData}
                    fill={colors[idx % colors.length]}
                    opacity="0.85"
                  />
                );
              })}
            </svg>
          </div>

          {/* Center Hub */}
          <div className="absolute w-14 h-14 rounded-full bg-[#0a0a0f] border-2 border-amber-400 shadow-xl flex items-center justify-center z-20">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Winner Announcement Banner */}
        {winner && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-[#E91E8C]/20 via-amber-500/20 to-[#F5A623]/20 border border-amber-500/50 animate-bounce">
            <p className="text-xs font-black uppercase tracking-widest text-amber-300">
              👑 ¡TENEMOS GANADOR OFICIAL! 👑
            </p>
            <h4 className="text-2xl font-black text-white mt-1">
              @{winner}
            </h4>
            <p className="text-xs text-zinc-300 mt-1">
              Premio: Auriculares HyperX Cloud II + Polera Oficial
            </p>
          </div>
        )}

        {/* Spin Action Button */}
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
            spinning
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#E91E8C] via-amber-500 to-[#F5A623] text-white hover:scale-105 shadow-[#E91E8C]/30'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          <span>{spinning ? 'Girando la ruleta...' : '¡Girar Ruleta Ahora!'}</span>
        </button>

        {/* Toggle participant names for live stream */}
        <div className="mt-4 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            {showConfig ? '▲ Ocultar lista de participantes' : '⚙️ Configurar participantes del chat en vivo'}
          </button>

          {showConfig && (
            <div className="mt-3 text-left space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400">
                Participantes (separados por comas):
              </label>
              <textarea
                value={namesInput}
                onChange={(e) => setNamesInput(e.target.value)}
                rows={2}
                className="w-full bg-black/50 border border-white/[0.1] rounded-xl p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none"
                placeholder="Chat, Metedor1, Metedor2..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}