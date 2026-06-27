import { db } from '@/db';
import { bankAccount } from '@/db/schema/schema';
import { eq, and, sql } from 'drizzle-orm';

// ─── Queries ────────────────────────────────────────────────────

/**
 * Fetch all active (non-archived) bank accounts for a user.
 */
export async function getBankAccounts(userId: string) {
  const accounts = await db.query.bankAccount.findMany({
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

  const hasCash = accounts.some(
    (a) => a.name.toLowerCase() === 'cash' || a.type.toLowerCase() === 'cash',
  );

  if (!hasCash) {
    accounts.push({
      id: 'default-cash',
      name: 'Cash',
      type: 'cash',
      balance: '0',
      currency: 'INR',
      color: '#10b981',
      icon: null,
      isArchived: false,
    } as (typeof accounts)[number]);
  }

  return accounts;
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
