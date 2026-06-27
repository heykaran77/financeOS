import { getTotalBalance } from '@/lib/queries/account.queries';
import { CardFrame } from '@/components/ui/card';
import { AnimatedNumber as NumberFlow } from '@/components/ui/animated-number';
import { NetworthTrendBadge } from './networth-trend-badge';
import { db } from '@/db';
import { transaction } from '@/db/schema/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

export async function NetworthCard({ userId }: { userId: string }) {
  const totalBalance = await getTotalBalance(userId);

  // Calculate realistic trend from the last 6 months of transactions
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const txData = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transaction.type} = 'income' THEN ${transaction.amount} ELSE 0.0 END), 0.0)`,
      totalExpenses: sql<string>`COALESCE(SUM(CASE WHEN ${transaction.type} = 'expense' THEN ${transaction.amount} ELSE 0.0 END), 0.0)`,
    })
    .from(transaction)
    .where(
      and(eq(transaction.userId, userId), gte(transaction.date, sixMonthsAgo)),
    );

  const netChange =
    Number(txData[0].totalIncome) - Number(txData[0].totalExpenses);
  const pastBalance = totalBalance - netChange;

  // Calculate percentage change (avoid division by zero)
  const percentageChange =
    pastBalance > 0 ? netChange / pastBalance : netChange > 0 ? 1 : 0;

  return (
    <CardFrame className="flex h-full flex-col justify-between gap-4 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-advercase-regular text-lg text-emerald-400">
            Total balance
          </h3>
          <div className="mt-2 text-4xl font-bold tracking-tight">
            <NumberFlow
              value={totalBalance}
              locales="en-IN"
              format={{
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NetworthTrendBadge value={percentageChange} />
        <span className="text-muted-foreground text-xs">Last 6 months</span>
      </div>
    </CardFrame>
  );
}
