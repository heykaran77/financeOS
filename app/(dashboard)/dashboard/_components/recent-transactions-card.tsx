import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getRecentTransactions } from '@/lib/queries/transaction.queries';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RecentTransactionsList } from './recent-transactions-table';
import { cn } from '@/lib/utils';

export async function RecentTransactionsCard({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const transactions = await getRecentTransactions(userId, 10);

  return (
    <CardFrame className={cn('flex flex-col p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-advercase-regular text-lg text-emerald-400">
          Recent activity
        </h3>
        <Link
          href="/transactions"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors"
        >
          View all
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Transaction list */}
      <div className="mt-3 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <RecentTransactionsList data={transactions} />
      </div>
    </CardFrame>
  );
}

export function RecentTransactionsCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <CardFrame className={cn('flex flex-col p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-14" />
      </div>

      {/* Skeleton rows */}
      <div className="mt-3 flex flex-col gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5"
          >
            {/* Icon placeholder */}
            <Skeleton className="size-8 shrink-0 rounded-lg" />

            {/* Text */}
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* Amount */}
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </CardFrame>
  );
}
