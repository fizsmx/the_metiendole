import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Inicia sesión con Google para votar en el podcast' }, { status: 401 });
    }

    const { pollId, optionId } = await req.json();
    if (!pollId || !optionId) {
      return NextResponse.json({ error: 'pollId y optionId requeridos' }, { status: 400 });
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

    // Verificar si la encuesta está activa
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true, votes: true },
    });

    if (!poll || !poll.active) {
      return NextResponse.json({ error: 'Votación cerrada o no encontrada' }, { status: 404 });
    }

    // Verificar si ya votó
    const existingVote = poll.votes.find((v) => v.userId === userId);
    if (existingVote) {
      return NextResponse.json({ error: 'Ya emitiste tu voto en este tema' }, { status: 400 });
    }

    const voteRewardPoints = 10;

    // Transacción: Guardar voto, premiar al usuario y registrar puntos
    const [, updatedUser] = await prisma.$transaction([
      prisma.pollVote.create({
        data: {
          pollId,
          optionId,
          userId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: voteRewardPoints },
        },
      }),
      prisma.pointTransaction.create({
        data: {
          userId,
          amount: voteRewardPoints,
          reason: 'POLL_VOTE',
          description: `Voto emitido en la encuesta: "${poll.question}"`,
        },
      }),
    ]);

    // Calcular porcentajes actualizados
    const allVotes = await prisma.pollVote.findMany({ where: { pollId } });
    const totalVotes = allVotes.length;

    const optionsWithStats = poll.options.map((opt) => {
      const votesForOption = allVotes.filter((v) => v.optionId === opt.id).length;
      return {
        id: opt.id,
        text: opt.text,
        votesCount: votesForOption,
        percentage: totalVotes > 0 ? Math.round((votesForOption / totalVotes) * 100) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      pollId,
      userVotedOptionId: optionId,
      totalVotes,
      options: optionsWithStats,
      newPoints: updatedUser.points,
      message: `¡Voto registrado! Ganaste +${voteRewardPoints} puntos.`,
    });
  } catch (error) {
    console.error('Error voting poll:', error);
    return NextResponse.json({ error: 'Error al registrar tu voto' }, { status: 500 });
  }
}
