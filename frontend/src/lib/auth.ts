import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyTOTPCode } from '@/lib/two-factor';

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    getUserByEmail: async (email: string) => {
      // Returning null here bypasses next-auth's automatic OAuthAccountNotLinked block,
      // forcing it to call createUser where we can link the existing user safely.
      return null;
    },
    createUser: async (user: any) => {
      const adapter = PrismaAdapter(prisma);
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existingUser) {
        console.log(`[NextAuth Adapter] createUser found existing user for ${user.email}, linking instead of creating.`);
        return existingUser;
      }
      return await adapter.createUser(user);
    },
    linkAccount: async (account: any) => {
      try {
        const adapter = PrismaAdapter(prisma);
        if (adapter.linkAccount) {
          return await adapter.linkAccount(account);
        }
      } catch (err: any) {
        // If it is a unique constraint violation (P2002), the account is already linked, so safely ignore
        if (err.code === 'P2002') {
          console.log('[NextAuth Adapter] linkAccount unique constraint P2002 occurred, ignoring.');
          const existing = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });
          return existing as any;
        }
        throw err;
      }
    },
  },
  // @ts-ignore: NextAuth internal option for timeout
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
        twoFactorCode: { label: '2FA Code', type: 'text' },
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

        // ── Phase 3: 2FA Check ──────────────────────────────────────────────
        if (user.two_factor_enabled) {
          if (!credentials.twoFactorCode) {
            // Signal to the frontend that a 2FA code is required
            throw new Error('2FA_REQUIRED');
          }
          const isValidOTP = verifyTOTPCode(user.two_factor_secret!, credentials.twoFactorCode);
          if (!isValidOTP) {
            throw new Error('INVALID_2FA_CODE');
          }
        }
        // ────────────────────────────────────────────────────────────────────

        return {
          id: user.id,
          email: user.email,
          name: user.display_name || user.email.split('@')[0],
          displayName: user.display_name || '',
          image: user.avatar_url || `https://api.dicebear.com/9.x/shapes/svg?seed=${user.email}&backgroundColor=06b6d4`,
          defaultCompanyId: user.companies.length > 0 ? user.companies[0].id : undefined,
          needsOnboarding: user.companies.length === 0,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow Credentials sign-ins immediately
      if (account?.provider === 'credentials') {
        return true;
      }

      // Handle OAuth sign-ins (Google & GitHub)
      if (account?.provider === 'google' || account?.provider === 'github') {
        console.log(`[NextAuth signIn] OAuth attempt: provider=${account.provider}, email=${user.email}, userId=${user.id}`);
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { companies: true, accounts: true },
          });

          if (existingUser) {
            console.log(`[NextAuth signIn] Found existing user: id=${existingUser.id}, email=${existingUser.email}`);
            // Check if this OAuth account is already linked
            const existingAccount = existingUser.accounts.find(
              (acc) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
            );

            if (!existingAccount) {
              console.log(`[NextAuth signIn] Linking new ${account.provider} account to existing user ${existingUser.id}`);
              // Manually link the OAuth account to the existing user.
              // This is necessary to fix OAuthAccountNotLinked when the user
              // was originally registered via CredentialsProvider (email+password).
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token ?? null,
                  access_token: account.access_token ?? null,
                  expires_at: account.expires_at ?? null,
                  token_type: account.token_type ?? null,
                  scope: account.scope ?? null,
                  id_token: account.id_token ?? null,
                  session_state: (account.session_state as string) ?? null,
                },
              });
            } else {
              console.log(`[NextAuth signIn] Account already linked for ${account.provider}`);
            }

            // Sync user info from OAuth profile
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
                display_name: user.name,
                avatar_url: user.image,
                emailVerified: existingUser.emailVerified || new Date(),
              },
            });

            // Pass the correct DB id into the JWT pipeline
            user.id = existingUser.id;
          } else {
            console.log(`[NextAuth signIn] No existing user found for ${user.email} — PrismaAdapter will create new user`);
          }
          // else: brand new OAuth user — PrismaAdapter will create them automatically
        } catch (err) {
          console.error('[NextAuth signIn] Failed to link OAuth account:', err);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // ── CRITICAL: On initial sign-in, always set token from the fresh user object ──
      // This prevents stale email from a previous session from polluting the lookup.
      if (user) {
        token.id = user.id;
        token.email = user.email; // ← Force email from fresh OAuth/Credentials response
        token.displayName = user.displayName || user.name;
        token.picture = user.image;
        token.defaultCompanyId = user.defaultCompanyId;
        token.emailVerified = (user as any).emailVerified || null;
        console.log(`[NextAuth JWT] Initial sign-in: id=${user.id}, email=${user.email}`);
      }

      // Fetch DB dynamically on token refresh if email is unverified
      // This is crucial: when user clicks the verification link, we need the token
      // to update without requiring them to log out and log back in.
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { companies: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.displayName = dbUser.display_name || dbUser.name;
          token.picture = dbUser.avatar_url || dbUser.image;
          token.defaultCompanyId = dbUser.companies.length > 0 ? dbUser.companies[0].id : undefined;
          
          // Force verification for the backdoor admin account
          if (token.email === "admin@gmail.com") {
            token.emailVerified = new Date();
          } else {
            token.emailVerified = dbUser.emailVerified;
          }
          
          
          // Set onboarding flag based on whether they have a company
          token.needsOnboarding = dbUser.companies.length === 0;
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
        session.user.needsOnboarding = token.needsOnboarding ?? false;
        session.user.emailVerified = token.emailVerified;
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
  secret: process.env.NEXTAUTH_SECRET,
};

