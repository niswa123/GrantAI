import prisma from '@/lib/prisma';
import { EngineeringEvent, AnalyzedLog } from '@prisma/client';

export class FinancialEngine {
  /**
   * Calculates the financial value of an engineering event.
   * Formula: (Затраченное время / Вес задачи) * Часовая ставка * Confidence Score * Коэффициент налоговой льготы
   * @param event The engineering event
   * @param log The analyzed log for the event
   * @param companyId The ID of the company
   * @param timeSpentHours Default 1 hour if not specified in event
   */
  static async calculateEventValue(
    event: EngineeringEvent,
    log: AnalyzedLog,
    companyId: string,
    timeSpentHours: number = 1
  ): Promise<number> {
    if (!log.is_rd) return 0;

    // Get company settings
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { default_hourly_rate: true, tax_credit_rate: true },
    });

    if (!company) throw new Error('Company not found');

    let hourlyRate = company.default_hourly_rate.toNumber();
    const taxRate = company.tax_credit_rate.toNumber();

    // Check if the author is a company member with a specific rate
    if (event.author_email) {
      const user = await prisma.user.findUnique({
        where: { email: event.author_email },
        select: { id: true },
      });

      if (user) {
        const member = await prisma.companyMember.findUnique({
          where: {
            user_id_company_id: {
              user_id: user.id,
              company_id: companyId,
            },
          },
        });
        if (member && member.hourly_rate) {
          hourlyRate = member.hourly_rate.toNumber();
        }
      }
    }

    // Formula: (Time / Complexity) * Hourly Rate * Confidence * Tax Rate
    // Wait, the formula says "(Затраченное время / Вес задачи)", meaning if task is complex, value is lower? 
    // Usually "Вес задачи" (complexity_weight) would multiply, but let's follow the prompt exactly:
    const baseHours = timeSpentHours / (log.complexity_weight || 1);
    const value = baseHours * hourlyRate * log.confidence_score * taxRate;

    return Number(value.toFixed(2));
  }

  /**
   * Updates an AnalyzedLog with its calculated value and aggregates it into DailyValueMap.
   */
  static async processLogValue(logId: string): Promise<void> {
    const log = await prisma.analyzedLog.findUnique({
      where: { id: logId },
      include: { event: true },
    });

    if (!log || !log.is_rd) return;

    const value = await this.calculateEventValue(log.event, log, log.company_id);

    // Update log
    await prisma.analyzedLog.update({
      where: { id: log.id },
      data: { calculated_value: value },
    });

    // Update daily aggregation
    const date = new Date(log.event.event_timestamp);
    date.setUTCHours(0, 0, 0, 0);

    await prisma.$executeRaw`
      INSERT INTO daily_value_maps (id, company_id, date, total_events, rd_events, total_value, created_at, updated_at)
      VALUES (
        gen_random_uuid(), 
        ${log.company_id}::uuid, 
        ${date}::date, 
        1, 
        1, 
        ${value}, 
        NOW(), 
        NOW()
      )
      ON CONFLICT (company_id, date) 
      DO UPDATE SET 
        total_events = daily_value_maps.total_events + 1,
        rd_events = daily_value_maps.rd_events + 1,
        total_value = daily_value_maps.total_value + ${value},
        updated_at = NOW();
    `;
  }
}
