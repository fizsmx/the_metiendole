import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/constants';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión con Google para reclamar puntos diarios' }, { status: 401 });
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

    // Verificar si ya reclamó hoy
    if (user.lastDailyAt) {
      const now = new Date();
      const last = new Date(user.lastDailyAt);
      const isToday =
        now.getFullYear() === last.getFullYear() &&
        now.getMonth() === last.getMonth() &&
        now.getDate() === last.getDate();

      if (isToday) {
        return NextResponse.json(
          {
            error: 'Ya reclamaste tu recompensa diaria de hoy. ¡Vuelve mañana!',
            alreadyClaimed: true,
            newPoints: user.points,
            streak: user.streak,
          },
          { status: 400 }
        );
      }
    }

    const pointsBonus = 50;
    const newStreak = (user.streak || 0) + 1;
    const newPoints = user.points + pointsBonus;

    // Ejecutar actualización y transacción de puntos en DB
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          points: newPoints,
          streak: newStreak,
          lastDailyAt: new Date(),
        },
      }),
      prisma.pointTransaction.create({
        data: {
          userId,
          amount: pointsBonus,
          reason: 'DAILY_LOGIN',
          description: `Recompensa de racha diaria de ${newStreak} días en Metele Nomás`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      pointsAdded: pointsBonus,
      newPoints: updatedUser.points,
      streak: updatedUser.streak,
    });
  } catch (error) {
    console.error('Error claiming daily:', error);
    return NextResponse.json({ error: 'Error al reclamar recompensa' }, { status: 500 });
  }
}
