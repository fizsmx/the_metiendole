import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Inicia sesión con Google para participar en este sorteo' }, { status: 401 });
    }

    const { giveawayId } = await req.json();
    if (!giveawayId) {
      return NextResponse.json({ error: 'giveawayId requerido' }, { status: 400 });
    }

    const userId = session.user.id;

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

    // Buscar usuario y validar puntos y nivel
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
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
