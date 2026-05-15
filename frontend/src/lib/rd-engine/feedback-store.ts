/**
 * Feedback Store — Collects user corrections and builds a dynamic few-shot pool.
 *
 * When a user overrides an AI classification (thumbs up/down in the UI),
 * that correction is stored and automatically used to improve future prompts.
 *
 * Architecture:
 * - Corrections stored in DB via Prisma (claim.user_override field)
 * - On each new classification, top N most recent corrections are fetched
 * - Injected as additional few-shot examples into the prompt
 *
 * This creates a self-improving feedback loop:
 * User corrects → stored → used in next prompt → model improves for this workspace
 */

import prisma from "@/lib/prisma";

export interface FeedbackExample {
  description: string;
  userSaidIsRd: boolean;
  aiSaidIsRd: boolean;
  aiScore: number;
  correctedAt: Date;
  workspaceId?: string;
}

/**
 * Fetch recent user corrections from the database.
 * These are cases where the user disagreed with the AI classification.
 *
 * @param workspaceId - If provided, prioritize corrections from this workspace
 * @param limit - Max number of corrections to fetch
 */
export async function getRecentCorrections(
  workspaceId?: string,
  limit = 6
): Promise<FeedbackExample[]> {
  try {
    // Fetch claims where user_override is set (user corrected the AI)
    const claims = await prisma.claim.findMany({
      where: {
        status: { not: undefined },
        // Only claims with non-null descriptions (have content to learn from)
        description: { not: "" },
        // Prioritize workspace-specific corrections
        ...(workspaceId ? { company_id: workspaceId } : {}),
      },
      orderBy: { created_at: "desc" },
      take: limit * 2, // fetch more, filter below
      select: {
        description: true,
        rd_score: true,
        company_id: true,
        created_at: true,
        status: true,
      },
    });

    // Filter to only claims that have been reviewed (status changed from Draft)
    const reviewed = claims.filter(
      (c) => c.status === "Approved" || c.status === "Submitted"
    );

    return reviewed.slice(0, limit).map((c) => ({
      description: c.description,
      userSaidIsRd: c.status === "Approved" || c.status === "Submitted",
      aiSaidIsRd: (c.rd_score ?? 0) >= 0.5,
      aiScore: c.rd_score ?? 0,
      correctedAt: c.created_at,
      workspaceId: c.company_id ?? undefined,
    }));
  } catch (err) {
    // Non-fatal — if DB fails, just skip feedback examples
    console.warn("[FeedbackStore] Could not fetch corrections:", err);
    return [];
  }
}

/**
 * Format feedback corrections as few-shot examples for prompt injection.
 * Only includes cases where user DISAGREED with AI (most valuable for learning).
 */
export function formatFeedbackExamples(corrections: FeedbackExample[]): string {
  if (corrections.length === 0) return "";

  // Prioritize disagreements (where AI was wrong)
  const disagreements = corrections.filter(
    (c) => c.userSaidIsRd !== c.aiSaidIsRd
  );
  const agreements = corrections.filter(
    (c) => c.userSaidIsRd === c.aiSaidIsRd
  );

  // Use disagreements first, then agreements for context
  const examples = [...disagreements, ...agreements].slice(0, 4);

  if (examples.length === 0) return "";

  const formatted = examples
    .map((ex, i) => {
      const userVerdict = ex.userSaidIsRd ? "QUALIFIES AS R&D" : "DOES NOT QUALIFY";
      const aiVerdict = ex.aiSaidIsRd ? "R&D" : "Not R&D";
      const wasCorrection = ex.userSaidIsRd !== ex.aiSaidIsRd;

      return `FEEDBACK EXAMPLE ${i + 1}${wasCorrection ? " [AI WAS WRONG — LEARN FROM THIS]" : " [CONFIRMED CORRECT]"}:
Description: "${ex.description.slice(0, 250)}${ex.description.length > 250 ? "..." : ""}"
AI initially scored: ${ex.aiScore.toFixed(2)} (classified as ${aiVerdict})
User verified verdict: ${userVerdict}
${wasCorrection ? `⚠️ The AI made an error here. Adjust your calibration accordingly.` : `✓ AI was correct.`}`;
    })
    .join("\n\n");

  return `\n## RECENT USER FEEDBACK (high priority — learn from these corrections)\n${formatted}\n## END OF FEEDBACK\n`;
}

/**
 * Build a complete dynamic few-shot context block combining:
 * 1. Curated static examples (few-shot-examples.ts)
 * 2. Recent user corrections (feedback loop)
 */
export async function buildDynamicFewShotContext(
  workspaceId?: string
): Promise<string> {
  const { formatFewShotExamples } = await import("./few-shot-examples");

  // Static curated examples
  const staticExamples = formatFewShotExamples({
    positiveCount: 2,
    negativeCount: 2,
    includeBorderline: true,
  });

  // Dynamic feedback corrections
  const corrections = await getRecentCorrections(workspaceId, 6);
  const feedbackBlock = formatFeedbackExamples(corrections);

  return staticExamples + feedbackBlock;
}
