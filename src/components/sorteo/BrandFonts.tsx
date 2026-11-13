import React from 'react';
import { Montserrat, Syncopate } from 'next/font/google';

// Manual de identidad: Gotham Black / Gotham Pro N (→ Montserrat) y Roca One (→ Syncopate),
// alternativas libres más cercanas a las tipografías oficiales.
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-mn-heading', display: 'swap' });
const syncopate = Syncopate({ subsets: ['latin'], weight: '700', variable: '--font-mn-display', display: 'swap' });

/** Aplica tipografías y colores oficiales de Metele Nomás a todo lo que envuelve */
export default function BrandFonts({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${montserrat.variable} ${syncopate.variable} font-sans`}
      style={
        {
          // las utilidades font-sans / font-heading del sitio apuntan a estas variables
          '--font-inter': 'var(--font-mn-heading)',
          '--font-space-grotesk': 'var(--font-mn-heading)',
          // colores oficiales del manual: #ef1b77 · #ff9343 · #1D1D1B
          '--mn-gradient': 'linear-gradient(135deg, #ef1b77, #ff9343)',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
