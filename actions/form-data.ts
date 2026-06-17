'use server';

import { getAuthenticatedUser } from '@/lib/auth.server';
import { getBankAccounts, getCategories } from '@/lib/queries/account.queries';
import type {
  BankAccountRow,
  CategoryRow,
} from '@/lib/queries/account.queries';

export interface TransactionFormData {
  accounts: BankAccountRow[];
  categories: CategoryRow[];
}

/**
 * Fetches accounts + categories for the add-transaction dialog.
 * Used by client components (e.g. the sidebar quick actions) that
 * can't call query functions directly.
 */
export async function getTransactionFormData(): Promise<TransactionFormData> {
  const user = await getAuthenticatedUser();
  const [accounts, categories] = await Promise.all([
    getBankAccounts(user.id),
    getCategories(user.id),
  ]);
  return { accounts, categories };
}
