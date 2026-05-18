/**
 * Attio CRM client — B2B sales intelligence for GrantAI.
 *
 * When a user registers, Attio automatically enriches their profile:
 * company size, LinkedIn, revenue, tech stack — all pulled automatically.
 *
 * Requires: ATTIO_API_KEY in .env
 * Get your key: https://app.attio.com → Settings → API Keys
 *
 * Docs: https://developers.attio.com/reference
 */

const ATTIO_API_BASE = 'https://api.attio.com/v2';

async function attioRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH',
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const apiKey = process.env.ATTIO_API_KEY;

  if (!apiKey) {
    console.warn('[Attio] ATTIO_API_KEY is not set — skipping CRM sync.');
    return null;
  }

  try {
    const res = await fetch(`${ATTIO_API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Attio] ${method} ${path} failed (${res.status}): ${text}`);
      return null;
    }

    return res.json();
  } catch (err) {
    // Never throw — a CRM failure should NOT block the user flow
    console.error(`[Attio] Network error calling ${path}:`, err);
    return null;
  }
}

// ─── People ───────────────────────────────────────────────────────────────────

/**
 * Called when a new user registers.
 *
 * Creates or updates a Person record in Attio.
 * Attio will automatically enrich the record with LinkedIn profile,
 * company info, job title, and more — purely from the email address.
 *
 * In Attio: go to People → the contact will appear automatically within minutes.
 * Set up a notification rule: "Notify me when a Person from a company > 50 employees is created"
 * to get instant Slack/email alerts for high-value signups.
 */
export async function attioOnUserRegistered(params: {
  userId: string;
  email: string;
  name?: string;
}): Promise<void> {
  const [firstName, ...rest] = (params.name || '').split(' ');
  const lastName = rest.join(' ') || '';

  // Upsert person by email (Attio merges if email already exists)
  await attioRequest('PUT', '/objects/people/records', {
    data: {
      values: {
        email_addresses: [{ email_address: params.email }],
        ...(firstName && { first_name: [{ value: firstName }] }),
        ...(lastName && { last_name: [{ value: lastName }] }),
        // Custom attribute — store our internal user ID for cross-referencing
        // Create this in Attio: Settings → Objects → People → Add attribute → "grantai_user_id"
        ...(params.userId && {
          grantai_user_id: [{ value: params.userId }],
        }),
      },
    },
    matching_attribute: 'email_addresses',
  });
}

/**
 * Called when a user activates a paid subscription.
 *
 * Updates the Person record with their plan tier so sales team
 * can see at a glance who is on which plan in Attio.
 */
export async function attioOnSubscriptionActivated(params: {
  email: string;
  plan: 'PRO' | 'ENTERPRISE';
}): Promise<void> {
  await attioRequest('PUT', '/objects/people/records', {
    data: {
      values: {
        email_addresses: [{ email_address: params.email }],
        // Custom attribute — create in Attio: Settings → Objects → People → Add attribute → "grantai_plan"
        grantai_plan: [{ value: params.plan }],
        grantai_is_paying: [{ value: true }],
      },
    },
    matching_attribute: 'email_addresses',
  });
}

/**
 * Called when a subscription is cancelled.
 * Marks the contact as churned in Attio for win-back tracking.
 */
export async function attioOnSubscriptionCancelled(email: string): Promise<void> {
  await attioRequest('PUT', '/objects/people/records', {
    data: {
      values: {
        email_addresses: [{ email_address: email }],
        grantai_plan: [{ value: 'FREE' }],
        grantai_is_paying: [{ value: false }],
        grantai_churned: [{ value: true }],
      },
    },
    matching_attribute: 'email_addresses',
  });
}
