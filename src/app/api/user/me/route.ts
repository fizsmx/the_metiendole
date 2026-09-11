import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        giveawayEntries: { select: { giveawayId: true } },
        votes: { select: { pollId: true, optionId: true } },
        achievements: { include: { achievement: true } },
      },
    });

    if (!user) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image || '/images/brand/logo-circle.png',
          nickname: session.user.nickname || session.user.name || 'Metedor',
          role: session.user.role || 'MEMBER',
          points: session.user.points || 150,
          level: session.user.level || 1,
          streak: session.user.streak || 1,
          dailyClaimed: false,
          enteredGiveawayIds: [],
          votedPolls: [],
        },
      });
    }

    // Check if daily reward claimed today
    let dailyClaimed = false;
    if (user.lastDailyAt) {
      const now = new Date();
      const last = new Date(user.lastDailyAt);
      dailyClaimed =
        now.getFullYear() === last.getFullYear() &&
        now.getMonth() === last.getMonth() &&
        now.getDate() === last.getDate();
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image || '/images/brand/logo-circle.png',
        nickname: user.nickname || user.name || 'Metedor',
        role: user.role,
        points: user.points,
        level: user.level,
        streak: user.streak,
        dailyClaimed,
        enteredGiveawayIds: user.giveawayEntries.map((e) => e.giveawayId),
        votedPolls: user.votes.map((v) => ({ pollId: v.pollId, optionId: v.optionId })),
      },
    });
  } catch (error) {
    console.error('Error fetching user me:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
