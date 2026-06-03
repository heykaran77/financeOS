import { db } from '@/db';
import { transaction } from '@/db/schema/schema';
import { eq, desc, and, gte, lte, sql, ilike, or } from 'drizzle-orm';

// ─── Types ──────────────────────────────────────────────────────

export const getTransactionsWithRelations = () =>
  db.query.transaction.findMany({
    with: {
      category: true,
      bankAccount: true,
      transactionTags: {
        with: {
          tag: true,
        },
      },
    },
  });

export type TransactionWithRelations = Awaited<
  ReturnType<typeof getTransactionsWithRelations>
>[number];

export type TransactionFilters = {
  type?: 'expense' | 'income' | 'transfer';
  categoryId?: string;
  bankAccountId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
};

// ─── Queries ────────────────────────────────────────────────────

/**
 * Fetch recent transactions with category, bank account, and tag relations.
 */
export async function getRecentTransactions(
  userId: string,
  limit: number = 5,
): Promise<TransactionWithRelations[]> {
  const results = await db.query.transaction.findMany({
    where: eq(transaction.userId, userId),
    orderBy: [desc(transaction.date), desc(transaction.createdAt)],
    limit,
    with: {
      category: true,
      bankAccount: true,
      transactionTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  return results as TransactionWithRelations[];
}

/**
 * Fetch paginated, filterable transactions.
 */
export async function getTransactions(
  userId: string,
  filters: TransactionFilters = {},
): Promise<{ data: TransactionWithRelations[]; total: number }> {
  const {
    type,
    categoryId,
    bankAccountId,
    startDate,
    endDate,
    search,
    limit = 20,
    offset = 0,
  } = filters;

  // Build where conditions
  const conditions = [eq(transaction.userId, userId)];

  if (type) conditions.push(eq(transaction.type, type));
  if (categoryId) conditions.push(eq(transaction.categoryId, categoryId));
  if (bankAccountId)
    conditions.push(eq(transaction.bankAccountId, bankAccountId));
  if (startDate) conditions.push(gte(transaction.date, startDate));
  if (endDate) conditions.push(lte(transaction.date, endDate));
  if (search) {
    conditions.push(
      or(
        ilike(transaction.description, `%${search}%`),
        ilike(transaction.source, `%${search}%`),
      )!,
    );
  }

  const whereClause = and(...conditions);

  // Run data + count in parallel
  const [data, countResult] = await Promise.all([
    db.query.transaction.findMany({
      where: whereClause,
      orderBy: [desc(transaction.date), desc(transaction.createdAt)],
      limit,
      offset,
      with: {
        category: true,
        bankAccount: true,
        transactionTags: {
          with: {
            tag: true,
          },
        },
      },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(transaction)
      .where(whereClause),
  ]);

  return {
    data: data as TransactionWithRelations[],
    total: Number(countResult[0].count),
  };
}

/**
 * Get transaction summary for a given period (income, expenses, net).
 */
export async function getTransactionSummary(
  userId: string,
  period: 'monthly' | 'weekly' | 'yearly' = 'monthly',
) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'weekly':
      startDate = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      );
      break;
    case 'yearly':
      startDate = new Date(Date.UTC(now.getFullYear(), 0, 1));
      break;
    case 'monthly':
    default:
      startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      break;
  }

  const result = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transaction.type} = 'income' THEN ${transaction.amount} ELSE 0 END), 0)`,
      totalExpenses: sql<string>`COALESCE(SUM(CASE WHEN ${transaction.type} = 'expense' THEN ${transaction.amount} ELSE 0 END), 0)`,
      totalTransfers: sql<string>`COALESCE(SUM(CASE WHEN ${transaction.type} = 'transfer' THEN ${transaction.amount} ELSE 0 END), 0)`,
      transactionCount: sql<number>`count(*)`,
    })
    .from(transaction)
    .where(
      and(eq(transaction.userId, userId), gte(transaction.date, startDate)),
    );

  const row = result[0];
  const income = parseFloat(row.totalIncome);
  const expenses = parseFloat(row.totalExpenses);
  const transfers = parseFloat(row.totalTransfers);

  return {
    totalIncome: income,
    totalExpenses: expenses,
    totalTransfers: transfers,
    net: income - expenses,
    transactionCount: Number(row.transactionCount),
    period,
    startDate,
  };
}
