'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmailVerification } from './emailActions';
import { verifyTurnstileToken } from '@/lib/turnstile-server';

export async function registerUser(data: FormData) {
  const email = data.get('email') as string;
  const password = data.get('password') as string;
  const confirmPassword = data.get('confirmPassword') as string;
  const captchaToken = data.get('cf-turnstile-response') as string | null;

  if (!email || !password) {
    return { error: 'Missing required fields' };
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

    const hashedPassword = await bcrypt.hash(password, 10);

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
