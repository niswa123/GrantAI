import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/integrations/jira/connect?companyId=<uuid>
 *
 * Initiates the Jira Cloud OAuth 2.0 (3LO) flow.
 * Requires a registered Atlassian OAuth 2.0 app:
 *   https://developer.atlassian.com/console/myapps/
 *
 * Scopes requested: read:jira-work read:jira-user
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

  const clientId = process.env.JIRA_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Jira integration is not configured on this server." },
      { status: 503 }
    );
  }

  const state = Buffer.from(
    JSON.stringify({ userId: session.user.id, companyId })
  ).toString("base64url");

  const params = new URLSearchParams({
    audience: "api.atlassian.com",
    client_id: clientId,
    scope: "read:issue:jira read:project:jira read:user:jira offline_access",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/jira/callback`,
    state,
    response_type: "code",
    prompt: "consent",
  });

  return NextResponse.redirect(
    `https://auth.atlassian.com/authorize?${params}`
  );
}
