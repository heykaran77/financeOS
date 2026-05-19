import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  date,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './authSchema';
import { bankAccount } from './bankAccountSchema';
import { category } from './categorySchema';
import { transaction } from './transactionSchema';

// ─── Recurring Transactions ─────────────────────────────────────
// Templates for repeating expenses/incomes (subscriptions, rent, salary).
// A cron job or server action processes these and creates actual transactions.

export const recurringTransaction = pgTable(
  'recurring_transaction',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bankAccountId: text('bank_account_id').references(() => bankAccount.id, {
      onDelete: 'set null',
    }),
    categoryId: text('category_id').references(() => category.id, {
      onDelete: 'set null',
    }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    type: text('type').notNull(), // 'expense' | 'income'
    description: text('description'), // e.g. "Netflix", "Rent", "Salary"
    frequency: text('frequency').notNull(), // 'daily' | 'weekly' | 'monthly' | 'yearly'
    nextDueDate: date('next_due_date', { mode: 'date' }).notNull(),
    lastProcessedDate: date('last_processed_date', { mode: 'date' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('recurring_userId_idx').on(table.userId),
    index('recurring_nextDueDate_idx').on(table.nextDueDate),
    check('recurring_type_check', sql`${table.type} IN ('expense', 'income')`),
    check(
      'recurring_frequency_check',
      sql`${table.frequency} IN ('daily', 'weekly', 'monthly', 'yearly')`,
    ),
    check('recurring_amount_positive', sql`${table.amount} > 0`),
  ],
);

// ─── Relations ──────────────────────────────────────────────────

export const recurringTransactionRelations = relations(
  recurringTransaction,
  ({ one, many }) => ({
    user: one(user, {
      fields: [recurringTransaction.userId],
      references: [user.id],
    }),
    bankAccount: one(bankAccount, {
      fields: [recurringTransaction.bankAccountId],
      references: [bankAccount.id],
    }),
    category: one(category, {
      fields: [recurringTransaction.categoryId],
      references: [category.id],
    }),
    generatedTransactions: many(transaction),
  }),
);
