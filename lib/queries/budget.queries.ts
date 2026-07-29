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
    progress:
      Number(row.limit) > 0 ? (Number(row.spent) / Number(row.limit)) * 100 : 0,
  }));
}

/**
 * Get ALL budgets for the budgets management page.
 * Includes active + inactive, all periods, with current-month spending.
 */
export async function getAllBudgets(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

  const results = await db
    .select({
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: category.name,
      categoryIcon: category.icon,
      color: category.color,
      limit: budget.amount,
      period: budget.period,
      isActive: budget.isActive,
      startDate: budget.startDate,
      endDate: budget.endDate,
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
    .where(eq(budget.userId, userId))
    .groupBy(
      budget.id,
      category.name,
      category.icon,
      category.color,
      budget.amount,
      budget.period,
      budget.isActive,
      budget.startDate,
      budget.endDate,
      budget.categoryId,
    )
    .orderBy(sql`${budget.isActive} DESC, ${budget.amount} DESC`);

  return results.map((row) => ({
    id: row.id,
    categoryId: row.categoryId,
    category: row.categoryName,
    categoryIcon: row.categoryIcon,
    color: row.color,
    limit: Number(row.limit),
    spent: Number(row.spent),
    period: row.period as 'monthly' | 'weekly' | 'yearly',
    isActive: row.isActive,
    startDate: row.startDate,
    endDate: row.endDate,
    progress:
      Number(row.limit) > 0 ? (Number(row.spent) / Number(row.limit)) * 100 : 0,
  }));
}

export type BudgetItem = Awaited<ReturnType<typeof getAllBudgets>>[number];

/**
 * Get categories available for budget creation.
 * Returns system defaults + user custom categories (expense type only).
 */
export async function getUserCategories(userId: string) {
  const results = await db
    .select({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      isDefault: category.isDefault,
    })
    .from(category)
    .where(
      and(
        sql`(${category.userId} = ${userId} OR ${category.userId} IS NULL)`,
        eq(category.type, 'expense'),
      ),
    )
    .orderBy(category.name);

  return results;
}

export type CategoryItem = Awaited<
  ReturnType<typeof getUserCategories>
>[number];
