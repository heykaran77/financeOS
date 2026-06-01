import { Skeleton } from '@/components/ui/skeleton';
import { CardFrame, CardFrameFooter } from '@/components/ui/card';

/**
 * Skeleton loading state for the transactions table.
 * Matches the CardFrame + table layout used by the real component.
 */
export function TransactionTableSkeleton() {
  return (
    <CardFrame className="w-full">
      {/* Table header skeleton */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="divide-y">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-7 rounded-md" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <CardFrameFooter className="p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </CardFrameFooter>
    </CardFrame>
  );
}
