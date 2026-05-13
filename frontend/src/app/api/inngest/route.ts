import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { analyzeEngineeringEvent } from "@/inngest/functions";

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    analyzeEngineeringEvent,
  ],
});
