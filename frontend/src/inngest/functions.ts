import { inngest } from "./client";
import { analyzeEngineeringEvent as runEventAnalyzer } from "@/lib/rd-engine/event-analyzer";

export const analyzeEngineeringEvent = inngest.createFunction(
  { id: "analyze-engineering-event", event: "engineering/event.received" },
  async ({ event, step }: { event: any; step: any }) => {
    const { eventId } = event.data;

    // Call the real R&D Engine to classify via LLM and persist the AnalyzedLog
    const result = await step.run("analyze-and-persist", async () => {
      return runEventAnalyzer(eventId);
    });

    // Run Financial Engine
    await step.run("run-financial-engine", async () => {
      const { FinancialEngine } = await import("@/lib/financial-engine");
      await FinancialEngine.processLogValue(result.analyzedLogId);
    });

    return { success: true, eventId, analyzedLogId: result.analyzedLogId };
  }
);
