import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './authSchema';
import { transaction } from './transactionSchema';
import { budget } from './budgetSchema';
import { recurringTransaction } from './recurringSchema';

// ─── Categories ─────────────────────────────────────────────────
// Supports both system-default and user-created custom categories.
// System defaults have userId = NULL and isDefault = true.

export const category = pgTable(
  'category',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // NULL = system default
    name: text('name').notNull(),
    type: text('type').notNull(), // 'expense' | 'income'
    icon: text('icon'), // Emoji or icon identifier
    color: text('color'), // Hex color for UI
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('category_userId_idx').on(table.userId),
    check('category_type_check', sql`${table.type} IN ('expense', 'income')`),
  ],
);

// ─── Relations ──────────────────────────────────────────────────

export const categoryRelations = relations(category, ({ one, many }) => ({
  user: one(user, {
    fields: [category.userId],
    references: [user.id],
  }),
  transactions: many(transaction),
  budgets: many(budget),
  recurringTransactions: many(recurringTransaction),
}));
