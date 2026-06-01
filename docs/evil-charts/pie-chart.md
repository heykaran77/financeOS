---
title: Pie Chart
description: Simple static & beautifully designed pie charts with donut, gradient, and glow effects
image: /og/pie-chart.png
links:
  github: https://github.com/legions-developer/evilcharts/blob/main/src/registry/charts/pie-chart.tsx
  doc: https://recharts.github.io/en-US/examples/SimplePieChart/
  api: https://recharts.github.io/en-US/api/PieChart/
---

### Basic Chart

```tsx
'use client';

import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
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

export function EvilExamplePieChart() {
  return (
    <EvilPieChart
      className="h-full w-full p-4"
      data={data}
      dataKey="visitors"
      nameKey="browser"
      config={chartConfig}
    >
      <Legend isClickable />
      <Tooltip />
      <Pie isClickable />
    </EvilPieChart>
  );
}
```

## Installation

    ### npm

```bash
npx shadcn@latest add @evilcharts/pie-chart
```

### yarn

```bash
yarn shadcn@latest add @evilcharts/pie-chart
```

### bun

```bash
bunx --bun shadcn@latest add @evilcharts/pie-chart
```

### pnpm

```bash
pnpm dlx shadcn@latest add @evilcharts/pie-chart
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
          Then, copy the following base pie-chart code into a new file in that folder.


          ### components/evilcharts/charts/pie-chart.tsx

```tsx
'use client';

import {
  type ChartConfig,
  ChartContainer,
  getColorsCount,
  LoadingIndicator,
} from '@/components/evilcharts/ui/chart';
import {
  ChartLegend,
  ChartLegendContent,
  type ChartLegendVariant,
} from '@/components/evilcharts/ui/legend';
import {
  ChartTooltip,
  ChartTooltipContent,
  type TooltipRoundness,
  type TooltipVariant,
} from '@/components/evilcharts/ui/tooltip';
import {
  ChartBackground,
  type BackgroundVariant,
} from '@/components/evilcharts/ui/background';
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  LabelList as RechartsLabelList,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  Sector,
  type PieSectorShapeProps,
} from 'recharts';
import { motion } from 'motion/react';

// Constants
const LOADING_SECTORS = 5;
const LOADING_ANIMATION_DURATION = 2000; // full loading cycle duration in milliseconds
const DEFAULT_INNER_RADIUS = 0;
const DEFAULT_OUTER_RADIUS = '80%';
const DEFAULT_CORNER_RADIUS = 0;
const DEFAULT_PADDING_ANGLE = 0;
const DEFAULT_START_ANGLE = 0;
const DEFAULT_END_ANGLE = 360;
// Stable empty-array reference so the `glowingSectors` default doesn't change every render
const EMPTY_GLOWING_SECTORS: string[] = [];

type LabelListProps = ComponentProps<typeof RechartsLabelList>;

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared state for every part of the chart. Lifted into <EvilPieChart /> so that
 * <Pie />, <Tooltip />, <Legend />, and friends can read it without prop drilling.
 * Sub-components are composed freely — the provider is the single source of truth.
 */
type PieChartContextValue = {
  config: ChartConfig; // colors + labels for every sector
  data: Record<string, unknown>[]; // rows rendered by the chart
  dataKey: string; // key holding each sector's numeric value
  nameKey: string; // key holding each sector's name
  isLoading: boolean; // whether the chart shows its loading skeleton
  selectedSector: string | null; // currently selected sector name, or null when none
  selectSector: (sectorName: string | null) => void; // sets the selected sector
};

const PieChartContext = createContext<PieChartContextValue | null>(null);

// Reads the chart context, throwing a helpful error when used outside <EvilPieChart />
function usePieChart() {
  const context = use(PieChartContext);

  if (!context) {
    throw new Error(
      'Pie chart parts (<Pie />, <Tooltip />, …) must be used within <EvilPieChart />',
    );
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root container
// ─────────────────────────────────────────────────────────────────────────────

type EvilPieChartProps<TData extends Record<string, unknown>> = {
  config: ChartConfig; // sector colors + labels
  data: TData[]; // rows rendered by the chart
  dataKey: keyof TData & string; // key holding each sector's numeric value
  nameKey: keyof TData & string; // key holding each sector's name
  children: ReactNode; // composed parts — <Pie />, <Tooltip />, <Legend />, …
  className?: string; // extra classes for the chart container
  chartProps?: ComponentProps<typeof RechartsPieChart>; // escape hatch for the raw Recharts chart
  defaultSelectedSector?: string | null; // sector selected on first render
  onSelectionChange?: (
    selection: { dataKey: string; value: number } | null,
  ) => void; // fires when the selected sector changes
  isLoading?: boolean; // shows the animated loading skeleton
};

/**
 * Root of the composible pie chart. Owns the data, the shared context, and the
 * loading skeleton. Everything visual — the pie itself, tooltip, legend, and an
 * optional background — is composed as children, so a consumer renders exactly
 * the parts they need.
 */
export function EvilPieChart<TData extends Record<string, unknown>>({
  config,
  data,
  dataKey,
  nameKey,
  children,
  className,
  chartProps,
  defaultSelectedSector = null,
  onSelectionChange,
  isLoading = false,
}: EvilPieChartProps<TData>) {
  const [selectedSector, setSelectedSector] = useState<string | null>(
    defaultSelectedSector,
  );

  // Updates selection state and notifies the parent with the sector's value
  const selectSector = useCallback(
    (sectorName: string | null) => {
      setSelectedSector(sectorName);

      if (sectorName === null) {
        onSelectionChange?.(null);
        return;
      }

      const selectedItem = data.find(
        (item) => (item[nameKey] as string) === sectorName,
      );

      if (selectedItem) {
        onSelectionChange?.({
          dataKey: sectorName,
          value: selectedItem[dataKey] as number,
        });
      }
    },
    [data, dataKey, nameKey, onSelectionChange],
  );

  const contextValue = useMemo<PieChartContextValue>(
    () => ({
      config,
      data,
      dataKey,
      nameKey,
      isLoading,
      selectedSector,
      selectSector,
    }),
    [config, data, dataKey, nameKey, isLoading, selectedSector, selectSector],
  );

  return (
    <PieChartContext value={contextValue}>
      <ChartContainer className={className} config={config}>
        <LoadingIndicator isLoading={isLoading} />
        <RechartsPieChart
          id="evil-charts-pie-chart"
          accessibilityLayer
          {...chartProps}
        >
          {children}
        </RechartsPieChart>
      </ChartContainer>
    </PieChartContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type PieProps = {
  variant?: PieVariant; // fill style for the pie's sectors
  innerRadius?: number | string; // inner radius — set above 0 for a donut
  outerRadius?: number | string; // outer radius of the pie
  cornerRadius?: number; // border-radius of each sector in pixels
  paddingAngle?: number; // gap between sectors in degrees — negative overlaps them
  startAngle?: number; // angle the pie starts drawing from
  endAngle?: number; // angle the pie stops drawing at
  isClickable?: boolean; // lets sectors be selected by clicking them
  glowingSectors?: string[]; // sector names that render with a soft outer glow
  children?: ReactNode; // optional <Label /> composition for sector labels
  pieProps?: Omit<
    ComponentProps<typeof RechartsPie>,
    'data' | 'dataKey' | 'nameKey'
  >; // escape hatch for raw Recharts Pie props
};

/**
 * The pie series. Self-contained: it generates its own radial color gradients
 * and glow filters under a unique id, so any number of pies — each with its own
 * shape and clickability — can live on one page without style collisions. While
 * the chart is loading it renders an animated skeleton in place of the data.
 * Compose <Label /> inside it to draw labels on each sector.
 */
export function Pie({
  variant = 'gradient',
  innerRadius = DEFAULT_INNER_RADIUS,
  outerRadius = DEFAULT_OUTER_RADIUS,
  cornerRadius = DEFAULT_CORNER_RADIUS,
  paddingAngle = DEFAULT_PADDING_ANGLE,
  startAngle = DEFAULT_START_ANGLE,
  endAngle = DEFAULT_END_ANGLE,
  isClickable = false,
  glowingSectors = EMPTY_GLOWING_SECTORS,
  children,
  pieProps,
}: PieProps) {
  const {
    config,
    data,
    dataKey,
    nameKey,
    isLoading,
    selectedSector,
    selectSector,
  } = usePieChart();
  const id = useId().replace(/:/g, ''); // unique id scopes this pie's style defs

  if (isLoading) {
    return (
      <RechartsPie
        data={LOADING_PIE_DATA}
        dataKey="value"
        nameKey="name"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        cornerRadius={cornerRadius}
        paddingAngle={paddingAngle}
        startAngle={startAngle}
        endAngle={endAngle}
        strokeWidth={0}
        isAnimationActive={false}
        shape={(props) => <AnimatedLoadingSector {...props} />}
      />
    );
  }

  const label = resolveLabel(children, dataKey);

  const preparedData = data.map((item) => ({
    ...item,
    fill: `url(#${id}-colors-${item[nameKey] as string})`,
  }));

  return (
    <>
      <RechartsPie
        data={preparedData}
        dataKey={dataKey}
        nameKey={nameKey}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        cornerRadius={cornerRadius}
        paddingAngle={paddingAngle}
        startAngle={startAngle}
        endAngle={endAngle}
        strokeWidth={0}
        isAnimationActive
        style={isClickable ? { cursor: 'pointer' } : undefined}
        onClick={(_, index) => {
          if (!isClickable) return;
          const clickedName = data[index]?.[nameKey] as string;
          // Clicking the selected sector clears the selection, otherwise selects it
          selectSector(selectedSector === clickedName ? null : clickedName);
        }}
        shape={(props: PieSectorShapeProps) => {
          const sectorName = data[props.index ?? 0]?.[nameKey] as string;
          const isGlowing = glowingSectors.includes(sectorName);
          const isDimmed =
            isClickable &&
            selectedSector !== null &&
            selectedSector !== sectorName;

          return (
            <Sector
              {...props}
              fill={`url(#${id}-colors-${sectorName})`}
              filter={isGlowing ? `url(#${id}-glow-${sectorName})` : undefined}
              stroke={paddingAngle < 0 ? 'var(--background)' : 'none'}
              strokeWidth={paddingAngle < 0 ? 5 : 0}
              opacity={isDimmed ? 0.3 : 1}
              className="transition-opacity duration-200"
            />
          );
        }}
        {...pieProps}
      >
        {label}
      </RechartsPie>
      <defs>
        <RadialColorGradient id={id} config={config} variant={variant} />
        {glowingSectors.length > 0 && (
          <GlowFilter id={id} glowingSectors={glowingSectors} />
        )}
      </defs>
    </>
  );
}

type LabelProps = {
  dataKey?: string; // data key for the label text — defaults to the pie's value key
  labelListProps?: Omit<LabelListProps, 'dataKey'>; // escape hatch for raw Recharts LabelList props
};

/**
 * Declares per-sector labels for the <Pie /> it is composed inside. It renders
 * nothing on its own — the parent <Pie /> reads its props and wires them into a
 * Recharts LabelList drawn over the sectors.
 */
export const Label: FC<LabelProps> = () => null;

type TooltipProps = {
  variant?: TooltipVariant; // visual style of the tooltip surface
  roundness?: TooltipRoundness; // border-radius of the tooltip
  defaultIndex?: number; // sector index shown by default with no hover
};

/**
 * The hover tooltip. Hidden automatically while the chart is loading.
 */
export function Tooltip({ variant, roundness, defaultIndex }: TooltipProps) {
  const { isLoading, nameKey } = usePieChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
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
  isClickable?: boolean; // lets each entry toggle selection of its sector
};

/**
 * The sector legend. When `isClickable` is set, each entry toggles selection of
 * its sector, driving the shared selection state read by the <Pie />.
 */
export function Legend({
  variant,
  align = 'center',
  verticalAlign = 'bottom',
  isClickable = false,
}: LegendProps) {
  const { nameKey, selectedSector, selectSector } = usePieChart();

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedSector}
          onSelectChange={selectSector}
          isClickable={isClickable}
          nameKey={nameKey}
          variant={variant}
        />
      }
    />
  );
}

type BackgroundProps = {
  variant?: BackgroundVariant; // background pattern style
};

/**
 * An optional decorative pattern drawn behind the pie. Compose it before the
 * <Pie /> so it sits underneath the sectors.
 */
export function Background({ variant = 'dots' }: BackgroundProps) {
  return <ChartBackground variant={variant} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Label helper
// ─────────────────────────────────────────────────────────────────────────────

// Pulls a <Label /> out of a pie's children into a Recharts LabelList element
const resolveLabel = (children: ReactNode, valueKey: string): ReactNode => {
  let label: ReactNode = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== Label) return;

    const { dataKey, labelListProps } = (child as ReactElement<LabelProps>)
      .props;

    label = (
      <RechartsLabelList
        dataKey={dataKey ?? valueKey}
        stroke="none"
        fontSize={12}
        fontWeight={500}
        fill="currentColor"
        className="fill-background"
        {...labelListProps}
      />
    );
  });

  return label;
};

// ─────────────────────────────────────────────────────────────────────────────
// Style definitions — one set per <Pie />, scoped to its unique id
// ─────────────────────────────────────────────────────────────────────────────

type PieVariant = 'gradient';

/**
 * Radial-style color gradients, one per sector. Each sector's fill paints from
 * the gradient that matches its name, supporting both single and multi-color
 * config entries.
 */
const RadialColorGradient = ({
  id,
  config,
}: {
  id: string; // unique id of the owning <Pie />
  config: ChartConfig; // sector colors the gradients are built from
  variant: PieVariant; // fill style — currently always a diagonal color gradient
}) => {
  return (
    <>
      {Object.entries(config).map(([sectorKey, sectorConfig]) => {
        const colorsCount = getColorsCount(sectorConfig);

        return (
          <linearGradient
            key={`${id}-colors-${sectorKey}`}
            id={`${id}-colors-${sectorKey}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            {colorsCount === 1 ? (
              <>
                <stop offset="0%" stopColor={`var(--color-${sectorKey}-0)`} />
                <stop offset="100%" stopColor={`var(--color-${sectorKey}-0)`} />
              </>
            ) : (
              Array.from({ length: colorsCount }, (_, index) => {
                const offset = `${(index / (colorsCount - 1)) * 100}%`;
                return (
                  <stop
                    key={offset}
                    offset={offset}
                    stopColor={`var(--color-${sectorKey}-${index}, var(--color-${sectorKey}-0))`}
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

/** Soft outer-glow SVG filter, one per glowing sector. */
const GlowFilter = ({
  id,
  glowingSectors,
}: {
  id: string; // unique id of the owning <Pie />
  glowingSectors: string[]; // sector names that should glow
}) => {
  return (
    <>
      {glowingSectors.map((sectorName) => (
        <filter
          key={`${id}-glow-${sectorName}`}
          id={`${id}-glow-${sectorName}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
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

// Equal-sized sectors used to render the circular pulsing loading skeleton
const LOADING_PIE_DATA = Array.from({ length: LOADING_SECTORS }, (_, i) => ({
  name: `loading${i}`,
  value: 100 / LOADING_SECTORS,
}));

/**
 * A single skeleton sector shown while the chart is loading. Each sector pulses
 * with a staggered delay, producing a wave that travels around the pie.
 */
const AnimatedLoadingSector = (
  props: ComponentProps<typeof Sector> & { index?: number },
) => {
  const { index = 0, ...sectorProps } = props;

  // Staggered delay so the pulse sweeps around the circle
  const delay = (index / LOADING_SECTORS) * (LOADING_ANIMATION_DURATION / 1000);

  return (
    <motion.g
      initial={{ opacity: 0.15 }}
      animate={{ opacity: [0.15, 0.5, 0.15] }}
      transition={{
        duration: LOADING_ANIMATION_DURATION / 1000,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Sector {...sectorProps} fill="currentColor" />
    </motion.g>
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

The pie chart is composible. `<EvilPieChart>` is the container, and you compose only the parts you need — `<Legend>`, `<Tooltip>`, `<Background>`, and one `<Pie>` — as its children. The `<Pie>` carries its own shape props (`innerRadius`, `paddingAngle`, `cornerRadius`, …), its `isClickable` flag, and `glowingSectors`, so a single chart can mix any combination of those.

```tsx
import {
  EvilPieChart,
  Pie,
  Label,
  Tooltip,
  Legend,
  Background,
} from '@/components/evilcharts/charts/pie-chart';
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
<EvilPieChart
  data={data}
  dataKey="visitors"
  nameKey="browser"
  config={chartConfig}
>
  <Legend isClickable />
  <Tooltip />
  <Pie isClickable innerRadius={60} paddingAngle={4} cornerRadius={8}>
    <Label />
  </Pie>
</EvilPieChart>
```

### Interactive Selection

Add `isClickable` to the `<Pie>` (and to `<Legend>`) to make sectors selectable. Use the `onSelectionChange` callback on `<EvilPieChart>` to handle selection events:

```tsx
<EvilPieChart
  data={data}
  dataKey="visitors"
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
  <Pie isClickable />
</EvilPieChart>
```

### Loading State

### isLoading='true'

```tsx
'use client';

import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
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

export function EvilExamplePieChart() {
  return (
    <EvilPieChart
      className="h-full w-full p-4"
      data={data}
      dataKey="visitors"
      nameKey="browser"
      config={chartConfig}
      isLoading // [!code highlight]
    >
      <Legend isClickable />
      <Tooltip />
      <Pie isClickable />
    </EvilPieChart>
  );
}
```

>

    The pie chart supports loading state with a placeholder animation. You can pass the `isLoading` prop to the chart to show the loading state while your data is being fetched.

## Examples

Below are some examples of the pie chart with different configurations. You can customize the `innerRadius`, `paddingAngle`, `cornerRadius`, and other properties.

### Gradient Colors

### gradient colors

```tsx
'use client';

import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
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
      light: ['#93c5fd', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'], // [!code highlight]
      dark: ['#bfdbfe', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'], // [!code highlight]
    },
  },
  safari: {
    label: 'Safari',
    colors: {
      light: ['#6ee7b7', '#10b981', '#059669', '#047857', '#065f46'], // [!code highlight]
      dark: ['#a7f3d0', '#34d399', '#10b981', '#059669', '#047857'], // [!code highlight]
    },
  },
  firefox: {
    label: 'Firefox',
    colors: {
      light: ['#fcd34d', '#f59e0b', '#d97706', '#b45309', '#92400e'], // [!code highlight]
      dark: ['#fde68a', '#fbbf24', '#f59e0b', '#d97706', '#b45309'], // [!code highlight]
    },
  },
  edge: {
    label: 'Edge',
    colors: {
      light: ['#c4b5fd', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'], // [!code highlight]
      dark: ['#ddd6fe', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9'], // [!code highlight]
    },
  },
  other: {
    label: 'Other',
    colors: {
      light: ['#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151'], // [!code highlight]
      dark: ['#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563'], // [!code highlight]
    },
  },
} satisfies ChartConfig;

export function EvilExamplePieChart() {
  return (
    <EvilPieChart
      className="h-full w-full p-4"
      data={data}
      dataKey="visitors"
      nameKey="browser"
      config={chartConfig}
    >
      <Legend isClickable />
      <Tooltip />
      <Pie isClickable />
    </EvilPieChart>
  );
}
```

### Donut Chart

### innerRadius={60}

```tsx
'use client';

import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
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

export function EvilExamplePieChart() {
  return (
    <EvilPieChart
      className="h-full w-full p-4"
      data={data}
      dataKey="visitors"
      nameKey="browser"
      config={chartConfig}
    >
      <Legend isClickable />
      <Tooltip />
      <Pie
        isClickable
        innerRadius={60} // [!code highlight]
      />
    </EvilPieChart>
  );
}
```

>

    Set `innerRadius` to a value greater than 0 to create a donut chart. The inner radius creates the hole in the center of the pie.

### Padded Sectors

### paddingAngle={4} cornerRadius={8}

```tsx
'use client';

import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
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

export function EvilExamplePieChart() {
  return (
    <EvilPieChart
      className="h-full w-full p-4"
      data={data}
      dataKey="visitors"
      nameKey="browser"
      config={chartConfig}
    >
      <Legend isClickable />
      <Tooltip />
      <Pie
        isClickable
        innerRadius={30} // [!code highlight]
        paddingAngle={4} // [!code highlight]
        cornerRadius={8} // [!code highlight]
      />
    </EvilPieChart>
  );
}
```

>

    Use `paddingAngle` to add space between sectors and `cornerRadius` to round the corners of each sector. Combine with `innerRadius` for a modern donut look.

### innerRadius={60} paddingAngle={-20} cornerRadius={100}

```tsx
'use client';

import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
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

export function EvilExamplePieChart() {
  return (
    <EvilPieChart
      className="h-full w-full p-4"
      data={data}
      dataKey="visitors"
      nameKey="browser"
      config={chartConfig}
    >
      <Legend isClickable />
      <Tooltip />
      <Pie innerRadius={60} paddingAngle={-25} cornerRadius={99} />
    </EvilPieChart>
  );
}
```

>

    Use a negative `paddingAngle` to create overlapping sectors with a high `cornerRadius` for a petal-like effect. Combine with `innerRadius` for a flower-shaped donut chart.

### Labels

### showLabels={true}

```tsx
'use client';

import {
  EvilPieChart,
  Pie,
  Label,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
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

export function EvilExamplePieChart() {
  return (
    <EvilPieChart
      className="h-full w-full p-4"
      data={data}
      dataKey="visitors"
      nameKey="browser"
      config={chartConfig}
    >
      <Legend isClickable />
      <Tooltip />
      <Pie isClickable innerRadius={30} paddingAngle={4} cornerRadius={8}>
        <Label // [!code highlight]
        />
      </Pie>
    </EvilPieChart>
  );
}
```

>

    Enable `showLabels` to display labels on each sector. You can customize the label with `labelKey` to show different data, and use `labelListProps` for additional customization.

### Glowing Sectors

### glowingSectors={['chrome', 'safari']}

```tsx
'use client';

import {
  EvilPieChart,
  Pie,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/pie-chart';
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

export function EvilExamplePieChart() {
  return (
    <EvilPieChart
      className="h-full w-full p-4"
      data={data}
      dataKey="visitors"
      nameKey="browser"
      config={chartConfig}
    >
      <Legend isClickable />
      <Tooltip />
      <Pie
        isClickable
        glowingSectors={['chrome', 'safari']} // [!code highlight]
      />
    </EvilPieChart>
  );
}
```

>

    Add a subtle glow effect to specific sectors using `glowingSectors` prop. Pass an array of sector names (the values from your `nameKey` field) to specify which sectors should glow.

## API Reference

The chart is composed of several parts. The props below are grouped by the component they belong to.

<ApiHeading>EvilPieChart</ApiHeading>

The root container. It owns the data, the shared selection state, and the loading skeleton. Everything visual is composed as its children.

### `data` (required)

type: `TData[]`

Data used to display the chart. An array of objects where each object represents a sector (`TData extends Record<string, unknown>`).

### `dataKey` (required)

type: `keyof TData & string`

The key from your data objects to use for sector values (typically numeric values that determine sector size).

### `nameKey` (required)

type: `keyof TData & string`

The key from your data objects to use for sector names (typically string values used for labels and legend).

### `config` (required)

type: `ChartConfig`

Configuration object that defines the chart's sectors. Each key should match a value from your `nameKey` field, with corresponding colors.

### `children` (required)

type: `ReactNode`

The composed chart parts — `<Legend />`, `<Tooltip />`, `<Background />`, and one `<Pie />`.

### `className`

type: `string`

Additional CSS classes to apply to the chart container.

### `defaultSelectedSector`

type: `string | null` · default: `null`

The sector name that should be selected by default.

### `onSelectionChange`

void">
Callback fired when a sector is selected or deselected — by clicking a clickable `<Pie />` sector or `<Legend />` entry. Receives an object with `dataKey` (sector name) and `value` (sector value), or `null` when deselected.

### `isLoading`

type: `boolean` · default: `false`

Shows a loading placeholder animation when data is being fetched.

### `chartProps`

">
Additional props forwarded to the underlying Recharts PieChart component. Read the [Recharts PieChart documentation](https://recharts.github.io/en-US/api/PieChart/) for available props.

<ApiHeading>Pie</ApiHeading>

The pie series. Self-contained — it generates its own radial color gradients and glow filters, so any number of pies can live on one page without style collisions. Compose a `<Label />` inside it to draw labels on each sector.

### `innerRadius`

type: `number | string` · default: `0`

The inner radius of the pie. Set to a value greater than 0 to create a donut chart. Can be a number (pixels) or percentage string.

### `outerRadius`

type: `number | string` · default: `"80%"`

The outer radius of the pie. Can be a number (pixels) or percentage string.

### `cornerRadius`

type: `number` · default: `0`

The border radius for the corners of each sector in pixels.

### `paddingAngle`

type: `number` · default: `0`

The angle of padding between sectors in degrees. Use a negative value to create overlapping sectors.

### `startAngle`

type: `number` · default: `0`

The starting angle of the pie in degrees (0 is 3 o'clock, 90 is 12 o'clock).

### `endAngle`

type: `number` · default: `360`

The ending angle of the pie in degrees. Set to less than 360 for a partial pie.

### `isClickable`

type: `boolean` · default: `false`

Enables interactive clicking on sectors to select/deselect them. When a sector is selected, the others dim.

### `glowingSectors`

type: `string[]` · default: `[]`

Array of sector names (values from your `nameKey` field) that should have a glowing effect applied. Creates a smooth outer glow around the specified sectors.

### `children`

type: `ReactNode`

Optional `<Label />` composition that draws labels on each sector.

### `pieProps`

, "data" | "dataKey" | "nameKey">'>
Escape hatch for raw props forwarded to the underlying Recharts Pie component. Read the [Recharts Pie documentation](https://recharts.github.io/en-US/api/Pie/) for available props.

<ApiHeading>Label</ApiHeading>

Per-sector labels composed inside a `<Pie />`. It renders nothing on its own — the parent `<Pie />` reads its props and draws a label list over the sectors.

### `dataKey`

type: `string`

The key from your data objects to use for label text. Falls back to the chart's `dataKey` when omitted.

### `labelListProps`

, "dataKey">'>
Escape hatch for raw props forwarded to the underlying Recharts LabelList component. Read the [Recharts LabelList documentation](https://recharts.github.io/en-US/api/LabelList/) for available props.

<ApiHeading>Tooltip</ApiHeading>

The hover tooltip. Hidden automatically while the chart is loading.

### `variant`

type: `"default" | "frosted-glass"` · default: `"default"`

The visual style of the tooltip surface.

### `roundness`

type: `"sm" | "md" | "lg" | "xl"` · default: `"lg"`

Controls the border-radius of the tooltip.

### `defaultIndex`

type: `number`

When set, the tooltip is visible by default at the specified sector index.

<ApiHeading>Legend</ApiHeading>

The sector legend. When `isClickable` is set, each entry toggles selection of its sector.

### `variant`

type: `"square" | "circle" | "circle-outline" | "rounded-square" | "rounded-square-outline" | …`

The visual style of the legend indicators.

### `align`

type: `"left" | "center" | "right"` · default: `"center"`

Horizontal placement of the legend.

### `verticalAlign`

type: `"top" | "middle" | "bottom"` · default: `"bottom"`

Vertical placement of the legend.

### `isClickable`

type: `boolean` · default: `false`

Lets each legend entry toggle selection of its sector.

<ApiHeading>Background</ApiHeading>

An optional decorative pattern drawn behind the pie. Compose it before the `<Pie />` so it sits underneath the sectors.

### `variant`

type: `BackgroundVariant` · default: `"dots"`

The background pattern style.
