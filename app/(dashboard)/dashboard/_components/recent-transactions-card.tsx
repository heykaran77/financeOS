import { getRecentTransactions } from '@/lib/queries/transaction.queries';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export async function RecentTransactionsCard({
  className,
}: {
  className?: string;
}) {
  const user = await getAuthenticatedUser();
  const transactions = await getRecentTransactions(user.id, 10);

  const formatCurrency = (val: string | number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val));

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(date));

  return (
    <CardFrame className={`flex flex-col gap-4 p-6 ${className || ''}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          recent transactions
        </h3>
      </div>

      <div className="mt-2 flex flex-col gap-4 overflow-y-auto pr-2">
        {transactions.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No recent transactions
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm leading-none font-medium">
                  {tx.description || tx.category?.name || 'Transaction'}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatDate(tx.date)}
                </span>
              </div>
              <div
                className={`text-sm font-medium ${tx.type === 'expense' ? '' : 'text-emerald-500'}`}
              >
                {tx.type === 'expense' ? '-' : '+'}
                {formatCurrency(tx.amount)}
              </div>
            </div>
          ))
        )}
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
    <CardFrame className={`flex flex-col gap-4 p-6 ${className || ''}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          recent transactions
        </h3>
      </div>
      <div className="mt-2 flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </CardFrame>
  );
}
