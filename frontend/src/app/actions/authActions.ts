'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function registerUser(data: FormData) {
  const email = data.get('email') as string;
  const password = data.get('password') as string;
  const companyName = data.get('companyName') as string;

  if (!email || !password || !companyName) {
    return { error: 'Missing required fields' };
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
        companies: {
          create: {
            name: companyName,
            country: 'Netherlands', // Default for MVP
          },
        },
      },
      include: {
        companies: true,
      },
    });

    return { success: true, user: { email: user.email, companyId: user.companies[0].id } };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: error.message || 'Failed to register' };
  }
}
