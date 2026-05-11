import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { companies: true },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.display_name || user.email.split('@')[0],
          displayName: user.display_name || '',
          image: user.avatar_url || `https://api.dicebear.com/9.x/shapes/svg?seed=${user.email}&backgroundColor=06b6d4`,
          defaultCompanyId: user.companies.length > 0 ? user.companies[0].id : undefined,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.displayName = user.displayName;
        token.picture = user.image;
        token.defaultCompanyId = user.defaultCompanyId;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.displayName = token.displayName;
        session.user.image = token.picture;
        session.user.defaultCompanyId = token.defaultCompanyId;
        // Override next-auth's "name" with our display_name so it's consistent
        if (token.displayName) {
          session.user.name = token.displayName;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'supersecret_fallback',
};

