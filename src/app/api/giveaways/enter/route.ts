import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Inicia sesión con Google para participar en este sorteo' }, { status: 401 });
    }

    const { giveawayId } = await req.json();
    if (!giveawayId) {
      return NextResponse.json({ error: 'giveawayId requerido' }, { status: 400 });
    }

    const sessionEmail = session.user.email?.toLowerCase().trim();
    const sessionId = session.user.id;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(sessionId ? [{ id: sessionId }] : []),
          ...(sessionEmail ? [{ email: sessionEmail }] : []),
        ],
      },
    });

    if (!user && sessionEmail) {
      const role = isSuperAdminEmail(sessionEmail) ? 'ADMIN' : 'MEMBER';
      const rawName = session.user.name || sessionEmail.split('@')[0];
      const nickname =
        rawName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') ||
        'metedor_' + Math.floor(Math.random() * 9000 + 1000);

      user = await prisma.user.create({
        data: {
          email: sessionEmail,
          name: rawName,
          nickname,
          image: session.user.image || '/images/brand/logo-circle.png',
          role,
          points: role === 'ADMIN' ? 9999 : 150,
          level: 1,
          streak: 1,
          bio: 'Miembro oficial de la comunidad de Metele Nomás.',
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userId = user.id;

    // Buscar el sorteo
    const giveaway = await prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: { entries: true },
    });

    if (!giveaway) {
      return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 });
    }

    if (giveaway.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Este sorteo ya no está activo' }, { status: 400 });
    }

    // Verificar si ya está inscrito
    const alreadyEntered = giveaway.entries.some((e) => e.userId === userId);
    if (alreadyEntered) {
      return NextResponse.json({ error: 'Ya estás participando en este sorteo' }, { status: 400 });
    }

    if (user.points < giveaway.costPoints) {
      return NextResponse.json(
        { error: `Necesitas ${giveaway.costPoints} puntos. Tienes ${user.points} pts.` },
        { status: 400 }
      );
    }

    if (user.level < giveaway.minLevel) {
      return NextResponse.json(
        { error: `Requiere Nivel ${giveaway.minLevel} mínimo. Tu nivel actual es ${user.level}.` },
        { status: 400 }
      );
    }

    // Transacción atómica: Crear inscripción y deducir puntos
    const [entry, updatedUser] = await prisma.$transaction([
      prisma.giveawayEntry.create({
        data: {
          giveawayId,
          userId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          points: { decrement: giveaway.costPoints },
        },
      }),
      ...(giveaway.costPoints > 0
        ? [
            prisma.pointTransaction.create({
              data: {
                userId,
                amount: -giveaway.costPoints,
                reason: 'GIVEAWAY_ENTRY',
                description: `Inscripción al sorteo "${giveaway.title}"`,
              },
            }),
          ]
        : []),
    ]);

    const totalEntries = await prisma.giveawayEntry.count({ where: { giveawayId } });

    return NextResponse.json({
      success: true,
      giveawayId,
      entryId: entry.id,
      participantsCount: totalEntries,
      newPoints: updatedUser.points,
      message: `¡Te inscribiste con éxito en "${giveaway.title}"!`,
    });
  } catch (error) {
    console.error('Error entering giveaway:', error);
    return NextResponse.json({ error: 'Error al inscribirse en el sorteo' }, { status: 500 });
  }
}
