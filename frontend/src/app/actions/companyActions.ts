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
    where: {
      OR: [
        { user_id: userId },
        { members: { some: { user_id: userId } } }
      ]
    },
    orderBy: { created_at: 'asc' },
  });

  return companies.map(c => ({
    id: c.id,
    name: c.name,
    logoUrl: c.logo_url || undefined,
    country: c.country,
    initials: c.name.charAt(0).toUpperCase(),
    color: 'bg-cyan-500', // Generate dynamically or use fixed color
    defaultHourlyRate: c.default_hourly_rate ? Number(c.default_hourly_rate) : 50.0,
    taxCreditRate: c.tax_credit_rate ? Number(c.tax_credit_rate) : 0.14,
    taxScheme: c.tax_scheme,
  }));
}

export async function createCompany(name: string, country: string, logoUrl?: string, registrationNumber?: string, vatNumber?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const company = await prisma.company.create({
      data: {
        name,
        country,
        logo_url: logoUrl,
        registration_number: registrationNumber || null,
        vat_number: vatNumber || null,
        user_id: (session.user as any).id,
      }
    });
    
    return {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        logoUrl: company.logo_url || undefined,
        country: company.country,
        initials: company.name.charAt(0).toUpperCase(),
        color: 'bg-cyan-500',
        defaultHourlyRate: company.default_hourly_rate ? Number(company.default_hourly_rate) : 50.0,
        taxCreditRate: company.tax_credit_rate ? Number(company.tax_credit_rate) : 0.14,
        taxScheme: company.tax_scheme,
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCompany(id: string, name: string, country: string, defaultHourlyRate?: number, taxCreditRate?: number, logoUrl?: string, taxScheme?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const dataToUpdate: any = { name, country };
    if (defaultHourlyRate !== undefined) dataToUpdate.default_hourly_rate = defaultHourlyRate;
    if (taxCreditRate !== undefined) dataToUpdate.tax_credit_rate = taxCreditRate;
    if (logoUrl !== undefined) dataToUpdate.logo_url = logoUrl;
    if (taxScheme !== undefined) dataToUpdate.tax_scheme = taxScheme;

    const company = await prisma.company.update({
      where: { id, user_id: (session.user as any).id },
      data: dataToUpdate
    });
    
    return {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        logoUrl: company.logo_url || undefined,
        country: company.country,
        initials: company.name.charAt(0).toUpperCase(),
        color: 'bg-cyan-500',
        defaultHourlyRate: company.default_hourly_rate ? Number(company.default_hourly_rate) : 50.0,
        taxCreditRate: company.tax_credit_rate ? Number(company.tax_credit_rate) : 0.14,
        taxScheme: company.tax_scheme,
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}


export async function getCompanySyncDefaults(companyId: string): Promise<{ salaries: number; devCosts: number; lastSyncAt: Date | null }> {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) return { salaries: 100000, devCosts: 20000, lastSyncAt: null };

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { estimated_salaries: true, estimated_dev_costs: true, last_sync_at: true },
    });
    return {
      salaries: company?.estimated_salaries ? Number(company.estimated_salaries) : 100000,
      devCosts: company?.estimated_dev_costs ? Number(company.estimated_dev_costs) : 20000,
      lastSyncAt: company?.last_sync_at ?? null,
    };
  } catch {
    return { salaries: 100000, devCosts: 20000, lastSyncAt: null };
  }
}

export async function updateCompanySyncDefaults(companyId: string, salaries: number, devCosts: number) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) return;

  try {
    await prisma.company.update({
      where: { id: companyId, user_id: (session.user as any).id },
      data: {
        estimated_salaries: salaries,
        estimated_dev_costs: devCosts,
        last_sync_at: new Date(),
      },
    });
  } catch {
    // Non-fatal — sync still completed
  }
}
