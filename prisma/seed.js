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

  // 2. Crear Único Usuario Host / Super Admin Real (Fisbert Chávez)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Fisbert Chávez (Metele Nomás)',
      nickname: 'metelenomas_tv',
      email: 'fisbertdarck@gmail.com',
      image: '/images/brand/logo-circle.png',
      banner: '/images/brand/banner.jpg',
      bio: '🎙️ Creador y Host de Metele Nomás Podcast & Stream. ¡Bienvenidos a la plataforma oficial!',
      role: 'ADMIN',
      points: 1000,
      level: 3,
      streak: 1,
      youtubeHandle: '@metelenomas',
      discordTag: 'Fisbert',
    },
  });

  // 3. Crear Logros (Achievements) oficiales
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

  await prisma.userAchievement.create({
    data: {
      userId: adminUser.id,
      achievementId: achievements[0].id,
    },
  });

  // 4. Crear Sorteos Oficiales (Sin participantes falsos)
  const now = new Date();
  const endsIn3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const endsIn7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.giveaway.create({
    data: {
      title: '🎧 Auriculares Gamer HyperX Cloud II + Polera Oficial',
      description: '¡Sorteo de fin de mes para toda la banda de Metele Nomás! Entra con tus puntos y participa en vivo por la ruleta.',
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

  await prisma.giveaway.create({
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

  // 5. Crear Votaciones Oficiales (Sin votos falsos)
  await prisma.poll.create({
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
  });

  await prisma.poll.create({
    data: {
      question: '🍕 ¿Qué ordenamos para comer durante el stream?',
      description: 'Votación rápida comunitaria en vivo.',
      category: 'COMUNIDAD',
      featured: false,
      active: true,
      options: {
        create: [
          { text: 'Pizza con extra queso y borde de jamón', order: 1 },
          { text: 'Hamburguesas gigantes smash', order: 2 },
          { text: 'Alitas ultra picantes (reto en vivo)', order: 3 },
        ],
      },
    },
  });

  // 6. Publicación Oficial de Bienvenida en el Muro (Sin comentarios falsos, sin reacciones falsas)
  await prisma.post.create({
    data: {
      userId: adminUser.id,
      content: '¡BIENVENIDOS OFICIALMENTE a la plataforma de la comunidad de METELE NOMÁS! 🚀 Aquí van a poder votar temas, participar en sorteos, acumular puntos y reclamar recompensas exclusivas. ¡Comenten abajo qué les parece la nueva casa! 👇',
      pinned: true,
      category: 'ANUNCIO',
    },
  });

  // 7. Clip Oficial de Bienvenida
  await prisma.clip.create({
    data: {
      userId: adminUser.id,
      title: '🎙️ Bienvenidos a Metele Nomás Podcast',
      description: 'El podcast donde hablamos sin filtro de todo lo que pasa en el streaming y la cultura pop.',
      videoUrl: 'https://www.youtube.com/@metelenomas',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
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
