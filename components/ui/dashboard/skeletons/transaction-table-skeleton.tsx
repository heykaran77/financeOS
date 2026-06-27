import { Skeleton } from '@/components/ui/skeleton';
import { CardFrame, CardFrameFooter } from '@/components/ui/card';

/**
 * Skeleton loading state for the transactions table.
 * Matches the CardFrame + table layout used by the real component.
 */
export function TransactionTableSkeleton() {
  return (
    <CardFrame className="flex h-[calc(100svh-14rem)] w-full flex-col overflow-hidden">
      {/* Table header skeleton */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="min-h-0 flex-1 divide-y">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            {/* Checkbox */}
            <Skeleton className="h-4 w-4 shrink-0 rounded" />

            {/* Description: icon + text */}
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Type badge */}
            <Skeleton className="h-5 w-18 rounded-sm" />

            {/* Amount */}
            <Skeleton className="ml-auto h-4 w-24" />

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* Method */}
            <Skeleton className="h-4 w-14" />

            {/* Account */}
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <CardFrameFooter className="shrink-0 border-t p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-8 w-20 rounded-md" />
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
