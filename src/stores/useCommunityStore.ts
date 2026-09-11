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
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  syncFromDatabase: () => Promise<void>;
  syncUserFromDatabase: () => Promise<void>;
  setCurrentUser: (user: Partial<UserProfile>) => void;

  // Current User
  currentUser: UserProfile;
  dailyClaimed: boolean;
  claimDailyReward: () => Promise<{ success: boolean; points: number; message?: string }>;

  // Data Collections
  giveaways: GiveawayItem[];
  enterGiveaway: (id: string) => Promise<{ success: boolean; message: string }>;
  spinWheelWinners: () => string;

  polls: PollItem[];
  votePoll: (pollId: string, optionId: string) => Promise<void>;

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
  isAuthModalOpen: false,
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

  setCurrentUser: (partialUser) => {
    const { currentUser } = get();
    set({ currentUser: { ...currentUser, ...partialUser } });
  },

  syncUserFromDatabase: async () => {
    try {
      const res = await fetch('/api/user/me');
      if (!res.ok) return;
      const data = await res.json();
      if (data.authenticated && data.user) {
        const u = data.user;
        const current = get().currentUser;
        set({
          currentUser: {
            ...current,
            id: u.id,
            name: u.name || current.name,
            nickname: u.nickname || current.nickname,
            email: u.email || current.email,
            image: u.image || current.image,
            role: u.role || current.role,
            points: typeof u.points === 'number' ? u.points : current.points,
            level: typeof u.level === 'number' ? u.level : current.level,
            streak: typeof u.streak === 'number' ? u.streak : current.streak,
          },
          dailyClaimed: !!u.dailyClaimed,
          giveaways: get().giveaways.map((g) => ({
            ...g,
            isEntered: (u.enteredGiveawayIds || []).includes(g.id),
          })),
          polls: get().polls.map((p) => {
            const vote = (u.votedPolls || []).find((v: { pollId: string; optionId: string }) => v.pollId === p.id);
            return vote ? { ...p, userVotedOptionId: vote.optionId } : p;
          }),
        });
      }
    } catch (e) {
      console.error('Error syncing user from database:', e);
    }
  },

  syncFromDatabase: async () => {
    try {
      const res = await fetch('/api/community/sync');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({
            giveaways: data.giveaways.length > 0 ? data.giveaways : get().giveaways,
            polls: data.polls.length > 0 ? data.polls : get().polls,
            leaderboard: data.leaderboard.length > 0 ? data.leaderboard : get().leaderboard,
            posts: data.posts.length > 0 ? data.posts : get().posts,
          });
        }
      }
      await get().syncUserFromDatabase();
    } catch (e) {
      console.error('Error syncing store from database:', e);
    }
  },

  // Estado de usuario invitado inicial (se sobreescribe con Google OAuth al iniciar sesión)
  currentUser: {
    id: 'guest',
    name: 'Invitado',
    nickname: 'invitado',
    email: '',
    image: '/images/brand/logo-circle.png',
    banner: '/images/brand/banner.jpg',
    bio: 'Comunidad oficial de Metele Nomás Podcast.',
    role: 'MEMBER',
    points: 0,
    level: 1,
    streak: 0,
    youtubeHandle: '',
    discordTag: '',
  },
  dailyClaimed: false,

  claimDailyReward: async () => {
    const { currentUser, dailyClaimed } = get();
    if (dailyClaimed || currentUser.id === 'guest') {
      return { success: false, points: 0, message: 'Ya reclamaste tu recompensa de hoy' };
    }

    try {
      const res = await fetch('/api/user/claim-daily', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.alreadyClaimed) {
          set({
            dailyClaimed: true,
            currentUser: {
              ...currentUser,
              points: typeof data.newPoints === 'number' ? data.newPoints : currentUser.points,
              streak: typeof data.streak === 'number' ? data.streak : currentUser.streak,
            },
          });
        }
        return { success: false, points: 0, message: data.error || 'Error al reclamar' };
      }

      set({
        dailyClaimed: true,
        currentUser: {
          ...currentUser,
          points: data.newPoints,
          streak: data.streak,
        },
      });
      return { success: true, points: data.pointsAdded, message: `+${data.pointsAdded} pts!` };
    } catch (e) {
      console.error('Error claiming daily reward:', e);
      return { success: false, points: 0, message: 'Error de red' };
    }
  },

  // Sorteos
  giveaways: [
    {
      id: 'gw_1',
      title: 'Auriculares Gamer HyperX Cloud II + Polera Oficial',
      description: 'Sorteo exclusivo para la comunidad de Metele Nomás. Entra con 50 puntos acumulados.',
      prize: 'HyperX Cloud II Wireless + Merch Pack',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
      costPoints: 50,
      minLevel: 1,
      winnersCount: 1,
      status: 'ACTIVE',
      endsAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      participantsCount: 0,
      isEntered: false,
    },
    {
      id: 'gw_2',
      title: 'Pase VIP a la Cabina del Podcast + Cena con el Equipo',
      description: 'Vive la experiencia del podcast en persona y comparte con Fisbert y los invitados especiales.',
      prize: 'Experiencia VIP Cabina + Cena Completa',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=700&auto=format&fit=crop&q=80',
      costPoints: 200,
      minLevel: 2,
      winnersCount: 2,
      status: 'ACTIVE',
      endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      participantsCount: 0,
      isEntered: false,
    },
  ],

  enterGiveaway: async (id) => {
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

    try {
      const res = await fetch('/api/giveaways/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Error al participar en el sorteo' };
      }

      set({
        currentUser: {
          ...currentUser,
          points: typeof data.newPoints === 'number' ? data.newPoints : currentUser.points - giveaway.costPoints,
        },
        giveaways: giveaways.map((g) =>
          g.id === id
            ? { ...g, isEntered: true, participantsCount: data.participantsCount ?? g.participantsCount + 1 }
            : g
        ),
      });

      return { success: true, message: data.message || 'Has entrado al sorteo con éxito' };
    } catch (e) {
      console.error('Error entering giveaway:', e);
      return { success: false, message: 'Error de red al inscribirse' };
    }
  },

  spinWheelWinners: () => {
    return 'Gira la ruleta';
  },

  // Encuestas
  polls: [
    {
      id: 'poll_1',
      question: '¿Qué temática quieren para el próximo capítulo del Podcast?',
      description: 'Vota tu favorita. El tema ganador será debatido durante el próximo directo.',
      category: 'STREAM',
      featured: true,
      active: true,
      totalVotes: 0,
      userVotedOptionId: undefined,
      options: [
        { id: 'opt_1', text: 'Noche de anécdotas y confesiones de streaming', votesCount: 0, percentage: 0 },
        { id: 'opt_2', text: 'Tier list en vivo: Creadores de contenido polémicos', votesCount: 0, percentage: 0 },
        { id: 'opt_3', text: 'Relatos paranormales y de terror de la comunidad', votesCount: 0, percentage: 0 },
        { id: 'opt_4', text: 'Invitado internacional en llamada Discord', votesCount: 0, percentage: 0 },
      ],
    },
    {
      id: 'poll_2',
      question: '¿Qué ordenamos para comer durante el stream?',
      description: 'El stream se alimenta de lo que decida el chat en vivo.',
      category: 'COMUNIDAD',
      featured: false,
      active: true,
      totalVotes: 0,
      userVotedOptionId: undefined,
      options: [
        { id: 'p2_1', text: 'Pizzas artesanales con bordes rellenos', votesCount: 0, percentage: 0 },
        { id: 'p2_2', text: 'Hamburguesas smash dobles con papas', votesCount: 0, percentage: 0 },
        { id: 'p2_3', text: 'Alitas picantes (Reto en vivo)', votesCount: 0, percentage: 0 },
      ],
    },
  ],

  votePoll: async (pollId, optionId) => {
    const { polls, currentUser } = get();
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || poll.userVotedOptionId) return;

    try {
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        console.warn('Error submitting vote to server:', data.error);
        return;
      }

      set({
        currentUser: {
          ...currentUser,
          points: typeof data.newPoints === 'number' ? data.newPoints : currentUser.points + 10,
        },
        polls: polls.map((p) => {
          if (p.id !== pollId) return p;
          return {
            ...p,
            totalVotes: data.totalVotes ?? p.totalVotes + 1,
            userVotedOptionId: optionId,
            options: data.options ?? p.options,
          };
        }),
      });
    } catch (e) {
      console.error('Error submitting vote:', e);
    }
  },

  // Muro
  posts: [
    {
      id: 'post_1',
      userId: 'usr_fisbert',
      userName: 'Fisbert Chávez (Metele Nomás)',
      userNickname: 'metelenomas_tv',
      userAvatar: '/images/brand/logo-circle.png',
      userRole: 'ADMIN',
      content: '¡BIENVENIDOS OFICIALMENTE a la plataforma de la comunidad de METELE NOMÁS! 🚀 Aquí van a poder votar temas, participar en sorteos, acumular puntos y reclamar recompensas exclusivas. ¡Comenten abajo qué les parece la nueva casa! 👇',
      pinned: true,
      category: 'ANUNCIO',
      createdAt: 'Publicación fijada',
      reactions: [
        { type: 'FIRE', count: 0, userReacted: false },
        { type: 'ROCKET', count: 0, userReacted: false },
        { type: 'HEART', count: 0, userReacted: false },
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
      title: 'Bienvenidos a Metele Nomás Podcast',
      description: 'El podcast donde hablamos sin filtro de todo lo que pasa en el streaming y la cultura pop.',
      videoUrl: 'https://www.youtube.com/@metelenomas',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      category: 'EPICO',
      isStaffPick: true,
      creatorName: 'metelenomas_tv',
      likesCount: 0,
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
      name: 'Rol VIP en Comunidad & Discord',
      description: 'Color dorado exclusivo, acceso a sorteos VIP y multiplicador de puntos x1.5.',
      pricePoints: 1000,
      category: 'ROLE',
      icon: 'VIP',
      stock: -1,
    },
    {
      id: 'item_2',
      name: 'Saludo & Dedicatoria en Vivo en el Stream',
      description: 'Tu nombre y mensaje leídos al aire durante el directo con banner personalizado.',
      pricePoints: 1500,
      category: 'SHOUTOUT',
      icon: 'LIVE',
      stock: 8,
    },
    {
      id: 'item_3',
      name: 'Polera Oficial "Metele Nomás" Signature',
      description: 'Algodón 100% premium con logo bordado en el pecho. Envío a todo el país.',
      pricePoints: 4000,
      category: 'MERCH',
      icon: 'MERCH',
      stock: 4,
    },
    {
      id: 'item_4',
      name: 'Badge Especial: Metedor Legendario',
      description: 'Insignia animada con fuego que brilla junto a tu nombre en comentarios y rankings.',
      pricePoints: 500,
      category: 'BADGE',
      icon: 'OG',
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
      title: 'Metele Nomás Podcast — En Vivo con Chat & Votaciones',
      description: 'Lunes, Miércoles y Viernes de 21:00 a 23:00 (Hora Bolivia). ¡El podcast más metedor!',
      gameTitle: 'Podcast & Charla en Vivo',
      scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      durationMin: 120,
      youtubeUrl: 'https://www.youtube.com/@MeteleNomas',
      isLive: false,
    },
    {
      id: 'evt_2',
      title: 'Noche de Ruleta & Sorteo Comunitario para Suscriptores',
      description: 'Gira la ruleta en directo para ganar periféricos gamer y membresías.',
      gameTitle: 'Sorteos & Dinámicas en Vivo',
      scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      durationMin: 120,
      youtubeUrl: 'https://www.youtube.com/@MeteleNomas',
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
      icon: 'SPARKLES',
      pointsReward: 50,
      unlocked: true,
      unlockedAt: 'Hace 12 días',
    },
    {
      id: 'ach_2',
      code: 'STREAK_7',
      title: 'Racha de Fuego',
      description: 'Mantuviste una racha de 7 días seguidos de ingreso.',
      icon: 'FLAME',
      pointsReward: 100,
      unlocked: true,
      unlockedAt: 'Hace 5 días',
    },
    {
      id: 'ach_3',
      code: 'POLL_MASTER',
      title: 'Voz del Pueblo',
      description: 'Has participado en más de 5 votaciones comunitarias.',
      icon: 'VOTE',
      pointsReward: 75,
      unlocked: true,
      unlockedAt: 'Ayer',
    },
    {
      id: 'ach_4',
      code: 'LUCKY_ONE',
      title: 'Tocado por la Suerte',
      description: 'Gana cualquier sorteo de la plataforma.',
      icon: 'TROPHY',
      pointsReward: 200,
      unlocked: false,
    },
    {
      id: 'ach_5',
      code: 'METEDOR_SUPREMO',
      title: 'Metedor Supremo',
      description: 'Alcanza el Nivel 5 de fidelidad.',
      icon: 'CROWN',
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
      points: 1000,
      level: 3,
      streak: 1,
      rank: 1,
    },
  ],

  // Admin Implementations
  adminTab: 'overview',
  setAdminTab: (tab) => set({ adminTab: tab }),

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