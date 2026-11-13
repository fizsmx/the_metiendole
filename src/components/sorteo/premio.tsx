'use client';

import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

/** Lo que se sortea. La imagen va en public/images/sorteo/premio.jpg */
export const PREMIO = {
  titulo: 'La JunoLisa',
  descripcion: 'Retrato estilo Mona Lisa con marco dorado · edición Metele Nomás',
  imagen: '/images/sorteo/premio.jpg',
};

export function PrizeImage({ className = '' }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#12121a] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_50px_rgba(247,201,72,0.3)] ring-1 ring-[#F7C948]/30 ${className}`}
    >
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-zinc-500">
          <ImageIcon className="h-10 w-10" />
          <span className="text-xs font-bold">Imagen del cuadro próximamente</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={PREMIO.imagen} alt={PREMIO.titulo} onError={() => setFailed(true)} className="h-full w-full object-cover" />
      )}
    </div>
  );
}
