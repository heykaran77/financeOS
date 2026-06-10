import { Suspense } from 'react';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { getAllGoals } from '@/lib/queries/goal.queries';
import { getBankAccounts } from '@/lib/queries/account.queries';
import { GoalsGrid } from './_components/goals-grid';
import { CreateGoalDialog } from '@/components/common/quick-actions/create-goal-dialog';
import SectionHeading from '@/components/common/SectionHeading';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function GoalsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardFrame key={i} className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="mt-1 h-4 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="size-7 rounded" />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        </CardFrame>
      ))}
    </div>
  );
}

export default async function GoalsPage() {
  const user = await getAuthenticatedUser();
  const goalsPromise = getAllGoals(user.id);
  const bankAccountsPromise = getBankAccounts(user.id);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <SectionHeading
          heading="Goals"
          subHeading="Set and track your financial objectives over time."
        />
        <CreateGoalDialog withTrigger />
      </div>

      <Suspense fallback={<GoalsGridSkeleton />}>
        <GoalsGrid
          goalsPromise={goalsPromise}
          bankAccountsPromise={bankAccountsPromise}
        />
      </Suspense>
    </div>
  );
}
