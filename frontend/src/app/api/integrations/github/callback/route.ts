import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/integrations/crypto";

/**
 * GET /api/integrations/github/callback
 *
 * GitHub redirects here after the user authorises (or denies) the OAuth app.
 * Exchanges the one-time `code` for an access token, then upserts the
 * Integration record for this company.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const settingsUrl = `${process.env.NEXTAUTH_URL}/settings/integrations`;

  // ── User denied access ──────────────────────────────────────────────────────
  if (errorParam === "access_denied") {
    return NextResponse.redirect(`${settingsUrl}?error=access_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${settingsUrl}?error=missing_params`);
  }

  // ── Decode & verify CSRF state ──────────────────────────────────────────────
  let userId: string;
  let companyId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    userId = decoded.userId;
    companyId = decoded.companyId;
    if (!userId || !companyId) throw new Error("Missing fields in state");
    // Ensure the companyId is a valid UUID to prevent DB format errors
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(companyId)) throw new Error("Invalid companyId format");
  } catch {
    return NextResponse.redirect(`${settingsUrl}?error=invalid_state`);
  }

  // ── Verify the session matches the state ────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.redirect(`${settingsUrl}?error=session_mismatch`);
  }

  // ── Exchange code for access token ──────────────────────────────────────────
  const clientId = process.env.GITHUB_INTEGRATION_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_INTEGRATION_CLIENT_SECRET!;

  let accessToken: string;
  let refreshToken: string | undefined;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/github/callback`,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("[GitHub OAuth] Token exchange error:", tokenData);
      return NextResponse.redirect(`${settingsUrl}?error=token_exchange_failed`);
    }

    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token ?? undefined;
  } catch (err) {
    console.error("[GitHub OAuth] Token exchange exception:", err);
    return NextResponse.redirect(`${settingsUrl}?error=token_exchange_failed`);
  }

  // ── Verify company ownership ────────────────────────────────────────────────
  const company = await prisma.company.findFirst({
    where: { id: companyId, user_id: userId },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.redirect(`${settingsUrl}?error=company_not_found`);
  }

  // ── Persist integration (upsert) ────────────────────────────────────────────
  try {
    await prisma.integration.upsert({
      where: { company_id_provider: { company_id: companyId, provider: "github" } },
      create: {
        company_id: companyId,
        provider: "github",
        access_token: encrypt(accessToken),
        refresh_token: refreshToken ? encrypt(refreshToken) : null,
        status: "active",
      },
      update: {
        access_token: encrypt(accessToken),
        refresh_token: refreshToken ? encrypt(refreshToken) : null,
        status: "active",
        updated_at: new Date(),
      },
    });
  } catch (err) {
    console.error("[GitHub OAuth] DB upsert error:", err);
    return NextResponse.redirect(`${settingsUrl}?error=db_error`);
  }

  return NextResponse.redirect(`${settingsUrl}?success=github`);
}
