import { db } from '@/db';
import { recurringTransaction } from '@/db/schema/schema';
import { eq, and, gte, asc } from 'drizzle-orm';

/**
 * Get upcoming recurring payments.
 */
export async function getUpcomingPayments(userId: string, limit: number = 5) {
  const now = new Date();

  const results = await db
    .select({
      id: recurringTransaction.id,
      description: recurringTransaction.description,
      amount: recurringTransaction.amount,
      nextDueDate: recurringTransaction.nextDueDate,
    })
    .from(recurringTransaction)
    .where(
      and(
        eq(recurringTransaction.userId, userId),
        eq(recurringTransaction.isActive, true),
        eq(recurringTransaction.type, 'expense'),
        gte(recurringTransaction.nextDueDate, now),
      ),
    )
    .orderBy(asc(recurringTransaction.nextDueDate))
    .limit(limit);

  return results.map((row) => ({
    ...row,
    amount: Number(row.amount),
  }));
}
