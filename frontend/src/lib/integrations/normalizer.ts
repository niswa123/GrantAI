import type {
  NormalizedEvent,
  GitHubPushPayload,
  GitHubPullRequestPayload,
  JiraWebhookPayload,
  LinearWebhookPayload,
  IntegrationProvider,
} from "./types";

// ─── GitHub ───────────────────────────────────────────────────────────────────

function normalizeGitHubPush(payload: GitHubPushPayload): NormalizedEvent[] {
  const commits = payload.commits.filter((c) => c.id && c.message);

  return commits.map((commit) => ({
    event_type: "commit",
    source_id: commit.id,
    title: commit.message.split("\n")[0].slice(0, 255),
    description:
      commit.message.includes("\n")
        ? commit.message.slice(commit.message.indexOf("\n") + 1).trim() || null
        : null,
    author_email: commit.author?.email ?? payload.pusher?.email ?? null,
    event_timestamp: new Date(commit.timestamp),
    raw_payload: commit,
  }));
}

function normalizeGitHubPullRequest(
  payload: GitHubPullRequestPayload
): NormalizedEvent | null {
  const pr = payload.pull_request;
  // Only emit an event when the PR is actually merged
  if (!pr.merged || !pr.merged_at) return null;

  return {
    event_type: "pr_merged",
    source_id: `pr-${pr.number}`,
    title: pr.title,
    description: pr.body ?? null,
    author_email: pr.user?.email ?? null,
    event_timestamp: new Date(pr.merged_at),
    raw_payload: payload,
  };
}

// ─── Jira ─────────────────────────────────────────────────────────────────────

function normalizeJiraIssue(
  payload: JiraWebhookPayload
): NormalizedEvent | null {
  const { issue } = payload;
  const fields = issue.fields;

  // Only emit when status is "Done" (case-insensitive)
  const status = fields.status?.name?.toLowerCase() ?? "";
  if (!["done", "closed", "resolved", "complete", "completed"].includes(status)) {
    return null;
  }

  const resolvedAt = fields.resolutiondate
    ? new Date(fields.resolutiondate)
    : new Date(fields.updated);

  return {
    event_type: "ticket_closed",
    source_id: issue.key,
    title: fields.summary,
    description: fields.description ?? null,
    author_email:
      fields.assignee?.emailAddress ??
      fields.reporter?.emailAddress ??
      null,
    event_timestamp: resolvedAt,
    raw_payload: payload,
  };
}

// ─── Linear ───────────────────────────────────────────────────────────────────

function normalizeLinearIssue(
  payload: LinearWebhookPayload
): NormalizedEvent | null {
  if (payload.type !== "Issue") return null;

  const { data } = payload;
  const stateType = data.state?.type?.toLowerCase() ?? "";

  // Only emit when the issue reaches a terminal completed state
  if (stateType !== "completed") return null;

  const completedAt = data.completedAt
    ? new Date(data.completedAt)
    : new Date(data.updatedAt);

  return {
    event_type: "ticket_closed",
    source_id: data.id,
    title: data.title,
    description: data.description ?? null,
    author_email: data.assignee?.email ?? null,
    event_timestamp: completedAt,
    raw_payload: payload,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type RawPayload = unknown;

/**
 * Normalizes a raw webhook payload from any supported provider into one or more
 * canonical NormalizedEvent objects, ready to be inserted into EngineeringEvent.
 *
 * Returns an empty array when the event should be silently ignored (e.g., a PR
 * that was closed without merging, or a Jira issue moved to "In Progress").
 *
 * @throws {Error} when the provider or event type is unsupported.
 */
export function normalizeToEngineeringEvents(
  provider: IntegrationProvider,
  eventType: string,
  payload: RawPayload
): NormalizedEvent[] {
  switch (provider) {
    case "github": {
      switch (eventType) {
        case "push": {
          const events = normalizeGitHubPush(payload as GitHubPushPayload);
          return events;
        }
        case "pull_request": {
          const event = normalizeGitHubPullRequest(
            payload as GitHubPullRequestPayload
          );
          return event ? [event] : [];
        }
        default:
          // Unknown GitHub events are silently ignored (we only subscribe to a subset)
          return [];
      }
    }

    case "jira": {
      switch (eventType) {
        case "jira:issue_updated":
        case "jira:issue_created": {
          const event = normalizeJiraIssue(payload as JiraWebhookPayload);
          return event ? [event] : [];
        }
        default:
          return [];
      }
    }

    case "linear": {
      switch (eventType) {
        case "Issue": {
          const event = normalizeLinearIssue(payload as LinearWebhookPayload);
          return event ? [event] : [];
        }
        default:
          return [];
      }
    }

    default: {
      throw new Error(
        `Unsupported integration provider: "${provider}". Supported providers: github, jira, linear.`
      );
    }
  }
}
