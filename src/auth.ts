import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
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

        // Buscar usuario existente en la base de datos
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
              role: email.includes('host') || email.includes('admin') ? 'ADMIN' : 'MEMBER',
              points: 150, // 100 base + 50 de bienvenida
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
          role: user.role,
          points: user.points,
          level: user.level,
          streak: user.streak,
          nickname: user.nickname || user.name || 'Metedor',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.points = dbUser.points;
          token.level = dbUser.level;
          token.streak = dbUser.streak;
          token.nickname = dbUser.nickname || dbUser.name || 'Metedor';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
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
      // Configurar valores por defecto para usuarios registrados vía Google OAuth
      if (user.id && user.name) {
        const defaultNick = user.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'metedor_' + user.id.slice(-4);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            nickname: defaultNick,
            points: 150, // Bono de bienvenida
            level: 1,
            streak: 1,
            role: user.email === 'host@metelenomas.com' ? 'ADMIN' : 'MEMBER',
          },
        });
      }
    },
  },
  pages: {
    signIn: '/',
  },
});
