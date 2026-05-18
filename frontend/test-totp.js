const { TOTP } = require('otplib');
const { ScureBase32Plugin } = require('@otplib/plugin-base32-scure');
const crypto = require('crypto');

class NodeCryptoPlugin {
  hmac(algorithm, key, data) {
    return crypto.createHmac(algorithm, key).update(data).digest();
  }
  randomBytes(size) {
    return crypto.randomBytes(size);
  }
  constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
}

const totp = new TOTP({
  crypto: new NodeCryptoPlugin(),
  base32: ScureBase32Plugin
});

const secret = totp.generateSecret();
console.log("Secret:", secret);
const code = totp.generateSync({ secret });
console.log("Code:", code);
console.log("Valid?", totp.verifySync(code, { secret }));
