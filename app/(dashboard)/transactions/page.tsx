import { Suspense } from 'react';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { TransactionList } from './_components/transaction-list';
import { TransactionTableSkeleton } from '@/components/ui/dashboard/skeletons/transaction-table-skeleton';
import SectionHeading from '@/components/common/SectionHeading';
import { AddTransactionDialog } from '@/components/forms/addTransactionDialog';
import { getBankAccounts, getCategories } from '@/lib/queries/account.queries';

export default async function TransactionsPage() {
  const user = await getAuthenticatedUser();

  // Fetch in parallel — both are needed for the dialog selects
  const [accounts, categories] = await Promise.all([
    getBankAccounts(user.id),
    getCategories(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          heading="Transactions"
          subHeading="View and manage all your transactions."
        />
        <AddTransactionDialog accounts={accounts} categories={categories} />
      </div>

      <Suspense fallback={<TransactionTableSkeleton />}>
        <TransactionList userId={user.id} />
      </Suspense>
    </div>
  );
}
