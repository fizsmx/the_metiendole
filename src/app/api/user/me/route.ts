import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/constants';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
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
      include: {
        giveawayEntries: { select: { giveawayId: true } },
        votes: { select: { pollId: true, optionId: true } },
        achievements: { include: { achievement: true } },
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
        include: {
          giveawayEntries: { select: { giveawayId: true } },
          votes: { select: { pollId: true, optionId: true } },
          achievements: { include: { achievement: true } },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
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
