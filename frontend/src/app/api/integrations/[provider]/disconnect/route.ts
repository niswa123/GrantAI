import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * DELETE /api/integrations/[provider]/disconnect
 *
 * Removes the integration for the given provider. The access token is
 * permanently deleted from the database.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider } = await params;
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId query parameter is required" },
      { status: 400 }
    );
  }

  // Verify company ownership
  const company = await prisma.company.findFirst({
    where: { id: companyId, user_id: session.user.id },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const deleted = await prisma.integration.deleteMany({
    where: { company_id: companyId, provider },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: "Integration not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
