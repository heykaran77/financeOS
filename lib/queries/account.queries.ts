import { db } from '@/db';
import { bankAccount, category } from '@/db/schema/schema';
import { eq, and, sql } from 'drizzle-orm';

// ─── Queries ────────────────────────────────────────────────────

/**
 * Fetch all active (non-archived) bank accounts for a user.
 */
export async function getBankAccounts(userId: string) {
  return db.query.bankAccount.findMany({
    where: and(
      eq(bankAccount.userId, userId),
      eq(bankAccount.isArchived, false),
    ),
    columns: {
      id: true,
      name: true,
      type: true,
      balance: true,
      currency: true,
      color: true,
      icon: true,
      isArchived: true,
    },
  });
}

export type BankAccountRow = Awaited<
  ReturnType<typeof getBankAccounts>
>[number];

/**
 * Get total balance across all active accounts.
 */
export async function getTotalBalance(userId: string): Promise<number> {
  const result = await db
    .select({
      total: sql<string>`COALESCE(SUM(${bankAccount.balance}::numeric), 0)`,
    })
    .from(bankAccount)
    .where(
      and(eq(bankAccount.userId, userId), eq(bankAccount.isArchived, false)),
    );

  return parseFloat(result[0].total);
}

/**
 * Fetch all categories visible to a user (their own + system defaults).
 */
export async function getCategories(userId: string) {
  return db.query.category.findMany({
    where: (cat, { or, eq, isNull }) =>
      or(eq(cat.userId, userId), isNull(cat.userId)),
    columns: {
      id: true,
      name: true,
      type: true,
      icon: true,
      color: true,
      isDefault: true,
    },
  });
}

export type CategoryRow = Awaited<ReturnType<typeof getCategories>>[number];
