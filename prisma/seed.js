const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Limpiar datos existentes
  await prisma.redemption.deleteMany();
  await prisma.shopItem.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.clipLike.deleteMany();
  await prisma.clip.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.giveawayEntry.deleteMany();
  await prisma.giveaway.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.streamEvent.deleteMany();

  // 2. Crear Usuarios
  const adminUser = await prisma.user.create({
    data: {
      name: 'Fisbert Chávez (Metele Nomás)',
      nickname: 'metelenomas_tv',
      email: 'host@metelenomas.com',
      image: '/images/brand/logo-circle.png',
      banner: '/images/brand/banner.jpg',
      bio: '🎙️ Creador y Host de Metele Nomás Podcast & Stream. ¡Bienvenidos a la mejor comunidad!',
      role: 'ADMIN',
      points: 9999,
      level: 5,
      streak: 45,
      youtubeHandle: '@metelenomas',
      discordTag: 'Fisbert#0001',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'Nico Gamer',
      nickname: 'NicoElMetedor',
      email: 'nico@example.com',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: '🎮 Fan #1 de los directos de los viernes. No me pierdo ningún debate!',
      role: 'VIP',
      points: 2450,
      level: 4,
      streak: 18,
      youtubeHandle: '@nicomete',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Camila Rojas',
      nickname: 'CamiStream',
      email: 'cami@example.com',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: '✨ Clips lover & moderadora de corazón. ¡A meterle con todo!',
      role: 'MODERATOR',
      points: 3800,
      level: 4,
      streak: 27,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Lucas Mendez',
      nickname: 'Lucas_OP',
      email: 'lucas@example.com',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      bio: 'Cazador de sorteos y creador de memes.',
      role: 'MEMBER',
      points: 820,
      level: 3,
      streak: 9,
    },
  });

  // 3. Crear Logros (Achievements)
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        code: 'FIRST_LOGIN',
        title: 'Primer Paso',
        description: 'Te uniste a la comunidad de Metele Nomás.',
        icon: '🎉',
        pointsReward: 50,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'STREAK_7',
        title: 'Racha de Fuego',
        description: '7 días seguidos entrando a la plataforma.',
        icon: '🔥',
        pointsReward: 100,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'POLL_MASTER',
        title: 'Voz del Pueblo',
        description: 'Participaste en 5 votaciones de la comunidad.',
        icon: '🗳️',
        pointsReward: 75,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'LUCKY_ONE',
        title: 'Tocado por la Suerte',
        description: 'Ganaste tu primer sorteo en directo.',
        icon: '👑',
        pointsReward: 200,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'CLIP_MAKER',
        title: 'Director de Cine',
        description: 'Uno de tus clips fue seleccionado como Staff Pick.',
        icon: '🎬',
        pointsReward: 150,
      },
    }),
  ]);

  // Asignar algunos logros
  await prisma.userAchievement.create({
    data: {
      userId: user1.id,
      achievementId: achievements[0].id,
    },
  });
  await prisma.userAchievement.create({
    data: {
      userId: user1.id,
      achievementId: achievements[1].id,
    },
  });
  await prisma.userAchievement.create({
    data: {
      userId: user2.id,
      achievementId: achievements[0].id,
    },
  });

  // 4. Crear Sorteos (Giveaways)
  const now = new Date();
  const endsIn3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const endsIn7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const giveaway1 = await prisma.giveaway.create({
    data: {
      title: '🎧 Auriculares Gamer HyperX Cloud II + Polera Oficial',
      description: '¡Sorteo de fin de mes para toda la banda de Metele Nomás! Entra gratis y gana los cascos que usamos en cabina.',
      prize: 'HyperX Cloud II + Merch Oficial',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
      costPoints: 50,
      minLevel: 1,
      winnersCount: 1,
      status: 'ACTIVE',
      startsAt: now,
      endsAt: endsIn3Days,
    },
  });

  const giveaway2 = await prisma.giveaway.create({
    data: {
      title: '🎟️ Pase VIP para la Cabina del Podcast + Cena con el Equipo',
      description: 'Acceso exclusivo al detrás de cámaras del próximo episodio en vivo de Metele Nomás.',
      prize: 'Experiencia VIP en Cabina + Kit Merch Completo',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
      costPoints: 200,
      minLevel: 2,
      winnersCount: 2,
      status: 'ACTIVE',
      startsAt: now,
      endsAt: endsIn7Days,
    },
  });

  // Entradas al sorteo
  await prisma.giveawayEntry.create({
    data: { giveawayId: giveaway1.id, userId: user1.id },
  });
  await prisma.giveawayEntry.create({
    data: { giveawayId: giveaway1.id, userId: user2.id },
  });
  await prisma.giveawayEntry.create({
    data: { giveawayId: giveaway1.id, userId: user3.id },
  });

  // 5. Crear Encuestas / Votaciones
  const poll1 = await prisma.poll.create({
    data: {
      question: '🎙️ ¿Qué tema o invitado quieren para el próximo capítulo del Podcast?',
      description: 'Vota y decide el contenido del próximo viernes. La opción ganadora se graba este fin de semana.',
      category: 'STREAM',
      featured: true,
      active: true,
      endsAt: endsIn3Days,
      options: {
        create: [
          { text: '🎮 Noche de anécdotas de videojuegos y torneos retro', order: 1 },
          { text: '🥊 Debate caliente: ¿Qué creadores de contenido están sobrevalorados?', order: 2 },
          { text: '👻 Especial historias paranormales enviadas por la comunidad', order: 3 },
          { text: '💡 Invitado sorpresa del mundo del streaming local', order: 4 },
        ],
      },
    },
    include: { options: true },
  });

  const poll2 = await prisma.poll.create({
    data: {
      question: '🍕 ¿Qué ordenamos para comer durante el stream maratón de 12 horas?',
      description: 'Votación rápida comunitaria.',
      category: 'COMUNIDAD',
      featured: false,
      active: true,
      options: {
        create: [
          { text: 'Pizza con extra queso y borde de jamón', order: 1 },
          { text: 'Hamburguesas gigantes smash', order: 2 },
          { text: 'Alitas ultra picantes (reto en vivo si gana)', order: 3 },
          { text: 'Sushi rolls variados', order: 4 },
        ],
      },
    },
    include: { options: true },
  });

  // Votos en la encuesta 1
  await prisma.pollVote.create({
    data: { pollId: poll1.id, optionId: poll1.options[0].id, userId: user1.id },
  });
  await prisma.pollVote.create({
    data: { pollId: poll1.id, optionId: poll1.options[0].id, userId: user2.id },
  });
  await prisma.pollVote.create({
    data: { pollId: poll1.id, optionId: poll1.options[1].id, userId: user3.id },
  });

  // 6. Crear Posts en el Muro Social
  const post1 = await prisma.post.create({
    data: {
      userId: adminUser.id,
      content: '¡BIEVENIDOS OFICIALMENTE a la plataforma de la comunidad de METELE NOMÁS! 🚀 Aquí van a poder votar temas, participar en sorteos, acumular puntos y reclamar recompensas exclusivas. ¡Comenten abajo qué les parece la nueva casa! 👇',
      pinned: true,
      category: 'ANUNCIO',
      comments: {
        create: [
          {
            userId: user1.id,
            content: '¡Ufff quedó brutal la plataforma! Ya metí mis votos para el sorteo 🔥',
          },
          {
            userId: user2.id,
            content: 'El diseño oscuro con los colores del podcast está a otro nivel, felicitaciones Fisbert! 👏',
          },
        ],
      },
    },
  });

  await prisma.reaction.create({
    data: { postId: post1.id, userId: user1.id, type: 'FIRE' },
  });
  await prisma.reaction.create({
    data: { postId: post1.id, userId: user2.id, type: 'FIRE' },
  });
  await prisma.reaction.create({
    data: { postId: post1.id, userId: user3.id, type: 'ROCKET' },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: '¿Quién más listo para el stream de este viernes? Se viene el debate caliente y los sorteos en vivo. ¡No se olviden de hacer login diario para sumar su racha!',
      category: 'GENERAL',
      comments: {
        create: [
          {
            userId: user3.id,
            content: 'Presente desde las 7pm sin falta 👊',
          },
        ],
      },
    },
  });

  await prisma.reaction.create({
    data: { postId: post2.id, userId: user2.id, type: 'HEART' },
  });

  // 7. Crear Clips Épicos
  await prisma.clip.create({
    data: {
      userId: adminUser.id,
      title: 'El momento más insólito del podcast #42 💀',
      description: 'Cuando se cayó el micrófono en pleno debate y nadie pudo aguantar la risa.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      category: 'FUNNY',
      isStaffPick: true,
    },
  });

  await prisma.clip.create({
    data: {
      userId: user2.id,
      title: 'Remontada legendaria en vivo 🏆',
      description: 'Quedando 1v4 en el stream de juegos. ¡Clip salvaje!',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      category: 'EPICO',
      isStaffPick: true,
    },
  });

  // 8. Crear Tienda de Recompensas
  await prisma.shopItem.createMany({
    data: [
      {
        name: '👑 Rol VIP en la Comunidad + Discord',
        description: 'Color dorado exclusivo, acceso a salas secretas y multiplicador de puntos 1.5x.',
        pricePoints: 1000,
        category: 'ROLE',
        icon: '👑',
        stock: -1,
      },
      {
        name: '📢 Saludo & Dedicatoria en Vivo en el Podcast',
        description: 'Mencionamos tu canal, proyecto o saludo personal durante el directo con tu nombre en pantalla.',
        pricePoints: 1500,
        category: 'SHOUTOUT',
        icon: '🎙️',
        stock: 10,
      },
      {
        name: '👕 Polera Oficial "Metele Nomás" Signature',
        description: 'Edición limitada en algodón premium con el logo bordado. Envío incluido.',
        pricePoints: 4000,
        category: 'MERCH',
        icon: '👕',
        stock: 5,
      },
      {
        name: '⭐ Insignia Especial de Perfil: "Metedor Legendario"',
        description: 'Badge animado que se muestra al lado de tu nombre en todo el sitio y en los comentarios.',
        pricePoints: 500,
        category: 'BADGE',
        icon: '⭐',
        stock: -1,
      },
    ],
  });

  // 9. Crear Eventos del Calendario de Streams
  const fridayStream = new Date(now);
  fridayStream.setDate(now.getDate() + ((5 + 7 - now.getDay()) % 7 || 7));
  fridayStream.setHours(20, 0, 0, 0);

  const sundayStream = new Date(fridayStream);
  sundayStream.setDate(fridayStream.getDate() + 2);
  sundayStream.setHours(19, 30, 0, 0);

  await prisma.streamEvent.create({
    data: {
      title: '🎙️ Metele Nomás Podcast Ep. #48 — Debate en Vivo + Ruleta de Sorteos',
      description: 'Transmisión en vivo por YouTube. Analizamos las noticias de la semana y giramos la ruleta para el giveaway de los auriculares!',
      gameTitle: 'Podcast & Charla',
      scheduledAt: fridayStream,
      durationMin: 150,
      youtubeUrl: 'https://youtube.com',
      isLive: false,
    },
  });

  await prisma.streamEvent.create({
    data: {
      title: '🎮 Domingo de Chill & Juegos con la Comunidad',
      description: 'Jugamos con los miembros del canal. ¡Trae tus puntos listos para las votaciones!',
      gameTitle: 'Gaming & Comunidad',
      scheduledAt: sundayStream,
      durationMin: 180,
      youtubeUrl: 'https://youtube.com',
      isLive: false,
    },
  });

  console.log('✅ Seed completed successfully with realistic community data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
