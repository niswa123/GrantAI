/**
 * Loops.so client — marketing email automation for GrantAI.
 *
 * Loops handles drip campaigns, onboarding sequences, and lifecycle emails.
 * Unlike Resend (transactional), Loops is built for SaaS marketing flows.
 *
 * Requires: LOOPS_API_KEY in .env
 * Get your key: https://app.loops.so → Settings → API Keys
 *
 * Docs: https://loops.so/docs/api-reference
 */

const LOOPS_API_BASE = 'https://app.loops.so/api/v1';

function getApiKey(): string | null {
  return process.env.LOOPS_API_KEY || null;
}

async function loopsRequest(path: string, body: Record<string, unknown>): Promise<void> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn('[Loops] LOOPS_API_KEY is not set — skipping marketing email automation.');
    return;
  }

  try {
    const res = await fetch(`${LOOPS_API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Loops] Request to ${path} failed (${res.status}): ${text}`);
    }
  } catch (err) {
    // Never throw — a marketing email failure should NOT break the main user flow
    console.error(`[Loops] Network error calling ${path}:`, err);
  }
}

// ─── Contact Management ───────────────────────────────────────────────────────

/**
 * Called when a new user registers.
 * Creates a contact in Loops and enrolls them in the onboarding drip sequence.
 *
 * In Loops dashboard, create a "Loop" with trigger: "Contact property updated"
 * where emailVerified = false AND subscribed = false.
 * Set it to wait 2 days then send the activation email.
 */
export async function loopsOnUserRegistered(params: {
  email: string;
  name?: string;
}): Promise<void> {
  await loopsRequest('/contacts/create', {
    email: params.email,
    firstName: params.name?.split(' ')[0] || '',
    lastName: params.name?.split(' ').slice(1).join(' ') || '',
    // Custom properties used to trigger drip campaigns in Loops
    userGroup: 'free',
    emailVerified: false,
    githubConnected: false,
    hasPaidSubscription: false,
    source: 'registration',
  });
}

/**
 * Called when a user verifies their email.
 * Updates their Loops contact so the "verify your email" nudge stops,
 * and the "connect GitHub" drip sequence begins.
 */
export async function loopsOnEmailVerified(email: string): Promise<void> {
  await loopsRequest('/contacts/update', {
    email,
    emailVerified: true,
  });

  // Fire a specific event to trigger the "Connect GitHub" sequence in Loops
  await loopsRequest('/events/send', {
    email,
    eventName: 'email_verified',
  });
}

/**
 * Called when a user connects their GitHub integration.
 * Stops the "connect GitHub" drip. Starts the "upgrade to paid" nudge.
 */
export async function loopsOnGitHubConnected(email: string): Promise<void> {
  await loopsRequest('/contacts/update', {
    email,
    githubConnected: true,
  });

  await loopsRequest('/events/send', {
    email,
    eventName: 'github_connected',
  });
}

/**
 * Called when a user successfully subscribes (Stripe or NOWPayments).
 * Stops all "upgrade" drip sequences. Starts the "power user" tips sequence.
 */
export async function loopsOnSubscriptionActivated(params: {
  email: string;
  plan: 'PRO' | 'ENTERPRISE';
}): Promise<void> {
  await loopsRequest('/contacts/update', {
    email: params.email,
    hasPaidSubscription: true,
    userGroup: params.plan.toLowerCase(),
  });

  await loopsRequest('/events/send', {
    email: params.email,
    eventName: 'subscription_activated',
    eventProperties: {
      plan: params.plan,
    },
  });
}

/**
 * Called when a subscription is cancelled.
 * Starts the "win-back" drip sequence.
 */
export async function loopsOnSubscriptionCancelled(email: string): Promise<void> {
  await loopsRequest('/contacts/update', {
    email,
    hasPaidSubscription: false,
    userGroup: 'churned',
  });

  await loopsRequest('/events/send', {
    email,
    eventName: 'subscription_cancelled',
  });
}
