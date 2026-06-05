import { getTotalBalance } from '@/lib/queries/account.queries';
import { CardFrame } from '@/components/ui/card';
import { AnimatedNumber as NumberFlow } from '@/components/ui/animated-number';

export async function NetworthCard({ userId }: { userId: string }) {
  const totalBalance = await getTotalBalance(userId);

  // Convert INR to USD as per wireframe (~$1900 for 160000 INR)
  // This is a naive static conversion for MVP, assuming base is INR
  const conversionRate = 1 / 84;
  const secondaryBalance = totalBalance * conversionRate;

  return (
    <CardFrame className="flex h-full flex-col justify-between gap-4 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-muted-foreground text-sm font-medium">
            Total balance [Networth]
          </h3>
          <div className="mt-2 text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">
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
          <div className="mt-1 text-sm text-emerald-600/80 dark:text-emerald-500/80">
            ~{' '}
            <NumberFlow
              value={secondaryBalance}
              locales="en-US"
              format={{
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="focus:ring-ring inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
          +12.4%
        </div>
        <span className="text-muted-foreground text-xs">Last 6 months</span>
      </div>
    </CardFrame>
  );
}
