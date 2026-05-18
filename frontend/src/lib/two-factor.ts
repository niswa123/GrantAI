import { authenticator } from '@/lib/totp';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';

const APP_NAME = 'GrantAI';

/**
 * Generates a new TOTP secret for a user, saves it to the DB (but does NOT enable 2FA yet),
 * and returns a QR code image (base64) and the raw secret for manual entry.
 */
export async function generate2FASecret(userId: string): Promise<{ qrCode: string; secret: string }> {
  const secret = authenticator.generateSecret(20);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Save the secret to DB but keep 2FA disabled until user verifies
  await prisma.user.update({
    where: { id: userId },
    data: { two_factor_secret: secret, two_factor_enabled: false },
  });

  const otpauthUrl = authenticator.keyuri(user.email, APP_NAME, secret);
  const qrCode = await QRCode.toDataURL(otpauthUrl);

  return { qrCode, secret };
}

/**
 * Verifies a TOTP code against the user's stored secret.
 * If valid, enables 2FA on the user's account.
 */
export async function verify2FAAndEnable(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.two_factor_secret) throw new Error('No 2FA secret found. Please set up 2FA first.');

  const isValid = authenticator.check(code, user.two_factor_secret);

  if (isValid) {
    await prisma.user.update({
      where: { id: userId },
      data: { two_factor_enabled: true },
    });
  }

  return isValid;
}

/**
 * Verifies a TOTP code and, if valid, disables 2FA entirely.
 */
export async function disable2FA(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.two_factor_secret) throw new Error('2FA is not enabled for this account.');

  const isValid = authenticator.check(code, user.two_factor_secret);

  if (isValid) {
    await prisma.user.update({
      where: { id: userId },
      data: { two_factor_enabled: false, two_factor_secret: null },
    });
  }

  return isValid;
}

/**
 * Verifies a TOTP code against a user's secret WITHOUT making any DB changes.
 * Used by the NextAuth `authorize` function during login.
 */
export function verifyTOTPCode(secret: string, code: string): boolean {
  return authenticator.check(code, secret);
}
