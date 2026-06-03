'use client';

import { use, useMemo } from 'react';
import { CardFrame } from '@/components/ui/card';
import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
import { ChartConfig } from '@/components/evilcharts/ui/chart';

type CategorySpendsData = {
  category: string;
  color: string | null;
  amount: number;
}[];

export function CategorySpendsChart({
  dataPromise,
}: {
  dataPromise: Promise<CategorySpendsData>;
}) {
  const data = use(dataPromise);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item) => {
      config[item.category] = {
        label: item.category,
        colors: {
          light: [item.color || '#3b82f6'],
          dark: [item.color || '#3b82f6'],
        },
      };
    });
    return config;
  }, [data]);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.category,
      value: item.amount,
      fill: `var(--color-${item.category}-0)`,
    }));
  }, [data]);

  return (
    <CardFrame className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          spends by category
        </h3>
      </div>

      <div className="mt-4 min-h-[250px] w-full flex-1">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No spends this month
          </div>
        ) : (
          <EvilPieChart
            data={chartData}
            config={chartConfig}
            className="h-full w-full"
            dataKey="value"
            nameKey="name"
          >
            <Tooltip />
            <Legend />
            <Pie />
          </EvilPieChart>
        )}
      </div>
    </CardFrame>
  );
}

export function CategorySpendsChartSkeleton() {
  return (
    <CardFrame className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          spends by category
        </h3>
      </div>
      <div className="mt-4 min-h-[250px] w-full flex-1">
        <EvilPieChart
          isLoading
          data={[]}
          config={{}}
          className="h-full w-full"
          dataKey="value"
          nameKey="name"
        >
          {null}
        </EvilPieChart>
      </div>
    </CardFrame>
  );
}
