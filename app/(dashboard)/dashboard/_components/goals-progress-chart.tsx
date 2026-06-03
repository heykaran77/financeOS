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

type GoalData = {
  id: string;
  name: string;
  target: number;
  current: number;
  progress: number;
}[];

const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']; // Array of fallback colors

export function GoalsProgressChart({
  dataPromise,
}: {
  dataPromise: Promise<GoalData>;
}) {
  const data = use(dataPromise);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((goal, idx) => {
      const color = colors[idx % colors.length];
      config[goal.name] = {
        label: goal.name,
        colors: {
          light: [color],
          dark: [color],
        },
      };
    });
    return config;
  }, [data]);

  const chartData = useMemo(() => {
    return data.map((g) => ({
      name: g.name,
      value: g.current,
      fill: `var(--color-${g.name}-0)`,
    }));
  }, [data]);

  return (
    <CardFrame className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          Goals reached progress (%)
        </h3>
      </div>

      <div className="mt-4 min-h-[250px] w-full flex-1">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No active goals
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

export function GoalsProgressChartSkeleton() {
  return (
    <CardFrame className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          Goals reached progress (%)
        </h3>
      </div>
      <div className="mt-4 min-h-[250px] w-full flex-1">
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
