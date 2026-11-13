import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isSuperAdminEmail } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { loadSorteoData } from '@/lib/sorteo/data';

// Votación pública de la final: solo el admin la abre, la consulta en vivo y la cierra.

async function requireAdmin() {
  const session = await auth();
  return isSuperAdminEmail(session?.user?.email);
}

// En la votación pública todos aparecen como "Metedor + últimos 4 dígitos"
const publicName = (_p: { name: string; phone: string } | undefined, id: string) => `Metedor ${id.slice(-4)}`;

async function pollWithCounts(id: string) {
  const poll = await prisma.sorteoPoll.findUnique({ where: { id } });
  if (!poll) return null;
  const grouped = await prisma.sorteoVote.groupBy({ by: ['choice'], where: { pollId: id }, _count: { _all: true } });
  const count = (c: string) => grouped.find((g) => g.choice === c)?._count._all ?? 0;
  const a = count('A');
  const b = count('B');
  return {
    id: poll.id,
    status: poll.status,
    createdAt: poll.createdAt,
    closedAt: poll.closedAt,
    options: [
      { key: 'A', id: poll.optionAId, name: poll.optionAName, votes: a },
      { key: 'B', id: poll.optionBId, name: poll.optionBName, votes: b },
    ],
    total: a + b,
  };
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  const poll = await pollWithCounts(id);
  if (!poll) return NextResponse.json({ error: 'Votación no encontrada' }, { status: 404 });
  return NextResponse.json(poll, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { aId?: string; bId?: string } | null;
  if (!body?.aId || !body?.bId || body.aId === body.bId) {
    return NextResponse.json({ error: 'Faltan los dos finalistas' }, { status: 400 });
  }

  const data = await loadSorteoData();
  const byId = new Map((data?.participants ?? []).map((p) => [p.id, p]));
  if (!byId.has(body.aId) || !byId.has(body.bId)) {
    return NextResponse.json({ error: 'Los finalistas no están en la lista de participantes' }, { status: 400 });
  }

  // Solo una votación abierta a la vez
  await prisma.sorteoPoll.updateMany({ where: { status: 'open' }, data: { status: 'closed', closedAt: new Date() } });
  const poll = await prisma.sorteoPoll.create({
    data: {
      optionAId: body.aId,
      optionAName: publicName(byId.get(body.aId), body.aId),
      optionBId: body.bId,
      optionBName: publicName(byId.get(body.bId), body.bId),
    },
  });
  return NextResponse.json(await pollWithCounts(poll.id));
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { id?: string; action?: 'close' | 'reopen' } | null;
  if (!body?.id || (body.action !== 'close' && body.action !== 'reopen')) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (body.action === 'reopen') {
    await prisma.sorteoPoll.updateMany({ where: { status: 'open', NOT: { id: body.id } }, data: { status: 'closed', closedAt: new Date() } });
  }
  await prisma.sorteoPoll.update({
    where: { id: body.id },
    data: body.action === 'close' ? { status: 'closed', closedAt: new Date() } : { status: 'open', closedAt: null },
  });
  return NextResponse.json(await pollWithCounts(body.id));
}
