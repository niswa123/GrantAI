'use server';

import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmailVerification } from './emailActions';
import { verifyTurnstileToken } from '@/lib/turnstile-server';
import { rateLimit } from '@/lib/rate-limiter';

const MAX_PASSWORD_LENGTH = 72;

export async function registerUser(data: FormData) {
  const email = data.get('email') as string;
  const password = data.get('password') as string;
  const confirmPassword = data.get('confirmPassword') as string;
  const captchaToken = data.get('cf-turnstile-response') as string | null;

  if (!email || !password) {
    return { error: 'Missing required fields' };
  }

  // Fix #3: Prevent Bcrypt DoS via extremely long passwords
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { error: `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.` };
  }

  // Server-side captcha validation
  if (process.env.TURNSTILE_SECRET_KEY) {
    const captchaOk = await verifyTurnstileToken(captchaToken || '');
    if (!captchaOk) return { error: 'CAPTCHA verification failed. Please try again.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User already exists' };
    }

    // Fix #5: Use consistent work factor = 12
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
      },
    });

    // Send verification email (non-blocking, don't fail registration if email fails)
    sendEmailVerification(email).catch((err) =>
      console.error('[Registration] Failed to send verification email:', err)
    );

    return { success: true, user: { email: user.email } };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: error.message || 'Failed to register' };
  }
}

// ── Forgot Password ────────────────────────────────────────────────────────

export async function forgotPassword(email: string) {
  try {
    // Rate limit: max 3 password reset emails per email per 10 minutes
    const { allowed } = rateLimit(`forgot:${email.toLowerCase()}`, 3, 600_000);
    if (!allowed) {
      // Still return success to prevent timing-based email enumeration
      return { success: true };
    }

    // Always return success to prevent email enumeration attacks
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: true };

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save the token to the database
    await prisma.passwordResetToken.create({
      data: { email, token, expires_at },
    });

    // Send email via Resend
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    let Resend: any;
    try {
      const mod = await import('resend');
      Resend = mod.Resend;
    } catch {
      console.warn('[ForgotPassword] resend package not installed.');
      console.info(`[ForgotPassword] Reset URL: ${resetUrl}`);
      return { success: true };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'GrantAI <noreply@grantai.app>',
      to: email,
      subject: 'Reset your GrantAI password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #020617; color: #f8fafc; border-radius: 16px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #ffffff; margin-bottom: 8px;">Reset your password</h1>
          <p style="color: #94a3b8; margin-bottom: 32px;">You requested a password reset for your GrantAI account. Click the button below to choose a new password.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #06b6d4; color: #020617; font-weight: 700; border-radius: 12px; text-decoration: none; font-size: 15px;">
            Reset Password
          </a>
          <p style="color: #475569; font-size: 12px; margin-top: 32px;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[ForgotPassword] Error:', error);
    return { error: 'Failed to send reset email. Please try again.' };
  }
}

// ── Reset Password ─────────────────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string) {
  if (!token) return { error: 'Invalid reset link.' };
  if (newPassword.length < 8) return { error: 'Password must be at least 8 characters.' };

  try {
    // Find and validate the token
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record) return { error: 'Invalid or expired reset link.' };
    if (record.expires_at < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return { error: 'This reset link has expired. Please request a new one.' };
    }

    // Hash the new password and update the user
    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email: record.email },
      data: { password_hash: newHash },
    });

    // Delete the used token so it can't be reused
    await prisma.passwordResetToken.delete({ where: { token } });

    return { success: true };
  } catch (error: any) {
    console.error('[ResetPassword] Error:', error);
    return { error: 'Failed to reset password. Please try again.' };
  }
}

