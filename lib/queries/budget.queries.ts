import { db } from '@/db';
import { budget, transaction, category } from '@/db/schema/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Get active budgets and the amount spent in the current month.
 */
export async function getBudgetStatus(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

  // We can query budgets and left join transactions to sum spent
  const results = await db
    .select({
      id: budget.id,
      categoryName: category.name,
      color: category.color,
      limit: budget.amount,
      spent: sql<number>`COALESCE(SUM(${transaction.amount}::numeric), 0)`,
    })
    .from(budget)
    .innerJoin(category, eq(budget.categoryId, category.id))
    .leftJoin(
      transaction,
      and(
        eq(transaction.categoryId, budget.categoryId),
        eq(transaction.userId, budget.userId),
        eq(transaction.type, 'expense'),
        gte(transaction.date, startOfMonth),
      ),
    )
    .where(
      and(
        eq(budget.userId, userId),
        eq(budget.isActive, true),
        eq(budget.period, 'monthly'),
      ),
    )
    .groupBy(budget.id, category.name, category.color, budget.amount)
    .orderBy(sql`${budget.amount} DESC`);

  return results.map((row) => ({
    id: row.id,
    category: row.categoryName,
    color: row.color,
    limit: Number(row.limit),
    spent: Number(row.spent),
    progress: Math.min((Number(row.spent) / Number(row.limit)) * 100, 100),
  }));
}
