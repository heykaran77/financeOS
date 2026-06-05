import { getUpcomingPayments } from '@/lib/queries/dashboard.queries';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UpcomingPaymentsTable } from './upcoming-payments-table';

export async function UpcomingPaymentsCard({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const payments = await getUpcomingPayments(userId, 3);

  return (
    <CardFrame className={`flex flex-col gap-4 p-6 ${className || ''}`}>
      <h3 className="font-advercase-regular text-lg text-emerald-400">
        Upcoming payments
      </h3>

      <div className="mt-1 max-h-[300px] w-full flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
    <CardFrame className={`flex flex-col gap-4 p-6 ${className || ''}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-emerald-600 dark:text-emerald-500">
          Upcoming payments
        </h3>
      </div>
      <div className="mt-2 w-full">
        <table className="w-full">
          <thead className="border-b border-dashed">
            <tr>
              <th className="pb-2">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="pb-2">
                <Skeleton className="h-4 w-24" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-dashed last:border-0">
                <td className="py-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="py-3">
                  <Skeleton className="h-4 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardFrame>
  );
}
