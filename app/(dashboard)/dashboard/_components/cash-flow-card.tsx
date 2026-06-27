import { getTransactionSummaryByDateRange } from '@/lib/queries/transaction.queries';
import { CardFrame } from '@/components/ui/card';
import { AnimatedNumber as NumberFlow } from '@/components/ui/animated-number';
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export async function CashFlowCard({ userId }: { userId: string }) {
  const now = new Date();

  // Current month
  const currentStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const currentEnd = new Date(
    Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  );

  // Previous month
  const prevStart = new Date(
    Date.UTC(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const prevEnd = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
  );

  const [currentSummary, prevSummary] = await Promise.all([
    getTransactionSummaryByDateRange(userId, currentStart, currentEnd),
    getTransactionSummaryByDateRange(userId, prevStart, prevEnd),
  ]);

  const savedPercentage =
    currentSummary.totalIncome > 0
      ? Math.round((currentSummary.net / currentSummary.totalIncome) * 100)
      : 0;

  // Calculate percentage change vs last month
  let netChangePercent = 0;
  if (prevSummary.net !== 0) {
    netChangePercent =
      ((currentSummary.net - prevSummary.net) / Math.abs(prevSummary.net)) *
      100;
  } else if (currentSummary.net > 0) {
    netChangePercent = 100; // From 0 to positive
  } else if (currentSummary.net < 0) {
    netChangePercent = -100; // From 0 to negative
  }

  const isPositiveChange = netChangePercent > 0;
  const isNegativeChange = netChangePercent < 0;
  const isNeutralChange = netChangePercent === 0;

  const maxCashFlow = Math.max(
    currentSummary.totalIncome,
    currentSummary.totalExpenses,
  );
  const incomeWidth =
    maxCashFlow > 0 ? (currentSummary.totalIncome / maxCashFlow) * 100 : 0;
  const expenseWidth =
    maxCashFlow > 0 ? (currentSummary.totalExpenses / maxCashFlow) * 100 : 0;

  return (
    <CardFrame className="flex h-full flex-col justify-between gap-4 p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="font-advercase-regular text-lg text-emerald-400">
              Cashflow
            </h3>
            <span className="text-muted-foreground text-sm">This month</span>
          </div>

          {/* Trend Indicator */}
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              isPositiveChange
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : isNegativeChange
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {isPositiveChange ? (
              <TrendingUp className="size-3.5" />
            ) : isNegativeChange ? (
              <TrendingDown className="size-3.5" />
            ) : (
              <Minus className="size-3.5" />
            )}
            <span>
              {isNeutralChange
                ? 'No change'
                : `${Math.abs(Math.round(netChangePercent))}%`}
            </span>
            <span className="text-muted-foreground ml-0.5 hidden opacity-80 sm:inline">
              vs last month
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <div
              className={cn(
                'flex items-center text-4xl font-bold tracking-tight',
                currentSummary.net > 0
                  ? 'text-emerald-500'
                  : currentSummary.net < 0
                    ? 'text-red-500'
                    : 'text-foreground',
              )}
            >
              {currentSummary.net > 0 ? '+' : currentSummary.net < 0 ? '−' : ''}
              <NumberFlow
                value={Math.abs(currentSummary.net)}
                locales="en-IN"
                format={{
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }}
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            net cash flow{' '}
            {savedPercentage > 0 && (
              <span>· saved {savedPercentage}% of income</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Income Col */}
        <div className="flex flex-col gap-2 rounded-xl bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
              <ArrowDownRight className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-foreground text-xs font-medium">Income</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              <NumberFlow
                value={currentSummary.totalIncome}
                locales="en-IN"
                format={{
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }}
              />
            </span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/15">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${incomeWidth}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expense Col */}
        <div className="flex flex-col gap-2 rounded-xl bg-red-500/5 p-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-red-500/10">
              <ArrowUpRight className="size-3.5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-foreground text-xs font-medium">
              Expenses
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-red-600 dark:text-red-400">
              <NumberFlow
                value={currentSummary.totalExpenses}
                locales="en-IN"
                format={{
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }}
              />
            </span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-red-500/15">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-1000 ease-out"
                style={{ width: `${expenseWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </CardFrame>
  );
}
