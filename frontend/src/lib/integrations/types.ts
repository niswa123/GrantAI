// ─── Normalized Output ────────────────────────────────────────────────────────

export type IntegrationProvider = "github" | "jira" | "linear";

export type EventType =
  | "commit"
  | "pr_merged"
  | "ticket_closed";

/** The canonical event format written to the EngineeringEvent table. */
export interface NormalizedEvent {
  event_type: EventType;
  /** Original ID from the source system (commit SHA, PR number, ticket key, etc.) */
  source_id: string;
  title: string;
  description: string | null;
  author_email: string | null;
  event_timestamp: Date;
  raw_payload: unknown;
}

// ─── GitHub Raw Payloads ──────────────────────────────────────────────────────

export interface GitHubCommit {
  id: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  timestamp: string;
  added: string[];
  modified: string[];
  removed: string[];
}

export interface GitHubPushPayload {
  ref: string;
  repository: { full_name: string };
  commits: GitHubCommit[];
  head_commit: GitHubCommit | null;
  pusher: { email: string };
}

export interface GitHubPullRequestPayload {
  action: string; // "closed", "opened", "merged", etc.
  pull_request: {
    number: number;
    title: string;
    body: string | null;
    merged: boolean;
    merged_at: string | null;
    user: { login: string; email?: string };
    head: { sha: string };
  };
  repository: { full_name: string };
}

// ─── Jira Raw Payloads ────────────────────────────────────────────────────────

export interface JiraWebhookPayload {
  webhookEvent: string; // "jira:issue_updated", "jira:issue_created", etc.
  issue: {
    key: string;
    fields: {
      summary: string;
      description?: string | null;
      resolutiondate?: string | null;
      reporter?: { emailAddress: string } | null;
      assignee?: { emailAddress: string } | null;
      status: { name: string };
      updated: string;
    };
  };
}

// ─── Linear Raw Payloads ──────────────────────────────────────────────────────

export interface LinearWebhookPayload {
  action: string; // "update", "create", "remove"
  type: string;   // "Issue", "Comment", etc.
  data: {
    id: string;
    title: string;
    description?: string | null;
    completedAt?: string | null;
    updatedAt: string;
    state?: {
      name: string;
      type: string; // "completed", "started", "backlog", etc.
    } | null;
    assignee?: {
      email: string;
    } | null;
  };
}
