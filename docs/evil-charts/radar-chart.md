---
title: Radar Chart
description: Beautiful radar charts with filled and lines variants, gradient colors, and glow effects
image: /og/radar-chart.png
links:
  github: https://github.com/legions-developer/evilcharts/blob/main/src/registry/charts/radar-chart.tsx
  doc: https://recharts.github.io/en-US/examples/SimpleRadarChart
  api: https://recharts.github.io/en-US/api/RadarChart
---

### Basic Chart

```tsx
'use client';

import {
  EvilRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  Legend,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/radar-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { skill: 'JavaScript', desktop: 186, mobile: 80 },
  { skill: 'TypeScript', desktop: 305, mobile: 200 },
  { skill: 'React', desktop: 237, mobile: 120 },
  { skill: 'Node.js', desktop: 173, mobile: 190 },
  { skill: 'CSS', desktop: 209, mobile: 130 },
  { skill: 'Python', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#3b82f6'],
      dark: ['#60a5fa'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#10b981'],
      dark: ['#34d399'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadarChart() {
  return (
    <EvilRadarChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="skill" />
      <Legend isClickable />
      <Tooltip />
      <Radar
        dataKey="desktop"
        variant="filled" // [!code highlight]
        isClickable
      >
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Radar>
      <Radar dataKey="mobile" variant="filled" isClickable>
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Radar>
    </EvilRadarChart>
  );
}
```

## Installation

    ### npm

```bash
npx shadcn@latest add @evilcharts/radar-chart
```

### yarn

```bash
yarn shadcn@latest add @evilcharts/radar-chart
```

### bun

```bash
bunx --bun shadcn@latest add @evilcharts/radar-chart
```

### pnpm

```bash
pnpm dlx shadcn@latest add @evilcharts/radar-chart
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
          Then, copy the following base radar-chart code into a new file in that folder.


          ### components/evilcharts/charts/radar-chart.tsx

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
import { ChartDot, type DotVariant } from '@/components/evilcharts/ui/dot';
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  PolarAngleAxis as RechartsPolarAngleAxis,
  PolarGrid as RechartsPolarGrid,
  PolarRadiusAxis as RechartsPolarRadiusAxis,
  Radar as RechartsRadar,
  RadarChart as RechartsRadarChart,
} from 'recharts';

// Constants
const STROKE_WIDTH = 1;
const DEFAULT_FILL_OPACITY = 0.3;
const LOADING_POINTS = 6;
const LOADING_ANIMATION_DURATION = 1500; // in milliseconds
const LOADING_RADAR_DATA_KEY = 'value';

type RadarVariant = 'filled' | 'lines';

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared state for every part of the chart. Lifted into <EvilRadarChart /> so that
 * <Radar />, <PolarAngleAxis />, <Legend />, and friends can read it without prop
 * drilling. Sub-components are composed freely — the provider is the single source
 * of truth.
 */
type RadarChartContextValue = {
  config: ChartConfig; // colors + labels for every series
  isLoading: boolean; // whether the chart shows its loading skeleton
  selectedDataKey: string | null; // currently selected series, or null when none
  selectDataKey: (dataKey: string | null) => void; // sets the selected series
};

const RadarChartContext = createContext<RadarChartContextValue | null>(null);

// Reads the chart context, throwing a helpful error when used outside <EvilRadarChart />
function useRadarChart() {
  const context = use(RadarChartContext);

  if (!context) {
    throw new Error(
      'Radar chart parts (<Radar />, <PolarAngleAxis />, …) must be used within <EvilRadarChart />',
    );
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container
// ─────────────────────────────────────────────────────────────────────────────

// Validates that every config key also exists on the data row type
type ValidateConfigKeys<TData, TConfig> = {
  [K in keyof TConfig]: K extends keyof TData ? ChartConfig[string] : never;
};

type EvilRadarChartBaseProps<
  TData extends Record<string, unknown>,
  TConfig extends Record<string, ChartConfig[string]>,
> = {
  config: TConfig & ValidateConfigKeys<TData, TConfig>; // series colors + labels
  data: TData[]; // rows rendered by the chart
  children: ReactNode; // composed parts — <Radar />, <PolarGrid />, <Legend />, …
  className?: string; // extra classes for the chart container
  chartProps?: ComponentProps<typeof RechartsRadarChart>; // escape hatch for the raw Recharts chart
  backgroundVariant?: BackgroundVariant; // background pattern drawn behind the chart
  defaultSelectedDataKey?: string | null; // series selected on first render
  onSelectionChange?: (selectedDataKey: string | null) => void; // fires when the selected series changes
  isLoading?: boolean; // shows the animated loading skeleton
  loadingPoints?: number; // number of points in the loading skeleton
};

type EvilRadarChartProps<
  TData extends Record<string, unknown>,
  TConfig extends Record<string, ChartConfig[string]>,
> = EvilRadarChartBaseProps<TData, TConfig>;

/**
 * Root of the composible radar chart. Owns the data, the shared context, and the
 * loading skeleton. Everything visual — the polar grid, axes, tooltip, legend, and
 * the radars themselves — is composed as children, so a consumer renders exactly
 * the parts they need.
 */
export function EvilRadarChart<
  TData extends Record<string, unknown>,
  TConfig extends Record<string, ChartConfig[string]>,
>({
  config,
  data,
  children,
  className,
  chartProps,
  backgroundVariant,
  defaultSelectedDataKey = null,
  onSelectionChange,
  isLoading = false,
  loadingPoints,
}: EvilRadarChartProps<TData, TConfig>) {
  const chartId = useId().replace(/:/g, ''); // colon-free id keeps CSS/SVG selectors valid
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(
    defaultSelectedDataKey,
  );
  const loadingData = useLoadingData(isLoading, loadingPoints);

  // Updates selection state and notifies the parent
  const selectDataKey = useCallback(
    (newSelectedDataKey: string | null) => {
      setSelectedDataKey(newSelectedDataKey);
      onSelectionChange?.(newSelectedDataKey);
    },
    [onSelectionChange],
  );

  const contextValue = useMemo<RadarChartContextValue>(
    () => ({
      config,
      isLoading,
      selectedDataKey,
      selectDataKey,
    }),
    [config, isLoading, selectedDataKey, selectDataKey],
  );

  return (
    <RadarChartContext value={contextValue}>
      <ChartContainer className={className} config={config}>
        <LoadingIndicator isLoading={isLoading} />
        <RechartsRadarChart
          id={chartId}
          data={isLoading ? loadingData : data}
          {...chartProps}
        >
          {backgroundVariant && <ChartBackground variant={backgroundVariant} />}
          {children}
          {isLoading && <LoadingRadar />}
        </RechartsRadarChart>
      </ChartContainer>
    </RadarChartContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type RadarProps = {
  dataKey: string; // series key — must exist on the data and config
  variant?: RadarVariant; // fill style for this radar only
  fillOpacity?: number; // opacity of the filled area when `variant="filled"`
  isGlowing?: boolean; // adds a soft outer glow around this radar
  isClickable?: boolean; // lets this radar be selected by clicking it
  children?: ReactNode; // optional <Dot /> and <ActiveDot /> composition
  radarProps?: Omit<ComponentProps<typeof RechartsRadar>, 'dataKey'>; // escape hatch for raw Recharts Radar props
};

/**
 * A single radar series. Each <Radar /> is fully self-contained: it generates its
 * own stroke/fill gradients and glow filter under a unique id, so any number of
 * radars — each with its own variant, opacity, and clickability — can live in one
 * chart without style collisions. Compose <Dot /> and <ActiveDot /> inside it to
 * add point markers.
 */
export function Radar({
  dataKey,
  variant = 'filled',
  fillOpacity = DEFAULT_FILL_OPACITY,
  isGlowing = false,
  isClickable = false,
  children,
  radarProps,
}: RadarProps) {
  const { config, isLoading, selectedDataKey, selectDataKey } = useRadarChart();
  const id = useId().replace(/:/g, ''); // unique id scopes this radar's style defs

  // The root renders the skeleton radar while loading, so real radars step aside
  if (isLoading) return null;

  const isSelected = selectedDataKey === null || selectedDataKey === dataKey;
  const opacity = isClickable && !isSelected ? 0.2 : 1;
  const isFilled = variant === 'filled';

  const { dot, activeDot } = resolveDots(children, id, dataKey, opacity);

  return (
    <>
      <RechartsRadar
        dataKey={dataKey}
        stroke={`url(#${id}-radar-stroke-${dataKey})`}
        strokeOpacity={opacity}
        strokeWidth={STROKE_WIDTH}
        fill={isFilled ? `url(#${id}-radar-fill-${dataKey})` : 'none'}
        fillOpacity={isFilled ? fillOpacity * opacity : 0}
        dot={dot}
        activeDot={activeDot}
        filter={isGlowing ? `url(#${id}-radar-glow-${dataKey})` : undefined}
        className="transition-opacity duration-200"
        style={isClickable ? { cursor: 'pointer' } : undefined}
        onClick={() => {
          if (!isClickable) return;
          // Clicking the selected radar clears the selection, otherwise selects it
          selectDataKey(selectedDataKey === dataKey ? null : dataKey);
        }}
        {...radarProps}
      />
      <defs>
        <ColorGradient id={id} dataKey={dataKey} config={config} />
        <StrokeGradient id={id} dataKey={dataKey} config={config} />
        {isFilled && <FillGradient id={id} dataKey={dataKey} config={config} />}
        {isGlowing && <GlowFilter id={id} dataKey={dataKey} />}
      </defs>
    </>
  );
}

type DotProps = {
  variant?: DotVariant; // visual style of the point marker
};

/**
 * Declares a resting point marker for the <Radar /> it is composed inside.
 * It renders nothing on its own — the parent <Radar /> reads its variant and
 * wires it into the Recharts dot slot.
 */
export const Dot: FC<DotProps> = () => null;

/**
 * Declares the hovered/active point marker for the <Radar /> it is composed
 * inside. Like <Dot />, it is a configuration slot and renders nothing itself.
 */
export const ActiveDot: FC<DotProps> = () => null;

type PolarGridProps = ComponentProps<typeof RechartsPolarGrid>;

/**
 * The polar grid lines. Defaults to a dashed polygon grid and forwards every
 * Recharts PolarGrid prop, so `gridType`, `polarRadius`, etc. pass straight through.
 */
export function PolarGrid({
  gridType = 'polygon',
  stroke = 'currentColor',
  strokeOpacity = 0.2,
  strokeDasharray = '3 4',
  ...props
}: PolarGridProps) {
  return (
    <RechartsPolarGrid
      gridType={gridType}
      stroke={stroke}
      strokeOpacity={strokeOpacity}
      strokeDasharray={strokeDasharray}
      {...props}
    />
  );
}

type PolarAngleAxisProps = ComponentProps<typeof RechartsPolarAngleAxis>;

/**
 * The angular category axis — the labels around the chart's perimeter. Ships
 * with the chart's flat default styling and forwards every Recharts
 * PolarAngleAxis prop. Hidden automatically while the chart is loading.
 */
export function PolarAngleAxis({
  tick = { fill: 'currentColor', fontSize: 12 },
  tickLine = false,
  ...props
}: PolarAngleAxisProps) {
  const { isLoading } = useRadarChart();

  if (isLoading) return null;

  return <RechartsPolarAngleAxis tick={tick} tickLine={tickLine} {...props} />;
}

type PolarRadiusAxisProps = ComponentProps<typeof RechartsPolarRadiusAxis>;

/**
 * The radial value axis — the scale running from the center outward. Forwards
 * every Recharts PolarRadiusAxis prop. Hidden automatically while the chart is
 * loading.
 */
export function PolarRadiusAxis({
  tick = { fill: 'currentColor', fontSize: 10 },
  tickLine = false,
  axisLine = false,
  ...props
}: PolarRadiusAxisProps) {
  const { isLoading } = useRadarChart();

  if (isLoading) return null;

  return (
    <RechartsPolarRadiusAxis
      tick={tick}
      tickLine={tickLine}
      axisLine={axisLine}
      {...props}
    />
  );
}

type TooltipProps = {
  variant?: TooltipVariant; // visual style of the tooltip surface
  roundness?: TooltipRoundness; // border-radius of the tooltip
  defaultIndex?: number; // data index shown by default with no hover
};

/**
 * The hover tooltip. Reads the chart's selection from context so its content
 * dims unselected series. Hidden automatically while the chart is loading.
 */
export function Tooltip({ variant, roundness, defaultIndex }: TooltipProps) {
  const { isLoading, selectedDataKey } = useRadarChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={false}
      content={
        <ChartTooltipContent
          selected={selectedDataKey}
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
  isClickable?: boolean; // lets each entry toggle selection of its series
};

/**
 * The series legend. When `isClickable` is set, each entry toggles selection of
 * its series, driving the shared selection state read by every <Radar />.
 * Hidden automatically while the chart is loading.
 */
export function Legend({
  variant,
  align = 'center',
  verticalAlign = 'bottom',
  isClickable = false,
}: LegendProps) {
  const { isLoading, selectedDataKey, selectDataKey } = useRadarChart();

  if (isLoading) return null;

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedDataKey}
          onSelectChange={selectDataKey}
          isClickable={isClickable}
          variant={variant}
        />
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dot helpers
// ─────────────────────────────────────────────────────────────────────────────

type RadarDotProp = ComponentProps<typeof RechartsRadar>['dot'];
type RadarActiveDotProp = ComponentProps<typeof RechartsRadar>['activeDot'];

// Pulls <Dot /> and <ActiveDot /> out of a radar's children into Recharts dot slots
const resolveDots = (
  children: ReactNode,
  id: string,
  dataKey: string,
  dotOpacity: number,
): { dot: RadarDotProp; activeDot: RadarActiveDotProp } => {
  let dot: RadarDotProp = false;
  let activeDot: RadarActiveDotProp = false;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === Dot) {
      const { variant } = (child as ReactElement<DotProps>).props;
      dot = (
        <ChartDot
          type={variant}
          dataKey={dataKey}
          chartId={id}
          fillOpacity={dotOpacity}
        />
      );
    }

    if (child.type === ActiveDot) {
      const { variant } = (child as ReactElement<DotProps>).props;
      activeDot = (
        <ChartDot
          type={variant}
          dataKey={dataKey}
          chartId={id}
          fillOpacity={dotOpacity}
        />
      );
    }
  });

  return { dot, activeDot };
};

// ─────────────────────────────────────────────────────────────────────────────
// Style definitions — one set per <Radar />, scoped to its unique id
// ─────────────────────────────────────────────────────────────────────────────

type StyleProps = {
  id: string; // unique id of the owning <Radar />
  dataKey: string; // series key the styles belong to
  config: ChartConfig; // colors + labels for every series
};

type ColorStopsProps = {
  dataKey: string; // series key the stops belong to
  colorsCount: number; // number of color steps in the gradient
  opacities?: number[]; // optional per-stop opacity ramp
};

// Emits one <stop> per color, falling back to a flat gradient for single colors
const ColorStops = ({ dataKey, colorsCount, opacities }: ColorStopsProps) => {
  if (colorsCount === 1) {
    return (
      <>
        <stop
          offset="0%"
          stopColor={`var(--color-${dataKey}-0)`}
          stopOpacity={opacities?.[0]}
        />
        <stop
          offset="100%"
          stopColor={`var(--color-${dataKey}-0)`}
          stopOpacity={opacities?.[opacities.length - 1]}
        />
      </>
    );
  }

  return (
    <>
      {Array.from({ length: colorsCount }, (_, index) => {
        const offset = `${(index / (colorsCount - 1)) * 100}%`;
        return (
          <stop
            key={offset}
            offset={offset}
            stopColor={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`}
            stopOpacity={opacities?.[index]}
          />
        );
      })}
    </>
  );
};

/**
 * Horizontal left-to-right color gradient for a series. Always rendered — the
 * radar's dots paint from this single gradient.
 */
const ColorGradient = ({ id, dataKey, config }: StyleProps) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});

  return (
    <linearGradient id={`${id}-colors-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
      <ColorStops dataKey={dataKey} colorsCount={colorsCount} />
    </linearGradient>
  );
};

/** Diagonal color gradient used for the radar's outline stroke. */
const StrokeGradient = ({ id, dataKey, config }: StyleProps) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});

  return (
    <linearGradient
      id={`${id}-radar-stroke-${dataKey}`}
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >
      <ColorStops dataKey={dataKey} colorsCount={colorsCount} />
    </linearGradient>
  );
};

/** Radial color gradient used for the radar's filled area, fading toward the edge. */
const FillGradient = ({ id, dataKey, config }: StyleProps) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});
  const opacities =
    colorsCount === 1
      ? [0.8, 0.3]
      : Array.from({ length: colorsCount }, (_, i) => (i === 0 ? 0.8 : 0.3));

  return (
    <radialGradient
      id={`${id}-radar-fill-${dataKey}`}
      cx="50%"
      cy="50%"
      r="50%"
    >
      <ColorStops
        dataKey={dataKey}
        colorsCount={colorsCount}
        opacities={opacities}
      />
    </radialGradient>
  );
};

/** Soft outer glow filter applied to a radar when `isGlowing` is set. */
const GlowFilter = ({ id, dataKey }: Pick<StyleProps, 'id' | 'dataKey'>) => {
  return (
    <filter
      id={`${id}-radar-glow-${dataKey}`}
      x="-50%"
      y="-50%"
      width="200%"
      height="200%"
    >
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
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
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

// Builds a fresh set of randomized loading points for the skeleton radar
const generateLoadingData = (points: number) => {
  const categories = ['A', 'B', 'C', 'D', 'E', 'F'];

  return categories.slice(0, points).map((category) => ({
    skill: category,
    [LOADING_RADAR_DATA_KEY]: 30 + Math.random() * 70,
  }));
};

/**
 * Hook that regenerates the loading skeleton data on a fixed interval, so the
 * skeleton radar keeps animating between shapes while the chart is loading.
 */
export function useLoadingData(
  isLoading: boolean,
  loadingPoints: number = LOADING_POINTS,
) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, LOADING_ANIMATION_DURATION);

    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingData = useMemo(
    () => generateLoadingData(loadingPoints),
    // refreshKey toggle triggers re-computation each animation cycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingPoints, refreshKey],
  );

  return loadingData;
}

/**
 * The skeleton radar shown while the chart is loading. Rendered by the root in
 * place of the real radars, it animates between randomized shapes.
 */
const LoadingRadar = () => {
  return (
    <RechartsRadar
      dataKey={LOADING_RADAR_DATA_KEY}
      stroke="currentColor"
      strokeOpacity={0.3}
      strokeWidth={2}
      fill="currentColor"
      fillOpacity={0.1}
      dot={false}
      isAnimationActive
      animationDuration={LOADING_ANIMATION_DURATION}
      animationEasing="ease-in-out"
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

The radar chart is a composible compound component. `<EvilRadarChart />` is the root container — every visual part (`<PolarGrid />`, `<PolarAngleAxis />`, `<Tooltip />`, `<Legend />`, and the `<Radar />` series) is composed as a child, so you render exactly what you need.

```tsx
import {
  EvilRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  Legend,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/radar-chart';
```

```tsx
const data = [
  { skill: 'JavaScript', desktop: 186, mobile: 80 },
  { skill: 'TypeScript', desktop: 305, mobile: 200 },
  { skill: 'React', desktop: 237, mobile: 120 },
  { skill: 'Node.js', desktop: 173, mobile: 190 },
  { skill: 'CSS', desktop: 209, mobile: 130 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: { light: ['#3b82f6'], dark: ['#60a5fa'] },
  },
  mobile: {
    label: 'Mobile',
    colors: { light: ['#10b981'], dark: ['#34d399'] },
  },
} satisfies ChartConfig;

<EvilRadarChart data={data} config={chartConfig}>
  <PolarGrid />
  <PolarAngleAxis dataKey="skill" />
  <Legend />
  <Tooltip />
  <Radar dataKey="desktop" variant="filled">
    <Dot variant="colored-border" />
    <ActiveDot variant="default" />
  </Radar>
  <Radar dataKey="mobile" variant="filled" />
</EvilRadarChart>;
```

### Interactive Selection

Set `isClickable` on a `<Radar />` to let it be selected by clicking, and on `<Legend />` to let legend entries toggle selection. Use the root's `onSelectionChange` callback to react to selection events:

```tsx
<EvilRadarChart
  data={data}
  config={chartConfig}
  onSelectionChange={(selectedDataKey) => {
    if (selectedDataKey) {
      console.log('Selected:', selectedDataKey);
    } else {
      console.log('Deselected');
    }
  }}
>
  <PolarGrid />
  <PolarAngleAxis dataKey="skill" />
  <Legend isClickable />
  <Tooltip />
  <Radar dataKey="desktop" variant="filled" isClickable />
  <Radar dataKey="mobile" variant="filled" isClickable />
</EvilRadarChart>
```

### Loading State

### isLoading='true'

```tsx
'use client';

import {
  EvilRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/radar-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#3b82f6'],
      dark: ['#60a5fa'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#10b981'],
      dark: ['#34d399'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadarChart() {
  return (
    <EvilRadarChart
      data={[]} // if isLoading is true, pass empty array → i.e isLoading ? [] : data
      config={chartConfig}
      className="h-full w-full p-4"
      isLoading={true} // [!code highlight]
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="skill" />
      <Legend />
      <Tooltip />
      <Radar dataKey="desktop" variant="filled" />
      <Radar dataKey="mobile" variant="filled" />
    </EvilRadarChart>
  );
}
```

>

    The radar chart supports loading state with animated data. You can pass the `isLoading` prop to the root to show a loading animation while your data is being fetched.

```tsx
<EvilRadarChart data={[]} config={chartConfig} isLoading>
  <PolarGrid />
  <PolarAngleAxis dataKey="skill" />
  <Legend />
  <Tooltip />
  <Radar dataKey="desktop" variant="filled" />
  <Radar dataKey="mobile" variant="filled" />
</EvilRadarChart>
```

## Examples

Below are some examples of the radar chart with different configurations.

### Lines Variant

### variant='lines'

```tsx
'use client';

import {
  EvilRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  Legend,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/radar-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { skill: 'JavaScript', desktop: 186, mobile: 80 },
  { skill: 'TypeScript', desktop: 305, mobile: 200 },
  { skill: 'React', desktop: 237, mobile: 120 },
  { skill: 'Node.js', desktop: 173, mobile: 190 },
  { skill: 'CSS', desktop: 209, mobile: 130 },
  { skill: 'Python', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#3b82f6'],
      dark: ['#60a5fa'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#10b981'],
      dark: ['#34d399'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadarChart() {
  return (
    <EvilRadarChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="skill" />
      <Legend />
      <Tooltip />
      <Radar
        dataKey="desktop"
        variant="lines" // [!code highlight]
      >
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Radar>
      <Radar dataKey="mobile" variant="lines">
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Radar>
    </EvilRadarChart>
  );
}
```

>

    Set `variant="lines"` to show only the outline without fill. This is useful for comparing multiple datasets more clearly.

### Circle Grid

### gridType='circle'

```tsx
'use client';

import {
  EvilRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  Legend,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/radar-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { skill: 'JavaScript', desktop: 186, mobile: 80 },
  { skill: 'TypeScript', desktop: 305, mobile: 200 },
  { skill: 'React', desktop: 237, mobile: 120 },
  { skill: 'Node.js', desktop: 173, mobile: 190 },
  { skill: 'CSS', desktop: 209, mobile: 130 },
  { skill: 'Python', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#3b82f6'],
      dark: ['#60a5fa'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#10b981'],
      dark: ['#34d399'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadarChart() {
  return (
    <EvilRadarChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <PolarGrid
        gridType="circle" // [!code highlight]
      />
      <PolarAngleAxis dataKey="skill" />
      <Legend />
      <Tooltip />
      <Radar dataKey="desktop" variant="filled">
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Radar>
      <Radar dataKey="mobile" variant="filled">
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Radar>
    </EvilRadarChart>
  );
}
```

>

    Set `gridType="circle"` to use circular grid lines instead of the default polygon grid.

### Gradient Colors

### gradient colors

```tsx
'use client';

import {
  EvilRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  Legend,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/radar-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { skill: 'JavaScript', desktop: 186, mobile: 80 },
  { skill: 'TypeScript', desktop: 305, mobile: 200 },
  { skill: 'React', desktop: 237, mobile: 120 },
  { skill: 'Node.js', desktop: 173, mobile: 190 },
  { skill: 'CSS', desktop: 209, mobile: 130 },
  { skill: 'Python', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#6366f1', '#a855f7', '#ec4899'], // Indigo -> Purple -> Pink // [!code highlight]
      dark: ['red', 'orange', 'pink'], // [!code highlight]
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#14b8a6', '#06b6d4', '#3b82f6'], // Teal -> Cyan -> Blue // [!code highlight]
      dark: ['#2dd4bf', '#22d3ee', '#60a5fa'], // [!code highlight]
    },
  },
} satisfies ChartConfig;

export function EvilExampleRadarChart() {
  return (
    <EvilRadarChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="skill" />
      <Legend />
      <Tooltip />
      <Radar dataKey="desktop" variant="filled">
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Radar>
      <Radar dataKey="mobile" variant="filled">
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Radar>
    </EvilRadarChart>
  );
}
```

### Glowing Radars

<ComponentPreview className="mb-0" title="<Radar isGlowing />" name="ex-glowing-radar-chart"  />
>  
  
    Add a subtle glow effect to a radar by setting `isGlowing` on its `<Radar />`. Each radar controls its own glow independently.

## API Reference

The radar chart is composed of a root container and a set of composible parts. Each part is documented in its own section below.

<ApiHeading>EvilRadarChart</ApiHeading>

The root container. Owns the data, the shared context, and the loading skeleton. All other parts must be rendered as its children.

### `data` (required)

type: `TData[]`

Data used to display the chart. An array of objects where each object represents a data point on the radar (`TData extends Record<string, unknown>`).

### `config`

" required>
Configuration object that defines the chart's radar series. Each key should match a numeric data key in your data array, with corresponding colors and labels.

### `children` (required)

type: `ReactNode`

The composed parts of the chart — `<PolarGrid />`, `<PolarAngleAxis />`, `<PolarRadiusAxis />`, `<Tooltip />`, `<Legend />`, and one or more `<Radar />` series.

### `className`

type: `string`

Additional CSS classes to apply to the chart container.

### `backgroundVariant`

type: `BackgroundVariant`

Background pattern variant to display behind the chart.

### `defaultSelectedDataKey`

type: `string | null` · default: `null`

The radar series selected on first render.

### `onSelectionChange`

void">
Callback fired when a radar is selected or deselected. Receives the selected data key, or `null` when deselected.

### `isLoading`

type: `boolean` · default: `false`

Shows a loading animation with animated data when data is being fetched.

### `loadingPoints`

type: `number` · default: `6`

Number of points rendered in the loading skeleton radar.

### `chartProps`

">
Additional props to pass to the underlying Recharts RadarChart component. Read the [Recharts RadarChart documentation](https://recharts.github.io/en-US/api/RadarChart/) for available props.

<ApiHeading>Radar</ApiHeading>

A single radar series. Each `<Radar />` is self-contained — it generates its own gradients and glow filter under a unique id, so multiple radars never collide on styles. Compose `<Dot />` and `<ActiveDot />` inside it to add point markers.

### `dataKey` (required)

type: `string`

The series key to render. Must exist on both the data and the config.

### `variant`

type: `"filled" | "lines"` · default: `"filled"`

The visual style for this radar. `"filled"` shows a filled area, `"lines"` shows only the outline.

### `fillOpacity`

type: `number` · default: `0.3`

The opacity of the filled area when using `variant="filled"`.

### `isGlowing`

type: `boolean` · default: `false`

Adds a soft outer glow around this radar. Each radar controls its own glow independently.

### `isClickable`

type: `boolean` · default: `false`

Enables interactive clicking on this radar to select/deselect it. When a radar is selected, unselected radars become semi-transparent.

### `children`

type: `ReactNode`

Optional `<Dot />` and `<ActiveDot />` composition for point markers on this radar.

### `radarProps`

, "dataKey">'>
Additional props to pass to the underlying Recharts Radar component. Read the [Recharts Radar documentation](https://recharts.github.io/en-US/api/Radar/) for available props.

<ApiHeading>Dot / ActiveDot</ApiHeading>

Configuration slots composed inside a `<Radar />`. `<Dot />` styles the resting point markers; `<ActiveDot />` styles the hovered/active marker. They render nothing on their own.

### `variant`

type: `"default" | "border" | "colored-border"`

The visual style for the point marker.

<ApiHeading>PolarGrid</ApiHeading>

The polar grid lines. Defaults to a dashed polygon grid and forwards every Recharts PolarGrid prop.

### `gridType`

type: `"polygon" | "circle"` · default: `"polygon"`

The shape of the grid lines. `"polygon"` creates angular grid lines, `"circle"` creates circular grid lines.

### `...props`

">
All other props are forwarded to the underlying Recharts PolarGrid component. Read the [Recharts PolarGrid documentation](https://recharts.github.io/en-US/api/PolarGrid/) for available props.

<ApiHeading>PolarAngleAxis</ApiHeading>

The angular category axis — the labels around the chart's perimeter. Hidden automatically while the chart is loading.

### `dataKey`

type: `string`

The key from your data objects to use for the angle axis labels (e.g., categories, skills, months).

### `...props`

">
All other props are forwarded to the underlying Recharts PolarAngleAxis component. Read the [Recharts PolarAngleAxis documentation](https://recharts.github.io/en-US/api/PolarAngleAxis/) for available props.

<ApiHeading>PolarRadiusAxis</ApiHeading>

The radial value axis — the scale running from the center outward. Hidden automatically while the chart is loading.

### `...props`

">
All props are forwarded to the underlying Recharts PolarRadiusAxis component. Read the [Recharts PolarRadiusAxis documentation](https://recharts.github.io/en-US/api/PolarRadiusAxis/) for available props.

<ApiHeading>Tooltip</ApiHeading>

The hover tooltip. Reads the chart's selection so its content dims unselected series. Hidden automatically while the chart is loading.

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

The series legend. When `isClickable` is set, each entry toggles selection of its series. Hidden automatically while the chart is loading.

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

Lets each legend entry toggle selection of its series, driving the shared selection state read by every `<Radar />`.
