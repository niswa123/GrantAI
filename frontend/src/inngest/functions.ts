import { inngest } from "./client";
import prisma from "@/lib/prisma";

export const analyzeEngineeringEvent = inngest.createFunction(
  { id: "analyze-engineering-event" },
  { event: "engineering/event.received" },
  async ({ event, step }) => {
    // This is a placeholder for the actual AI pipeline
    // It receives an EngineeringEvent and evaluates it
    
    const { eventId, companyId } = event.data;

    // Fetch the event from DB
    const engineeringEvent = await step.run("fetch-event", async () => {
      return prisma.engineeringEvent.findUnique({
        where: { id: eventId },
      });
    });

    if (!engineeringEvent) {
      return { success: false, reason: "Event not found" };
    }

    // Call LLM Pipeline (mocked for now)
    const analysisResult = await step.run("analyze-with-llm", async () => {
      // TODO: Call OpenAI / Anthropic here to score the description
      return {
        is_rd: true,
        confidence_score: 0.85,
        complexity_weight: 1.2,
        justification: "This commit involves solving technical uncertainty related to distributed caching.",
      };
    });

    // Save the AnalyzedLog to the DB
    const log = await step.run("save-analysis", async () => {
      return prisma.analyzedLog.create({
        data: {
          event_id: engineeringEvent.id,
          company_id: companyId,
          is_rd: analysisResult.is_rd,
          confidence_score: analysisResult.confidence_score,
          complexity_weight: analysisResult.complexity_weight,
          justification: analysisResult.justification,
          calculated_value: 0, // This will be calculated by the financial engine
        },
      });
    });

    // Update the event status
    await step.run("update-event-status", async () => {
      return prisma.engineeringEvent.update({
        where: { id: engineeringEvent.id },
        data: { status: "analyzed" },
      });
    });

    // Run Financial Engine
    await step.run("run-financial-engine", async () => {
      const { FinancialEngine } = await import("@/lib/financial-engine");
      await FinancialEngine.processLogValue(log.id);
    });

    return { success: true, eventId };
  }
);
