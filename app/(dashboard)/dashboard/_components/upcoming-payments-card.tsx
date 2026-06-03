import { getUpcomingPayments } from '@/lib/queries/dashboard.queries';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export async function UpcomingPaymentsCard({
  className,
}: {
  className?: string;
}) {
  const user = await getAuthenticatedUser();
  const payments = await getUpcomingPayments(user.id, 3);

  const formatDate = (date: Date) => {
    const today = new Date();
    const target = new Date(date);

    // Check if tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (target.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
    }).format(target);
  };

  return (
    <CardFrame className={`flex flex-col gap-4 p-6 ${className || ''}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-emerald-600 dark:text-emerald-500">
          Upcoming payments
        </h3>
      </div>

      <div className="mt-2 w-full">
        <table className="text-foreground w-full text-left text-sm">
          <thead className="text-muted-foreground border-b border-dashed">
            <tr>
              <th className="pb-2 font-mono">Due Date</th>
              <th className="pb-2 font-mono">Bill</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="text-muted-foreground py-4 text-center"
                >
                  No upcoming payments
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b border-dashed last:border-0">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {formatDate(p.nextDueDate)}
                  </td>
                  <td className="truncate py-3">
                    {p.description || 'Subscription'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
