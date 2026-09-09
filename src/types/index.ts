export type UserRole = 'ADMIN' | 'MODERATOR' | 'VIP' | 'MEMBER';

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  image: string;
  banner?: string;
  bio?: string;
  role: UserRole;
  points: number;
  level: number;
  streak: number;
  lastDailyAt?: string;
  youtubeHandle?: string;
  discordTag?: string;
}

export interface GiveawayItem {
  id: string;
  title: string;
  description: string;
  prize: string;
  imageUrl?: string;
  costPoints: number;
  minLevel: number;
  winnersCount: number;
  status: 'ACTIVE' | 'DRAWING' | 'FINISHED';
  endsAt: string;
  participantsCount: number;
  isEntered?: boolean;
}

export interface PollOptionItem {
  id: string;
  text: string;
  votesCount: number;
  percentage: number;
}

export interface PollItem {
  id: string;
  question: string;
  description?: string;
  category: string;
  featured: boolean;
  active: boolean;
  totalVotes: number;
  userVotedOptionId?: string;
  options: PollOptionItem[];
}

export interface PostReaction {
  type: 'FIRE' | 'HEART' | 'LAUGH' | 'SKULL' | 'ROCKET';
  count: number;
  userReacted: boolean;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userNickname: string;
  userAvatar: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface PostItem {
  id: string;
  userId: string;
  userName: string;
  userNickname: string;
  userAvatar: string;
  userRole: UserRole;
  content: string;
  imageUrl?: string;
  category: 'GENERAL' | 'MEMES' | 'CLIPS' | 'DEBATE' | 'ANUNCIO';
  pinned: boolean;
  createdAt: string;
  reactions: PostReaction[];
  comments: PostComment[];
}

export interface ClipItem {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail: string;
  category: 'EPICO' | 'FAIL' | 'FUNNY' | 'CLUTCH';
  isStaffPick: boolean;
  creatorName: string;
  likesCount: number;
  userLiked: boolean;
}

export interface ShopReward {
  id: string;
  name: string;
  description: string;
  pricePoints: number;
  category: 'ROLE' | 'BADGE' | 'SHOUTOUT' | 'DIGITAL' | 'MERCH';
  icon: string;
  stock: number;
}

export interface StreamSchedule {
  id: string;
  title: string;
  description: string;
  gameTitle: string;
  scheduledAt: string;
  durationMin: number;
  youtubeUrl: string;
  isLive: boolean;
}

export interface AchievementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  pointsReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  nickname: string;
  image: string;
  role: UserRole;
  points: number;
  level: number;
  streak: number;
  rank: number;
}