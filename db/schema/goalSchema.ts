import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  numeric,
  date,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './authSchema';
import { transaction } from './transactionSchema';

// ─── Financial Goals ────────────────────────────────────────────
// Tracking savings goals like "Buy a Macbook", "Emergency Fund"

export const goal = pgTable(
  'goal',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    targetAmount: numeric('target_amount', {
      precision: 12,
      scale: 2,
    }).notNull(),
    currentAmount: numeric('current_amount', { precision: 12, scale: 2 })
      .default('0')
      .notNull(),
    targetDate: date('target_date', { mode: 'date' }),
    status: text('status').default('in_progress').notNull(), // 'in_progress', 'completed', 'paused'
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('goal_userId_idx').on(table.userId)],
);

export const goalRelations = relations(goal, ({ one, many }) => ({
  user: one(user, {
    fields: [goal.userId],
    references: [user.id],
  }),
  transactions: many(transaction),
}));
