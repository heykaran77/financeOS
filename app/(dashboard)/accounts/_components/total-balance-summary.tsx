'use client';

import { CardFrame } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/animated-number';

export function TotalBalanceSummary({
  totalBalance,
}: {
  totalBalance: number;
}) {
  return (
    <CardFrame className="flex items-center justify-between p-6">
      <div>
        <p className="text-muted-foreground text-sm font-medium">
          Total Balance
        </p>
        <p className="text-primary text-3xl font-bold tracking-tighter md:text-4xl">
          <AnimatedNumber
            value={totalBalance}
            locales="en-IN"
            format={{
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }}
          />
        </p>
      </div>
      <div className="text-muted-foreground/40 font-mono text-xs">
        Across all accounts
      </div>
    </CardFrame>
  );
}
