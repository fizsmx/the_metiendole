import type { Metadata } from 'next';
import Link from 'next/link';
import BrandFonts from '@/components/sorteo/BrandFonts';

export const metadata: Metadata = {
  title: 'Política de privacidad · Metele Nomás',
  description: 'Qué datos usa Metele Nomás al iniciar sesión con Google y al votar en el Gran Sorteo.',
};

const CONTACT = 'fisbert.smx@gmail.com';

export default function PrivacidadPage() {
  return (
    <BrandFonts>
      <main className="mx-auto max-w-2xl px-5 py-12 text-zinc-300">
        <p className="font-roca text-xs font-bold uppercase text-[#ff9343]">Metele Nomás Podcast</p>
        <h1 className="mt-2 font-heading text-3xl font-black text-white">Política de privacidad</h1>
        <p className="mt-2 text-sm text-zinc-500">Última actualización: 13 de noviembre de 2026</p>

        <Section title="Qué datos usamos">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b className="text-white">Al iniciar sesión con Google:</b> tu nombre, tu correo y tu foto de perfil. No accedemos a tus correos,
              contactos ni a ningún otro dato de tu cuenta.
            </li>
            <li>
              <b className="text-white">Al votar en el Gran Sorteo:</b> el número de WhatsApp que escribes y la opción que elegiste.
            </li>
          </ul>
        </Section>

        <Section title="Para qué">
          <p>
            Solo para comprobar que eres miembro de la comunidad Metele Nomás y que cada persona vote una sola vez (un voto por cuenta de
            Google y por número). Tu número no se muestra a nadie ni se usa para enviarte mensajes ni publicidad.
          </p>
        </Section>

        <Section title="Con quién se comparte">
          <p>Con nadie. Los datos no se venden ni se entregan a terceros.</p>
        </Section>

        <Section title="Cuánto tiempo se guardan">
          <p>Los votos se guardan hasta que termina el sorteo y se publica el resultado; después se eliminan.</p>
        </Section>

        <Section title="Tus derechos">
          <p>
            Puedes pedir que borremos tus datos o preguntar qué guardamos escribiendo a{' '}
            <a className="font-bold text-[#ff9343] underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>
            .
          </p>
        </Section>

        <Link href="/votar" className="mt-10 inline-block rounded-xl bg-gradient-to-r from-[#ef1b77] to-[#ff9343] px-5 py-2.5 text-sm font-bold text-white">
          Ir a la votación
        </Link>
      </main>
    </BrandFonts>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 font-heading text-lg font-black text-white">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
