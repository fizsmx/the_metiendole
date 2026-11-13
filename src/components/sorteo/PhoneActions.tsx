'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Phone, X } from 'lucide-react';
import { formatPhone } from './lib';

/** Intenta copiar; si el portapapeles del sistema no responde en 1 s, prueba el método antiguo */
async function copyText(text: string): Promise<boolean> {
  try {
    const ok = await Promise.race([
      navigator.clipboard.writeText(text).then(() => true),
      new Promise<boolean>((r) => setTimeout(() => r(false), 1000)),
    ]);
    if (ok) return true;
  } catch {
    /* sigue con el respaldo */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Copiar el número completo (aunque en pantalla esté enmascarado) y llamar */
export default function PhoneActions({ phone, compact = false }: { phone: string; compact?: boolean }) {
  const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'manual'>('idle');
  const manualRef = useRef<HTMLSpanElement>(null);

  // si no se pudo copiar, deja el número seleccionado para Ctrl+C
  useEffect(() => {
    if (state !== 'manual' || !manualRef.current) return;
    const range = document.createRange();
    range.selectNodeContents(manualRef.current);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [state]);

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setState('copying');
    if (await copyText(phone)) {
      setState('copied');
      setTimeout(() => setState('idle'), 2500);
    } else {
      setState('manual');
    }
  };

  const btn = `flex items-center gap-1 rounded-lg font-bold transition ${compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'}`;

  return (
    <div className="relative flex shrink-0 items-center gap-1.5">
      <button
        onClick={(e) => void onCopy(e)}
        disabled={state === 'copying'}
        title={`Copiar ${formatPhone(phone)}`}
        aria-label={`Copiar número ${formatPhone(phone)}`}
        className={`${btn} ${state === 'copied' ? 'bg-[#10B981]/25 text-[#34d399]' : 'border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10'}`}
      >
        {state === 'copied' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {state === 'copied' ? '¡Copiado!' : state === 'copying' ? 'Copiando…' : 'Copiar'}
      </button>
      <a
        href={`tel:${phone}`}
        onClick={(e) => e.stopPropagation()}
        title={`Llamar a ${formatPhone(phone)}`}
        aria-label={`Llamar a ${formatPhone(phone)}`}
        className={`${btn} bg-[#10B981] text-white hover:brightness-110`}
      >
        <Phone className="h-3.5 w-3.5" />
      </a>

      {state === 'manual' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full z-30 mt-1 flex items-center gap-2 whitespace-nowrap rounded-xl border border-[#ff9343]/50 bg-[#12121a] px-3 py-2 shadow-xl"
        >
          <span ref={manualRef} className="select-all font-mono text-sm font-bold text-white">
            {phone}
          </span>
          <span className="text-[10px] text-zinc-400">Ctrl+C para copiar</span>
          <button onClick={() => setState('idle')} aria-label="Cerrar" className="text-zinc-500 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
