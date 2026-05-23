import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const { pathname } = req.nextUrl;

    // Helper: create a redirect response without caching
    const noStoreRedirect = (url: string) => {
      const res = NextResponse.redirect(new URL(url, req.url));
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.headers.set("Pragma", "no-cache");
      return res;
    };

    // STRICT EMAIL VERIFICATION GATE
    if (
      !token?.emailVerified &&
      pathname !== "/check-email" &&
      pathname !== "/verify-email" &&
      !pathname.startsWith("/api")
    ) {
      return noStoreRedirect("/check-email");
    }

    // If they ARE verified, but try to access the "check-email" holding page, send them away
    if (token?.emailVerified && pathname === "/check-email") {
      const dest = token.needsOnboarding ? "/onboarding" : "/dashboard";
      return noStoreRedirect(dest);
    }

    // ONBOARDING GATE
    if (
      token?.emailVerified &&
      token?.needsOnboarding === true &&
      pathname !== "/onboarding" &&
      !pathname.startsWith("/api")
    ) {
      return noStoreRedirect("/onboarding");
    }

    // If user is done with onboarding but tries to visit /onboarding, redirect to dashboard
    if (token?.needsOnboarding === false && pathname === "/onboarding") {
      return noStoreRedirect("/dashboard");
    }

    // For all other protected routes: add no-store headers to prevent bfcache
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
    return res;
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/onboarding",
    "/check-email",
    "/verify-email",
    "/input/:path*",
    "/company/:path*",
  ],
};
