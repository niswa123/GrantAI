"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function addClaimLog(claimId: string, action: string, details?: string) {
  const session = await getServerSession(authOptions);
  
  const userId = (session?.user as any)?.id || null;

  try {
    const log = await prisma.auditLog.create({
      data: {
        claim_id: claimId,
        user_id: userId,
        action,
        details,
      },
      include: {
        user: {
          select: {
            display_name: true,
            email: true,
          }
        }
      }
    });
    return { success: true, log };
  } catch (error: any) {
    console.error("Failed to add claim log:", error);
    return { success: false, error: error.message };
  }
}

export async function getClaimLogs(claimId: string) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { claim_id: claimId },
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            display_name: true,
            email: true,
          }
        }
      }
    });
    return { success: true, logs };
  } catch (error: any) {
    console.error("Failed to get claim logs:", error);
    return { success: false, error: error.message };
  }
}
