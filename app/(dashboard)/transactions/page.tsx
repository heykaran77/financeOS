import { Suspense } from 'react';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { TransactionList } from './_components/transaction-list';
import { TransactionTableSkeleton } from '@/components/ui/dashboard/skeletons/transaction-table-skeleton';
import SectionHeading from '@/components/common/SectionHeading';

export default async function TransactionsPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          heading="Transactions"
          subHeading="View and manage all your transactions."
        />
      </div>

      <Suspense fallback={<TransactionTableSkeleton />}>
        <TransactionList userId={user.id} />
      </Suspense>
    </div>
  );
}
