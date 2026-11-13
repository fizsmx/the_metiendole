import type { Metadata } from 'next';
import BrandFonts from '@/components/sorteo/BrandFonts';

export const metadata: Metadata = {
  title: 'Gran Sorteo · Metele Nomás',
  robots: { index: false, follow: false },
};

export default function SorteoLayout({ children }: { children: React.ReactNode }) {
  return <BrandFonts>{children}</BrandFonts>;
}
