import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Debes iniciar sesión con Google para reclamar puntos diarios' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

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
          { error: 'Ya reclamaste tu recompensa diaria de hoy. ¡Vuelve mañana!' },
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
