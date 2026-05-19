import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  date,
  index,
  unique,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './authSchema';
import { category } from './categorySchema';

// ─── Budgets ────────────────────────────────────────────────────
// Monthly/weekly/yearly spending limits per category.
// One budget per user per category per period.

export const budget = pgTable(
  'budget',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => category.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(), // Spending limit
    period: text('period').notNull(), // 'monthly' | 'weekly' | 'yearly'
    startDate: date('start_date', { mode: 'date' }).notNull(),
    endDate: date('end_date', { mode: 'date' }), // NULL = ongoing
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
    index('budget_userId_idx').on(table.userId),
    unique('budget_user_category_period_unique').on(
      table.userId,
      table.categoryId,
      table.period,
    ),
    check(
      'budget_period_check',
      sql`${table.period} IN ('monthly', 'weekly', 'yearly')`,
    ),
    check('budget_amount_positive', sql`${table.amount} > 0`),
  ],
);

// ─── Relations ──────────────────────────────────────────────────

export const budgetRelations = relations(budget, ({ one }) => ({
  user: one(user, {
    fields: [budget.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [budget.categoryId],
    references: [category.id],
  }),
}));
