// ─── Barrel Export ──────────────────────────────────────────────
// All schemas re-exported from here for Drizzle config and app usage.

export {
  user,
  session,
  account,
  verification,
  userRelations,
  sessionRelations,
  accountRelations,
} from './authSchema';

export { bankAccount, bankAccountRelations } from './bankAccountSchema';

export { category, categoryRelations } from './categorySchema';

export { transaction, transactionRelations } from './transactionSchema';

export { budget, budgetRelations } from './budgetSchema';

export {
  recurringTransaction,
  recurringTransactionRelations,
} from './recurringSchema';

export {
  tag,
  transactionTag,
  tagRelations,
  transactionTagRelations,
} from './tagSchema';
