import { db } from '@/db';
import { transaction, category } from '@/db/schema/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Fetch monthly spend trend for a bar chart.
 * Groups expenses by month.
 */
export async function getSpendsTrend(userId: string, months: number = 12) {
  const now = new Date();
  const startDate = new Date(
    Date.UTC(now.getFullYear(), now.getMonth() - months + 1, 1),
  );

  const results = await db
    .select({
      month: sql<string>`to_char(${transaction.date}, 'Mon')`,
      year: sql<string>`to_char(${transaction.date}, 'YYYY')`,
      monthNumber: sql<number>`extract(month from ${transaction.date})`,
      amount: sql<number>`SUM(${transaction.amount}::numeric)`,
    })
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, userId),
        eq(transaction.type, 'expense'),
        gte(transaction.date, startDate),
      ),
    )
    .groupBy(
      sql`to_char(${transaction.date}, 'Mon'), to_char(${transaction.date}, 'YYYY'), extract(month from ${transaction.date})`,
    )
    .orderBy(
      sql`to_char(${transaction.date}, 'YYYY') ASC, extract(month from ${transaction.date}) ASC`,
    );

  // Ensure 0s for missing months? For now, just return results mapped correctly.
  return results.map((row) => ({
    month: row.month,
    amount: Number(row.amount),
  }));
}

/**
 * Fetch spends grouped by category for a pie chart.
 */
export async function getCategorySpends(
  userId: string,
  period: 'monthly' | 'yearly' = 'monthly',
) {
  const now = new Date();
  let startDate: Date;

  if (period === 'yearly') {
    startDate = new Date(Date.UTC(now.getFullYear(), 0, 1));
  } else {
    startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  }

  const results = await db
    .select({
      categoryName: category.name,
      color: category.color,
      amount: sql<number>`SUM(${transaction.amount}::numeric)`,
    })
    .from(transaction)
    .innerJoin(category, eq(transaction.categoryId, category.id))
    .where(
      and(
        eq(transaction.userId, userId),
        eq(transaction.type, 'expense'),
        gte(transaction.date, startDate),
      ),
    )
    .groupBy(category.name, category.color)
    .orderBy(sql`SUM(${transaction.amount}::numeric) DESC`);

  return results.map((r) => ({
    category: r.categoryName,
    color: r.color,
    amount: Number(r.amount),
  }));
}
