import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/integrations
 *
 * Returns the list of integrations for the authenticated user's company.
 * Tokens are never returned — only metadata (provider, status, updated_at).
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

  // Reject non-UUID IDs before hitting Prisma
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(companyId)) {
    return NextResponse.json({ error: "Invalid companyId format" }, { status: 400 });
  }

  // Verify company belongs to the requesting user
  const company = await prisma.company.findFirst({
    where: { id: companyId, user_id: session.user.id },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const integrations = await prisma.integration.findMany({
    where: { company_id: companyId },
    select: {
      id: true,
      provider: true,
      status: true,
      config: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { updated_at: "desc" },
  });

  return NextResponse.json({ integrations });
}
