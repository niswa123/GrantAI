import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/integrations/github/connect
 *
 * Initiates the GitHub OAuth flow. Redirects the authenticated user to
 * GitHub's authorization page.
 *
 * Query params:
 *   - companyId: required — which company this integration belongs to.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId query parameter is required" },
      { status: 400 }
    );
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(companyId)) {
    return NextResponse.json(
      { error: "Invalid companyId. Please reload the page." },
      { status: 400 }
    );
  }

  const clientId = process.env.GITHUB_INTEGRATION_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub integration is not configured on this server." },
      { status: 503 }
    );
  }

  // CSRF state: encode userId + companyId so callback can verify both
  const state = Buffer.from(
    JSON.stringify({ userId: session.user.id, companyId })
  ).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/github/callback`,
    scope: "repo read:user user:email",
    state,
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params}`;
  return NextResponse.redirect(githubAuthUrl);
}
