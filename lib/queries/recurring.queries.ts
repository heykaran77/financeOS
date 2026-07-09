import { db } from '@/db';
import { recurringTransaction } from '@/db/schema/schema';
import { eq, and } from 'drizzle-orm';

// ─── Queries ────────────────────────────────────────────────────

/**
 * Fetch all recurring transactions for a user, with joined category/account names.
 */
export async function getRecurringTransactions(userId: string) {
  return db.query.recurringTransaction.findMany({
    where: and(eq(recurringTransaction.userId, userId)),
    with: {
      category: {
        columns: { id: true, name: true, icon: true, color: true },
      },
      bankAccount: {
        columns: { id: true, name: true, type: true, icon: true },
      },
    },
    orderBy: (rt, { asc }) => [asc(rt.nextDueDate)],
  });
}

export type RecurringTransactionRow = Awaited<
  ReturnType<typeof getRecurringTransactions>
>[number];

/**
 * Get count of active recurring transactions for a user.
 */
export async function getActiveRecurringCount(userId: string): Promise<number> {
  const result = await db.query.recurringTransaction.findMany({
    where: and(
      eq(recurringTransaction.userId, userId),
      eq(recurringTransaction.isActive, true),
    ),
    columns: { id: true },
  });
  return result.length;
}
