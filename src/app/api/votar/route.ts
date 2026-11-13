import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { loadSorteoData, normalizePhone } from '@/lib/sorteo/data';

// Votación pública de la final del Gran Sorteo.
// Reglas: sesión con Google + número de WhatsApp que esté en la comunidad.
// Un voto por cuenta de Google y uno por número (lo garantiza la base de datos con @@unique).

const isProd = process.env.NODE_ENV === 'production';

/** Acepta "+591 7xxxxxxx", "591 7xxxxxxx" o "7xxxxxxx" (Bolivia por defecto) */
function toE164(raw: string): string {
  let p = normalizePhone(raw);
  if (p.startsWith('00')) p = `+${p.slice(2)}`;
  if (p.startsWith('+')) return p;
  if (/^[67]\d{7}$/.test(p)) return `+591${p}`;
  return `+${p}`;
}

async function currentPoll() {
  return (
    (await prisma.sorteoPoll.findFirst({ where: { status: 'open' }, orderBy: { createdAt: 'desc' } })) ??
    (await prisma.sorteoPoll.findFirst({ orderBy: { createdAt: 'desc' } }))
  );
}

async function counts(pollId: string) {
  const grouped = await prisma.sorteoVote.groupBy({ by: ['choice'], where: { pollId }, _count: { _all: true } });
  const get = (c: string) => grouped.find((g) => g.choice === c)?._count._all ?? 0;
  return { A: get('A'), B: get('B') };
}

export async function GET() {
  const poll = await currentPoll();
  if (!poll) return NextResponse.json({ poll: null }, { headers: { 'Cache-Control': 'no-store' } });

  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  const mine = email ? await prisma.sorteoVote.findUnique({ where: { pollId_email: { pollId: poll.id, email } } }) : null;
  // los resultados se ven después de votar o cuando la votación cerró
  const showResults = !!mine || poll.status === 'closed';

  return NextResponse.json(
    {
      poll: {
        id: poll.id,
        status: poll.status,
        options: [
          { key: 'A', name: poll.optionAName },
          { key: 'B', name: poll.optionBName },
        ],
      },
      myVote: mine?.choice ?? null,
      results: showResults ? await counts(poll.id) : null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Inicia sesión con Google para votar.' }, { status: 401 });
  if (isProd && session?.user?.provider !== 'google') {
    return NextResponse.json({ error: 'Solo se puede votar con una cuenta de Google.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { pollId?: string; choice?: string; phone?: string } | null;
  if (!body?.pollId || (body.choice !== 'A' && body.choice !== 'B') || !body.phone) {
    return NextResponse.json({ error: 'Elige un finalista y escribe tu número.' }, { status: 400 });
  }

  const poll = await prisma.sorteoPoll.findUnique({ where: { id: body.pollId } });
  if (!poll) return NextResponse.json({ error: 'Esta votación ya no existe.' }, { status: 404 });
  if (poll.status !== 'open') return NextResponse.json({ error: 'La votación ya cerró.' }, { status: 409 });

  const phone = toE164(body.phone);
  const data = await loadSorteoData();
  if (!data?.memberPhones.has(phone)) {
    return NextResponse.json(
      { error: 'Ese número no está en la comunidad Metele Nomás. Usa el número con el que estás en el grupo de WhatsApp.' },
      { status: 403 },
    );
  }

  try {
    await prisma.sorteoVote.create({ data: { pollId: poll.id, email, phone, choice: body.choice } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const byEmail = await prisma.sorteoVote.findUnique({ where: { pollId_email: { pollId: poll.id, email } } });
      return NextResponse.json(
        { error: byEmail ? 'Ya votaste con esta cuenta de Google.' : 'Ese número de WhatsApp ya votó.' },
        { status: 409 },
      );
    }
    throw e;
  }

  return NextResponse.json({ ok: true, myVote: body.choice, results: await counts(poll.id) });
}
