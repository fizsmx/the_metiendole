import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'MODERATOR' | 'VIP' | 'MEMBER' | string;
      points: number;
      level: number;
      streak: number;
      nickname: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    role?: 'ADMIN' | 'MODERATOR' | 'VIP' | 'MEMBER' | string;
    points?: number;
    level?: number;
    streak?: number;
    nickname?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'ADMIN' | 'MODERATOR' | 'VIP' | 'MEMBER' | string;
    points?: number;
    level?: number;
    streak?: number;
    nickname?: string;
  }
}
