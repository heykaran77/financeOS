import { db } from '@/db';
import { budget, transaction, category } from '@/db/schema/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Get all categories with a basic overview of their active budget limits.
 * We'll let the analytics chart handle the "spent" calculations by period.
 */
export async function getCategoryListOverview(userId: string) {
  const results = await db
    .select({
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isDefault: category.isDefault,
      budgetLimit: sql<number>`COALESCE(MAX(${budget.amount}::numeric), 0)`,
    })
    .from(category)
    .leftJoin(
      budget,
      and(
        eq(budget.categoryId, category.id),
        eq(budget.userId, userId),
        eq(budget.isActive, true),
      ),
    )
    .where(
      and(sql`(${category.userId} = ${userId} OR ${category.userId} IS NULL)`),
    )
    .groupBy(
      category.id,
      category.name,
      category.type,
      category.icon,
      category.color,
      category.isDefault,
    )
    .orderBy(category.type, category.name);

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    color: row.color,
    isDefault: row.isDefault,
    budgetLimit: Number(row.budgetLimit),
  }));
}

/**
 * Get spending by category for a specific time period (weekly, monthly, yearly).
 * This will be used to populate the @evil-charts pie/bar charts.
 */
export async function getCategorySpendingAnalytics(
  userId: string,
  period: 'weekly' | 'monthly' | 'yearly' | 'all',
) {
  const now = new Date();
  let startDate = new Date(0); // Epoch

  if (period === 'weekly') {
    // Last 7 days
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'monthly') {
    // Start of current month
    startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  } else if (period === 'yearly') {
    // Start of current year
    startDate = new Date(Date.UTC(now.getFullYear(), 0, 1));
  }

  const results = await db
    .select({
      categoryId: category.id,
      categoryName: category.name,
      color: category.color,
      spent: sql<number>`COALESCE(SUM(${transaction.amount}::numeric), 0)`,
    })
    .from(transaction)
    .innerJoin(category, eq(transaction.categoryId, category.id))
    .where(
      and(
        eq(transaction.userId, userId),
        eq(transaction.type, 'expense'),
        period !== 'all' ? gte(transaction.date, startDate) : undefined,
      ),
    )
    .groupBy(category.id, category.name, category.color)
    .having(sql`SUM(${transaction.amount}::numeric) > 0`)
    .orderBy(sql`SUM(${transaction.amount}::numeric) DESC`);

  return results.map((row) => ({
    id: row.categoryId,
    name: row.categoryName,
    color: row.color || '#cccccc', // Default fallback color
    value: Number(row.spent),
  }));
}
