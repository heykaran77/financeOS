'use client';

import { use, useMemo } from 'react';
import { CardFrame } from '@/components/ui/card';
import {
  EvilRadialChart,
  RadialBar,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radial-chart';
import { ChartConfig } from '@/components/evilcharts/ui/chart';

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

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((budget) => {
      config[budget.category] = {
        label: budget.category,
        colors: {
          light: [budget.color || '#10b981'],
          dark: [budget.color || '#10b981'],
        },
      };
    });
    return config;
  }, [data]);

  const chartData = useMemo(() => {
    return data.map((b) => ({
      name: b.category,
      value: b.spent,
      fill: `var(--color-${b.category}-0)`,
      // We could pass limit here if EvilRadialChart supports a max value per bar,
      // but usually radial bars expect a single metric.
      // The wireframe shows concentric circles.
    }));
  }, [data]);

  return (
    <CardFrame className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          Monthly budget status
        </h3>
      </div>

      <div className="mt-4 min-h-[250px] w-full flex-1">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No active budgets
          </div>
        ) : (
          <EvilRadialChart
            data={chartData}
            config={chartConfig}
            className="h-full w-full"
            innerRadius="30%"
            outerRadius="100%"
            nameKey="name"
          >
            <Tooltip />
            <Legend />
            <RadialBar dataKey="value" showBackground cornerRadius={10} />
          </EvilRadialChart>
        )}
      </div>
    </CardFrame>
  );
}

export function BudgetStatusChartSkeleton() {
  return (
    <CardFrame className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          Monthly budget status
        </h3>
      </div>
      <div className="mt-4 min-h-[250px] w-full flex-1">
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
