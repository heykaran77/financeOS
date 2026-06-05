import { Suspense } from 'react';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { NetworthCard } from './_components/networth-card';
import { AccountStackedCards } from './_components/account-stacked-cards';
import { CashFlowCard } from './_components/cash-flow-card';
import {
  SpendsTrendChart,
  SpendsTrendChartSkeleton,
} from './_components/spends-trend-chart';
import {
  BudgetStatusChart,
  BudgetStatusChartSkeleton,
} from './_components/budget-status-chart';
import {
  CategorySpendsChart,
  CategorySpendsChartSkeleton,
} from './_components/category-spends-chart';
import { AiInsightsCard } from './_components/ai-insights-card';
import {
  RecentTransactionsCard,
  RecentTransactionsCardSkeleton,
} from './_components/recent-transactions-card';
import {
  GoalsProgressChart,
  GoalsProgressChartSkeleton,
} from './_components/goals-progress-chart';
import {
  UpcomingPaymentsCard,
  UpcomingPaymentsCardSkeleton,
} from './_components/upcoming-payments-card';

// Import data queries directly here for use in components if we were passing promises from server components
import {
  getSpendsTrend,
  getCategorySpends,
} from '@/lib/queries/analytics.queries';
import { getBudgetStatus } from '@/lib/queries/budget.queries';
import { getGoalsProgress } from '@/lib/queries/goal.queries';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SectionHeading from '@/components/common/SectionHeading';

const CardSkeleton = () => (
  <CardFrame className="flex h-full min-h-[160px] flex-col gap-4 p-6">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="mt-2 h-10 w-48" />
    <Skeleton className="mt-1 h-4 w-24" />
  </CardFrame>
);

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  // Kick off chart queries early to pass the promises down to the suspense boundaries
  const spendsPromise = getSpendsTrend(user.id, 12);
  const budgetPromise = getBudgetStatus(user.id);
  const categoryPromise = getCategorySpends(user.id, 'monthly');
  const goalsPromise = getGoalsProgress(user.id);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <SectionHeading
        heading="Dashboard"
        subHeading="view summary of your finances"
      />
      {/* Top Row: 3 Columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Suspense fallback={<CardSkeleton />}>
          <NetworthCard userId={user.id} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <AccountStackedCards userId={user.id} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <CashFlowCard userId={user.id} />
        </Suspense>
      </div>

      {/* Row 2: Spends Trend (2/3) + Recent Transactions (1/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<SpendsTrendChartSkeleton />}>
            <SpendsTrendChart dataPromise={spendsPromise} />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense
            fallback={<RecentTransactionsCardSkeleton className="h-full" />}
          >
            <RecentTransactionsCard userId={user.id} className="h-full" />
          </Suspense>
        </div>
      </div>

      {/* Row 3: Budget | Category Spends | Goals — side by side */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<BudgetStatusChartSkeleton />}>
          <BudgetStatusChart dataPromise={budgetPromise} />
        </Suspense>
        <Suspense fallback={<CategorySpendsChartSkeleton />}>
          <CategorySpendsChart dataPromise={categoryPromise} />
        </Suspense>
        <Suspense fallback={<GoalsProgressChartSkeleton />}>
          <GoalsProgressChart dataPromise={goalsPromise} />
        </Suspense>
      </div>

      {/* Row 4: AI Insights (2/3) + Upcoming Payments (1/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AiInsightsCard />
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<UpcomingPaymentsCardSkeleton />}>
            <UpcomingPaymentsCard userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
