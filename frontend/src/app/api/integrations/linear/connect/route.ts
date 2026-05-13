import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/integrations/linear/connect?companyId=<uuid>
 *
 * Initiates the Linear OAuth 2.0 flow.
 * Register your app at: https://linear.app/settings/api/applications/new
 *
 * Scopes: read
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

  const clientId = process.env.LINEAR_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Linear integration is not configured on this server." },
      { status: 503 }
    );
  }

  const state = Buffer.from(
    JSON.stringify({ userId: session.user.id, companyId })
  ).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/linear/callback`,
    response_type: "code",
    scope: "read",
    state,
  });

  return NextResponse.redirect(
    `https://linear.app/oauth/authorize?${params}`
  );
}
