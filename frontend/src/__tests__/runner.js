/**
 * Minimal test runner — uses only Node.js built-in modules.
 * Run: node src/__tests__/runner.js
 */
const assert = require('assert');

let passed = 0;
let failed = 0;
const results = [];

function it(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result
        .then(() => {
          passed++;
          results.push({ name, status: 'PASS' });
        })
        .catch((err) => {
          failed++;
          results.push({ name, status: 'FAIL', error: err.message });
        });
    } else {
      passed++;
      results.push({ name, status: 'PASS' });
    }
  } catch (err) {
    failed++;
    results.push({ name, status: 'FAIL', error: err.message });
  }
  return Promise.resolve();
}

async function describe(suiteName, fn) {
  console.log(`\n  📦 ${suiteName}`);
  const promises = [];
  const origIt = global.it;
  global.it = (name, testFn) => {
    const p = it(`${suiteName} › ${name}`, testFn);
    promises.push(p);
  };
  fn();
  global.it = origIt;
  await Promise.all(promises);
}

global.it = it;
global.describe = describe;
global.assert = assert;

module.exports = { it, describe, assert, printSummary };

async function printSummary() {
  await new Promise((r) => setTimeout(r, 100)); // flush async
  console.log('\n' + '─'.repeat(60));
  for (const r of results) {
    const icon = r.status === 'PASS' ? '  ✅' : '  ❌';
    console.log(`${icon} ${r.name}`);
    if (r.error) console.log(`      Error: ${r.error}`);
  }
  console.log('─'.repeat(60));
  console.log(`\n  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failed > 0) process.exitCode = 1;
}
