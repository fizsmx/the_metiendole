import type { Metadata } from 'next';
import BrandFonts from '@/components/sorteo/BrandFonts';

export const metadata: Metadata = {
  title: 'Vota en la final · Gran Sorteo Metele Nomás',
  description: '¿Quién se lleva La JunoLisa? Vota por tu finalista favorito.',
  openGraph: {
    title: 'Vota en la final del Gran Sorteo Metele Nomás',
    description: '¿Quién se lleva La JunoLisa? Un voto por persona, solo miembros de la comunidad.',
    images: ['/images/sorteo/premio.jpg'],
  },
};

export default function VotarLayout({ children }: { children: React.ReactNode }) {
  return <BrandFonts>{children}</BrandFonts>;
}
