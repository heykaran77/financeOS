import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './authSchema';
import { transaction } from './transactionSchema';

// ─── Tags ───────────────────────────────────────────────────────
// Flexible labeling system for transactions.
// e.g. "vacation", "tax-deductible", "reimbursable", "impulse buy"

export const tag = pgTable(
  'tag',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color'), // Hex color for UI
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('tag_userId_idx').on(table.userId)],
);

// ─── Transaction ↔ Tag (Many-to-Many Junction) ─────────────────

export const transactionTag = pgTable(
  'transaction_tag',
  {
    transactionId: text('transaction_id')
      .notNull()
      .references(() => transaction.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.transactionId, table.tagId] }),
    index('transaction_tag_tagId_idx').on(table.tagId),
  ],
);

// ─── Relations ──────────────────────────────────────────────────

export const tagRelations = relations(tag, ({ one, many }) => ({
  user: one(user, {
    fields: [tag.userId],
    references: [user.id],
  }),
  transactionTags: many(transactionTag),
}));

export const transactionTagRelations = relations(transactionTag, ({ one }) => ({
  transaction: one(transaction, {
    fields: [transactionTag.transactionId],
    references: [transaction.id],
  }),
  tag: one(tag, {
    fields: [transactionTag.tagId],
    references: [tag.id],
  }),
}));
