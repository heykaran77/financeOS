---
title: Radial Chart
description: Beautiful radial bar charts with full and semi-circle variants, gradient colors, and glow effects
image: /og/radial-chart.png
links:
  github: https://github.com/legions-developer/evilcharts/blob/main/src/registry/charts/radial-chart.tsx
  doc: https://recharts.github.io/en-US/examples/SimpleRadialBarChart
  api: https://recharts.github.io/en-US/api/RadialBarChart
---

### Basic Chart

```tsx
'use client';

import {
  EvilRadialChart,
  RadialBar,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radial-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
];

const chartConfig = {
  chrome: {
    label: 'Chrome',
    colors: {
      light: ['#3b82f6'],
      dark: ['#60a5fa'],
    },
  },
  safari: {
    label: 'Safari',
    colors: {
      light: ['#10b981'],
      dark: ['#34d399'],
    },
  },
  firefox: {
    label: 'Firefox',
    colors: {
      light: ['#f59e0b'],
      dark: ['#fbbf24'],
    },
  },
  edge: {
    label: 'Edge',
    colors: {
      light: ['#8b5cf6'],
      dark: ['#a78bfa'],
    },
  },
  other: {
    label: 'Other',
    colors: {
      light: ['#6b7280'],
      dark: ['#9ca3af'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadialChart() {
  return (
    <EvilRadialChart
      className="h-full w-full p-4"
      data={data}
      nameKey="browser"
      config={chartConfig}
      variant="full" // [!code highlight]
    >
      <Legend isClickable />
      <Tooltip />
      <RadialBar dataKey="visitors" isClickable />
    </EvilRadialChart>
  );
}
```

## Installation

    ### npm

```bash
npx shadcn@latest add @evilcharts/radial-chart
```

### yarn

```bash
yarn shadcn@latest add @evilcharts/radial-chart
```

### bun

```bash
bunx --bun shadcn@latest add @evilcharts/radial-chart
```

### pnpm

```bash
pnpm dlx shadcn@latest add @evilcharts/radial-chart
```

        ### Install the following dependencies:

          ### npm

```bash
npm install recharts
```

### yarn

```bash
yarn add recharts
```

### bun

```bash
bun add recharts
```

### pnpm

```bash
pnpm add recharts
```

        ### Copy and paste the following code snippets into your project.

          To use the chart, first create the folder `evilcharts` and a subfolder called `charts` inside your `components` directory.
          Then, copy the following base radial-chart code into a new file in that folder.


          ### components/evilcharts/charts/radial-chart.tsx

```tsx
'use client';

import {
  type ChartConfig,
  ChartContainer,
  getColorsCount,
  LoadingIndicator,
} from '@/components/evilcharts/ui/chart';
import {
  ChartTooltip,
  ChartTooltipContent,
  type TooltipRoundness,
  type TooltipVariant,
} from '@/components/evilcharts/ui/tooltip';
import {
  ChartLegend,
  ChartLegendContent,
  type ChartLegendVariant,
} from '@/components/evilcharts/ui/legend';
import {
  ChartBackground,
  type BackgroundVariant,
} from '@/components/evilcharts/ui/background';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import {
  RadialBar as RechartsRadialBar,
  RadialBarChart as RechartsRadialBarChart,
  Sector,
  type SectorProps,
} from 'recharts';
import { TypedDataKey } from 'recharts/types/util/typedDataKey';

// Constants
const DEFAULT_INNER_RADIUS = '30%';
const DEFAULT_OUTER_RADIUS = '100%';
const DEFAULT_CORNER_RADIUS = 5;
const DEFAULT_BAR_SIZE = 14;
const LOADING_BARS = 5;
// Stable empty-array reference so the `glowingBars` default doesn't change every render
const EMPTY_GLOWING_BARS: string[] = [];
const LOADING_ANIMATION_DURATION = 1500; // in milliseconds — interval between skeleton data changes

type RadialBarChartProps = ComponentProps<typeof RechartsRadialBarChart>;
type RadialBarRechartsProps = ComponentProps<typeof RechartsRadialBar>;

type RadialVariant = 'full' | 'semi';

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared state for every part of the chart. Lifted into <EvilRadialChart /> so
 * that <RadialBar />, <Tooltip />, and <Legend /> can read it without prop
 * drilling. Sub-components are composed freely — the provider is the single
 * source of truth.
 */
type RadialChartContextValue = {
  config: ChartConfig; // colors + labels for every bar
  nameKey: string; // data key holding each bar's name
  chartId: string; // colon-free id scoping this chart's style defs
  isLoading: boolean; // whether the chart shows its loading skeleton
  selectedBar: string | null; // currently selected bar name, or null when none
  selectBar: (barName: string | null, value?: number) => void; // sets the selected bar
};

const RadialChartContext = createContext<RadialChartContextValue | null>(null);

// Reads the chart context, throwing a helpful error when used outside <EvilRadialChart />
function useRadialChart() {
  const context = use(RadialChartContext);

  if (!context) {
    throw new Error(
      'Radial chart parts (<RadialBar />, <Tooltip />, …) must be used within <EvilRadialChart />',
    );
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container
// ─────────────────────────────────────────────────────────────────────────────

type EvilRadialChartBaseProps<TData extends Record<string, unknown>> = {
  config: ChartConfig; // bar colors + labels, keyed by each bar's name
  data: TData[]; // rows rendered by the chart — one bar per row
  nameKey: keyof TData & string; // data key holding each bar's name
  children: ReactNode; // composed parts — <RadialBar />, <Tooltip />, <Legend />
  className?: string; // extra classes for the chart container
  chartProps?: RadialBarChartProps; // escape hatch for the raw Recharts chart
  variant?: RadialVariant; // arc shape — full circle or half circle
  innerRadius?: number | string; // inner radius of the radial bars
  outerRadius?: number | string; // outer radius of the radial bars
  defaultSelectedDataKey?: string | null; // bar selected on first render
  onSelectionChange?: (
    selection: { dataKey: string; value: number } | null,
  ) => void; // fires when the selected bar changes
  isLoading?: boolean; // shows the animated loading skeleton
  backgroundVariant?: BackgroundVariant; // background pattern behind the chart
};

type EvilRadialChartProps<TData extends Record<string, unknown>> =
  EvilRadialChartBaseProps<TData>;

/**
 * Root of the composible radial chart. Owns the data, the shared context, the
 * loading skeleton, and the chart-wide arc shape. Everything visual — the
 * tooltip, legend, and the radial bar itself — is composed as children, so a
 * consumer renders exactly the parts they need.
 */
export function EvilRadialChart<TData extends Record<string, unknown>>({
  config,
  data,
  nameKey,
  children,
  className,
  chartProps,
  variant = 'full',
  innerRadius = DEFAULT_INNER_RADIUS,
  outerRadius = DEFAULT_OUTER_RADIUS,
  defaultSelectedDataKey = null,
  onSelectionChange,
  isLoading = false,
  backgroundVariant,
}: EvilRadialChartProps<TData>) {
  const chartId = useId().replace(/:/g, ''); // colon-free id keeps CSS/SVG selectors valid
  const [selectedBar, setSelectedBar] = useState<string | null>(
    defaultSelectedDataKey,
  );
  const loadingData = useLoadingData(isLoading);

  const variantConfig = getVariantConfig(variant);

  // Updates selection state and notifies the parent with the bar's value
  const selectBar = useCallback(
    (barName: string | null, value?: number) => {
      setSelectedBar(barName);
      onSelectionChange?.(
        barName === null ? null : { dataKey: barName, value: value ?? 0 },
      );
    },
    [onSelectionChange],
  );

  // Real bars paint from a per-name gradient; the skeleton keeps the raw rows
  const preparedData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        fill: `url(#${chartId}-radial-colors-${item[nameKey] as string})`,
      })),
    [data, nameKey, chartId],
  );

  const contextValue = useMemo<RadialChartContextValue>(
    () => ({
      config,
      nameKey,
      chartId,
      isLoading,
      selectedBar,
      selectBar,
    }),
    [config, nameKey, chartId, isLoading, selectedBar, selectBar],
  );

  return (
    <RadialChartContext value={contextValue}>
      <ChartContainer className={className} config={config}>
        <LoadingIndicator isLoading={isLoading} />
        <RechartsRadialBarChart
          id={chartId}
          data={isLoading ? loadingData : preparedData}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={variantConfig.startAngle}
          endAngle={variantConfig.endAngle}
          cx={variantConfig.cx}
          cy={variantConfig.cy}
          {...chartProps}
        >
          {backgroundVariant && <ChartBackground variant={backgroundVariant} />}
          {children}
          {isLoading && <LoadingRadialBar />}
          <defs>
            <ColorGradientStyle config={config} chartId={chartId} />
          </defs>
        </RechartsRadialBarChart>
      </ChartContainer>
    </RadialChartContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type RadialBarProps = {
  dataKey: string; // value key — determines each bar's size
  cornerRadius?: number; // border radius of each bar's corners
  barSize?: number; // thickness of each radial bar
  showBackground?: boolean; // renders the unfilled track behind each bar
  isClickable?: boolean; // lets bars be selected by clicking them
  glowingBars?: string[]; // names of bars rendered with a soft glow
  radialBarProps?: Omit<RadialBarRechartsProps, 'dataKey'>; // escape hatch for raw Recharts RadialBar props
};

/**
 * The radial bar series. Each data row becomes one bar. The series generates
 * its own glow filter definitions under the chart's unique id, so glow effects
 * never collide with other charts on the page. Pass `glowingBars` to highlight
 * specific bars and `isClickable` to make bars selectable.
 */
export function RadialBar({
  dataKey,
  cornerRadius = DEFAULT_CORNER_RADIUS,
  barSize = DEFAULT_BAR_SIZE,
  showBackground = true,
  isClickable = false,
  glowingBars = EMPTY_GLOWING_BARS,
  radialBarProps,
}: RadialBarProps) {
  const { nameKey, chartId, isLoading, selectedBar, selectBar } =
    useRadialChart();

  // The root renders the skeleton bar while loading, so the real bar steps aside
  if (isLoading) return null;

  return (
    <>
      <RechartsRadialBar
        dataKey={dataKey as TypedDataKey<Record<string, unknown>>}
        cornerRadius={cornerRadius}
        barSize={barSize}
        background={showBackground}
        className="drop-shadow-sm"
        style={isClickable ? { cursor: 'pointer' } : undefined}
        onClick={(payload, index) => {
          if (!isClickable) return;
          const entry = payload as Record<string, unknown>;
          const barName =
            (entry?.[nameKey] as string | undefined) ?? String(index);
          const value = Number(entry?.[dataKey] ?? 0);
          // Clicking the selected bar clears the selection, otherwise selects it
          selectBar(selectedBar === barName ? null : barName, value);
        }}
        shape={(props: SectorProps) => {
          const barName = (props as unknown as Record<string, unknown>)[
            nameKey
          ] as string;
          const isGlowing = glowingBars.includes(barName);
          const isSelected = selectedBar === null || selectedBar === barName;

          return (
            <Sector
              {...props}
              filter={
                isGlowing
                  ? `url(#${chartId}-radial-glow-${barName})`
                  : undefined
              }
              opacity={isClickable && !isSelected ? 0.3 : 1}
              className="transition-opacity duration-200"
            />
          );
        }}
        {...radialBarProps}
      />
      <defs>
        {glowingBars.length > 0 && (
          <GlowFilterStyle chartId={chartId} glowingBars={glowingBars} />
        )}
      </defs>
    </>
  );
}

type TooltipProps = {
  variant?: TooltipVariant; // visual style of the tooltip surface
  roundness?: TooltipRoundness; // border-radius of the tooltip
  defaultIndex?: number; // data index shown by default with no hover
};

/**
 * The hover tooltip. Labels each bar by its name from context. Hidden
 * automatically while the chart is loading.
 */
export function Tooltip({ variant, roundness, defaultIndex }: TooltipProps) {
  const { nameKey, isLoading } = useRadialChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={false}
      content={
        <ChartTooltipContent
          nameKey={nameKey}
          hideLabel
          roundness={roundness}
          variant={variant}
        />
      }
    />
  );
}

type LegendProps = {
  variant?: ChartLegendVariant; // visual style of the legend indicators
  align?: 'left' | 'center' | 'right'; // horizontal placement
  verticalAlign?: 'top' | 'middle' | 'bottom'; // vertical placement
  isClickable?: boolean; // lets each entry toggle selection of its bar
};

/**
 * The bar legend. When `isClickable` is set, each entry toggles selection of
 * its bar, driving the shared selection state read by <RadialBar />. Hidden
 * automatically while the chart is loading.
 */
export function Legend({
  variant,
  align = 'center',
  verticalAlign = 'bottom',
  isClickable = false,
}: LegendProps) {
  const { nameKey, isLoading, selectedBar, selectBar } = useRadialChart();

  if (isLoading) return null;

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedBar}
          onSelectChange={selectBar}
          isClickable={isClickable}
          nameKey={nameKey}
          variant={variant}
        />
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant helpers
// ─────────────────────────────────────────────────────────────────────────────

// Returns the angle + center configuration for the chart's arc shape
function getVariantConfig(variant: RadialVariant) {
  switch (variant) {
    case 'semi':
      return { startAngle: 180, endAngle: 0, cx: '50%', cy: '70%' };
    case 'full':
    default:
      return { startAngle: 90, endAngle: -270, cx: '50%', cy: '50%' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Style definitions — scoped to the chart's unique id
// ─────────────────────────────────────────────────────────────────────────────

/** Diagonal color gradient applied to every radial bar, one per config key. */
const ColorGradientStyle = ({
  config,
  chartId,
}: {
  config: ChartConfig;
  chartId: string;
}) => {
  return (
    <>
      {Object.entries(config).map(([dataKey, colorConfig]) => {
        const colorsCount = getColorsCount(colorConfig);

        return (
          <linearGradient
            key={`${chartId}-radial-colors-${dataKey}`}
            id={`${chartId}-radial-colors-${dataKey}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            {colorsCount === 1 ? (
              <>
                <stop offset="0%" stopColor={`var(--color-${dataKey}-0)`} />
                <stop offset="100%" stopColor={`var(--color-${dataKey}-0)`} />
              </>
            ) : (
              Array.from({ length: colorsCount }, (_, index) => {
                const offset = `${(index / (colorsCount - 1)) * 100}%`;
                return (
                  <stop
                    key={offset}
                    offset={offset}
                    stopColor={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`}
                  />
                );
              })
            )}
          </linearGradient>
        );
      })}
    </>
  );
};

/** Soft outer-glow SVG filter, one per glowing bar. */
const GlowFilterStyle = ({
  chartId,
  glowingBars,
}: {
  chartId: string;
  glowingBars: string[];
}) => {
  return (
    <>
      {glowingBars.map((barName) => (
        <filter
          key={`${chartId}-radial-glow-${barName}`}
          id={`${chartId}-radial-glow-${barName}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      ))}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

// Builds random skeleton rows with values between 40 and 100
function generateLoadingData() {
  return Array.from({ length: LOADING_BARS }, (_, i) => ({
    name: `loading${i}`,
    value: 40 + Math.random() * 60,
  }));
}

// Hook to animate the loading skeleton data at fixed intervals
function useLoadingData(isLoading: boolean) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, LOADING_ANIMATION_DURATION);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Regenerate skeleton data whenever the interval ticks
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadingData = useMemo(() => generateLoadingData(), [tick]);

  return loadingData;
}

/**
 * The skeleton bar shown while the chart is loading. Rendered by the root in
 * place of the real <RadialBar />, with animated values and a muted fill.
 */
const LoadingRadialBar = () => {
  return (
    <RechartsRadialBar
      dataKey="value"
      cornerRadius={DEFAULT_CORNER_RADIUS}
      barSize={DEFAULT_BAR_SIZE}
      background
      isAnimationActive
      animationDuration={LOADING_ANIMATION_DURATION}
      animationEasing="ease-in-out"
      shape={(props: SectorProps) => (
        <Sector {...props} fill="currentColor" fillOpacity={0.25} />
      )}
    />
  );
};
```

        ### Now, Let's add the chart component to your project.

          These Components are required by the chart component to render the chart. Make a folder called `ui` inside the `evilcharts` folder and paste the code there.

          Below is main chart component.


          ### components/evilcharts/ui/chart.tsx

```tsx
'use client';

import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';
import * as React from 'react';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

type ThemeKey = keyof typeof THEMES;

// All Keys are optional at first
type ThemeColorsBase = {
  [K in ThemeKey]?: string[];
};

// Require at least one theme key
type AtLeastOneThemeColor = {
  [K in ThemeKey]: Required<Pick<ThemeColorsBase, K>> &
    Partial<Omit<ThemeColorsBase, K>>;
}[ThemeKey];

const VALID_THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

// Validation for chart config colors at runtime
function validateChartConfigColors(config: ChartConfig): void {
  for (const [key, value] of Object.entries(config)) {
    if (value.colors) {
      const hasValidThemeKey = VALID_THEME_KEYS.some(
        (themeKey) => value.colors?.[themeKey] !== undefined,
      );

      if (!hasValidThemeKey) {
        throw new Error(
          `[EvilCharts] Invalid chart config for "${key}": colors object must have at least one theme key (${VALID_THEME_KEYS.join(', ')}). Received empty object or invalid keys.`,
        );
      }
    }
  }
}

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    colors?: AtLeastOneThemeColor;
  }
>;

interface ChartContextProps {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

interface ChartContainerProps
  extends
    Omit<React.ComponentProps<'div'>, 'children'>,
    Pick<
      React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>,
      | 'initialDimension'
      | 'aspect'
      | 'debounce'
      | 'minHeight'
      | 'minWidth'
      | 'maxHeight'
      | 'height'
      | 'width'
      | 'onResize'
      | 'children'
    > {
  config: ChartConfig;
  innerResponsiveContainerStyle?: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['style'];
  /** Optional content rendered below the chart (e.g. EvilBrush) */
  footer?: React.ReactNode;
}

function ChartContainer({
  id,
  config,
  initialDimension = { width: 320, height: 200 },
  className,
  children,
  footer,
  ...props
}: Readonly<ChartContainerProps>) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;

  // Validate chart config at runtime
  validateChartConfigColors(config);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          'min-h-0 w-full flex-1',
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border relative flex flex-col justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          !footer && 'aspect-video',
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          className="min-h-0 w-full flex-1"
          initialDimension={initialDimension}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
        {footer}
      </div>
    </ChartContext.Provider>
  );
}

function LoadingIndicator({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="text-primary bg-background flex items-center justify-center gap-2 rounded-md border px-2 py-0.5 text-sm">
        <div className="border-border border-t-primary h-3 w-3 animate-spin rounded-full border" />
        <span>Loading</span>
      </div>
    </div>
  );
}

// Distribute colors evenly across slots, extra slots go to last color(s)
// Example: 2 colors for 4 slots → [red, red, pink, pink]
// Example: 3 colors for 4 slots → [red, pink, blue, blue]
function distributeColors(colorsArray: string[], maxCount: number): string[] {
  const availableCount = colorsArray.length;
  if (availableCount >= maxCount) {
    return colorsArray.slice(0, maxCount);
  }

  const result: string[] = [];
  const baseSlots = Math.floor(maxCount / availableCount);
  const extraSlots = maxCount % availableCount;

  // First (availableCount - extraSlots) colors get baseSlots each
  // Last extraSlots colors get (baseSlots + 1) each
  for (let colorIdx = 0; colorIdx < availableCount; colorIdx++) {
    const isExtraColor = colorIdx >= availableCount - extraSlots;
    const slotsForThisColor = baseSlots + (isExtraColor ? 1 : 0);
    for (let j = 0; j < slotsForThisColor; j++) {
      result.push(colorsArray[colorIdx]);
    }
  }

  return result;
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.colors,
  );

  if (!colorConfig.length) {
    return null;
  }

  const generateCssVars = (theme: keyof typeof THEMES) =>
    colorConfig
      .flatMap(([key, itemConfig]) => {
        const colorsArray = itemConfig.colors?.[theme];
        if (
          !colorsArray ||
          !Array.isArray(colorsArray) ||
          colorsArray.length === 0
        ) {
          return [];
        }

        // Get max count across all themes for this key
        const maxCount = getColorsCount(itemConfig);

        // Distribute colors evenly across all required slots
        const distributedColors = distributeColors(colorsArray, maxCount);

        return distributedColors.map(
          (color, index) => `  --color-${key}-${index}: ${color};`,
        );
      })
      .filter(Boolean)
      .join('\n');

  const css = Object.entries(THEMES)
    .map(
      ([theme, prefix]) =>
        `${prefix} [data-chart=${id}] {\n${generateCssVars(theme as keyof typeof THEMES)}\n}`,
    )
    .join('\n');

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

// Helper to extract item config from a payload.
export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

// Format values to percent for expanded charts
function axisValueToPercentFormatter(value: number) {
  return `${Math.round(value * 100).toFixed(0)}%`;
}

// Get max colors count across all themes for a config entry
function getColorsCount(config: ChartConfig[string]): number {
  if (!config.colors) return 1;
  const counts = VALID_THEME_KEYS.map(
    (theme) => config.colors?.[theme]?.length ?? 0,
  );
  return Math.max(...counts, 1);
}

// Generate random loading data for skeleton/loading state
// min/max represent percentage of the range (0-100), defaults to 20-80 for realistic look
export const getLoadingData = (
  points: number = 10,
  min: number = 0,
  max: number = 70,
) => {
  const range = max - min;
  return Array.from({ length: points }, () => ({
    loading: Math.floor(Math.random() * range) + min,
  }));
};

export {
  ChartContainer,
  ChartStyle,
  axisValueToPercentFormatter,
  LoadingIndicator,
  getColorsCount,
};
```

        ### Now, We need to add sub components.

          Create a file called `tooltip.tsx` inside the `evilcharts/ui` folder and paste the code there.


          ### components/evilcharts/ui/tooltip.tsx

```tsx
import {
  getPayloadConfigFromPayload,
  getColorsCount,
  useChart,
} from '@/components/evilcharts/ui/chart';
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';
import * as React from 'react';

type TooltipRoundness = 'sm' | 'md' | 'lg' | 'xl';
type TooltipVariant = 'default' | 'frosted-glass';

const roundnessMap: Record<TooltipRoundness, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

const variantMap: Record<TooltipVariant, string> = {
  default: 'bg-background',
  'frosted-glass': 'bg-background/70 backdrop-blur-sm',
};

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  nameKey,
  labelKey,
  selected,
  roundness = 'lg',
  variant = 'default',
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
    selected?: string | null;
    roundness?: TooltipRoundness;
    variant?: TooltipVariant;
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<ValueType, NameType>,
    'accessibilityLayer'
  >) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string'
        ? (config[label]?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    // Empty tooltip - to prevent position getting 0.0 so it doesnt animate tooltip every time from 0.0 origin
    return <span className="p-4" />;
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        'border-border/50 grid min-w-32 items-start gap-1.5 border px-2.5 py-1.5 text-xs shadow-xl',
        roundnessMap[roundness],
        variantMap[variant],
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== 'none')
          .map((item, index) => {
            // For pie charts, item.name contains the sector name (e.g., "chrome")
            // For radial charts, the name is in item.payload[nameKey]
            // For other charts, item.name or item.dataKey contains the series name
            const payloadName =
              nameKey && item.payload
                ? (item.payload as Record<string, unknown>)[nameKey]
                : undefined;
            const key = `${payloadName ?? item.name ?? item.dataKey ?? 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);

            // Get colors count for this item to determine gradient vs solid
            const colorsCount = itemConfig ? getColorsCount(itemConfig) : 1;

            return (
              <div
                key={index}
                className={cn(
                  '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
                  indicator === 'dot' && 'items-center',
                  selected != null && selected !== item.dataKey && 'opacity-30',
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn('shrink-0 rounded-[2px]', {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent!':
                              indicator === 'dashed',
                            'my-0.5': nestLabel && indicator === 'dashed',
                          })}
                          style={getIndicatorColorStyle(key, colorsCount)}
                        />
                      )
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between gap-4 leading-none',
                        nestLabel ? 'items-end' : 'items-center',
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value != null && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {typeof item.value === 'number'
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function getIndicatorColorStyle(
  dataKey: string,
  colorsCount: number,
): React.CSSProperties {
  if (colorsCount <= 1) {
    return { background: `var(--color-${dataKey}-0)` };
  }

  // Multiple colors: create linear gradient with evenly distributed stops
  const stops = Array.from({ length: colorsCount }, (_, index) => {
    const offset = (index / (colorsCount - 1)) * 100;
    return `var(--color-${dataKey}-${index}) ${offset}%`;
  }).join(', ');

  return { background: `linear-gradient(to right, ${stops})` };
}

const ChartTooltip = ({
  animationDuration = 200,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) => (
  <RechartsPrimitive.Tooltip animationDuration={animationDuration} {...props} />
);

export { ChartTooltip, ChartTooltipContent };
export type { TooltipRoundness, TooltipVariant };
```

          Now, create another file called `legend.tsx` inside the `evilcharts/ui` folder and paste the code there.


          ### components/evilcharts/ui/legend.tsx

```tsx
import {
  getPayloadConfigFromPayload,
  getColorsCount,
  useChart,
} from '@/components/evilcharts/ui/chart';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';
import * as React from 'react';

type ChartLegendVariant =
  | 'square'
  | 'circle'
  | 'circle-outline'
  | 'rounded-square'
  | 'rounded-square-outline'
  | 'vertical-bar'
  | 'horizontal-bar';

function ChartLegendContent({
  className,
  hideIcon = false,
  nameKey,
  payload,
  verticalAlign,
  align = 'right',
  selected,
  onSelectChange,
  isClickable,
  variant = 'rounded-square',
}: React.ComponentProps<'div'> & {
  hideIcon?: boolean;
  nameKey?: string;
  selected?: string | null;
  isClickable?: boolean;
  onSelectChange?: (selected: string | null) => void;
  variant?: ChartLegendVariant;
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 select-none',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        verticalAlign === 'top' ? 'pb-4' : 'pt-4',
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== 'none')
        .map((item) => {
          // For pie charts, item.value contains the sector name (e.g., "chrome")
          // For radial charts, the name is in item.payload[nameKey]
          // For other charts, item.dataKey contains the series name (e.g., "desktop")
          const payloadName =
            nameKey && item.payload
              ? (item.payload as Record<string, unknown>)[nameKey]
              : undefined;
          const key = `${payloadName ?? item.value ?? item.dataKey ?? 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const isSelected = selected === null || selected === key;

          // Get colors count for this item to determine gradient vs solid
          const colorsCount = itemConfig ? getColorsCount(itemConfig) : 1;

          return (
            <div
              key={key}
              className={cn(
                '[&>svg]:text-muted-foreground flex items-center gap-1.5 transition-opacity [&>svg]:h-3 [&>svg]:w-3',
                !isSelected && 'opacity-30',
                isClickable && 'cursor-pointer',
              )}
              onClick={() => {
                if (!isClickable) return;

                onSelectChange?.(selected === key ? null : key);
              }}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <LegendIndicator
                  variant={variant}
                  dataKey={key}
                  colorsCount={colorsCount}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend indicator — each variant gets its own branch so future variants
// can diverge freely in markup & style.
// ---------------------------------------------------------------------------

function LegendIndicator({
  variant,
  dataKey,
  colorsCount,
}: {
  variant: ChartLegendVariant;
  dataKey: string;
  colorsCount: number;
}) {
  const fillStyle = getLegendFillStyle(dataKey, colorsCount);
  const outlineStyle = getLegendOutlineStyle(dataKey, colorsCount);

  switch (variant) {
    case 'square':
      return <div className="h-2 w-2 shrink-0" style={fillStyle} />;

    case 'circle':
      return (
        <div className="h-2 w-2 shrink-0 rounded-full" style={fillStyle} />
      );

    case 'circle-outline':
      return (
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full p-[1.5px]"
          style={outlineStyle}
        />
      );

    case 'vertical-bar':
      return (
        <div className="h-3 w-1 shrink-0 rounded-[2px]" style={fillStyle} />
      );

    case 'horizontal-bar':
      return (
        <div className="h-1 w-3 shrink-0 rounded-[2px]" style={fillStyle} />
      );

    case 'rounded-square-outline':
      return (
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[3px] p-[1.5px]"
          style={outlineStyle}
        />
      );

    case 'rounded-square':
    default:
      return (
        <div className="h-2 w-2 shrink-0 rounded-[2px]" style={fillStyle} />
      );
  }
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

/** Solid fill / gradient background for filled variants. */
function getLegendFillStyle(
  dataKey: string,
  colorsCount: number,
): React.CSSProperties {
  if (colorsCount <= 1) {
    return { backgroundColor: `var(--color-${dataKey}-0)` };
  }

  const stops = Array.from({ length: colorsCount }, (_, i) => {
    const offset = (i / (colorsCount - 1)) * 100;
    return `var(--color-${dataKey}-${i}) ${offset}%`;
  }).join(', ');

  return { background: `linear-gradient(to right, ${stops})` };
}

/**
 * Outline style for stroke variants.
 * Uses background + mask-composite to punch out the center, leaving only the
 * "border" visible. Works with both solid colors and gradients, and respects
 * border-radius — unlike plain `border-color`.
 */
function getLegendOutlineStyle(
  dataKey: string,
  colorsCount: number,
): React.CSSProperties {
  const maskStyle: React.CSSProperties = {
    WebkitMask:
      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
  };

  if (colorsCount <= 1) {
    return {
      backgroundColor: `var(--color-${dataKey}-0)`,
      ...maskStyle,
    };
  }

  const stops = Array.from({ length: colorsCount }, (_, i) => {
    const offset = (i / (colorsCount - 1)) * 100;
    return `var(--color-${dataKey}-${i}) ${offset}%`;
  }).join(', ');

  return {
    background: `linear-gradient(to right, ${stops})`,
    ...maskStyle,
  };
}

const ChartLegend = RechartsPrimitive.Legend;

export { ChartLegend, ChartLegendContent, type ChartLegendVariant };
```

## Usage

The radial chart is composible. `<EvilRadialChart>` is the container, and you compose only the parts you need — `<Legend>`, `<Tooltip>`, and a `<RadialBar>` — as its children. The `<RadialBar>` carries its own `glowingBars` and `isClickable`, so styling and interactivity live with the series itself.

```tsx
import {
  EvilRadialChart,
  RadialBar,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radial-chart';
```

```tsx
const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
];

const chartConfig = {
  chrome: {
    label: 'Chrome',
    colors: { light: ['#3b82f6'], dark: ['#60a5fa'] },
  },
  safari: {
    label: 'Safari',
    colors: { light: ['#10b981'], dark: ['#34d399'] },
  },
  firefox: {
    label: 'Firefox',
    colors: { light: ['#f59e0b'], dark: ['#fbbf24'] },
  },
} satisfies ChartConfig;
```

```tsx
<EvilRadialChart
  data={data}
  nameKey="browser"
  config={chartConfig}
  variant="full"
>
  <Legend isClickable />
  <Tooltip />
  <RadialBar dataKey="visitors" isClickable glowingBars={['chrome']} />
</EvilRadialChart>
```

### Interactive Selection

Add `isClickable` to `<RadialBar>` (and to `<Legend>`) to make bars selectable. Use the `onSelectionChange` callback on `<EvilRadialChart>` to handle selection events:

```tsx
<EvilRadialChart
  data={data}
  nameKey="browser"
  config={chartConfig}
  onSelectionChange={(selection) => {
    if (selection) {
      console.log('Selected:', selection.dataKey, 'Value:', selection.value);
    } else {
      console.log('Deselected');
    }
  }}
>
  <Legend isClickable />
  <Tooltip />
  <RadialBar dataKey="visitors" isClickable />
</EvilRadialChart>
```

### Loading State

### isLoading='true'

```tsx
'use client';

import {
  EvilRadialChart,
  RadialBar,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radial-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
];

const chartConfig = {
  chrome: {
    label: 'Chrome',
    colors: {
      light: ['#3b82f6'],
      dark: ['#60a5fa'],
    },
  },
  safari: {
    label: 'Safari',
    colors: {
      light: ['#10b981'],
      dark: ['#34d399'],
    },
  },
  firefox: {
    label: 'Firefox',
    colors: {
      light: ['#f59e0b'],
      dark: ['#fbbf24'],
    },
  },
  edge: {
    label: 'Edge',
    colors: {
      light: ['#8b5cf6'],
      dark: ['#a78bfa'],
    },
  },
  other: {
    label: 'Other',
    colors: {
      light: ['#6b7280'],
      dark: ['#9ca3af'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadialChart() {
  return (
    <EvilRadialChart
      className="h-full w-full p-4"
      data={data}
      nameKey="browser"
      config={chartConfig}
      isLoading // [!code highlight]
    >
      <Legend />
      <Tooltip />
      <RadialBar dataKey="visitors" />
    </EvilRadialChart>
  );
}
```

>

    The radial chart supports loading state with a placeholder animation. You can pass the `isLoading` prop to the chart to show the loading state while your data is being fetched.

## Examples

Below are some examples of the radial chart with different configurations. You can customize the `variant`, `innerRadius`, `outerRadius`, and other properties.

### Semi-Circle Variant

### variant='semi'

```tsx
'use client';

import {
  EvilRadialChart,
  RadialBar,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radial-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
];

const chartConfig = {
  chrome: {
    label: 'Chrome',
    colors: {
      light: ['#3b82f6'],
      dark: ['#60a5fa'],
    },
  },
  safari: {
    label: 'Safari',
    colors: {
      light: ['#10b981'],
      dark: ['#34d399'],
    },
  },
  firefox: {
    label: 'Firefox',
    colors: {
      light: ['#f59e0b'],
      dark: ['#fbbf24'],
    },
  },
  edge: {
    label: 'Edge',
    colors: {
      light: ['#8b5cf6'],
      dark: ['#a78bfa'],
    },
  },
  other: {
    label: 'Other',
    colors: {
      light: ['#6b7280'],
      dark: ['#9ca3af'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadialChart() {
  return (
    <EvilRadialChart
      className="h-full w-full p-4"
      data={data}
      nameKey="browser"
      config={chartConfig}
      variant="semi" // [!code highlight]
    >
      <Legend />
      <Tooltip />
      <RadialBar dataKey="visitors" />
    </EvilRadialChart>
  );
}
```

>

    Set `variant="semi"` to create a half-circle radial chart. This is useful for displaying progress or gauges in a more compact space.

### Gradient Colors

### gradient colors

```tsx
'use client';

import {
  EvilRadialChart,
  RadialBar,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radial-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
];

const chartConfig = {
  chrome: {
    label: 'Chrome',
    colors: {
      light: ['#ff6b6b', '#feca57', '#48dbfb'], // Coral -> Gold -> Electric Blue // [!code highlight]
      dark: ['#ff7979', '#ffeaa7', '#74b9ff'], // [!code highlight]
    },
  },
  safari: {
    label: 'Safari',
    colors: {
      light: ['#a29bfe', '#fd79a8', '#fdcb6e'], // Lavender -> Pink -> Sunflower // [!code highlight]
      dark: ['#b8b5ff', '#ff9ff3', '#ffeaa7'], // [!code highlight]
    },
  },
  firefox: {
    label: 'Firefox',
    colors: {
      light: ['#00d2d3', '#54a0ff', '#5f27cd'], // Turquoise -> Blue -> Purple // [!code highlight]
      dark: ['#01e2e3', '#74b9ff', '#7c3aed'], // [!code highlight]
    },
  },
  edge: {
    label: 'Edge',
    colors: {
      light: ['#ff9f43', '#ee5a24', '#b71540'], // Tangerine -> Vermillion -> Wine // [!code highlight]
      dark: ['#ffbe76', '#f0932b', '#e74c3c'], // [!code highlight]
    },
  },
  other: {
    label: 'Other',
    colors: {
      light: ['#1dd1a1', '#10ac84', '#01a3a4'], // Mint -> Jungle -> Teal // [!code highlight]
      dark: ['#55efc4', '#00b894', '#00cec9'], // [!code highlight]
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadialChart() {
  return (
    <EvilRadialChart
      className="h-full w-full p-4"
      data={data}
      nameKey="browser"
      config={chartConfig}
    >
      <Legend />
      <Tooltip />
      <RadialBar dataKey="visitors" />
    </EvilRadialChart>
  );
}
```

### Glowing Bars

### glowingBars={['chrome', 'safari']}

```tsx
'use client';

import {
  EvilRadialChart,
  RadialBar,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radial-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
];

const chartConfig = {
  chrome: {
    label: 'Chrome',
    colors: {
      light: ['#3b82f6'],
      dark: ['#60a5fa'],
    },
  },
  safari: {
    label: 'Safari',
    colors: {
      light: ['#10b981'],
      dark: ['#34d399'],
    },
  },
  firefox: {
    label: 'Firefox',
    colors: {
      light: ['#f59e0b'],
      dark: ['#fbbf24'],
    },
  },
  edge: {
    label: 'Edge',
    colors: {
      light: ['#8b5cf6'],
      dark: ['#a78bfa'],
    },
  },
  other: {
    label: 'Other',
    colors: {
      light: ['#6b7280'],
      dark: ['#9ca3af'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadialChart() {
  return (
    <EvilRadialChart
      className="h-full w-full p-4"
      data={data}
      nameKey="browser"
      config={chartConfig}
    >
      <Legend />
      <Tooltip />
      <RadialBar
        dataKey="visitors"
        glowingBars={['chrome', 'safari']} // [!code highlight]
      />
    </EvilRadialChart>
  );
}
```

>

    Add a subtle glow effect to specific bars using the `glowingBars` prop on `<RadialBar>`. Pass an array of bar names (the values from your `nameKey` field) to specify which bars should glow.

## API Reference

The chart is composed of several parts. The props below are grouped by the component they belong to.

<ApiHeading>EvilRadialChart</ApiHeading>

The root container. It owns the data, the shared selection state, the loading skeleton, and the chart-wide arc shape. Everything visual is composed as its children.

### `data` (required)

type: `TData[]`

Data used to display the chart. An array of objects where each object represents a radial bar (`TData extends Record<string, unknown>`).

### `config` (required)

type: `ChartConfig`

Configuration object that defines the chart's bars. Each key should match a value from your `nameKey` field, with corresponding colors.

### `nameKey` (required)

type: `keyof TData & string`

The key from your data objects to use for bar names (typically string values used for labels and the legend).

### `children` (required)

type: `ReactNode`

The composed chart parts — `<Legend />`, `<Tooltip />`, and a `<RadialBar />`.

### `className`

type: `string`

Additional CSS classes to apply to the chart container.

### `variant`

type: `"full" | "semi"` · default: `"full"`

The arc shape of the radial chart. `"full"` displays a full circle (360°), `"semi"` displays a half circle (180°).

### `innerRadius`

type: `number | string` · default: `"30%"`

The inner radius of the radial bars. Can be a number (pixels) or percentage string.

### `outerRadius`

type: `number | string` · default: `"100%"`

The outer radius of the radial bars. Can be a number (pixels) or percentage string.

### `defaultSelectedDataKey`

type: `string | null` · default: `null`

The bar name that should be selected by default.

### `onSelectionChange`

void">
Callback fired when a bar is selected or deselected — by clicking a clickable `<RadialBar />` or `<Legend />` entry. Receives an object with `dataKey` (bar name) and `value` (bar value), or `null` when deselected.

### `isLoading`

type: `boolean` · default: `false`

Shows a loading placeholder animation when data is being fetched.

### `backgroundVariant`

type: `BackgroundVariant`

Background pattern variant to display behind the chart.

### `chartProps`

">
Additional props forwarded to the underlying Recharts RadialBarChart component. Read the [Recharts RadialBarChart documentation](https://recharts.github.io/en-US/api/RadialBarChart/) for available props.

<ApiHeading>RadialBar</ApiHeading>

The radial bar series. Each data row becomes one bar. It generates its own glow filter definitions, so glow effects never collide with other charts on the page.

### `dataKey` (required)

type: `string`

The key from your data objects to use for bar values (typically numeric values that determine bar size).

### `cornerRadius`

type: `number` · default: `5`

The border radius for the corners of each bar in pixels.

### `barSize`

type: `number` · default: `14`

The thickness of each radial bar in pixels.

### `showBackground`

type: `boolean` · default: `true`

Whether to render the background track (the unfilled portion of each bar).

### `isClickable`

type: `boolean` · default: `false`

Enables interactive clicking on bars to select/deselect them. Unselected bars dim while a selection is active.

### `glowingBars`

type: `string[]` · default: `[]`

Array of bar names (values from your `nameKey` field) that should have a glowing effect applied. Creates a smooth outer glow around the specified bars.

### `radialBarProps`

, "dataKey">'>
Additional props forwarded to the underlying Recharts RadialBar component. Read the [Recharts RadialBar documentation](https://recharts.github.io/en-US/api/RadialBar/) for available props.

<ApiHeading>Tooltip</ApiHeading>

The hover tooltip. Labels each bar by its name. Render it to show a tooltip, omit it for none.

### `variant`

type: `"default" | "frosted-glass"` · default: `"default"`

Controls the visual style of the tooltip.

### `roundness`

type: `"sm" | "md" | "lg" | "xl"` · default: `"lg"`

Controls the border-radius of the tooltip.

### `defaultIndex`

type: `number`

When set, the tooltip will be visible by default at the specified data point index.

<ApiHeading>Legend</ApiHeading>

The bar legend. When `isClickable` is set, each entry toggles selection of its bar. Render it to show a legend, omit it for none.

### `variant`

type: `"square" | "circle" | "circle-outline" | "rounded-square" | "rounded-square-outline" | …`

The visual style variant for the legend indicators.

### `align`

type: `"left" | "center" | "right"` · default: `"center"`

Horizontal placement of the legend.

### `verticalAlign`

type: `"top" | "middle" | "bottom"` · default: `"bottom"`

Vertical placement of the legend.

### `isClickable`

type: `boolean` · default: `false`

When enabled, each legend entry toggles selection of its bar, driving the shared selection state read by `<RadialBar />`.
