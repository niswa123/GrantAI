'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function getUserCompanies() {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.id) {
    return [];
  }

  const userId = (session.user as any).id;

  const companies = await prisma.company.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'asc' },
  });

  return companies.map(c => ({
    id: c.id,
    name: c.name,
    country: c.country,
    initials: c.name.charAt(0).toUpperCase(),
    color: 'bg-cyan-500', // Generate dynamically or use fixed color
  }));
}

export async function createCompany(name: string, country: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const company = await prisma.company.create({
      data: {
        name,
        country,
        user_id: (session.user as any).id,
      }
    });
    
    return {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        country: company.country,
        initials: company.name.charAt(0).toUpperCase(),
        color: 'bg-cyan-500',
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCompany(id: string, name: string, country: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const company = await prisma.company.update({
      where: { id, user_id: (session.user as any).id },
      data: { name, country }
    });
    
    return {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        country: company.country,
        initials: company.name.charAt(0).toUpperCase(),
        color: 'bg-cyan-500',
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}
