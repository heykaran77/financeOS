import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './authSchema';
import { transaction } from './transactionSchema';

// ─── Bank Accounts ──────────────────────────────────────────────
// Tracks user's financial accounts: checking, savings, credit cards, cash, etc.

export const bankAccount = pgTable(
  'bank_account',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g. "HDFC Savings", "Cash Wallet"
    type: text('type').notNull(), // checking, savings, credit_card, cash, investment, other
    balance: numeric('balance', { precision: 12, scale: 2 })
      .default('0')
      .notNull(),
    currency: text('currency').default('INR').notNull(),
    color: text('color'), // Hex color for UI
    icon: text('icon'), // Icon identifier for UI
    isArchived: boolean('is_archived').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('bank_account_userId_idx').on(table.userId),
    check(
      'bank_account_type_check',
      sql`${table.type} IN ('checking', 'savings', 'credit_card', 'cash', 'investment', 'other')`,
    ),
  ],
);

// ─── Relations ──────────────────────────────────────────────────

export const bankAccountRelations = relations(bankAccount, ({ one, many }) => ({
  user: one(user, {
    fields: [bankAccount.userId],
    references: [user.id],
  }),
  transactions: many(transaction),
}));
