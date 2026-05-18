/**
 * TEST SUITE 4 — Financial Engine
 * ───────────────────────────────
 * Tests the financial formulas:
 *   • Event financial value calculation
 *   • Dashboard metrics (ROI, etc.)
 *
 * Pure unit tests.
 */
'use strict';

const assert = require('assert');

// ─── Extracted logic ──────────────

function calcFinancialEventValue(timeSpentHours, complexityWeight, hourlyRate, confidenceScore, taxRate) {
    const baseHours = timeSpentHours / (complexityWeight || 1);
    const value = baseHours * hourlyRate * confidenceScore * taxRate;
    return Number(value.toFixed(2));
}

function getRoi(record) {
  if (!record.totalCosts || record.totalCosts === 0) return 0;
  return Math.round(((record.estimatedRefund || 0) / record.totalCosts) * 1000) / 10;
}

// ─── Tests ─────────────────────────────────────────────────────────────────

module.exports = async function runSuite() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  SUITE 4 — Financial Engine');
  console.log('════════════════════════════════════════════════════════════');

  const tests = [];
  function it(name, fn) {
    tests.push({ name, fn });
  }

  it('calcFinancialEventValue computes correct value', () => {
    // time: 2, weight: 2 -> baseHours = 1
    // rate: 100, conf: 0.8, tax: 0.2
    // 1 * 100 * 0.8 * 0.2 = 16.00
    const val = calcFinancialEventValue(2, 2, 100, 0.8, 0.2);
    assert.strictEqual(val, 16.00);
  });

  it('calcFinancialEventValue defaults complexityWeight to 1 if falsy', () => {
    const val = calcFinancialEventValue(1, 0, 100, 1.0, 0.2);
    assert.strictEqual(val, 20.00);
  });

  it('getRoi computes ROI correctly as percentage', () => {
    const record = { estimatedRefund: 250, totalCosts: 1000 };
    assert.strictEqual(getRoi(record), 25.0);
  });

  it('getRoi handles 0 totalCosts gracefully', () => {
    const record = { estimatedRefund: 250, totalCosts: 0 };
    assert.strictEqual(getRoi(record), 0);
  });

  it('getRoi rounds to 1 decimal place', () => {
    const record = { estimatedRefund: 100, totalCosts: 300 };
    // 100/300 = 0.3333... -> *1000 = 333.33... -> round = 333 -> /10 = 33.3
    assert.strictEqual(getRoi(record), 33.3);
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
