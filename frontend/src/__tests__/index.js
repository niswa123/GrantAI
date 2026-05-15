/**
 * MAIN TEST RUNNER
 * Executes all test suites and prints a summary.
 */
'use strict';

async function runAll() {
  console.log('🚀 Starting GrantAI Test Suite\n');

  let totalPassed = 0;
  let totalFailed = 0;

  const suites = [
    require('./01_webhook_github.test.js'),
    require('./02_webhook_jira_linear.test.js'),
    require('./03_ai_pipeline.test.js'),
    require('./04_financial_engine.test.js')
  ];

  for (const suite of suites) {
    const { passed, failed } = await suite();
    totalPassed += passed;
    totalFailed += failed;
  }

  console.log('\n============================================================');
  console.log(`🏁 TEST RUN COMPLETE`);
  console.log(`   Passed: ${totalPassed}`);
  console.log(`   Failed: ${totalFailed}`);
  console.log('============================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runAll().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
