import crypto from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(str: string): Buffer {
  str = str.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.ceil((str.length * 5) / 8));

  for (let i = 0; i < str.length; i++) {
    const charValue = BASE32_CHARS.indexOf(str[i]);
    if (charValue === -1) {
      throw new Error('Invalid base32 character');
    }

    value = (value << 5) | charValue;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output.subarray(0, index);
}

function hotp(secret: Buffer, counter: number, digits: number = 6): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuffer.writeUInt32BE(counter & 0xffffffff, 4);

  const hmac = crypto.createHmac('sha1', secret).update(counterBuffer).digest();
  
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const token = (binary % Math.pow(10, digits)).toString();
  return token.padStart(digits, '0');
}

export const authenticator = {
  generateSecret: (length: number = 20): string => {
    const randomBytes = crypto.randomBytes(length);
    return base32Encode(randomBytes);
  },

  keyuri: (user: string, issuer: string, secret: string): string => {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
      user
    )}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  },

  generate: (secret: string): string => {
    const secretBuffer = base32Decode(secret);
    const counter = Math.floor(Date.now() / 1000 / 30);
    return hotp(secretBuffer, counter);
  },

  check: (token: string, secret: string, window: number = 1): boolean => {
    const secretBuffer = base32Decode(secret);
    const currentCounter = Math.floor(Date.now() / 1000 / 30);

    for (let i = -window; i <= window; i++) {
      if (hotp(secretBuffer, currentCounter + i) === token) {
        return true;
      }
    }
    return false;
  },
};
