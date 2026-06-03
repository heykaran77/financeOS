import { getTransactionSummary } from '@/lib/queries/transaction.queries';
import { CardFrame } from '@/components/ui/card';
import { getAuthenticatedUser } from '@/lib/auth.server';
import { AnimatedNumber as NumberFlow } from '@/components/ui/animated-number';

export async function CashFlowCard() {
  const user = await getAuthenticatedUser();
  const summary = await getTransactionSummary(user.id, 'monthly');

  const savedPercentage =
    summary.totalIncome > 0
      ? Math.round((summary.net / summary.totalIncome) * 100)
      : 0;

  const maxCashFlow = Math.max(summary.totalIncome, summary.totalExpenses);
  const incomeWidth =
    maxCashFlow > 0 ? (summary.totalIncome / maxCashFlow) * 100 : 0;
  const expenseWidth =
    maxCashFlow > 0 ? (summary.totalExpenses / maxCashFlow) * 100 : 0;

  return (
    <CardFrame className="flex h-full flex-col justify-between gap-4 p-6">
      <div>
        <h3 className="text-muted-foreground text-sm font-medium">Cash flow</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="flex items-center text-4xl font-bold tracking-tight">
            {summary.net > 0 ? '+' : ''}
            <NumberFlow
              value={Math.abs(summary.net)}
              locales="en-IN"
              format={{
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }}
            />
          </div>
          <span className="text-sm font-medium text-emerald-500">
            net cash flow
          </span>
        </div>
        <div className="text-muted-foreground mt-1 text-sm">
          {savedPercentage}% saved |{' '}
          <span className="text-emerald-500">+12%</span> vs last month
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">income</span>
            <span className="font-medium text-emerald-500">
              <NumberFlow
                value={summary.totalIncome}
                locales="en-IN"
                format={{
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }}
              />
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/20">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${incomeWidth}%` }}
            />
          </div>
        </div>
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">expense</span>
            <span className="font-medium text-red-500">
              <NumberFlow
                value={summary.totalExpenses}
                locales="en-IN"
                format={{
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }}
              />
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-red-500/20">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-500"
              style={{ width: `${expenseWidth}%` }}
            />
          </div>
        </div>
      </div>
    </CardFrame>
  );
}
