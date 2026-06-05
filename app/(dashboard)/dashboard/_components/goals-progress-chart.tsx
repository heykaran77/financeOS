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
      const key = sanitizeKey(goal.name);
      config[key] = {
        label: `${goal.name} (${Math.round(goal.progress)}%)`,
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
      name: sanitizeKey(g.name),
      value: g.current,
      fill: `var(--color-${sanitizeKey(g.name)}-0)`,
    }));
  }, [data]);

  return (
    <CardFrame className="flex h-full flex-col gap-1 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-advercase-regular text-lg text-emerald-400">
          Goals Progress
        </h3>
      </div>

      <div className="min-h-[200px] w-full flex-1">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No active goals
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

export function GoalsProgressChartSkeleton() {
  return (
    <CardFrame className="flex h-full flex-col gap-2 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm font-medium">
          Goals reached progress (%)
        </h3>
      </div>
      <div className="min-h-[200px] w-full flex-1">
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
