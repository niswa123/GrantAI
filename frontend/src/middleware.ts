import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const { pathname } = req.nextUrl;

    // If user needs onboarding (OAuth user with no workspace),
    // redirect them to /onboarding when they try to access the app.
    if (
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
    "/input/:path*",
    "/company/:path*",
  ],
};
