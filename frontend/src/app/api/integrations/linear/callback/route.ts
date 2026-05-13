import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/integrations/crypto";

/**
 * GET /api/integrations/linear/callback
 *
 * Handles the OAuth callback from Linear. Exchanges the code for an access token
 * and persists the integration.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const settingsUrl = `${process.env.NEXTAUTH_URL}/settings/integrations`;

  if (errorParam) {
    return NextResponse.redirect(`${settingsUrl}?error=access_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${settingsUrl}?error=missing_params`);
  }

  // ── Decode CSRF state ────────────────────────────────────────────────────────
  let userId: string;
  let companyId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    userId = decoded.userId;
    companyId = decoded.companyId;
    if (!userId || !companyId) throw new Error();
  } catch {
    return NextResponse.redirect(`${settingsUrl}?error=invalid_state`);
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.redirect(`${settingsUrl}?error=session_mismatch`);
  }

  // ── Exchange code for access token ───────────────────────────────────────────
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://api.linear.app/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.LINEAR_CLIENT_ID!,
        client_secret: process.env.LINEAR_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/linear/callback`,
        code,
        grant_type: "authorization_code",
      }),
    });

    const data = await tokenRes.json();
    if (!data.access_token) {
      console.error("[Linear OAuth] Token exchange error:", data);
      return NextResponse.redirect(`${settingsUrl}?error=token_exchange_failed`);
    }
    accessToken = data.access_token;
  } catch (err) {
    console.error("[Linear OAuth] Token exchange exception:", err);
    return NextResponse.redirect(`${settingsUrl}?error=token_exchange_failed`);
  }

  // ── Verify company ownership ─────────────────────────────────────────────────
  const company = await prisma.company.findFirst({
    where: { id: companyId, user_id: userId },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.redirect(`${settingsUrl}?error=company_not_found`);
  }

  // ── Upsert integration ────────────────────────────────────────────────────────
  try {
    await prisma.integration.upsert({
      where: { company_id_provider: { company_id: companyId, provider: "linear" } },
      create: {
        company_id: companyId,
        provider: "linear",
        access_token: encrypt(accessToken),
        status: "active",
      },
      update: {
        access_token: encrypt(accessToken),
        status: "active",
        updated_at: new Date(),
      },
    });
  } catch (err) {
    console.error("[Linear OAuth] DB upsert error:", err);
    return NextResponse.redirect(`${settingsUrl}?error=db_error`);
  }

  return NextResponse.redirect(`${settingsUrl}?success=linear`);
}
