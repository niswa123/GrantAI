/**
 * TEST SUITE 2 — Jira / Linear Webhook Integration
 * ─────────────────────────────────────────────────
 * Tests the Jira and Linear webhook normalisation logic isolated from HTTP/DB:
 *   • Event filtering (only "Done" / "closed" transitions matter)
 *   • Title/description extraction from both payload shapes
 *   • source_id uniqueness and determinism
 *   • Edge cases: null descriptions, missing fields, unknown statuses
 *
 * All tests are pure unit tests — no network, no DB.
 */
'use strict';

const assert = require('assert');

// ─── Extracted normalisation logic (mirrors actual normalizer) ──────────────

/**
 * Normalize a Jira "issue_updated" webhook payload into an EngineeringEvent.
 * Jira webhooks fire on any status change; we only care about "Done".
 * Returns [] if the issue didn't transition to a terminal state.
 */
function normalizeJiraWebhook(eventType, payload) {
  if (eventType !== 'issue_updated' && eventType !== 'jira:issue_updated') return [];

  const issue = payload.issue || {};
  const fields = issue.fields || {};
  const statusCategory = fields.status?.statusCategory?.name || '';

  // Only process issues that moved into "Done" category
  const isDone =
    statusCategory === 'Done' ||
    fields.status?.name?.toLowerCase() === 'done' ||
    fields.status?.name?.toLowerCase() === 'closed';

  if (!isDone) return [];

  const issueKey = issue.key || `jira-${issue.id}`;
  const summary = fields.summary || '(no summary)';
  const description = fields.description?.content
    ? extractJiraDocText(fields.description)
    : typeof fields.description === 'string'
    ? fields.description
    : null;

  return [
    {
      event_type: 'ticket_closed',
      source_id: `jira-${issueKey}`,
      title: summary.slice(0, 255),
      description,
      author_email: payload.user?.emailAddress || null,
      event_timestamp: new Date(fields.updated || Date.now()),
    },
  ];
}

/**
 * Extract plain text from Jira's Atlassian Document Format (ADF).
 * Recursively walks the document tree extracting text nodes.
 */
function extractJiraDocText(doc) {
  if (!doc || typeof doc !== 'object') return '';
  if (doc.type === 'text') return doc.text || '';
  const children = doc.content || [];
  return children.map(extractJiraDocText).filter(Boolean).join(' ');
}

/**
 * Normalize a Linear webhook payload into an EngineeringEvent.
 * Linear fires webhooks on any issue action; we only care about "completed".
 */
function normalizeLinearWebhook(action, payload) {
  const data = payload.data || {};
  const state = data.state || {};

  // Only process issues moved to a completed/done state
  const isCompleted =
    action === 'update' &&
    (state.type === 'completed' ||
      state.name?.toLowerCase() === 'done' ||
      state.name?.toLowerCase() === 'completed');

  if (!isCompleted) return [];

  const issueId = data.id || 'unknown';
  const title = (data.title || '(no title)').slice(0, 255);

  return [
    {
      event_type: 'ticket_closed',
      source_id: `linear-${issueId}`,
      title,
      description: data.description || null,
      author_email: data.assignee?.email || null,
      event_timestamp: new Date(data.updatedAt || Date.now()),
    },
  ];
}

// ─── Tests ─────────────────────────────────────────────────────────────────

module.exports = async function runSuite() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  SUITE 2 — Jira / Linear Webhook Integration');
  console.log('════════════════════════════════════════════════════════════');

  const tests = [];
  function it(name, fn) {
    tests.push({ name, fn });
  }

  // ── Jira Tests ─────────────────────────────────────────────────────────────

  it('Jira: normalizes issue_updated with Done status into ticket_closed event', () => {
    const payload = {
      webhookEvent: 'jira:issue_updated',
      user: { emailAddress: 'eng@acme.com' },
      issue: {
        key: 'ENG-101',
        fields: {
          summary: 'Implement novel compression algorithm for log streams',
          description: 'Researched LZ78 variants and developed custom solution.',
          status: { name: 'Done', statusCategory: { name: 'Done' } },
          updated: '2026-05-15T14:00:00.000Z',
        },
      },
    };
    const events = normalizeJiraWebhook('jira:issue_updated', payload);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].event_type, 'ticket_closed');
    assert.strictEqual(events[0].source_id, 'jira-ENG-101');
    assert.strictEqual(events[0].title, 'Implement novel compression algorithm for log streams');
    assert.strictEqual(events[0].author_email, 'eng@acme.com');
    assert.ok(events[0].event_timestamp instanceof Date);
  });

  it('Jira: returns empty array for issue_updated with In Progress status', () => {
    const payload = {
      webhookEvent: 'jira:issue_updated',
      issue: {
        key: 'ENG-102',
        fields: {
          summary: 'Work in progress',
          status: { name: 'In Progress', statusCategory: { name: 'In Progress' } },
          updated: '2026-05-15T14:00:00.000Z',
        },
      },
    };
    assert.strictEqual(normalizeJiraWebhook('jira:issue_updated', payload).length, 0);
  });

  it('Jira: returns empty array for non-update event types', () => {
    const payload = {
      issue: {
        key: 'ENG-103',
        fields: { summary: 'Test', status: { name: 'Done', statusCategory: { name: 'Done' } } },
      },
    };
    assert.strictEqual(normalizeJiraWebhook('issue_created', payload).length, 0);
    assert.strictEqual(normalizeJiraWebhook('comment_created', payload).length, 0);
  });

  it('Jira: handles null description gracefully', () => {
    const payload = {
      issue: {
        key: 'ENG-104',
        fields: {
          summary: 'ML experiment: adaptive sampling',
          description: null,
          status: { name: 'Done', statusCategory: { name: 'Done' } },
          updated: '2026-05-15T14:00:00.000Z',
        },
      },
    };
    const events = normalizeJiraWebhook('jira:issue_updated', payload);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].description, null);
  });

  it('Jira: extracts text from Atlassian Document Format (ADF)', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Novel approach' },
            { type: 'text', text: ' using neural architecture search.' },
          ],
        },
      ],
    };
    const result = extractJiraDocText(doc);
    assert.ok(result.includes('Novel approach'), 'Should extract plain text from ADF');
    assert.ok(result.includes('neural architecture search'), 'Should extract nested text');
  });

  it('Jira: source_id uses issue key for deterministic deduplication', () => {
    const mkPayload = (key) => ({
      issue: {
        key,
        fields: {
          summary: 'Test',
          status: { name: 'Done', statusCategory: { name: 'Done' } },
          updated: '2026-05-15T00:00:00.000Z',
        },
      },
    });
    const e1 = normalizeJiraWebhook('jira:issue_updated', mkPayload('ENG-200'));
    const e2 = normalizeJiraWebhook('jira:issue_updated', mkPayload('ENG-200'));
    assert.strictEqual(e1[0].source_id, e2[0].source_id, 'source_id must be deterministic');
  });

  it('Jira: title is truncated to 255 characters', () => {
    const longTitle = 'A'.repeat(300);
    const payload = {
      issue: {
        key: 'ENG-999',
        fields: {
          summary: longTitle,
          status: { name: 'Done', statusCategory: { name: 'Done' } },
          updated: '2026-05-15T00:00:00.000Z',
        },
      },
    };
    const events = normalizeJiraWebhook('jira:issue_updated', payload);
    assert.strictEqual(events[0].title.length, 255, 'Title must be capped at 255 chars');
  });

  // ── Linear Tests ───────────────────────────────────────────────────────────

  it('Linear: normalizes update+completed into ticket_closed event', () => {
    const payload = {
      data: {
        id: 'lin-issue-abc123',
        title: 'Developed custom real-time inference engine',
        description: 'Built from scratch using novel SIMD vectorization techniques.',
        state: { name: 'Done', type: 'completed' },
        assignee: { email: 'researcher@corp.com' },
        updatedAt: '2026-05-15T13:00:00.000Z',
      },
    };
    const events = normalizeLinearWebhook('update', payload);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].event_type, 'ticket_closed');
    assert.strictEqual(events[0].source_id, 'linear-lin-issue-abc123');
    assert.strictEqual(events[0].title, 'Developed custom real-time inference engine');
    assert.strictEqual(events[0].author_email, 'researcher@corp.com');
  });

  it('Linear: returns empty array for update with non-completed state', () => {
    const payload = {
      data: {
        id: 'lin-issue-xyz',
        title: 'In progress work',
        state: { name: 'In Progress', type: 'started' },
        updatedAt: '2026-05-15T13:00:00.000Z',
      },
    };
    assert.strictEqual(normalizeLinearWebhook('update', payload).length, 0);
  });

  it('Linear: returns empty array for "create" action even with completed state', () => {
    const payload = {
      data: {
        id: 'lin-xyz',
        title: 'New issue',
        state: { name: 'Done', type: 'completed' },
        updatedAt: '2026-05-15T13:00:00.000Z',
      },
    };
    assert.strictEqual(normalizeLinearWebhook('create', payload).length, 0);
  });

  it('Linear: handles missing assignee gracefully (author_email = null)', () => {
    const payload = {
      data: {
        id: 'lin-no-assignee',
        title: 'Unassigned R&D task',
        description: null,
        state: { type: 'completed', name: 'Done' },
        updatedAt: '2026-05-15T13:00:00.000Z',
      },
    };
    const events = normalizeLinearWebhook('update', payload);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].author_email, null);
  });

  // Run
  let p = 0, f = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`  ✅  ${name}`);
      p++;
    } catch (err) {
      console.log(`  ❌  ${name}`);
      console.log(`       ${err.message}`);
      f++;
    }
  }
  console.log(`\n  → ${p} passed, ${f} failed`);
  return { passed: p, failed: f };
};
