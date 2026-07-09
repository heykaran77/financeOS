import { Suspense } from 'react';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { TransactionList } from './_components/transaction-list';
import { TransactionTableSkeleton } from '@/components/ui/dashboard/skeletons/transaction-table-skeleton';
import SectionHeading from '@/components/common/SectionHeading';
import { AddTransactionDialog } from '@/components/forms/addTransactionDialog';
import { AddRecurringDialog } from '@/components/forms/addRecurringDialog';
import { RecurringList } from './_components/recurring-list';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { getBankAccounts, getCategories } from '@/lib/queries/account.queries';

export default async function TransactionsPage() {
  const user = await getAuthenticatedUser();

  // Fetch in parallel — both are needed for the dialog selects
  const [accounts, categories] = await Promise.all([
    getBankAccounts(user.id),
    getCategories(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          heading="Transactions"
          subHeading="View and manage all your transactions."
        />
        <div className="flex items-center gap-2">
          <AddRecurringDialog
            accounts={accounts}
            categories={categories}
            withTrigger
          />
          <AddTransactionDialog accounts={accounts} categories={categories} />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTab value="all">All Transactions</TabsTab>
          <TabsTab value="recurring">Recurring</TabsTab>
        </TabsList>
        <TabsPanel value="all">
          <Suspense fallback={<TransactionTableSkeleton />}>
            <TransactionList userId={user.id} />
          </Suspense>
        </TabsPanel>
        <TabsPanel value="recurring">
          <Suspense fallback={<TransactionTableSkeleton />}>
            <RecurringList userId={user.id} />
          </Suspense>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
