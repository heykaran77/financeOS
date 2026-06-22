'use client';

import { useState, useEffect } from 'react';
import { getCategoryAnalyticsAction } from '@/actions/category';
import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
import type { ChartConfig } from '@/components/evilcharts/ui/chart';

type Period = 'weekly' | 'monthly' | 'yearly' | 'all';

interface CategoryData extends Record<string, unknown> {
  id: string;
  name: string;
  color: string;
  value: number;
}

export function CategoryAnalytics() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [data, setData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCategoryAnalyticsAction(period)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch category analytics', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [period]);

  // Generate dynamic chart config
  const chartConfig = data.reduce((acc, item) => {
    acc[item.id] = {
      label: item.name,
      colors: {
        light: [item.color],
        dark: [item.color], // Use the same color or generate a variant if needed
      },
    };
    return acc;
  }, {} as ChartConfig);

  const hasData = data.length > 0;

  return (
    <div className="border-border bg-card flex flex-col rounded-xl border shadow-sm">
      <div className="border-border flex flex-col items-start justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Spends by Category
          </h2>
          <p className="text-muted-foreground text-sm">
            Visual overview of your expenses.
          </p>
        </div>

        <div className="bg-muted flex rounded-lg p-1">
          {(['weekly', 'monthly', 'yearly', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setIsLoading(true);
                setPeriod(p);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                period === p
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-[350px] w-full items-center justify-center p-6">
        {!isLoading && !hasData ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-muted-foreground">
              No expenses found for this period.
            </p>
            <p className="text-muted-foreground/60 text-sm">
              Add some transactions to see your charts.
            </p>
          </div>
        ) : (
          <EvilPieChart
            className="h-full w-full"
            data={data}
            dataKey="value"
            nameKey="id"
            config={chartConfig as ChartConfig}
            isLoading={isLoading}
          >
            <Tooltip />
            <Legend isClickable />
            <Pie isClickable innerRadius="60%" />
          </EvilPieChart>
        )}
      </div>
    </div>
  );
}
