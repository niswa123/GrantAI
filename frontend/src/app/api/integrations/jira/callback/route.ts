import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/integrations/crypto";

/**
 * GET /api/integrations/jira/callback
 *
 * Handles the OAuth callback from Atlassian. Exchanges the code for tokens,
 * fetches the accessible Jira Cloud sites, and persists the integration.
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
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(companyId)) throw new Error("Invalid companyId format");
  } catch {
    return NextResponse.redirect(`${settingsUrl}?error=invalid_state`);
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.redirect(`${settingsUrl}?error=session_mismatch`);
  }

  // ── Exchange code for tokens ─────────────────────────────────────────────────
  let accessToken: string;
  let refreshToken: string;

  try {
    const tokenRes = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/jira/callback`,
      }),
    });

    const data = await tokenRes.json();
    if (!data.access_token) {
      console.error("[Jira OAuth] Token exchange error:", data);
      return NextResponse.redirect(`${settingsUrl}?error=token_exchange_failed`);
    }

    accessToken = data.access_token;
    refreshToken = data.refresh_token;
  } catch (err) {
    console.error("[Jira OAuth] Token exchange exception:", err);
    return NextResponse.redirect(`${settingsUrl}?error=token_exchange_failed`);
  }

  // ── Fetch accessible Jira Cloud sites ────────────────────────────────────────
  let cloudSites: Array<{ id: string; name: string; url: string }> = [];
  try {
    const sitesRes = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    cloudSites = await sitesRes.json();
  } catch (err) {
    console.error("[Jira OAuth] Failed to fetch cloud sites:", err);
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
      where: { company_id_provider: { company_id: companyId, provider: "jira" } },
      create: {
        company_id: companyId,
        provider: "jira",
        access_token: encrypt(accessToken),
        refresh_token: refreshToken ? encrypt(refreshToken) : null,
        config: { cloudSites },
        status: "active",
      },
      update: {
        access_token: encrypt(accessToken),
        refresh_token: refreshToken ? encrypt(refreshToken) : null,
        config: { cloudSites },
        status: "active",
        updated_at: new Date(),
      },
    });
  } catch (err) {
    console.error("[Jira OAuth] DB upsert error:", err);
    return NextResponse.redirect(`${settingsUrl}?error=db_error`);
  }

  return NextResponse.redirect(`${settingsUrl}?success=jira`);
}
