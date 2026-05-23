/**
 * PostHog server-side analytics client.
 * Used for backend event tracking (registration, payments, etc.)
 * where we need 100% accuracy regardless of browser state.
 */
import { PostHog } from 'posthog-node';

// Singleton pattern — reuse the same client across requests
let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
      // Flush immediately in serverless environments (no persistent process)
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

/** Capture a server-side event and flush it immediately. */
export async function captureServerEvent({
  distinctId,
  event,
  properties,
}: {
  distinctId: string;
  event: string;
  properties?: Record<string, any>;
}) {
  const client = getPostHogClient();
  if (!client) return;

  client.capture({ distinctId, event, properties });
  await client.flush();
}
