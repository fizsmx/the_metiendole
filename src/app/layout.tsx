import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Metele Nomás — Comunidad Oficial del Podcast & Stream',
  description: 'La casa oficial de los seguidores más fieles de Metele Nomás. Sorteos en vivo con ruleta, votaciones de temas para el podcast, tabla de clasificación, clips y puntos acumulables.',
  icons: {
    icon: '/images/brand/logo-icon.png',
    apple: '/images/brand/logo-icon.png',
  },
  openGraph: {
    title: 'Metele Nomás — Plataforma de la Comunidad',
    description: 'Votaciones en vivo, sorteos semanales, clips épicos y tienda de recompensas con puntos.',
    images: ['/images/brand/banner.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-sans antialiased selection:bg-[#E91E8C] selection:text-white flex flex-col pb-16 xl:pb-0">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}