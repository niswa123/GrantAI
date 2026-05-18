#!/usr/bin/env tsx
/**
 * Cloudflare Turnstile Configuration Checker
 * 
 * This script verifies that Turnstile is properly configured
 * for both development and production environments.
 * 
 * Usage:
 *   npm run check:turnstile
 *   or
 *   tsx scripts/check-turnstile.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Loaded .env.local\n');
} else {
  console.log('⚠️  No .env.local found, checking process.env\n');
}

// Test keys (always pass validation)
const TEST_SITE_KEY = '1x00000000000000000000AA';
const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

// Production keys (from your Cloudflare dashboard)
const PROD_SITE_KEY = '0x4AAAAAADRJG0feCQv43WrF';
const PROD_SECRET_KEY = '0x4AAAAAADRJG8Nun7-S7sLyEqJBmJ5ms1Y';

interface CheckResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

function checkKey(name: string, value: string | undefined, expectedTest: string, expectedProd: string): CheckResult {
  if (!value) {
    return {
      status: 'fail',
      message: `❌ ${name} is not set`
    };
  }

  if (value === expectedTest) {
    return {
      status: 'warn',
      message: `⚠️  ${name} is using TEST key (always passes validation)`
    };
  }

  if (value === expectedProd) {
    return {
      status: 'pass',
      message: `✓ ${name} is using PRODUCTION key`
    };
  }

  return {
    status: 'pass',
    message: `✓ ${name} is set (custom key)`
  };
}

async function verifyTurnstileAPI(secretKey: string): Promise<boolean> {
  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', 'test-token');

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    
    // Test keys should fail with invalid token, but API should respond
    if (secretKey === TEST_SECRET_KEY) {
      return res.ok; // Just check if API is reachable
    }

    return res.ok;
  } catch (error) {
    console.error('API verification error:', error);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Cloudflare Turnstile Configuration Check');
  console.log('═══════════════════════════════════════════════════════════\n');

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Check Site Key (public)
  const siteKeyResult = checkKey(
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    siteKey,
    TEST_SITE_KEY,
    PROD_SITE_KEY
  );
  console.log(siteKeyResult.message);

  // Check Secret Key (private)
  const secretKeyResult = checkKey(
    'TURNSTILE_SECRET_KEY',
    secretKey,
    TEST_SECRET_KEY,
    PROD_SECRET_KEY
  );
  console.log(secretKeyResult.message);

  console.log('\n───────────────────────────────────────────────────────────\n');

  // Determine environment
  const isTestEnv = siteKey === TEST_SITE_KEY && secretKey === TEST_SECRET_KEY;
  const isProdEnv = siteKey === PROD_SITE_KEY && secretKey === PROD_SECRET_KEY;

  if (isTestEnv) {
    console.log('📍 Environment: DEVELOPMENT (test keys)');
    console.log('   → Turnstile will always pass validation');
    console.log('   → Good for local development\n');
  } else if (isProdEnv) {
    console.log('📍 Environment: PRODUCTION (real keys)');
    console.log('   → Turnstile will validate real users');
    console.log('   → Required for production deployment\n');
  } else {
    console.log('📍 Environment: CUSTOM (non-standard keys)');
    console.log('   → Using custom Turnstile configuration\n');
  }

  // Verify API connectivity
  if (secretKey) {
    console.log('🔍 Testing Cloudflare API connectivity...');
    const apiOk = await verifyTurnstileAPI(secretKey);
    if (apiOk) {
      console.log('✓ Cloudflare Turnstile API is reachable\n');
    } else {
      console.log('❌ Failed to reach Cloudflare Turnstile API\n');
    }
  }

  // Check integration files
  console.log('───────────────────────────────────────────────────────────\n');
  console.log('📦 Checking integration files...\n');

  const files = [
    'src/components/turnstile.tsx',
    'src/lib/turnstile-server.ts',
    'src/app/register/page.tsx',
    'src/app/actions/authActions.ts',
  ];

  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${file}`);
    } else {
      console.log(`❌ ${file} (missing)`);
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════════\n');

  const hasErrors = siteKeyResult.status === 'fail' || secretKeyResult.status === 'fail';
  const hasWarnings = siteKeyResult.status === 'warn' || secretKeyResult.status === 'warn';

  if (hasErrors) {
    console.log('❌ Configuration has ERRORS - Turnstile will not work');
    console.log('   → Set NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY\n');
    process.exit(1);
  } else if (hasWarnings && process.env.NODE_ENV === 'production') {
    console.log('⚠️  Using TEST keys in production environment');
    console.log('   → Replace with real keys from Cloudflare Dashboard');
    console.log('   → See: documents/TURNSTILE_SETUP_GUIDE.md\n');
    process.exit(1);
  } else {
    console.log('✓ Turnstile is properly configured');
    if (isTestEnv) {
      console.log('  → Ready for local development');
    } else {
      console.log('  → Ready for production');
    }
    console.log('\n📚 Documentation: documents/TURNSTILE_SETUP_GUIDE.md\n');
  }
}

main().catch((error) => {
  console.error('Error running check:', error);
  process.exit(1);
});
