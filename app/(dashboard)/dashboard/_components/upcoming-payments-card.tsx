import { getUpcomingPayments } from '@/lib/queries/dashboard.queries';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UpcomingPaymentsTable } from './upcoming-payments-table';
import { cn } from '@/lib/utils';

export async function UpcomingPaymentsCard({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const payments = await getUpcomingPayments(userId, 3);

  return (
    <CardFrame className={cn('flex flex-col p-5', className)}>
      <h3 className="font-advercase-regular text-lg text-emerald-400">
        Upcoming payments
      </h3>

      <div className="mt-3 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <UpcomingPaymentsTable data={payments} />
      </div>
    </CardFrame>
  );
}

export function UpcomingPaymentsCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <CardFrame className={cn('flex flex-col p-5', className)}>
      <Skeleton className="h-5 w-36" />

      <div className="mt-3 flex flex-col gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </CardFrame>
  );
}
