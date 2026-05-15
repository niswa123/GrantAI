/**
 * TEST SUITE 3 — AI Pipeline (R&D Analyzer)
 * ─────────────────────────────────────────
 * Tests the deterministic parts of the AI classification pipeline:
 *   • Score clamping and normalization
 *   • Complexity weight derivation
 *   • Event value calculation formulas
 *
 * Pure unit tests — no network, no DB.
 */
'use strict';

const assert = require('assert');

// ─── Extracted logic (mirrors actual pipeline) ──────────────

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deriveComplexityWeight(result) {
  const { novelty, technicalUncertainty, systematicApproach, creativeElement } = result.criteriaScores;
  
  const weightedAvg =
    (novelty.score * 0.35) +
    (technicalUncertainty.score * 0.35) +
    (systematicApproach.score * 0.15) +
    (creativeElement.score * 0.15);

  const weight = 1.0 + (weightedAvg * 2.0);
  return Math.round(weight * 100) / 100;
}

function calculateEventValue(isRd, confidenceScore, complexityWeight, dailyRate = 800) {
  if (!isRd) return 0;
  return Math.round(dailyRate * complexityWeight * confidenceScore * 100) / 100;
}

// ─── Tests ─────────────────────────────────────────────────────────────────

module.exports = async function runSuite() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  SUITE 3 — AI Pipeline (R&D Analyzer)');
  console.log('════════════════════════════════════════════════════════════');

  const tests = [];
  function it(name, fn) {
    tests.push({ name, fn });
  }

  it('clamps scores correctly', () => {
    assert.strictEqual(clamp(1.5, 0, 1), 1);
    assert.strictEqual(clamp(-0.5, 0, 1), 0);
    assert.strictEqual(clamp(0.75, 0, 1), 0.75);
  });

  it('deriveComplexityWeight calculates correctly for max scores', () => {
    const result = {
      criteriaScores: {
        novelty: { score: 1.0 },
        technicalUncertainty: { score: 1.0 },
        systematicApproach: { score: 1.0 },
        creativeElement: { score: 1.0 }
      }
    };
    // 1.0 + (1.0 * 2.0) = 3.0
    assert.strictEqual(deriveComplexityWeight(result), 3.0);
  });

  it('deriveComplexityWeight calculates correctly for min scores', () => {
    const result = {
      criteriaScores: {
        novelty: { score: 0.0 },
        technicalUncertainty: { score: 0.0 },
        systematicApproach: { score: 0.0 },
        creativeElement: { score: 0.0 }
      }
    };
    // 1.0 + (0.0 * 2.0) = 1.0
    assert.strictEqual(deriveComplexityWeight(result), 1.0);
  });

  it('calculateEventValue returns 0 if not R&D', () => {
    assert.strictEqual(calculateEventValue(false, 0.9, 2.0, 800), 0);
  });

  it('calculateEventValue calculates correctly for R&D', () => {
    // 800 * 2.5 * 0.8 = 1600
    assert.strictEqual(calculateEventValue(true, 0.8, 2.5, 800), 1600);
  });

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
