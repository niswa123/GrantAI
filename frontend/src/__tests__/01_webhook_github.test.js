/**
 * TEST SUITE 1 — GitHub Webhook Integration
 * ─────────────────────────────────────────
 * Tests the webhook handling logic ISOLATED from the real HTTP layer:
 *   • HMAC-SHA256 signature computation & timing-safe comparison
 *   • Payload parsing and normalisation decisions
 *   • Event routing (push → commit, pr_merged → engineering event)
 *   • Duplicate detection via source_id deduplication
 *
 * All tests use Node built-ins only — no network, no DB, no LLM.
 */
'use strict';

const assert = require('assert');
const { createHmac, timingSafeEqual } = require('crypto');

// ─── Inline extracted logic (mirrors route.ts / normalizer) ────────────────

/**
 * Compute the expected GitHub webhook HMAC-SHA256 signature.
 * (Extracted from /api/webhooks/github/route.ts)
 */
function computeExpectedSignature(secret, bodyText) {
  return 'sha256=' + createHmac('sha256', secret).update(bodyText).digest('hex');
}

/**
 * Verify a GitHub webhook signature in a timing-safe manner.
 * Returns true if the signature matches.
 */
function verifyWebhookSignature(secret, bodyText, incomingSignature) {
  if (!incomingSignature) return false;
  const expected = computeExpectedSignature(secret, bodyText);
  const sigBuffer = Buffer.from(incomingSignature);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Minimal normalizer for GitHub push events.
 * (Mirrors src/lib/integrations/normalizer.ts behaviour)
 */
function normalizeGitHubPushEvent(payload) {
  const events = [];
  const commits = payload.commits || [];
  for (const commit of commits) {
    if (!commit.id || !commit.message) continue;
    events.push({
      event_type: 'commit',
      source_id: `github-commit-${commit.id}`,
      title: commit.message.split('\n')[0].slice(0, 255),
      description: commit.message,
      author_email: commit.author?.email || null,
      event_timestamp: new Date(commit.timestamp || Date.now()),
    });
  }
  return events;
}

/**
 * Minimal normalizer for GitHub pull_request events.
 */
function normalizeGitHubPREvent(payload) {
  const pr = payload.pull_request;
  if (!pr) return [];
  // Only fire on "closed + merged"
  if (payload.action !== 'closed' || !pr.merged) return [];
  return [
    {
      event_type: 'pr_merged',
      source_id: `github-pr-${pr.number}`,
      title: pr.title || '(no title)',
      description: pr.body || null,
      author_email: pr.user?.login ? `${pr.user.login}@github` : null,
      event_timestamp: new Date(pr.merged_at || Date.now()),
    },
  ];
}

// ─── Tests ─────────────────────────────────────────────────────────────────

module.exports = async function runSuite() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  SUITE 1 — GitHub Webhook Integration');
  console.log('════════════════════════════════════════════════════════════');

  const tests = [];
  function it(name, fn) {
    tests.push({ name, fn });
  }

  // ── 1.1  HMAC signature — happy path ──────────────────────────────────────
  it('generates correct sha256= prefixed HMAC for a known payload', () => {
    const secret = 'test_secret';
    const body = JSON.stringify({ ref: 'refs/heads/main' });
    const sig = computeExpectedSignature(secret, body);
    assert.ok(sig.startsWith('sha256='), 'Signature must start with sha256=');
    assert.strictEqual(sig.length, 71, 'sha256= (7) + 64-char hex = 71 chars');
  });

  // ── 1.2  HMAC verification — valid signature accepted ─────────────────────
  it('verifyWebhookSignature returns true for a correct signature', () => {
    const secret = 'super_secret';
    const body = '{"action":"push"}';
    const validSig = computeExpectedSignature(secret, body);
    assert.strictEqual(verifyWebhookSignature(secret, body, validSig), true);
  });

  // ── 1.3  HMAC verification — tampered body rejected ───────────────────────
  it('verifyWebhookSignature returns false when body is tampered', () => {
    const secret = 'super_secret';
    const originalBody = '{"action":"push"}';
    const tamperedBody = '{"action":"push","extra":true}';
    const sig = computeExpectedSignature(secret, originalBody);
    assert.strictEqual(verifyWebhookSignature(secret, tamperedBody, sig), false);
  });

  // ── 1.4  HMAC verification — missing signature header rejected ────────────
  it('verifyWebhookSignature returns false when signature header is null', () => {
    assert.strictEqual(verifyWebhookSignature('s', 'body', null), false);
  });

  // ── 1.5  HMAC verification — wrong secret rejected ────────────────────────
  it('verifyWebhookSignature returns false when secret does not match', () => {
    const body = '{"ref":"refs/heads/main"}';
    const sig = computeExpectedSignature('correct_secret', body);
    assert.strictEqual(verifyWebhookSignature('wrong_secret', body, sig), false);
  });

  // ── 1.6  Push event normalizer — single commit ────────────────────────────
  it('normalizeGitHubPushEvent converts a single commit correctly', () => {
    const payload = {
      commits: [
        {
          id: 'abc123',
          message: 'Рефакторинг ядра\n\nDetailed description here.',
          timestamp: '2026-05-15T12:00:00Z',
          author: { email: 'dev@example.com' },
        },
      ],
    };
    const events = normalizeGitHubPushEvent(payload);
    assert.strictEqual(events.length, 1, 'Should produce exactly one event');
    assert.strictEqual(events[0].event_type, 'commit');
    assert.strictEqual(events[0].source_id, 'github-commit-abc123');
    assert.strictEqual(events[0].title, 'Рефакторинг ядра');
    assert.strictEqual(events[0].author_email, 'dev@example.com');
    assert.ok(events[0].event_timestamp instanceof Date, 'event_timestamp must be a Date');
  });

  // ── 1.7  Push event normalizer — multi-commit push ────────────────────────
  it('normalizeGitHubPushEvent handles multiple commits in one push', () => {
    const payload = {
      commits: [
        { id: 'c1', message: 'feat: add ML pipeline', timestamp: '2026-05-14T10:00:00Z', author: {} },
        { id: 'c2', message: 'fix: typo in README', timestamp: '2026-05-14T10:01:00Z', author: {} },
      ],
    };
    const events = normalizeGitHubPushEvent(payload);
    assert.strictEqual(events.length, 2);
    assert.strictEqual(events[0].source_id, 'github-commit-c1');
    assert.strictEqual(events[1].source_id, 'github-commit-c2');
  });

  // ── 1.8  Push event normalizer — empty payload produces no events ──────────
  it('normalizeGitHubPushEvent returns empty array for payload with no commits', () => {
    const events = normalizeGitHubPushEvent({ commits: [] });
    assert.strictEqual(events.length, 0);
  });

  // ── 1.9  Push event normalizer — skips commits missing required fields ─────
  it('normalizeGitHubPushEvent skips commits without id or message', () => {
    const payload = {
      commits: [
        { message: 'valid commit', id: 'x1', timestamp: '2026-05-14T10:00:00Z', author: {} },
        { id: 'x2', timestamp: '2026-05-14T10:01:00Z', author: {} }, // missing message
        { message: 'also valid', id: 'x3', timestamp: '2026-05-14T10:02:00Z', author: {} },
      ],
    };
    const events = normalizeGitHubPushEvent(payload);
    assert.strictEqual(events.length, 2, 'Should skip commit without message');
    assert.strictEqual(events[0].source_id, 'github-commit-x1');
    assert.strictEqual(events[1].source_id, 'github-commit-x3');
  });

  // ── 1.10  PR normalizer — merged PR produces event ────────────────────────
  it('normalizeGitHubPREvent returns one event for a merged PR', () => {
    const payload = {
      action: 'closed',
      pull_request: {
        number: 42,
        title: 'feat: implement custom neural indexer',
        body: 'This PR introduces a novel indexing algorithm.',
        merged: true,
        merged_at: '2026-05-15T14:00:00Z',
        user: { login: 'alice' },
      },
    };
    const events = normalizeGitHubPREvent(payload);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].event_type, 'pr_merged');
    assert.strictEqual(events[0].source_id, 'github-pr-42');
    assert.strictEqual(events[0].title, 'feat: implement custom neural indexer');
  });

  // ── 1.11  PR normalizer — closed-but-not-merged skipped ──────────────────
  it('normalizeGitHubPREvent returns empty array for closed-but-not-merged PR', () => {
    const payload = {
      action: 'closed',
      pull_request: { number: 7, title: 'wip', body: null, merged: false, user: {} },
    };
    assert.strictEqual(normalizeGitHubPREvent(payload).length, 0);
  });

  // ── 1.12  PR normalizer — non-close action skipped ──────────────────────
  it('normalizeGitHubPREvent returns empty array for "opened" action', () => {
    const payload = {
      action: 'opened',
      pull_request: { number: 8, title: 'wip', body: null, merged: false, user: {} },
    };
    assert.strictEqual(normalizeGitHubPREvent(payload).length, 0);
  });

  // ── 1.13  Deduplication — source_id is idempotent key ────────────────────
  it('source_id stays identical for the same commit across two webhook deliveries', () => {
    const commit = { id: 'sha_abc', message: 'refactor: core', timestamp: '2026-05-15T00:00:00Z', author: {} };
    const first = normalizeGitHubPushEvent({ commits: [commit] });
    const second = normalizeGitHubPushEvent({ commits: [commit] });
    assert.strictEqual(first[0].source_id, second[0].source_id, 'source_id must be deterministic for upsert');
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
