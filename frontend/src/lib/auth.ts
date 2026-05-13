import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Increase timeout for OAuth token exchange (default 3500ms is too short)
  httpOptions: {
    timeout: 15000,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
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

        if (!user.password_hash) {
          throw new Error('This account uses OAuth. Please sign in with your OAuth provider.');
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
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins (Google & GitHub)
      if (account?.provider === 'google' || account?.provider === 'github') {
        // Check if user exists, if not - they will be created by PrismaAdapter
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          // Update user info from OAuth profile if needed
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name,
              image: user.image,
              display_name: user.name,
              avatar_url: user.image,
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      if (user) {
        token.id = user.id;
        token.displayName = user.displayName || user.name;
        token.picture = user.image;
        token.defaultCompanyId = user.defaultCompanyId;
      }

      // For OAuth users, fetch additional data from database
      if (account?.provider && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { companies: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.displayName = dbUser.display_name || dbUser.name;
          token.picture = dbUser.avatar_url || dbUser.image;
          token.defaultCompanyId = dbUser.companies.length > 0 ? dbUser.companies[0].id : undefined;
        }
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

