import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const { pathname } = req.nextUrl;

    // STRICT EMAIL VERIFICATION GATE
    // If the user has not verified their email, block access to all app routes
    if (!token?.emailVerified && pathname !== "/check-email" && !pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/check-email", req.url));
    }

    // If they ARE verified, but try to access the "check-email" holding page, send them away
    if (token?.emailVerified && pathname === "/check-email") {
      // If they still need onboarding, send them there, otherwise dashboard
      const dest = token.needsOnboarding ? "/onboarding" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // ONBOARDING GATE
    // If user needs onboarding (OAuth user with no workspace),
    // redirect them to /onboarding when they try to access the app.
    if (
      token?.emailVerified &&
      token?.needsOnboarding === true &&
      pathname !== "/onboarding" &&
      !pathname.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // If user is done with onboarding but tries to visit /onboarding, redirect to dashboard
    if (token?.needsOnboarding === false && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
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
    "/input/:path*",
    "/company/:path*",
  ],
};
