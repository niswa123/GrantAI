'use server';

import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Uses Resend (https://resend.com) - install: npm install resend
// Requires RESEND_API_KEY in .env

async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  // Dynamic import so the app doesn't crash if resend isn't installed yet
  let Resend: any;
  try {
    const mod = await import('resend');
    Resend = mod.Resend;
  } catch {
    console.warn('[EmailVerification] resend package not installed. Run: npm install resend');
    console.info(`[EmailVerification] Verification URL: ${verifyUrl}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'GrantAI <noreply@grantai.app>',
    to: email,
    subject: 'Confirm your GrantAI account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #020617; color: #f8fafc; border-radius: 16px;">
        <h1 style="font-size: 24px; font-weight: 900; color: #ffffff; margin-bottom: 8px;">Confirm your email</h1>
        <p style="color: #94a3b8; margin-bottom: 32px;">Click the button below to verify your email address and activate your GrantAI account.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background: #06b6d4; color: #020617; font-weight: 700; border-radius: 12px; text-decoration: none; font-size: 15px;">
          Verify Email Address
        </a>
        <p style="color: #475569; font-size: 12px; margin-top: 32px;">This link expires in 24 hours. If you didn't create a GrantAI account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendEmailVerification(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store token in DB (uses existing VerificationToken model from Prisma schema)
  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: email, token } },
    create: { identifier: email, token, expires },
    update: { expires },
  });

  await sendVerificationEmail(email, token);
  return { success: true };
}

export async function verifyEmail(token: string) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return { error: 'Invalid or expired verification link.' };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return { error: 'Verification link has expired. Please request a new one.' };
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  // Clean up token
  await prisma.verificationToken.delete({ where: { token } });

  return { success: true };
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'User not found.' };
  if (user.emailVerified) return { error: 'Email already verified.' };

  return sendEmailVerification(email);
}
