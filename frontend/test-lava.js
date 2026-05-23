const LAVA_API_URL = 'https://gate.lava.top/api/v3/invoice';
const LAVA_API_KEY = 'ySiZP6fBp2l02sZafro3JWy0vJOXzMhBWuUw4gp6Ji3x1YC1Jh6MZvb5IcETNvYp';
const LAVA_PRO_OFFER_ID = '6d36ce89-74db-4773-986f-06d7fc2534c5';

async function testBearer() {
  console.log('Testing Bearer token auth...');
  const payload = {
    offerId: LAVA_PRO_OFFER_ID,
    email: 'test@example.com',
    custom: 'test-user-id:PRO',
    currency: 'RUB',
  };

  try {
    const res = await fetch(LAVA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LAVA_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('Bearer status:', res.status);
    console.log('Bearer response:', await res.text());
  } catch (err) {
    console.error('Bearer error:', err);
  }
}

async function testSignatureHeader() {
  console.log('\nTesting Signature header auth...');
  const crypto = require('crypto');
  const payload = {
    offerId: LAVA_PRO_OFFER_ID,
    email: 'test@example.com',
    custom: 'test-user-id:PRO',
    currency: 'RUB',
  };

  const bodyStr = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', LAVA_API_KEY).update(bodyStr).digest('hex');

  try {
    const res = await fetch(LAVA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Signature': signature,
      },
      body: bodyStr,
    });

    console.log('Signature status:', res.status);
    console.log('Signature response:', await res.text());
  } catch (err) {
    console.error('Signature error:', err);
  }
}

async function testXApiKeyHeader() {
  console.log('\nTesting X-Api-Key / x-api-key auth...');
  const payload = {
    offerId: LAVA_PRO_OFFER_ID,
    email: 'test@example.com',
    custom: 'test-user-id:PRO',
    currency: 'RUB',
  };

  try {
    const res = await fetch(LAVA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LAVA_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    console.log('X-Api-Key status:', res.status);
    console.log('X-Api-Key response:', await res.text());
  } catch (err) {
    console.error('X-Api-Key error:', err);
  }
}

async function run() {
  await testBearer();
  await testSignatureHeader();
  await testXApiKeyHeader();
}

run();
