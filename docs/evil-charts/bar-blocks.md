---
title: Bar Blocks
description: Simple static & beautifully designed bar charts
image: /og/bar-chart-blocks.png
---

## Monospace Bar Chart

### Monospace Bar Chart

```tsx
'use client';

import {
  type ChartConfig,
  ChartContainer,
} from '@/components/evilcharts/ui/chart';
import { Bar, BarChart, Rectangle, XAxis } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const chartData = [
  { month: 'January', desktop: 342 },
  { month: 'February', desktop: 876 },
  { month: 'March', desktop: 512 },
  { month: 'April', desktop: 629 },
  { month: 'May', desktop: 458 },
  { month: 'June', desktop: 781 },
  { month: 'July', desktop: 394 },
  { month: 'August', desktop: 925 },
  { month: 'September', desktop: 647 },
  { month: 'October', desktop: 532 },
  { month: 'November', desktop: 803 },
  { month: 'December', desktop: 271 },
  { month: 'January', desktop: 342 },
  { month: 'February', desktop: 876 },
  { month: 'March', desktop: 512 },
  { month: 'April', desktop: 629 },
  { month: 'May', desktop: 458 },
  { month: 'June', desktop: 781 },
  { month: 'July', desktop: 394 },
  { month: 'August', desktop: 925 },
  { month: 'September', desktop: 647 },
  { month: 'October', desktop: 532 },
  { month: 'November', desktop: 803 },
  { month: 'December', desktop: 271 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#18181b'],
      dark: ['#fafafa'],
    },
  },
} satisfies ChartConfig;

export function EvilMonospaceBarChart() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs">
              {'[$] Total Sales'}
            </span>
            <span className="text-primary font-mono text-3xl">
              <span className="text-muted-foreground text-xl font-normal">
                $
              </span>
              <span className="tracking-tighter">14,340</span>
            </span>
          </div>
          <hr className="mx-4 h-full border-l border-dashed" />
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs">
              {'[⬆] Top Month'}
            </span>
            <span className="text-primary font-mono text-3xl">
              <span className="tracking-tighter">June</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end gap-1">
          <span className="text-muted-foreground font-mono text-[10px]">
            {'// X-AXIS: '}
            <span className="text-primary">MONTHS</span>
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">
            {'// Y-AXIS: '}
            <span className="text-primary">SALES</span>
          </span>
        </div>
      </div>
      <hr className="my-4 border-t border-dashed" />
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          {Object.keys(chartConfig).map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key}-0)`}
              shape={BarShape}
              activeBar={BarShape}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface BarProps {
  index?: number;
  value?: number | [number, number];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  isActive?: boolean;
}

// Scale factor: collapsed = thin line, expanded = full width
const COLLAPSED_SCALE = 0.1; // [!code highlight]

const BarShape = (props: BarProps) => {
  const { fill, x, y, width, height, index, value, isActive } = props;

  const xPos = Number(x || 0);
  const yPos = Number(y || 0);
  const realWidth = Number(width || 0);
  const realHeight = Number(height || 0);

  // Center position for the bar
  const centerX = xPos + realWidth / 2;
  const centerY = yPos + realHeight / 2;

  return (
    <>
      <Rectangle {...props} fill="transparent" />

      <AnimatePresence>
        <motion.rect
          key={`bar-${index}`}
          x={xPos}
          y={yPos}
          width={realWidth}
          height={realHeight}
          fill={fill}
          initial={{ scaleX: isActive ? COLLAPSED_SCALE : 1 }}
          animate={{ scaleX: isActive ? 1 : COLLAPSED_SCALE }}
          exit={{ scaleX: COLLAPSED_SCALE }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            transformOrigin: `${centerX}px ${centerY}px`,
            transformBox: 'fill-box',
          }}
        />
      </AnimatePresence>
      {isActive && (
        <AnimatePresence>
          <motion.text
            className="font-mono"
            key={`text-${index}`}
            initial={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
            transition={{ duration: 0.2 }}
            x={centerX}
            y={yPos - 5}
            textAnchor="middle"
            fill={fill}
            style={{ pointerEvents: 'none' }}
          >
            {value}
          </motion.text>
        </AnimatePresence>
      )}
    </>
  );
};
```

### npm

```bash
npx shadcn@latest add @evilcharts/monospace-bar-chart
```

### yarn

```bash
yarn shadcn@latest add @evilcharts/monospace-bar-chart
```

### bun

```bash
bunx --bun shadcn@latest add @evilcharts/monospace-bar-chart
```

### pnpm

```bash
pnpm dlx shadcn@latest add @evilcharts/monospace-bar-chart
```

## Hover Trace Bar Chart

### Hover Trace Bar Chart

```tsx
'use client';

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
import {
  type ChartConfig,
  ChartContainer,
} from '@/components/evilcharts/ui/chart';
import { useMotionValueEvent, useSpring } from 'motion/react';
import NumberFlow from '@number-flow/react';
import * as React from 'react';

const CHART_MARGIN = 38;

const chartData = [
  { month: 'January', desktop: 342 },
  { month: 'February', desktop: 676 },
  { month: 'March', desktop: 512 },
  { month: 'April', desktop: 629 },
  { month: 'May', desktop: 458 },
  { month: 'June', desktop: 781 },
  { month: 'July', desktop: 394 },
  { month: 'August', desktop: 924 },
  { month: 'September', desktop: 647 },
  { month: 'October', desktop: 532 },
  { month: 'November', desktop: 803 },
  { month: 'December', desktop: 271 },
  { month: 'January', desktop: 342 },
  { month: 'February', desktop: 876 },
  { month: 'March', desktop: 512 },
  { month: 'April', desktop: 629 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#18181b'],
      dark: ['#fafafa'],
    },
  },
} satisfies ChartConfig;

export function EvilHoverTraceBarChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const maxData = React.useMemo(
    () =>
      chartData.reduce(
        (max, item, index) =>
          item.desktop > max.value
            ? { index, month: item.month, value: item.desktop }
            : max,
        { index: 0, month: chartData[0].month, value: chartData[0].desktop },
      ),
    [],
  );

  const selectedData =
    activeIndex != null && chartData[activeIndex]
      ? {
          index: activeIndex,
          month: chartData[activeIndex].month,
          value: chartData[activeIndex].desktop,
        }
      : maxData;

  const valueSpring = useSpring(selectedData.value, {
    stiffness: 110,
    damping: 20,
  });
  const [springValue, setSpringValue] = React.useState(selectedData.value);

  const handleBarHover = React.useCallback(
    (index: number) => {
      setActiveIndex(index);
      valueSpring.set(chartData[index]?.desktop ?? maxData.value);
    },
    [maxData.value, valueSpring],
  );

  useMotionValueEvent(valueSpring, 'change', (latest) => {
    setSpringValue(Math.round(latest));
  });

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground font-mono text-xs">
            {'[desktop] Value'}
          </p>
          <p className="text-primary font-mono text-3xl tracking-tighter">
            <NumberFlow
              value={selectedData.value}
              format={{
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'narrowSymbol',
              }}
            />
          </p>
        </div>

        <div className="space-y-1 text-right">
          <p className="text-muted-foreground font-mono text-[10px]">
            {'[month]'}
          </p>
          <p className="text-primary font-mono text-xs">{selectedData.month}</p>
        </div>
      </div>

      <ChartContainer config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ left: CHART_MARGIN }}
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
          />

          <Tooltip cursor={false} content={() => null} />

          <Bar
            dataKey="desktop"
            fill="var(--color-desktop-0)"
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
            label={<HoverTraceLabel value={selectedData.value} />}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

interface HoverTraceLabelProps {
  viewBox?: CartesianViewBox;
  value: number;
}

const HoverTraceLabel = ({ viewBox, value }: HoverTraceLabelProps) => {
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;
  const formattedValue = value.toLocaleString();
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
```

### npm

```bash
npx shadcn@latest add @evilcharts/hover-trace-bar-chart
```

### yarn

```bash
yarn shadcn@latest add @evilcharts/hover-trace-bar-chart
```

### bun

```bash
bunx --bun shadcn@latest add @evilcharts/hover-trace-bar-chart
```

### pnpm

```bash
pnpm dlx shadcn@latest add @evilcharts/hover-trace-bar-chart
```

## Grid Bar Chart

### Grid Bar Chart

```tsx
'use client';

import {
  type ChartConfig,
  ChartContainer,
} from '@/components/evilcharts/ui/chart';
import { Bar, BarChart, XAxis } from 'recharts';
const SQUARE_SIZE = 10;
const GAP = 2;
const CELL_SIZE = SQUARE_SIZE + GAP;

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 273 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 346 },
  { month: 'July', desktop: 181 },
  { month: 'August', desktop: 392 },
  { month: 'September', desktop: 298 },
  { month: 'October', desktop: 215 },
  { month: 'November', desktop: 327 },
  { month: 'December', desktop: 162 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#18181b'],
      dark: ['#fafafa'],
    },
  },
} satisfies ChartConfig;

interface GridBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
}

// Renders ghost squares filling the entire column height — used as the Bar background.
// recharts passes y = chart top, height = full chart area height, so y + height = the
// shared bottom baseline, which perfectly aligns with the data squares in GridBarShape.
const GridBarBackground = (props: GridBarProps) => {
  const { fill, x, y, width, height } = props;

  const xPos = Number(x ?? 0);
  const yPos = Number(y ?? 0);
  const realWidth = Number(width ?? 0);
  const realHeight = Number(height ?? 0);

  if (realHeight <= 0) return null;

  const numSquares = Math.floor(realHeight / CELL_SIZE);
  const squareSize = Math.min(SQUARE_SIZE, Math.max(2, realWidth - 2));
  const squareX = xPos + Math.floor((realWidth - squareSize) / 2);
  const bottomY = yPos + realHeight;

  return (
    <>
      {Array.from({ length: numSquares }, (_, i) => {
        const squareY = bottomY - (i + 1) * CELL_SIZE + GAP;
        return (
          <rect
            className="dark:opacity-[0.1]"
            key={i}
            x={squareX}
            y={squareY}
            width={squareSize}
            height={squareSize}
            fill={fill}
          />
        );
      })}
    </>
  );
};

const GridBarShape = (props: GridBarProps) => {
  const { fill, x, y, width, height } = props;

  const xPos = Number(x ?? 0);
  const yPos = Number(y ?? 0);
  const realWidth = Number(width ?? 0);
  const realHeight = Number(height ?? 0);

  if (realHeight <= 0) return null;

  const numSquares = Math.max(1, Math.floor(realHeight / CELL_SIZE));
  const squareSize = Math.min(SQUARE_SIZE, Math.max(2, realWidth - 2));
  const squareX = xPos + Math.floor((realWidth - squareSize) / 2);
  const bottomY = yPos + realHeight;

  return (
    <>
      {Array.from({ length: numSquares }, (_, i) => {
        const squareY = bottomY - (i + 1) * CELL_SIZE + GAP;
        return (
          <rect
            key={i}
            x={squareX}
            y={squareY}
            width={squareSize}
            height={squareSize}
            fill={fill}
          />
        );
      })}
    </>
  );
};

export function EvilGridBarChart() {
  const total = chartData.reduce((sum, item) => sum + item.desktop, 0);
  const maxData = chartData.reduce(
    (max, item, index) =>
      item.desktop > max.value
        ? { index, month: item.month, value: item.desktop }
        : max,
    { index: 0, month: chartData[0].month, value: chartData[0].desktop },
  );

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs">
              {'[Σ] Total'}
            </span>
            <span className="text-primary font-mono text-3xl tracking-tighter">
              {total.toLocaleString()}
            </span>
          </div>
          <hr className="mx-4 h-full border-l border-dashed" />
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs">
              {'[⬆] Peak'}
            </span>
            <span className="text-primary font-mono text-3xl tracking-tighter">
              {maxData.month.slice(0, 3)}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end gap-1">
          <span className="text-muted-foreground font-mono text-[10px]">
            {'// CELL: '}
            <span className="text-primary">10x10px</span>
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">
            {'// TYPE: '}
            <span className="text-primary">GRID</span>
          </span>
        </div>
      </div>
      <hr className="my-4 border-t border-dashed" />
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value: string) => value.slice(0, 3)}
          />
          {Object.keys(chartConfig).map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key}-0)`}
              background={GridBarBackground}
              shape={GridBarShape}
              activeBar={GridBarShape}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
```

### npm

```bash
npx shadcn@latest add @evilcharts/grid-bar-chart
```

### yarn

```bash
yarn shadcn@latest add @evilcharts/grid-bar-chart
```

### bun

```bash
bunx --bun shadcn@latest add @evilcharts/grid-bar-chart
```

### pnpm

```bash
pnpm dlx shadcn@latest add @evilcharts/grid-bar-chart
```

## Isometric Bar Chart

### Isometric Bar Chart

```tsx
'use client';

import * as React from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { motion } from 'motion/react';
import {
  type ChartConfig,
  ChartContainer,
} from '@/components/evilcharts/ui/chart';
import {
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/evilcharts/ui/tooltip';

const chartData = [
  { month: 'January', revenue: 28 },
  { month: 'February', revenue: 34 },
  { month: 'March', revenue: 22 },
  { month: 'April', revenue: 41 },
  { month: 'May', revenue: 47 },
  { month: 'June', revenue: 31 },
  { month: 'July', revenue: 38 },
];

const chartConfig = {
  revenue: {
    label: 'Revenue',
    colors: {
      light: ['#18181b'],
      dark: ['#fafafa'],
    },
  },
} satisfies ChartConfig;

const DX = 10;
const DY = 10;

const BEVEL_OPACITY = 0.55;

const FILLED = true;

const DIRECTION: 'left' | 'right' = 'right';

const HIGHLIGHT_COLOR = '#22c55e';
const HIGHLIGHT_COLOR_DARK = '#15803d';

interface ShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: { month: string; revenue: number };
}

function IsoBar({
  x,
  y,
  width,
  height,
  index,
  payload,
  maxValue,
  idPrefix,
}: ShapeProps & { maxValue: number; idPrefix: string }) {
  const bx = Number(x ?? 0);
  const by = Number(y ?? 0);
  const bw = Number(width ?? 0);
  const bh = Number(height ?? 0);

  if (bh <= 0) return null;

  const highlight = payload?.revenue === maxValue;
  const dx = DIRECTION === 'left' ? -DX : DX;
  const sideX = DIRECTION === 'left' ? bx : bx + bw;
  const topPoints = `${bx},${by} ${bx + bw},${by} ${bx + bw + dx},${by - DY} ${bx + dx},${by - DY}`;
  const sidePoints = `${sideX},${by} ${sideX + dx},${by - DY} ${sideX + dx},${by + bh - DY} ${sideX},${by + bh}`;

  // Gradient/pattern ids are namespaced per chart instance so multiple
  // charts on the same page don't share (and clobber) each other's <defs>.
  const url = (name: string) => `url(#${idPrefix}-${name})`;

  const strokeColor = highlight ? HIGHLIGHT_COLOR_DARK : 'var(--color-accent)';

  const frontFill = FILLED
    ? highlight
      ? url('iso-front-accent')
      : url('iso-front-base')
    : 'none';
  const topFill = FILLED
    ? highlight
      ? url('iso-top-accent')
      : url('iso-top-base')
    : 'none';
  const rightFill = FILLED
    ? highlight
      ? url('iso-right-accent')
      : url('iso-right-base')
    : 'none';
  const hatchFill = highlight ? url('iso-hatch-accent') : url('iso-hatch-base');

  return (
    <motion.g
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{
        duration: 0.7,
        delay: (index ?? 0) * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
    >
      <polygon
        points={sidePoints}
        fill={rightFill}
        stroke={strokeColor}
        strokeWidth={FILLED ? 0 : 1}
      />
      <polygon
        points={topPoints}
        fill={topFill}
        stroke={strokeColor}
        strokeWidth={FILLED ? 0 : 1}
      />
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        fill={frontFill}
        stroke={strokeColor}
        strokeWidth={FILLED ? 0 : 1}
      />
      {FILLED && <rect x={bx} y={by} width={bw} height={bh} fill={hatchFill} />}
      {FILLED && highlight && (
        <rect x={bx} y={by} width={2} height={bh} fill="rgba(0,0,0,0.15)" />
      )}
    </motion.g>
  );
}

function IsoBarDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <linearGradient
        id={`${idPrefix}-iso-front-base`}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={1} />
        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.8} />
      </linearGradient>
      <linearGradient
        id={`${idPrefix}-iso-top-base`}
        x1="0"
        y1="0"
        x2="1"
        y2="0"
      >
        <stop
          offset="0%"
          stopColor="var(--color-accent)"
          stopOpacity={BEVEL_OPACITY}
        />
        <stop
          offset="100%"
          stopColor="var(--color-accent)"
          stopOpacity={BEVEL_OPACITY * 0.9}
        />
      </linearGradient>
      <linearGradient
        id={`${idPrefix}-iso-right-base`}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor="var(--color-accent)"
          stopOpacity={BEVEL_OPACITY * 0.7}
        />
        <stop
          offset="100%"
          stopColor="var(--color-accent)"
          stopOpacity={BEVEL_OPACITY * 0.55}
        />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-iso-front-accent`}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="0%" stopColor={HIGHLIGHT_COLOR} stopOpacity={1} />
        <stop
          offset="100%"
          stopColor={HIGHLIGHT_COLOR_DARK}
          stopOpacity={0.95}
        />
      </linearGradient>
      <linearGradient
        id={`${idPrefix}-iso-top-accent`}
        x1="0"
        y1="0"
        x2="1"
        y2="0"
      >
        <stop
          offset="0%"
          stopColor={HIGHLIGHT_COLOR}
          stopOpacity={BEVEL_OPACITY + 0.15}
        />
        <stop
          offset="100%"
          stopColor={HIGHLIGHT_COLOR}
          stopOpacity={BEVEL_OPACITY}
        />
      </linearGradient>
      <linearGradient
        id={`${idPrefix}-iso-right-accent`}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor={HIGHLIGHT_COLOR_DARK}
          stopOpacity={BEVEL_OPACITY + 0.05}
        />
        <stop
          offset="100%"
          stopColor={HIGHLIGHT_COLOR_DARK}
          stopOpacity={BEVEL_OPACITY * 0.7}
        />
      </linearGradient>

      <pattern
        id={`${idPrefix}-iso-hatch-base`}
        patternUnits="userSpaceOnUse"
        width="6"
        height="6"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="6"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.15"
        />
      </pattern>
      <pattern
        id={`${idPrefix}-iso-hatch-accent`}
        patternUnits="userSpaceOnUse"
        width="6"
        height="6"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="6"
          stroke={HIGHLIGHT_COLOR_DARK}
          strokeWidth="1"
          strokeOpacity="0.15"
        />
      </pattern>
    </defs>
  );
}

export function EvilIsometricBarChart() {
  // Namespaces this instance's <defs> ids so several charts can coexist on a page.
  const idPrefix = React.useId().replace(/:/g, '');

  const maxValue = React.useMemo(
    () => chartData.reduce((m, d) => (d.revenue > m ? d.revenue : m), 0),
    [],
  );
  const total = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const peak = chartData.find((d) => d.revenue === maxValue)!;

  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs">
              {'[$] Total'}
            </span>
            <span className="text-primary font-mono text-3xl">
              <span className="text-muted-foreground text-xl font-normal">
                $
              </span>
              <span className="tracking-tighter">{total}K</span>
            </span>
          </div>
          <hr className="mx-4 h-full border-l border-dashed" />
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground font-mono text-xs">
              {'[⬆] Peak'}
            </span>
            <span className="text-primary font-mono text-3xl tracking-tighter">
              {peak.month.slice(0, 3)}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end gap-1">
          <span className="text-muted-foreground font-mono text-[10px]">
            {'// PROJECTION: '}
            <span className="text-primary">ISOMETRIC</span>
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">
            {'// HIGHLIGHT: '}
            <span className="text-primary">MAX</span>
          </span>
        </div>
      </div>
      <hr className="my-4 border-t border-dashed" />
      <ChartContainer config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
          barCategoryGap="25%"
        >
          <IsoBarDefs idPrefix={idPrefix} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value: string) => value.slice(0, 3)}
          />
          <YAxis hide domain={[0, 'dataMax + 10']} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex flex-1 items-center gap-2">
                    <div
                      className="size-2.5 shrink-0 rounded-[2px]"
                      style={{ background: 'var(--color-revenue-0)' }}
                    />
                    <span className="text-muted-foreground flex-1 capitalize">
                      {name}
                    </span>
                    <span className="text-foreground font-mono font-medium tabular-nums">
                      ${value}K
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="revenue"
            isAnimationActive={false}
            shape={(props: unknown) => (
              <IsoBar
                {...(props as ShapeProps)}
                maxValue={maxValue}
                idPrefix={idPrefix}
              />
            )}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
```

### npm

```bash
npx shadcn@latest add @evilcharts/isometric-bar-chart
```

### yarn

```bash
yarn shadcn@latest add @evilcharts/isometric-bar-chart
```

### bun

```bash
bunx --bun shadcn@latest add @evilcharts/isometric-bar-chart
```

### pnpm

```bash
pnpm dlx shadcn@latest add @evilcharts/isometric-bar-chart
```
