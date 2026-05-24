import { notFound } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ResultClient from "./result-client";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

async function getClaimById(id: string) {
  try {
    const claim = await prisma.claim.findUnique({ where: { id } });
    return claim;
  } catch {
    return null;
  }
}

export default async function ResultPage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  if (!id) notFound();

  // UUID guard — Prisma will crash on non-UUID strings
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) notFound();

  const claim = await getClaimById(id);
  if (!claim) notFound();

  let parsedMetadata: any = {};
  const claimText = claim.claim_text ?? "";
  const match = claimText.match(/<!-- GRANT_AI_METADATA: ([\s\S]*?) -->/);
  if (match) {
    try {
      parsedMetadata = JSON.parse(match[1].trim());
    } catch (e) {
      console.error("[ResultPage] Failed to parse metadata comment:", e);
    }
  }

  // Map DB fields → base shape expected by ResultClient.
  // Rich fields (draftClaim, criteriaScores, chainOfThought etc.) may be
  // hydrated client-side from sessionStorage when a fresh calculation redirects here.
  const result = {
    id: claim.id,
    date: claim.created_at.toISOString(),
    description: claim.description,
    salaryCosts: Number(claim.total_salary_cost),
    devCosts: Number(claim.total_dev_cost),
    totalCosts: Number(claim.total_salary_cost) + Number(claim.total_dev_cost),
    classification: ((claim.rd_score ?? 0) >= 0.5 ? "R&D" : "Not R&D") as "R&D" | "Not R&D",
    confidenceScore: claim.rd_score ?? 0,
    explanation:
      (claim.rd_score ?? 0) >= 0.5
        ? "The project demonstrates significant technical uncertainty and qualifies for R&D tax credits based on the provided description."
        : "The project appears to be routine development with insufficient technical uncertainty for R&D classification.",
    estimatedRefund: Number(claim.estimated_rd_amount ?? 0),
    creditRate: 0.2,
    draftClaim: claimText,
    model: "KIE.AI Gemini Flash",
    status: claim.status,
    companyId: claim.company_id ?? undefined,
    // Hydrated from metadata if available on reload
    chainOfThought: parsedMetadata.chainOfThought,
    criteriaScores: parsedMetadata.criteriaScores,
    keyInnovations: parsedMetadata.keyInnovations,
    disqualifyingFactors: parsedMetadata.disqualifyingFactors,
    riskFlags: parsedMetadata.riskFlags,
    recommendedEvidence: parsedMetadata.recommendedEvidence,
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultClient result={result} />
    </Suspense>
  );
}
