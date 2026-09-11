'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trophy, RefreshCw, Sparkles } from 'lucide-react';

export default function OBSRuletaPage() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [namesInput, setNamesInput] = useState('Chat en Vivo, Metedores, Metele Nomás, YouTube Live');
  const [showConfig, setShowConfig] = useState(false);

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

    const extraSpins = 6 + Math.floor(Math.random() * 4);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = rotation + extraSpins * 360 + randomAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      const randomIndex = Math.floor(Math.random() * participants.length);
      setWinner(participants[randomIndex]);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 select-none font-sans">
      {/* OBS Overlay Container */}
      <div className="relative bg-[#0d0d14]/95 border-2 border-amber-400/50 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_80px_rgba(233,30,140,0.3)] backdrop-blur-2xl">
        {/* Top Channel Branding */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#E91E8C] to-[#F5A623] shadow-lg">
            <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
              <Image
                src="/images/brand/logo-icon.png"
                alt="Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-black text-white tracking-tight leading-none">
              METELE NOMÁS
            </h2>
            <p className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
              Ruleta de Sorteos en Vivo
            </p>
          </div>
        </div>

        {/* Wheel Graphic */}
        <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
          {/* Wheel Pointer Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_2px_10px_rgba(245,166,35,0.9)]" />

          {/* Rotating Disc */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_35px_rgba(245,166,35,0.4)] relative overflow-hidden transition-transform duration-[4500ms] cubic-bezier(0.15,0.9,0.25,1)"
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
                      textShadow: '0 1px 4px rgba(0,0,0,0.95)',
                    }}
                  >
                    {name}
                  </div>
                </div>
              );
            })}

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
                    opacity="0.88"
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

        {/* Winner Callout */}
        {winner && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-[#E91E8C]/25 via-amber-500/25 to-[#F5A623]/25 border-2 border-amber-400 animate-bounce shadow-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" /> ¡GANADOR OFICIAL DEL SORTEO! <Sparkles className="w-4 h-4" />
            </p>
            <h3 className="text-3xl font-black text-white mt-1">
              @{winner}
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              ¡Felicidades! Revisa tu bandeja de mensajes.
            </p>
          </div>
        )}

        {/* OBS Streamer Trigger Button */}
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
            spinning
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#E91E8C] via-amber-500 to-[#F5A623] text-white hover:scale-105 shadow-xl shadow-[#E91E8C]/30'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          <span>{spinning ? 'Girando en Directo...' : '¡Girar Ruleta en Vivo!'}</span>
        </button>

        {/* Toggle participant names for OBS */}
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