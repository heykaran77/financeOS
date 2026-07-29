'use client';

import { use, useMemo } from 'react';
import { CardFrame } from '@/components/ui/card';
import {
  EvilRadialChart,
  RadialBar,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radial-chart';
import { PolarAngleAxis } from 'recharts';
import { ChartConfig } from '@/components/evilcharts/ui/chart';

// Converts a display name to a CSS-safe slug for use in CSS custom properties
function sanitizeKey(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type BudgetData = {
  id: string;
  category: string;
  color: string | null;
  limit: number;
  spent: number;
  progress: number;
}[];

export function BudgetStatusChart({
  dataPromise,
}: {
  dataPromise: Promise<BudgetData>;
}) {
  const data = use(dataPromise);

  // Filter out budgets where nothing has been spent yet
  const activeData = useMemo(() => data.filter((b) => b.spent > 0), [data]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    activeData.forEach((budget) => {
      const key = sanitizeKey(budget.category);
      config[key] = {
        label: `${budget.category} (${Math.round(budget.progress)}%)`,
        colors: {
          light: [budget.color || '#10b981'],
          dark: [budget.color || '#10b981'],
        },
      };
    });
    return config;
  }, [activeData]);

  const chartData = useMemo(() => {
    const realData = activeData.map((b) => ({
      name: sanitizeKey(b.category),
      value: Math.round(Math.min(b.progress, 100)),
      fill: `var(--color-${sanitizeKey(b.category)}-0)`,
    }));
    return realData;
  }, [activeData]);

  return (
    <CardFrame className="flex h-full flex-col p-5">
      <h3 className="font-advercase-regular text-lg text-emerald-400">
        Budget status
      </h3>

      <div className="min-h-50 w-full flex-1">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No active budgets
          </div>
        ) : activeData.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No spending against budgets yet
          </div>
        ) : (
          <EvilRadialChart
            data={chartData}
            config={chartConfig}
            className="h-full w-full"
            innerRadius="50%"
            outerRadius="100%"
            nameKey="name"
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <Tooltip />
            <Legend isClickable />
            <RadialBar dataKey="value" showBackground isClickable />
          </EvilRadialChart>
        )}
      </div>
    </CardFrame>
  );
}

export function BudgetStatusChartSkeleton() {
  return (
    <CardFrame className="flex h-full flex-col gap-2 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          Monthly budget status
        </h3>
      </div>
      <div className="min-h-50 w-full flex-1">
        {/* We use the EvilRadialChart's native isLoading state */}
        <EvilRadialChart
          isLoading
          data={[]}
          config={{}}
          className="h-full w-full"
          nameKey="name"
        >
          {null}
        </EvilRadialChart>
      </div>
    </CardFrame>
  );
}
