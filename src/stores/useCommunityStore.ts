import { create } from 'zustand';
import {
  UserProfile,
  GiveawayItem,
  PollItem,
  PostItem,
  PostComment,
  ClipItem,
  ShopReward,
  StreamSchedule,
  AchievementItem,
  LeaderboardUser,
} from '@/types';

interface CommunityState {
  // Navigation & Modals
  activeTab: 'home' | 'sorteos' | 'votaciones' | 'leaderboard' | 'muro' | 'clips' | 'tienda' | 'calendario';
  setActiveTab: (tab: CommunityState['activeTab']) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isWhatsAppQROpen: boolean;
  setIsWhatsAppQROpen: (open: boolean) => void;
  isWheelOpen: boolean;
  setIsWheelOpen: (open: boolean) => void;

  // Current User
  currentUser: UserProfile;
  dailyClaimed: boolean;
  claimDailyReward: () => { success: boolean; points: number };

  // Data Collections
  giveaways: GiveawayItem[];
  enterGiveaway: (id: string) => { success: boolean; message: string };
  spinWheelWinners: () => string;

  polls: PollItem[];
  votePoll: (pollId: string, optionId: string) => void;

  posts: PostItem[];
  createPost: (content: string, category: PostItem['category']) => void;
  addComment: (postId: string, content: string) => void;
  toggleReaction: (postId: string, type: 'FIRE' | 'HEART' | 'LAUGH' | 'SKULL' | 'ROCKET') => void;

  clips: ClipItem[];
  toggleClipLike: (clipId: string) => void;

  shopItems: ShopReward[];
  redeemItem: (itemId: string) => { success: boolean; message: string };

  streamEvents: StreamSchedule[];
  achievements: AchievementItem[];
  leaderboard: LeaderboardUser[];

  // Admin Panel State & Actions
  adminTab: 'overview' | 'giveaways' | 'polls' | 'users' | 'feed' | 'streams' | 'shop';
  setAdminTab: (tab: 'overview' | 'giveaways' | 'polls' | 'users' | 'feed' | 'streams' | 'shop') => void;
  createGiveaway: (giveaway: {
    title: string;
    description: string;
    prize: string;
    costPoints: number;
    minLevel: number;
    winnersCount: number;
    endsAt: string;
    imageUrl?: string;
  }) => void;
  deleteGiveaway: (id: string) => void;
  createPoll: (poll: {
    question: string;
    description?: string;
    category: string;
    options: string[];
  }) => void;
  deletePoll: (id: string) => void;
  togglePollStatus: (id: string) => void;
  updateUserRole: (userId: string, role: UserProfile['role']) => void;
  adjustUserPoints: (userId: string, delta: number) => void;
  deletePost: (postId: string) => void;
  togglePostPinned: (postId: string) => void;
  toggleStreamLive: (streamId: string) => void;
  addStreamEvent: (event: {
    title: string;
    description: string;
    gameTitle: string;
    scheduledAt: string;
    youtubeUrl: string;
  }) => void;
  addShopItem: (item: {
    name: string;
    description: string;
    pricePoints: number;
    category: 'ROLE' | 'BADGE' | 'SHOUTOUT' | 'DIGITAL' | 'MERCH';
    icon: string;
    stock: number;
  }) => void;
  toggleAdminRole: () => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isProfileOpen: false,
  setIsProfileOpen: (open) => set({ isProfileOpen: open }),
  isWhatsAppQROpen: false,
  setIsWhatsAppQROpen: (open) => set({ isWhatsAppQROpen: open }),
  isWheelOpen: false,
  setIsWheelOpen: (open) => set({ isWheelOpen: open }),

  // Usuario simulado conectado (listo para conectar con Google OAuth en producción)
  currentUser: {
    id: 'usr_fiel_01',
    name: 'Metedor Fiel',
    nickname: 'Metedor_OG',
    email: 'metedor@comunidad.tv',
    image: '/images/brand/logo-circle.png',
    banner: '/images/brand/banner.jpg',
    bio: '🔥 Hincha número 1 de Metele Nomás. Aquí no se duerme en los directos.',
    role: 'ADMIN',
    points: 1250,
    level: 3,
    streak: 12,
    youtubeHandle: '@metedor_fiel',
    discordTag: 'Metedor#1337',
  },
  dailyClaimed: false,

  claimDailyReward: () => {
    const { currentUser, dailyClaimed } = get();
    if (dailyClaimed) return { success: false, points: 0 };

    const reward = 50 + currentUser.streak * 5;
    set({
      dailyClaimed: true,
      currentUser: {
        ...currentUser,
        points: currentUser.points + reward,
        streak: currentUser.streak + 1,
      },
    });
    return { success: true, points: reward };
  },

  // Sorteos
  giveaways: [
    {
      id: 'gw_1',
      title: '🎧 Auriculares Gamer HyperX Cloud II + Polera Oficial',
      description: '¡Sorteo exclusivo para la comunidad de Metele Nomás! Entra con 50 puntos acumulados.',
      prize: 'HyperX Cloud II Wireless + Merch Pack',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
      costPoints: 50,
      minLevel: 1,
      winnersCount: 1,
      status: 'ACTIVE',
      endsAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      participantsCount: 384,
      isEntered: false,
    },
    {
      id: 'gw_2',
      title: '🎟️ Pase VIP a la Cabina del Podcast + Cena con el Equipo',
      description: 'Vive la experiencia del podcast en persona y cena con Fisbert y los invitados especiales.',
      prize: 'Experiencia VIP Cabina + Cena Completa',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=700&auto=format&fit=crop&q=80',
      costPoints: 200,
      minLevel: 2,
      winnersCount: 2,
      status: 'ACTIVE',
      endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      participantsCount: 192,
      isEntered: true,
    },
  ],

  enterGiveaway: (id) => {
    const { currentUser, giveaways } = get();
    const giveaway = giveaways.find((g) => g.id === id);
    if (!giveaway) return { success: false, message: 'Sorteo no encontrado' };

    if (giveaway.isEntered) {
      return { success: false, message: 'Ya estás participando en este sorteo' };
    }

    if (currentUser.points < giveaway.costPoints) {
      return { success: false, message: `Puntos insuficientes (${giveaway.costPoints} necesarios)` };
    }

    if (currentUser.level < giveaway.minLevel) {
      return { success: false, message: `Requiere Nivel ${giveaway.minLevel}` };
    }

    set({
      currentUser: {
        ...currentUser,
        points: currentUser.points - giveaway.costPoints,
      },
      giveaways: giveaways.map((g) =>
        g.id === id
          ? { ...g, isEntered: true, participantsCount: g.participantsCount + 1 }
          : g
      ),
    });

    return { success: true, message: '¡Has entrado al sorteo con éxito! 🎉' };
  },

  spinWheelWinners: () => {
    const sampleNames = [
      'NicoElMetedor',
      'CamiStream',
      'Lucas_OP',
      'Andres_Gaming',
      'Sofi_Poderosa',
      'Metedor_OG',
      'Pablo_Bolivia',
      'Gabi_Podcast',
    ];
    const randomIndex = Math.floor(Math.random() * sampleNames.length);
    return sampleNames[randomIndex];
  },

  // Encuestas
  polls: [
    {
      id: 'poll_1',
      question: '🎙️ ¿Qué temática quieren para el capítulo especial de 50 Episodios?',
      description: 'Vota tu favorita. El tema ganador será debatido durante un directo de 4 horas.',
      category: 'STREAM',
      featured: true,
      active: true,
      totalVotes: 842,
      userVotedOptionId: 'opt_1',
      options: [
        { id: 'opt_1', text: '🎮 Noche de anécdotas y confesiones prohibidas de streaming', votesCount: 395, percentage: 47 },
        { id: 'opt_2', text: '🥊 Tier list en vivo: Creadores más polémicos de habla hispana', votesCount: 260, percentage: 31 },
        { id: 'opt_3', text: '👻 Relatos paranormales y de terror enviados por la comunidad', votesCount: 124, percentage: 15 },
        { id: 'opt_4', text: '💡 Invitado internacional misterioso en llamada Discord', votesCount: 63, percentage: 7 },
      ],
    },
    {
      id: 'poll_2',
      question: '🍕 ¿Qué ordenamos para el maratón del próximo domingo?',
      description: 'El stream se alimenta de lo que decida el chat.',
      category: 'COMUNIDAD',
      featured: false,
      active: true,
      totalVotes: 512,
      userVotedOptionId: undefined,
      options: [
        { id: 'p2_1', text: 'Pizzas artesanales con bordes rellenos', votesCount: 240, percentage: 47 },
        { id: 'p2_2', text: 'Hamburguesas smash dobles con papas', votesCount: 180, percentage: 35 },
        { id: 'p2_3', text: 'Alitas picantes nivel suicidio (Reto en vivo)', votesCount: 92, percentage: 18 },
      ],
    },
  ],

  votePoll: (pollId, optionId) => {
    const { polls, currentUser } = get();
    set({
      currentUser: { ...currentUser, points: currentUser.points + 10 }, // 10 pts por votar
      polls: polls.map((p) => {
        if (p.id !== pollId || p.userVotedOptionId) return p;
        const newTotal = p.totalVotes + 1;
        const updatedOptions = p.options.map((opt) => {
          const newVotes = opt.id === optionId ? opt.votesCount + 1 : opt.votesCount;
          return {
            ...opt,
            votesCount: newVotes,
            percentage: Math.round((newVotes / newTotal) * 100),
          };
        });
        return {
          ...p,
          totalVotes: newTotal,
          userVotedOptionId: optionId,
          options: updatedOptions,
        };
      }),
    });
  },

  // Muro
  posts: [
    {
      id: 'post_1',
      userId: 'usr_admin',
      userName: 'Fisbert Chávez',
      userNickname: 'metelenomas_tv',
      userAvatar: '/images/brand/logo-circle.png',
      userRole: 'ADMIN',
      content: '¡BIENVENIDOS A LA PLATAFORMA OFICIAL DE METELE NOMÁS! 🚀 Aquí tienen su espacio definitivo: voten los temas de cada viernes, participen en sorteos con sus puntos de racha y comenten todo lo que se les ocurra. ¡A meterle nomás!',
      pinned: true,
      category: 'ANUNCIO',
      createdAt: 'Hace 2 horas',
      reactions: [
        { type: 'FIRE', count: 88, userReacted: true },
        { type: 'ROCKET', count: 42, userReacted: false },
        { type: 'HEART', count: 54, userReacted: true },
      ],
      comments: [
        {
          id: 'c_1',
          userId: 'usr_1',
          userName: 'Nico Gamer',
          userNickname: 'NicoElMetedor',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          userRole: 'VIP',
          content: '¡Qué locura cómo quedó la página! Los colores y el logo están 🔥 Ya reclamé mis puntos de hoy.',
          createdAt: 'Hace 1 hora',
        },
        {
          id: 'c_2',
          userId: 'usr_2',
          userName: 'Camila Rojas',
          userNickname: 'CamiStream',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
          userRole: 'MODERATOR',
          content: 'Hermoso todo! Moderación 100% activa. No se olviden de unirse al grupo de WhatsApp desde el botón abajo!',
          createdAt: 'Hace 45 min',
        },
      ],
    },
    {
      id: 'post_2',
      userId: 'usr_1',
      userName: 'Nico Gamer',
      userNickname: 'NicoElMetedor',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      userRole: 'VIP',
      content: '¿Quién más va a estar prendido en el directo de mañana? Acuérdense de votar en la encuesta del tema del podcast para que gane la noche de anécdotas 😂',
      pinned: false,
      category: 'GENERAL',
      createdAt: 'Hace 3 horas',
      reactions: [
        { type: 'FIRE', count: 23, userReacted: false },
        { type: 'LAUGH', count: 15, userReacted: true },
      ],
      comments: [],
    },
  ],

  createPost: (content, category) => {
    const { currentUser, posts } = get();
    const newPost: PostItem = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userNickname: currentUser.nickname,
      userAvatar: currentUser.image,
      userRole: currentUser.role,
      content,
      category,
      pinned: false,
      createdAt: 'Justo ahora',
      reactions: [
        { type: 'FIRE', count: 1, userReacted: true },
        { type: 'ROCKET', count: 0, userReacted: false },
        { type: 'HEART', count: 0, userReacted: false },
      ],
      comments: [],
    };
    set({
      posts: [newPost, ...posts],
      currentUser: { ...currentUser, points: currentUser.points + 15 },
    });
  },

  addComment: (postId, content) => {
    const { currentUser, posts } = get();
    const newComment: PostComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userNickname: currentUser.nickname,
      userAvatar: currentUser.image,
      userRole: currentUser.role,
      content,
      createdAt: 'Justo ahora',
    };
    set({
      posts: posts.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      ),
      currentUser: { ...currentUser, points: currentUser.points + 5 },
    });
  },

  toggleReaction: (postId, type) => {
    const { posts } = get();
    set({
      posts: posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          reactions: p.reactions.map((r) => {
            if (r.type !== type) return r;
            const userReacted = !r.userReacted;
            return {
              ...r,
              userReacted,
              count: userReacted ? r.count + 1 : r.count - 1,
            };
          }),
        };
      }),
    });
  },

  // Clips
  clips: [
    {
      id: 'clip_1',
      title: 'El ataque de risa legendario del Podcast #42 💀',
      description: 'Cuando se cayó el micrófono en pleno debate y nadie pudo aguantar la risa.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      category: 'FUNNY',
      isStaffPick: true,
      creatorName: 'metelenomas_tv',
      likesCount: 312,
      userLiked: true,
    },
    {
      id: 'clip_2',
      title: 'Remontada 1v4 épica en el stream de juegos 🏆',
      description: 'Jugada decisiva en el torneo comunitario de los domingos.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      category: 'EPICO',
      isStaffPick: true,
      creatorName: 'NicoElMetedor',
      likesCount: 185,
      userLiked: false,
    },
    {
      id: 'clip_3',
      title: 'El susto más grande de la historia en Resident Evil 😱',
      description: 'Casi tira los audífonos por la ventana.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
      category: 'FAIL',
      isStaffPick: false,
      creatorName: 'CamiStream',
      likesCount: 94,
      userLiked: false,
    },
  ],

  toggleClipLike: (clipId) => {
    const { clips } = get();
    set({
      clips: clips.map((c) => {
        if (c.id !== clipId) return c;
        const userLiked = !c.userLiked;
        return {
          ...c,
          userLiked,
          likesCount: userLiked ? c.likesCount + 1 : c.likesCount - 1,
        };
      }),
    });
  },

  // Tienda
  shopItems: [
    {
      id: 'item_1',
      name: '👑 Rol VIP en Comunidad & Discord',
      description: 'Color dorado exclusivo, acceso a sorteos VIP y multiplicador de puntos x1.5.',
      pricePoints: 1000,
      category: 'ROLE',
      icon: '👑',
      stock: -1,
    },
    {
      id: 'item_2',
      name: '📢 Saludo & Dedicatoria en Vivo en el Stream',
      description: 'Tu nombre y mensaje leídos al aire durante el directo con banner personalizado.',
      pricePoints: 1500,
      category: 'SHOUTOUT',
      icon: '🎙️',
      stock: 8,
    },
    {
      id: 'item_3',
      name: '👕 Polera Oficial "Metele Nomás" Signature',
      description: 'Algodón 100% premium con logo bordado en el pecho. Envío a todo el país.',
      pricePoints: 4000,
      category: 'MERCH',
      icon: '👕',
      stock: 4,
    },
    {
      id: 'item_4',
      name: '⭐ Badge Especial: "Metedor Legendario"',
      description: 'Insignia animada con fuego que brilla junto a tu nombre en comentarios y rankings.',
      pricePoints: 500,
      category: 'BADGE',
      icon: '⭐',
      stock: -1,
    },
  ],

  redeemItem: (itemId) => {
    const { currentUser, shopItems } = get();
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Artículo no encontrado' };

    if (currentUser.points < item.pricePoints) {
      return {
        success: false,
        message: `Te faltan ${item.pricePoints - currentUser.points} puntos para canjear esto.`,
      };
    }

    set({
      currentUser: { ...currentUser, points: currentUser.points - item.pricePoints },
      shopItems: shopItems.map((i) =>
        i.id === itemId && i.stock > 0 ? { ...i, stock: i.stock - 1 } : i
      ),
    });

    return {
      success: true,
      message: `¡Canjeaste "${item.name}" con éxito! Revisa tu perfil.`,
    };
  },

  // Eventos de Stream
  streamEvents: [
    {
      id: 'evt_1',
      title: '🎙️ Metele Nomás Podcast #48 — Debate Caliente + Sorteo de Cascos',
      description: 'Transmisión especial en vivo por YouTube. Votaremos los temas con el chat.',
      gameTitle: 'Podcast & Charla en Vivo',
      scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      durationMin: 180,
      youtubeUrl: 'https://youtube.com',
      isLive: false,
    },
    {
      id: 'evt_2',
      title: '🎮 Domingo de Torneo Comunitario & Ruleta de Puntos',
      description: 'Partidas con los suscriptores y giros de la ruleta cada 30 minutos.',
      gameTitle: 'Gaming & Comunidad',
      scheduledAt: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      durationMin: 210,
      youtubeUrl: 'https://youtube.com',
      isLive: false,
    },
  ],

  // Logros
  achievements: [
    {
      id: 'ach_1',
      code: 'FIRST_LOGIN',
      title: 'Primer Paso',
      description: 'Te uniste oficialmente a la familia de Metele Nomás.',
      icon: '🎉',
      pointsReward: 50,
      unlocked: true,
      unlockedAt: 'Hace 12 días',
    },
    {
      id: 'ach_2',
      code: 'STREAK_7',
      title: 'Racha de Fuego',
      description: 'Mantuviste una racha de 7 días seguidos de ingreso.',
      icon: '🔥',
      pointsReward: 100,
      unlocked: true,
      unlockedAt: 'Hace 5 días',
    },
    {
      id: 'ach_3',
      code: 'POLL_MASTER',
      title: 'Voz del Pueblo',
      description: 'Has participado en más de 5 votaciones comunitarias.',
      icon: '🗳️',
      pointsReward: 75,
      unlocked: true,
      unlockedAt: 'Ayer',
    },
    {
      id: 'ach_4',
      code: 'LUCKY_ONE',
      title: 'Tocado por la Suerte',
      description: 'Gana cualquier sorteo de la plataforma.',
      icon: '👑',
      pointsReward: 200,
      unlocked: false,
    },
    {
      id: 'ach_5',
      code: 'METEDOR_SUPREMO',
      title: 'Metedor Supremo',
      description: 'Alcanza el Nivel 5 de fidelidad.',
      icon: '⚡',
      pointsReward: 500,
      unlocked: false,
    },
  ],

  // Leaderboard
  leaderboard: [
    {
      id: 'u_lead_1',
      name: 'Fisbert Chávez',
      nickname: 'metelenomas_tv',
      image: '/images/brand/logo-circle.png',
      role: 'ADMIN',
      points: 9999,
      level: 5,
      streak: 45,
      rank: 1,
    },
    {
      id: 'u_lead_2',
      name: 'Camila Rojas',
      nickname: 'CamiStream',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'MODERATOR',
      points: 3800,
      level: 4,
      streak: 27,
      rank: 2,
    },
    {
      id: 'u_lead_3',
      name: 'Nico Gamer',
      nickname: 'NicoElMetedor',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'VIP',
      points: 2450,
      level: 4,
      streak: 18,
      rank: 3,
    },
    {
      id: 'u_lead_4',
      name: 'Metedor Fiel (Tú)',
      nickname: 'Metedor_OG',
      image: '/images/brand/logo-circle.png',
      role: 'VIP',
      points: 1250,
      level: 3,
      streak: 12,
      rank: 4,
    },
    {
      id: 'u_lead_5',
      name: 'Lucas Mendez',
      nickname: 'Lucas_OP',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      role: 'MEMBER',
      points: 820,
      level: 3,
      streak: 9,
      rank: 5,
    },
    {
      id: 'u_lead_6',
      name: 'Sofia Valda',
      nickname: 'Sofi_Poderosa',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'MEMBER',
      points: 640,
      level: 2,
      streak: 6,
      rank: 6,
    },
  ],

  // Admin Implementations
  adminTab: 'overview',
  setAdminTab: (tab) => set({ adminTab: tab }),

  toggleAdminRole: () => {
    const { currentUser } = get();
    set({
      currentUser: {
        ...currentUser,
        role: currentUser.role === 'ADMIN' ? 'MEMBER' : 'ADMIN',
      },
    });
  },

  createGiveaway: (giveaway) => {
    const { giveaways } = get();
    const newGw: GiveawayItem = {
      ...giveaway,
      id: `gw_${Date.now()}`,
      status: 'ACTIVE',
      participantsCount: 0,
      isEntered: false,
    };
    set({ giveaways: [newGw, ...giveaways] });
  },

  deleteGiveaway: (id) => {
    const { giveaways } = get();
    set({ giveaways: giveaways.filter((g) => g.id !== id) });
  },

  createPoll: (newPoll) => {
    const { polls } = get();
    const pollItem: PollItem = {
      id: `poll_${Date.now()}`,
      question: newPoll.question,
      description: newPoll.description,
      category: newPoll.category,
      featured: true,
      active: true,
      totalVotes: 0,
      options: newPoll.options.map((optText, index) => ({
        id: `opt_${Date.now()}_${index}`,
        text: optText,
        votesCount: 0,
        percentage: 0,
      })),
    };
    set({ polls: [pollItem, ...polls] });
  },

  deletePoll: (id) => {
    const { polls } = get();
    set({ polls: polls.filter((p) => p.id !== id) });
  },

  togglePollStatus: (id) => {
    const { polls } = get();
    set({
      polls: polls.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    });
  },

  updateUserRole: (userId, role) => {
    const { leaderboard } = get();
    set({
      leaderboard: leaderboard.map((u) => (u.id === userId ? { ...u, role } : u)),
    });
  },

  adjustUserPoints: (userId, delta) => {
    const { leaderboard } = get();
    set({
      leaderboard: leaderboard.map((u) =>
        u.id === userId ? { ...u, points: Math.max(0, u.points + delta) } : u
      ),
    });
  },

  deletePost: (postId) => {
    const { posts } = get();
    set({ posts: posts.filter((p) => p.id !== postId) });
  },

  togglePostPinned: (postId) => {
    const { posts } = get();
    set({
      posts: posts.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p)),
    });
  },

  toggleStreamLive: (streamId) => {
    const { streamEvents } = get();
    set({
      streamEvents: streamEvents.map((s) =>
        s.id === streamId ? { ...s, isLive: !s.isLive } : s
      ),
    });
  },

  addStreamEvent: (event) => {
    const { streamEvents } = get();
    const newEvent: StreamSchedule = {
      ...event,
      id: `evt_${Date.now()}`,
      durationMin: 120,
      isLive: false,
    };
    set({ streamEvents: [newEvent, ...streamEvents] });
  },

  addShopItem: (item) => {
    const { shopItems } = get();
    const newItem: ShopReward = {
      ...item,
      id: `item_${Date.now()}`,
    };
    set({ shopItems: [...shopItems, newItem] });
  },
}));