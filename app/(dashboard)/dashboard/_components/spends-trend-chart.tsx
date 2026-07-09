'use client';

import { use, useMemo, useState, useCallback, useEffect } from 'react';
import {
  Bar,
  BarChart,
  Rectangle,
  ReferenceLine,
  Tooltip,
  XAxis,
  type BarShapeProps,
  type CartesianViewBox,
} from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/evilcharts/ui/chart';
import { CardFrame } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMotionValueEvent, useSpring } from 'motion/react';
import NumberFlow from '@number-flow/react';

type SpendData = { month: string; amount: number }[];

const CHART_MARGIN = 38;
const CHART_MARGIN_MOBILE = 10;

const chartConfig = {
  amount: {
    label: 'Spent',
    colors: {
      light: ['#18181b'],
      dark: ['#fafafa'],
    },
  },
} satisfies ChartConfig;

export function SpendsTrendChart({
  dataPromise,
}: {
  dataPromise: Promise<SpendData>;
}) {
  const data = use(dataPromise);
  const total = useMemo(
    () => data.reduce((acc, curr) => acc + curr.amount, 0),
    [data],
  );

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxData = useMemo(
    () =>
      data.reduce(
        (max, item, index) =>
          item.amount > max.value
            ? { index, month: item.month, value: item.amount }
            : max,
        { index: 0, month: data[0]?.month || '', value: data[0]?.amount || 0 },
      ),
    [data],
  );

  const selectedData =
    activeIndex != null && data[activeIndex]
      ? {
          index: activeIndex,
          month: data[activeIndex].month,
          value: data[activeIndex].amount,
        }
      : maxData;

  const valueSpring = useSpring(selectedData.value, {
    stiffness: 110,
    damping: 20,
  });
  const [springValue, setSpringValue] = useState(selectedData.value);

  const handleBarHover = useCallback(
    (index: number) => {
      setActiveIndex(index);
      valueSpring.set(data[index]?.amount ?? maxData.value);
    },
    [maxData.value, valueSpring, data],
  );

  useMotionValueEvent(valueSpring, 'change', (latest) => {
    setSpringValue(Math.round(latest));
  });

  return (
    <CardFrame className="flex h-full flex-col gap-3 p-4 sm:gap-4 sm:p-6">
      <h3 className="font-advercase-regular text-lg text-emerald-400">
        Monthly spends
      </h3>
      <div className="flex min-h-[200px] flex-1 flex-col">
        <div className="mb-4 flex items-end justify-between">
          <p className="text-primary text-2xl font-bold tracking-tighter sm:text-3xl">
            <NumberFlow
              value={selectedData.value}
              format={{
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }}
            />
          </p>

          <div className="space-y-1 text-right">
            <p className="text-muted-foreground font-mono text-[10px]">
              {'[month]'}
            </p>
            <p className="text-primary font-mono text-xs">
              {selectedData.month}
            </p>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="min-h-[150px] flex-1 overflow-hidden sm:min-h-[200px]"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: isMobile ? CHART_MARGIN_MOBILE : CHART_MARGIN }}
            onMouseMove={(state) => {
              if (state?.activeTooltipIndex != null) {
                handleBarHover(Number(state.activeTooltipIndex));
              }
            }}
            onMouseLeave={() => {
              setActiveIndex(null);
              valueSpring.set(maxData.value);
            }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(0, 3)}
              fontSize={12}
              interval="preserveStartEnd"
            />

            <Tooltip cursor={false} content={() => null} />

            <Bar
              dataKey="amount"
              fill="var(--color-amount-0)"
              radius={4}
              shape={(props: BarShapeProps) => (
                <HoverTraceBarShape
                  {...props}
                  highlightedIndex={selectedData.index}
                />
              )}
              activeBar={(props: BarShapeProps) => (
                <HoverTraceBarShape
                  {...props}
                  highlightedIndex={selectedData.index}
                />
              )}
            />

            <ReferenceLine
              y={springValue}
              stroke="var(--foreground)"
              strokeDasharray="3 3"
              label={
                !isMobile ? (
                  <HoverTraceLabel value={selectedData.value} />
                ) : undefined
              }
            />
          </BarChart>
        </ChartContainer>
      </div>
    </CardFrame>
  );
}

interface HoverTraceLabelProps {
  viewBox?: CartesianViewBox;
  value: number;
}

const HoverTraceLabel = ({ viewBox, value }: HoverTraceLabelProps) => {
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;
  const formattedValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
  const width = formattedValue.length * 8 + 12;

  return (
    <>
      <rect
        x={x - CHART_MARGIN}
        y={y - 9}
        width={width}
        height={18}
        fill="var(--foreground)"
        rx={4}
      />
      <text
        className="font-mono text-[11px]"
        fontWeight={600}
        x={x - CHART_MARGIN + 7}
        y={y + 4}
        fill="var(--background)"
      >
        {formattedValue}
      </text>
      <ellipse cx={'99.5%'} cy={y} rx={3} ry={3} fill="var(--foreground)" />
    </>
  );
};

type HoverTraceBarShapeProps = BarShapeProps & {
  highlightedIndex: number;
};

const HoverTraceBarShape = (props: HoverTraceBarShapeProps) => {
  const { x, y, width, height, fill, index, isActive, highlightedIndex } =
    props;
  const fillOpacity = isActive || index === highlightedIndex ? 1 : 0.2;

  return (
    <g>
      <Rectangle {...props} fill="transparent" pointerEvents="all" />
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        radius={4}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={isActive ? 'var(--foreground)' : undefined}
        strokeOpacity={isActive ? 0.35 : undefined}
        strokeWidth={isActive ? 1 : undefined}
        className="transition-opacity duration-200"
      />
    </g>
  );
};

export function SpendsTrendChartSkeleton() {
  return (
    <CardFrame className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-1 h-8 w-32" />
      </div>
      <div className="flex h-[200px] w-full items-end justify-between gap-2">
        {[40, 60, 30, 80, 50, 70, 90, 45, 65, 85, 55, 75].map((h, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </CardFrame>
  );
}
