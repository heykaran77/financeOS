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

// Converts a display name to a CSS-safe slug for use in CSS custom properties
function sanitizeKey(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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
      const key = sanitizeKey(item.category);
      config[key] = {
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
      name: sanitizeKey(item.category),
      value: item.amount,
      fill: `var(--color-${sanitizeKey(item.category)}-0)`,
    }));
  }, [data]);

  return (
    <CardFrame className="flex h-full flex-col gap-2 p-5">
      <h3 className="font-advercase-regular text-lg text-emerald-400">
        Spends by Category
      </h3>
      <div className="min-h-[200px] w-full flex-1">
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
            <Legend isClickable />
            <Pie isClickable />
          </EvilPieChart>
        )}
      </div>
    </CardFrame>
  );
}

export function CategorySpendsChartSkeleton() {
  return (
    <CardFrame className="flex h-full flex-col gap-2 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          spends by category
        </h3>
      </div>
      <div className="min-h-[200px] w-full flex-1">
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
