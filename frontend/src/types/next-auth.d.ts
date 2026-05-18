import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      displayName?: string;
      defaultCompanyId?: string;
      needsOnboarding?: boolean;
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    displayName?: string;
    picture?: string | null;
    defaultCompanyId?: string;
    needsOnboarding?: boolean;
    emailVerified?: Date | null;
  }
}
