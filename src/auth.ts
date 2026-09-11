import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { isSuperAdminEmail } from '@/lib/constants';

const isPostgres = !!process.env.DATABASE_URL?.startsWith('postgres');

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'metele-nomas-super-secret-key-2026-xyz123!',
  adapter: isPostgres ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'Acceso Directo',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Nombre', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        if (!email) return null;

        const role = isSuperAdminEmail(email) ? 'ADMIN' : 'MEMBER';

        try {
          // Buscar usuario existente en la base de datos si está disponible
          let user = await prisma.user.findUnique({
            where: { email },
          });

          // Si no existe, crearlo como nuevo miembro de la comunidad
          if (!user) {
            const rawName = (credentials?.name as string) || email.split('@')[0];
            const nickname = rawName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'metedor_' + Math.floor(Math.random() * 9000 + 1000);
            
            user = await prisma.user.create({
              data: {
                email,
                name: rawName,
                nickname,
                image: '/images/brand/logo-circle.png',
                role,
                points: role === 'ADMIN' ? 9999 : 150,
                level: 1,
                streak: 1,
                bio: 'Nuevo metedor oficial de la comunidad de Metele Nomás.',
              },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: isSuperAdminEmail(user.email) ? 'ADMIN' : user.role,
            points: user.points,
            level: user.level,
            streak: user.streak,
            nickname: user.nickname || user.name || 'Metedor',
          };
        } catch (e) {
          console.warn('DB error in authorize, using memory user fallback:', e);
          const rawName = (credentials?.name as string) || email.split('@')[0];
          return {
            id: 'usr_' + Math.random().toString(36).slice(2, 8),
            name: rawName,
            email,
            image: '/images/brand/logo-circle.png',
            role,
            points: role === 'ADMIN' ? 9999 : 150,
            level: 1,
            streak: 1,
            nickname: rawName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'metedor',
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || token.sub || 'usr_' + Math.random().toString(36).slice(2, 8);
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = isSuperAdminEmail(user.email) ? 'ADMIN' : 'MEMBER';
        token.points = isSuperAdminEmail(user.email) ? 9999 : 150;
        token.level = 1;
        token.streak = 1;
        token.nickname = user.name?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'metedor';
      }
      
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.role = isSuperAdminEmail(dbUser.email) ? 'ADMIN' : dbUser.role;
            token.points = dbUser.points;
            token.level = dbUser.level;
            token.streak = dbUser.streak;
            token.nickname = dbUser.nickname || dbUser.name || token.nickname;
          }
        } catch (e) {
          // Si la DB aún no está sincronizada o no es accesible, continuamos con los datos del token
          console.warn('DB lookup skipped in jwt callback:', e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id || token.sub) as string;
        session.user.role = (token.role as 'ADMIN' | 'MODERATOR' | 'VIP' | 'MEMBER') || 'MEMBER';
        session.user.points = typeof token.points === 'number' ? token.points : 150;
        session.user.level = typeof token.level === 'number' ? token.level : 1;
        session.user.streak = typeof token.streak === 'number' ? token.streak : 1;
        session.user.nickname = (token.nickname as string) || session.user.name || 'Metedor';
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      try {
        if (user.id && user.name) {
          const defaultNick = user.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'metedor_' + user.id.slice(-4);
          await prisma.user.update({
            where: { id: user.id },
            data: {
              nickname: defaultNick,
              points: isSuperAdminEmail(user.email) ? 9999 : 150, // Bono de bienvenida
              level: 1,
              streak: 1,
              role: isSuperAdminEmail(user.email) ? 'ADMIN' : 'MEMBER',
            },
          });
        }
      } catch (e) {
        console.warn('Could not update user in createUser event:', e);
      }
    },
  },
  pages: {
    signIn: '/',
  },
});
