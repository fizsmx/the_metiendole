import { UserRole, PostItem } from '@/types';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // 1. Sorteos
    const dbGiveaways = await prisma.giveaway.findMany({
      include: {
        entries: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const giveaways = dbGiveaways.map((gw) => ({
      id: gw.id,
      title: gw.title,
      description: gw.description,
      prize: gw.prize,
      imageUrl: gw.imageUrl || undefined,
      costPoints: gw.costPoints,
      minLevel: gw.minLevel,
      winnersCount: gw.winnersCount,
      status: gw.status as 'ACTIVE' | 'DRAWING' | 'FINISHED',
      endsAt: gw.endsAt.toISOString(),
      participantsCount: gw.entries.length,
      isEntered: currentUserId ? gw.entries.some((e) => e.userId === currentUserId) : false,
    }));

    // 2. Encuestas / Votaciones
    const dbPolls = await prisma.poll.findMany({
      include: {
        options: {
          include: {
            votes: true,
          },
        },
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const polls = dbPolls.map((poll) => {
      const totalVotes = poll.votes.length;
      const userVote = currentUserId ? poll.votes.find((v) => v.userId === currentUserId) : undefined;

      const options = poll.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        votesCount: opt.votes.length,
        percentage: totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0,
      }));

      return {
        id: poll.id,
        question: poll.question,
        description: poll.description || undefined,
        category: poll.category,
        featured: poll.featured,
        active: poll.active,
        totalVotes,
        userVotedOptionId: userVote?.optionId,
        options,
      };
    });

    // 3. Leaderboard Top 20
    const topUsers = await prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        nickname: true,
        image: true,
        role: true,
        points: true,
        level: true,
        streak: true,
      },
    });

    const leaderboard = topUsers.map((u, idx) => ({
      id: u.id,
      name: u.name || 'Metedor',
      nickname: u.nickname || 'metedor',
      image: u.image || '/images/brand/logo-circle.png',
      role: u.role as UserRole,
      points: u.points,
      level: u.level,
      streak: u.streak,
      rank: idx + 1,
    }));

    // 4. Muro de publicaciones
    const dbPosts = await prisma.post.findMany({
      include: {
        user: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    });

    const posts = dbPosts.map((p) => {
      const reactionTypes = ['FIRE', 'HEART', 'LAUGH', 'SKULL', 'ROCKET'] as const;
      const reactions = reactionTypes.map((type) => {
        const typeReactions = p.reactions.filter((r) => r.type === type);
        return {
          type,
          count: typeReactions.length,
          userReacted: currentUserId ? typeReactions.some((r) => r.userId === currentUserId) : false,
        };
      });

      return {
        id: p.id,
        userId: p.userId,
        userName: p.user.name || 'Metedor',
        userNickname: p.user.nickname || 'metedor',
        userAvatar: p.user.image || '/images/brand/logo-circle.png',
        userRole: p.user.role as UserRole,
        content: p.content,
        imageUrl: p.imageUrl || undefined,
        category: p.category as PostItem['category'],
        pinned: p.pinned,
        createdAt: p.createdAt.toISOString(),
        reactions,
        comments: p.comments.map((c) => ({
          id: c.id,
          userId: c.userId,
          userName: c.user.name || 'Metedor',
          userNickname: c.user.nickname || 'metedor',
          userAvatar: c.user.image || '/images/brand/logo-circle.png',
          userRole: c.user.role as UserRole,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        })),
      };
    });

    return NextResponse.json({
      success: true,
      giveaways,
      polls,
      leaderboard,
      posts,
    });
  } catch (error) {
    console.error('Error syncing community data from db, using graceful fallback:', error);
    return NextResponse.json({
      success: true,
      giveaways: [],
      polls: [],
      leaderboard: [],
      posts: [],
      fallback: true,
    });
  }
}
