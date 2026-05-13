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
    defaultHourlyRate: c.default_hourly_rate ? Number(c.default_hourly_rate) : 50.0,
    taxCreditRate: c.tax_credit_rate ? Number(c.tax_credit_rate) : 0.14,
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
        defaultHourlyRate: company.default_hourly_rate ? Number(company.default_hourly_rate) : 50.0,
        taxCreditRate: company.tax_credit_rate ? Number(company.tax_credit_rate) : 0.14,
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCompany(id: string, name: string, country: string, defaultHourlyRate?: number, taxCreditRate?: number) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const dataToUpdate: any = { name, country };
    if (defaultHourlyRate !== undefined) dataToUpdate.default_hourly_rate = defaultHourlyRate;
    if (taxCreditRate !== undefined) dataToUpdate.tax_credit_rate = taxCreditRate;

    const company = await prisma.company.update({
      where: { id, user_id: (session.user as any).id },
      data: dataToUpdate
    });
    
    return {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        country: company.country,
        initials: company.name.charAt(0).toUpperCase(),
        color: 'bg-cyan-500',
        defaultHourlyRate: company.default_hourly_rate ? Number(company.default_hourly_rate) : 50.0,
        taxCreditRate: company.tax_credit_rate ? Number(company.tax_credit_rate) : 0.14,
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

