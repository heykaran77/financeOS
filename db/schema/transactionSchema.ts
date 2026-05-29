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
import { recurringTransaction } from './recurringSchema';
import { transactionTag } from './tagSchema';
import { goal } from './goalSchema';

// ─── Transactions ───────────────────────────────────────────────
// Unified table for all money movement: expenses, incomes, and transfers.
// This is the core table of the app.

export const transaction = pgTable(
  'transaction',
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
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(), // Always positive
    type: text('type').notNull(), // 'expense' | 'income' | 'transfer'
    description: text('description'), // Free-text note
    date: date('date', { mode: 'date' }).notNull(), // When the transaction occurred
    paymentMethod: text('payment_method'), // cash, upi, card, net_banking, other
    source: text('source'), // Income source — e.g. "Acme Corp", "Upwork" (used when type = 'income')
    isRecurring: boolean('is_recurring').default(false).notNull(),
    recurringTransactionId: text('recurring_transaction_id').references(
      () => recurringTransaction.id,
      { onDelete: 'set null' },
    ),
    goalId: text('goal_id').references(() => goal.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('transaction_userId_idx').on(table.userId),
    index('transaction_userId_date_idx').on(table.userId, table.date),
    index('transaction_bankAccountId_idx').on(table.bankAccountId),
    index('transaction_categoryId_idx').on(table.categoryId),
    index('transaction_goalId_idx').on(table.goalId),
    check(
      'transaction_type_check',
      sql`${table.type} IN ('expense', 'income', 'transfer')`,
    ),
    check('transaction_amount_positive', sql`${table.amount} > 0`),
  ],
);

// ─── Relations ──────────────────────────────────────────────────

export const transactionRelations = relations(transaction, ({ one, many }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
  bankAccount: one(bankAccount, {
    fields: [transaction.bankAccountId],
    references: [bankAccount.id],
  }),
  category: one(category, {
    fields: [transaction.categoryId],
    references: [category.id],
  }),
  recurringTransaction: one(recurringTransaction, {
    fields: [transaction.recurringTransactionId],
    references: [recurringTransaction.id],
  }),
  goal: one(goal, {
    fields: [transaction.goalId],
    references: [goal.id],
  }),
  transactionTags: many(transactionTag),
}));
