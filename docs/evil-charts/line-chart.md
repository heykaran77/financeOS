---
title: Line Chart
description: Simple static & beautifully designed line charts
image: /og/line-chart.png
links:
  github: https://github.com/legions-developer/evilcharts/blob/main/src/registry/charts/line-chart.tsx
  doc: https://recharts.github.io/en-US/examples/SimpleLineChart/
  api: https://recharts.github.io/en-US/api/LineChart/
---

### Basic Chart

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
      showBrush
      xDataKey="month"
      brushFormatLabel={(value) => String(value).substring(0, 3)}
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend isClickable />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" isClickable>
        <Dot variant="border" />
        <ActiveDot variant="colored-border" />
      </Line>
      <Line dataKey="mobile" strokeVariant="solid" isClickable>
        <Dot variant="border" />
        <ActiveDot variant="colored-border" />
      </Line>
    </EvilLineChart>
  );
}
```

## Installation

    ### npm

```bash
npx shadcn@latest add @evilcharts/line-chart
```

### yarn

```bash
yarn shadcn@latest add @evilcharts/line-chart
```

### bun

```bash
bunx --bun shadcn@latest add @evilcharts/line-chart
```

### pnpm

```bash
pnpm dlx shadcn@latest add @evilcharts/line-chart
```

        ### Install the following dependencies:

          ### npm

```bash
npm install recharts motion
```

### yarn

```bash
yarn add recharts motion
```

### bun

```bash
bun add recharts motion
```

### pnpm

```bash
pnpm add recharts motion
```

        ### Copy and paste the following code snippets into your project.

          To use the chart, first create the folder `evilcharts` and a subfolder called `charts` inside your `components` directory.
          Then, copy the following base line-chart code into a new file in that folder.


          ### components/evilcharts/charts/line-chart.tsx

```tsx
'use client';

import {
  type ChartConfig,
  ChartContainer,
  getColorsCount,
  getLoadingData,
  LoadingIndicator,
} from '@/components/evilcharts/ui/chart';
import {
  CartesianGrid,
  Curve,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  type CurveProps,
} from 'recharts';
import {
  ChartTooltip,
  ChartTooltipContent,
  type TooltipRoundness,
  type TooltipVariant,
} from '@/components/evilcharts/ui/tooltip';
import {
  EvilBrush,
  useEvilBrush,
  type EvilBrushRange,
} from '@/components/evilcharts/ui/evil-brush';
import {
  ChartLegend,
  ChartLegendContent,
  type ChartLegendVariant,
} from '@/components/evilcharts/ui/legend';
import { ChartDot, type DotVariant } from '@/components/evilcharts/ui/dot';
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react';
import { motion, useReducedMotion } from 'motion/react';

// Constants
const STROKE_WIDTH = 1;
const LOADING_LINE_DATA_KEY = 'loading';
const LOADING_ANIMATION_DURATION = 2000; // in milliseconds
const REVEAL_DURATION = 1; // intro wipe length, in seconds
const REVEAL_EASE: [number, number, number, number] = [0, 0.7, 0.5, 1]; // intro wipe easing

type CurveType = ComponentProps<typeof RechartsLine>['type'];
type LineDotProp = ComponentProps<typeof RechartsLine>['dot'];
type LineActiveDotProp = ComponentProps<typeof RechartsLine>['activeDot'];
type StrokeVariant = 'solid' | 'dashed' | 'animated-dashed';

/**
 * Direction of the custom motion.dev intro reveal. Recharts' own line animation
 * is permanently disabled (it drew the line after the dots had already popped
 * in) — these reveals replace it.
 *
 * NOTE: a reveal is a per-frame animated SVG mask, so it is heavier than a
 * static chart. `"none"` opts out entirely; it is also what a device with the
 * OS "reduce motion" preference falls back to automatically.
 */
type LineAnimationType =
  | 'none'
  | 'left-to-right'
  | 'right-to-left'
  | 'center-out'
  | 'edges-in';
type RevealAnimationType = Exclude<LineAnimationType, 'none'>;

// ─────────────────────────────────────────────────────────────────────────────
// Shared context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared state for every part of the chart. Lifted into <EvilLineChart /> so that
 * <Line />, <XAxis />, <Legend />, and friends can read it without prop drilling.
 * Sub-components are composed freely — the provider is the single source of truth.
 */
type LineChartContextValue = {
  config: ChartConfig; // colors + labels for every series
  curveType: CurveType; // default curve interpolation each <Line /> inherits
  animationType: LineAnimationType; // default intro reveal each <Line /> inherits
  isLoading: boolean; // whether the chart shows its loading skeleton
  selectedDataKey: string | null; // currently selected series, or null when none
  selectDataKey: (dataKey: string | null) => void; // sets the selected series
};

const LineChartContext = createContext<LineChartContextValue | null>(null);

// Reads the chart context, throwing a helpful error when used outside <EvilLineChart />
function useLineChart() {
  const context = use(LineChartContext);

  if (!context) {
    throw new Error(
      'Line chart parts (<Line />, <XAxis />, …) must be used within <EvilLineChart />',
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

type EvilLineChartBaseProps<
  TData extends Record<string, unknown>,
  TConfig extends Record<string, ChartConfig[string]>,
> = {
  config: TConfig & ValidateConfigKeys<TData, TConfig>; // series colors + labels
  data: TData[]; // rows rendered by the chart
  children: ReactNode; // composed parts — <Line />, <XAxis />, <Legend />, …
  className?: string; // extra classes for the chart container
  chartProps?: ComponentProps<typeof RechartsLineChart>; // escape hatch for the raw Recharts chart
  curveType?: CurveType; // default curve interpolation for every <Line />
  animationType?: LineAnimationType; // default intro reveal for every <Line />
  defaultSelectedDataKey?: string | null; // series selected on first render
  onSelectionChange?: (selectedDataKey: string | null) => void; // fires when the selected series changes
  isLoading?: boolean; // shows the animated loading skeleton
  loadingPoints?: number; // number of points in the loading skeleton
  showBrush?: boolean; // renders a zoom brush below the chart
  xDataKey?: keyof TData & string; // x-axis key — only needed for the brush footer
  brushHeight?: number; // height of the brush preview in pixels
  brushFormatLabel?: (value: unknown, index: number) => string; // formats brush axis labels
  onBrushChange?: (range: EvilBrushRange) => void; // fires when the brush range changes
};

type EvilLineChartProps<
  TData extends Record<string, unknown>,
  TConfig extends Record<string, ChartConfig[string]>,
> = EvilLineChartBaseProps<TData, TConfig>;

/**
 * Root of the composible line chart. Owns the data, the shared context, the
 * loading skeleton, and the optional zoom brush. Everything visual — axes,
 * grid, tooltip, legend, and the lines themselves — is composed as children,
 * so a consumer renders exactly the parts they need.
 */
export function EvilLineChart<
  TData extends Record<string, unknown>,
  TConfig extends Record<string, ChartConfig[string]>,
>({
  config,
  data,
  children,
  className,
  chartProps,
  curveType = 'linear',
  animationType = 'left-to-right',
  defaultSelectedDataKey = null,
  onSelectionChange,
  isLoading = false,
  loadingPoints,
  showBrush = false,
  xDataKey,
  brushHeight,
  brushFormatLabel,
  onBrushChange,
}: EvilLineChartProps<TData, TConfig>) {
  const chartId = useId().replace(/:/g, ''); // colon-free id keeps CSS/SVG selectors valid
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(
    defaultSelectedDataKey,
  );
  const { loadingData, onShimmerExit } = useLoadingData(
    isLoading,
    loadingPoints,
  );
  const { visibleData, brushProps } = useEvilBrush({ data });

  const displayData = showBrush && !isLoading ? visibleData : data;

  // Updates selection state and notifies the parent
  const selectDataKey = useCallback(
    (newSelectedDataKey: string | null) => {
      setSelectedDataKey(newSelectedDataKey);
      onSelectionChange?.(newSelectedDataKey);
    },
    [onSelectionChange],
  );

  const contextValue = useMemo<LineChartContextValue>(
    () => ({
      config,
      curveType,
      animationType,
      isLoading,
      selectedDataKey,
      selectDataKey,
    }),
    [
      config,
      curveType,
      animationType,
      isLoading,
      selectedDataKey,
      selectDataKey,
    ],
  );

  return (
    <LineChartContext value={contextValue}>
      <ChartContainer
        className={className}
        config={config}
        footer={
          showBrush &&
          !isLoading && (
            <EvilBrush
              data={data}
              chartConfig={config}
              xDataKey={xDataKey}
              variant="line"
              curveType={curveType}
              height={brushHeight}
              formatLabel={brushFormatLabel}
              skipStyle
              className="mt-1"
              {...brushProps}
              onChange={(range) => {
                brushProps.onChange(range);
                onBrushChange?.(range);
              }}
            />
          )
        }
      >
        <LoadingIndicator isLoading={isLoading} />
        <RechartsLineChart
          id={chartId}
          accessibilityLayer
          data={isLoading ? loadingData : displayData}
          {...chartProps}
        >
          {children}
          {isLoading && (
            <LoadingLine
              chartId={chartId}
              curveType={curveType}
              onShimmerExit={onShimmerExit}
            />
          )}
        </RechartsLineChart>
      </ChartContainer>
    </LineChartContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composible parts
// ─────────────────────────────────────────────────────────────────────────────

type LineProps = {
  dataKey: string; // series key — must exist on the data and config
  strokeVariant?: StrokeVariant; // stroke style for this line only
  curveType?: CurveType; // curve interpolation — falls back to the chart default
  animationType?: LineAnimationType; // intro reveal — falls back to the chart default
  connectNulls?: boolean; // join segments across null/missing values
  isClickable?: boolean; // lets this line be selected by clicking it
  glowing?: boolean; // applies a soft outer glow to this line
  enableBufferLine?: boolean; // renders this line's last segment as a dashed buffer
  children?: ReactNode; // optional <Dot /> and <ActiveDot /> composition
  lineProps?: ComponentProps<typeof RechartsLine>; // escape hatch for raw Recharts Line props
};

/**
 * A single line series. Each <Line /> is fully self-contained: it generates its
 * own gradient and glow definitions under a unique id, so any number of lines —
 * each with its own stroke, glow, and clickability — can live in one chart
 * without style collisions. Compose <Dot /> and <ActiveDot /> inside it to add
 * point markers.
 */
export function Line({
  dataKey,
  strokeVariant = 'solid',
  curveType,
  animationType,
  connectNulls = false,
  isClickable = false,
  glowing = false,
  enableBufferLine = false,
  children,
  lineProps,
}: LineProps) {
  const {
    config,
    curveType: defaultCurve,
    animationType: defaultAnimation,
    isLoading,
    selectedDataKey,
    selectDataKey,
  } = useLineChart();
  const id = useId().replace(/:/g, ''); // unique id scopes this line's style defs
  // Devices set to "reduce motion" skip the intro reveal entirely
  const shouldReduceMotion = useReducedMotion();

  // The root renders the skeleton line while loading, so real lines step aside
  if (isLoading) return null;

  const resolvedCurve = curveType ?? defaultCurve;

  // The reveal is an animated SVG mask — heavier than a static chart — so
  // `"none"` and the OS reduce-motion preference both opt out of it.
  const revealType: LineAnimationType = shouldReduceMotion
    ? 'none'
    : (animationType ?? defaultAnimation);
  const maskId = revealType === 'none' ? undefined : `${id}-reveal-mask`;

  const isSelected = selectedDataKey === dataKey;
  const hasSelection = selectedDataKey !== null;
  const opacity = getOpacity(selectedDataKey, dataKey);

  const { dot, activeDot } = resolveDots(
    children,
    id,
    dataKey,
    opacity.dot,
    maskId,
  );

  const isAnimatedDashed = strokeVariant === 'animated-dashed';
  const isDashed = strokeVariant === 'dashed' || isAnimatedDashed;

  return (
    <>
      <g key={dataKey}>
        {isClickable && (
          <RechartsLine
            type={resolvedCurve}
            dataKey={dataKey}
            connectNulls={connectNulls}
            stroke="transparent"
            strokeWidth={15}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            legendType="none"
            tooltipType="none"
            style={{ cursor: 'pointer' }}
            onClick={() => selectDataKey(isSelected ? null : dataKey)}
          />
        )}
        <RechartsLine
          type={resolvedCurve}
          dataKey={dataKey}
          connectNulls={connectNulls}
          strokeOpacity={opacity.stroke}
          stroke={`url(#${id}-colors-${dataKey})`}
          filter={glowing ? `url(#${id}-glow-${dataKey})` : undefined}
          dot={dot}
          activeDot={activeDot}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={getStrokeDasharray(enableBufferLine, isDashed)}
          shape={enableBufferLine ? bufferLineShape : undefined}
          // Recharts' built-in line animation is permanently disabled — it drew
          // the line after the dots had already popped in. The motion.dev reveal
          // mask drives the intro instead, wiping stroke and dots in together.
          isAnimationActive={false}
          style={{
            ...(maskId ? { mask: `url(#${maskId})` } : {}),
            ...(isClickable ? { cursor: 'pointer' } : {}),
          }}
          onClick={() => {
            if (!isClickable) return;
            // Clicking the selected line clears the selection, otherwise selects it
            selectDataKey(isSelected ? null : dataKey);
          }}
          {...lineProps}
        >
          {isAnimatedDashed && !hasSelection && <AnimatedDashedStroke />}
        </RechartsLine>
      </g>
      <defs>
        {revealType !== 'none' && <RevealMask id={id} type={revealType} />}
        <ColorGradient id={id} dataKey={dataKey} config={config} />
        {glowing && <GlowFilter id={id} dataKey={dataKey} />}
      </defs>
    </>
  );
}

type DotProps = {
  variant?: DotVariant; // visual style of the point marker
};

/**
 * Declares a resting point marker for the <Line /> it is composed inside.
 * It renders nothing on its own — the parent <Line /> reads its variant and
 * wires it into the Recharts dot slot.
 */
export const Dot: FC<DotProps> = () => null;

/**
 * Declares the hovered/active point marker for the <Line /> it is composed
 * inside. Like <Dot />, it is a configuration slot and renders nothing itself.
 */
export const ActiveDot: FC<DotProps> = () => null;

type XAxisProps = ComponentProps<typeof RechartsXAxis>;

/**
 * The horizontal category axis. Ships with the chart's flat default styling and
 * forwards every Recharts XAxis prop, so `dataKey`, `tickFormatter`, etc. are
 * passed straight through. Hidden automatically while the chart is loading.
 */
export function XAxis({
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  ...props
}: XAxisProps) {
  const { isLoading } = useLineChart();

  if (isLoading) return null;

  return (
    <RechartsXAxis
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      {...props}
    />
  );
}

type YAxisProps = ComponentProps<typeof RechartsYAxis>;

/**
 * The vertical value axis. Ships with the chart's flat default styling and
 * forwards every Recharts YAxis prop. Hidden automatically while the chart is
 * loading.
 */
export function YAxis({
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  width = 'auto',
  ...props
}: YAxisProps) {
  const { isLoading } = useLineChart();

  if (isLoading) return null;

  return (
    <RechartsYAxis
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      width={width}
      {...props}
    />
  );
}

type GridProps = ComponentProps<typeof CartesianGrid>;

/**
 * The background grid lines. Defaults to horizontal-only dashed lines and
 * forwards every Recharts CartesianGrid prop for full control.
 */
export function Grid({
  vertical = false,
  strokeDasharray = '3 3',
  ...props
}: GridProps) {
  return (
    <CartesianGrid
      vertical={vertical}
      strokeDasharray={strokeDasharray}
      {...props}
    />
  );
}

type TooltipProps = {
  variant?: TooltipVariant; // visual style of the tooltip surface
  roundness?: TooltipRoundness; // border-radius of the tooltip
  defaultIndex?: number; // data index shown by default with no hover
  cursor?: boolean; // whether the vertical cursor line follows the pointer
};

/**
 * The hover tooltip. Reads the chart's selection from context so its content
 * dims unselected series. Hidden automatically while the chart is loading.
 */
export function Tooltip({
  variant,
  roundness,
  defaultIndex,
  cursor = true,
}: TooltipProps) {
  const { isLoading, selectedDataKey } = useLineChart();

  if (isLoading) return null;

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={
        cursor ? { strokeDasharray: '3 3', strokeWidth: STROKE_WIDTH } : false
      }
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
 * its series, driving the shared selection state read by every <Line />.
 */
export function Legend({
  variant,
  align = 'right',
  verticalAlign = 'top',
  isClickable = false,
}: LegendProps) {
  const { selectedDataKey, selectDataKey } = useLineChart();

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
// Selection + dot helpers
// ─────────────────────────────────────────────────────────────────────────────

// Returns stroke/dot opacity — dims a series only when another is selected
const getOpacity = (selectedDataKey: string | null, dataKey: string) => {
  if (selectedDataKey === null) {
    return { stroke: 1, dot: 1 };
  }

  return selectedDataKey === dataKey
    ? { stroke: 1, dot: 1 }
    : { stroke: 0.3, dot: 0.3 };
};

// Resolves a line's stroke-dasharray — the buffer line manages its own dashes
const getStrokeDasharray = (enableBufferLine: boolean, isDashed: boolean) => {
  if (enableBufferLine) return undefined;

  return isDashed ? '5 5' : undefined;
};

// Pulls <Dot /> and <ActiveDot /> out of a line's children into Recharts dot slots.
// When a `maskId` is given the resting dot is wired to the intro reveal mask so it
// wipes in with the line; the active dot is always left unmasked since it only
// appears on hover, after the intro has finished.
const resolveDots = (
  children: ReactNode,
  id: string,
  dataKey: string,
  dotOpacity: number,
  maskId: string | undefined,
): { dot: LineDotProp; activeDot: LineActiveDotProp } => {
  let dot: LineDotProp = false;
  let activeDot: LineActiveDotProp = false;

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
          maskId={maskId}
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
// Buffer line
// ─────────────────────────────────────────────────────────────────────────────

// Buffer line shape — renders the last segment as dashed while the rest stays solid.
// Renders a single <Curve> and uses a ref callback to measure the actual SVG path
// length via getTotalLength() + getPointAtLength(), then sets stroke-dasharray
// imperatively. Works correctly with any curve type (linear, natural, monotone, etc.).
type CurvePoint = NonNullable<NonNullable<CurveProps['points']>[number]>;
type DrawableCurvePoint = CurvePoint & { x: number; y: number };

const isDrawableCurvePoint = (
  point: CurvePoint,
): point is DrawableCurvePoint => {
  return typeof point.x === 'number' && typeof point.y === 'number';
};

const BUFFER_DASH_SIZE = 4;
const BUFFER_GAP_SIZE = 3;

// Binary-search the path to find the length at which path.x ≈ targetX,
// using the browser's native getPointAtLength for exact curve measurement.
const findLengthAtX = (
  path: SVGPathElement,
  totalLength: number,
  targetX: number,
): number => {
  let lo = 0;
  let hi = totalLength;
  // ~0.5px precision is more than enough for a dasharray split
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    const pt = path.getPointAtLength(mid);
    if (pt.x < targetX) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

const bufferLineShape = (props: CurveProps) => {
  const { points, ...rest } = props;

  if (!points || points.length < 2) {
    return <Curve {...props} />;
  }

  const drawablePoints = points.filter(isDrawableCurvePoint);

  if (drawablePoints.length < 2) {
    return <Curve {...props} />;
  }

  // x coordinate of the second-to-last point — where solid meets dashed
  const splitX = drawablePoints[drawablePoints.length - 2].x;

  // Ref callback runs synchronously during React commit (before browser paint),
  // so there's no visible flash of an un-dashed line.
  const gRef = (g: SVGGElement | null) => {
    if (!g) return;
    const path = g.querySelector('path');
    if (!path) return;

    const totalLength = path.getTotalLength();
    const solidLength = findLengthAtX(path, totalLength, splitX);
    const lastSegmentLength = totalLength - solidLength;

    // Build dasharray: solid run, then repeating dash-gap for the buffer segment
    const reps =
      Math.ceil(lastSegmentLength / (BUFFER_DASH_SIZE + BUFFER_GAP_SIZE)) + 1;
    const dashedPart = Array.from(
      { length: reps },
      () => `${BUFFER_DASH_SIZE} ${BUFFER_GAP_SIZE}`,
    ).join(' ');

    path.setAttribute('stroke-dasharray', `${solidLength} 0 ${dashedPart}`);
  };

  return (
    <g ref={gRef}>
      <Curve {...rest} points={drawablePoints} />
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Style definitions — one set per <Line />, scoped to its unique id
// ─────────────────────────────────────────────────────────────────────────────

type StyleProps = {
  id: string; // unique id of the owning <Line />
  dataKey: string; // series key the style belongs to
};

// Animated dashed-stroke effect, rendered as a child of the Recharts Line
const AnimatedDashedStroke = () => {
  return (
    <>
      <animate
        attributeName="stroke-dasharray"
        values="5 5; 0 5; 5 5"
        dur="1s"
        repeatCount="indefinite"
        keyTimes="0;0.5;1"
      />
      <animate
        attributeName="stroke-dashoffset"
        values="0; -10"
        dur="1s"
        repeatCount="indefinite"
        keyTimes="0;1"
      />
    </>
  );
};

// motion `originX` for each single-rect reveal — the edge the wipe grows from.
// 0 = left edge, 1 = right edge, 0.5 = centre (grows outward to both edges).
const SINGLE_REVEAL_ORIGIN: Record<
  Exclude<RevealAnimationType, 'edges-in'>,
  number
> = {
  'left-to-right': 0,
  'right-to-left': 1,
  'center-out': 0.5,
};

/**
 * Wipe mask driven by motion.dev, played once when a <Line /> mounts. The same
 * mask is applied to the line's stroke and its resting dots, so both reveal in
 * lockstep — fixing Recharts' default, where the dots appeared before the line
 * had finished drawing.
 *
 * `maskUnits`/`maskContentUnits` are both userSpaceOnUse so every masked element
 * shares one coordinate space and the wipe edge lands at the same x on each.
 *
 * Each rect animates `scaleX` 0 → 1; `originX` decides which edge it grows from.
 * "edges-in" needs two rects — each half grows inward from an opposite edge.
 */
const RevealMask = ({
  id,
  type,
}: {
  id: string;
  type: RevealAnimationType;
}) => {
  const reveal = {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: REVEAL_DURATION, ease: REVEAL_EASE },
  };

  return (
    <mask
      id={`${id}-reveal-mask`}
      maskUnits="userSpaceOnUse"
      maskContentUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="100%"
      height="100%"
    >
      {type === 'edges-in' ? (
        <>
          {/* left half wipes inward from the left edge toward the centre */}
          <motion.rect
            {...reveal}
            x="0"
            y="0"
            width="50%"
            height="100%"
            fill="white"
            style={{ originX: 0 }}
          />
          {/* right half wipes inward from the right edge toward the centre */}
          <motion.rect
            {...reveal}
            x="50%"
            y="0"
            width="50%"
            height="100%"
            fill="white"
            style={{ originX: 1 }}
          />
        </>
      ) : (
        <motion.rect
          {...reveal}
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="white"
          style={{ originX: SINGLE_REVEAL_ORIGIN[type] }}
        />
      )}
    </mask>
  );
};

/**
 * Horizontal left-to-right color gradient for a series. Always rendered — the
 * line's stroke and its dots all paint from this single gradient.
 */
const ColorGradient = ({
  id,
  dataKey,
  config,
}: StyleProps & { config: ChartConfig }) => {
  const colorsCount = getColorsCount(config[dataKey] ?? {});

  return (
    <linearGradient id={`${id}-colors-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
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
};

/** Soft outer glow filter applied to a glowing line. */
const GlowFilter = ({ id, dataKey }: StyleProps) => {
  return (
    <filter
      id={`${id}-glow-${dataKey}`}
      x="-50%"
      y="-50%"
      width="200%"
      height="200%"
    >
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 2 0"
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

// Builds bell-curve eased gradient stops for the loading shimmer
const generateEasedGradientStops = (
  steps: number = 17,
  minOpacity: number = 0.05,
  maxOpacity: number = 0.9,
) => {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1); // 0 to 1
    // Sine-based bell curve easing: peaks at center (t=0.5), smooth falloff at edges
    const eased = Math.sin(t * Math.PI) ** 2;
    const opacity = minOpacity + eased * (maxOpacity - minOpacity);
    return {
      offset: `${(t * 100).toFixed(0)}%`,
      opacity: Number(opacity.toFixed(3)),
    };
  });
};

/**
 * Hook to manage loading data with pixel-perfect shimmer synchronization.
 *
 * Uses motion.dev's onUpdate callback to ensure chart data is only regenerated
 * when the shimmer has completely exited the visible area. This eliminates
 * timing drift issues from setTimeout/setInterval.
 */
export function useLoadingData(isLoading: boolean, loadingPoints: number = 14) {
  const [loadingDataKey, setLoadingDataKey] = useState(false);

  // Callback fired by motion.dev when the shimmer exits the visible area
  const onShimmerExit = useCallback(() => {
    if (isLoading) {
      setLoadingDataKey((prev) => !prev);
    }
  }, [isLoading]);

  const loadingData = useMemo(
    () => getLoadingData(loadingPoints),
    // loadingDataKey toggle triggers re-computation when the shimmer exits
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingPoints, loadingDataKey],
  );

  return { loadingData, onShimmerExit };
}

/**
 * The skeleton line shown while the chart is loading. Rendered by the root in
 * place of the real lines, paired with its own masked shimmer pattern.
 */
const LoadingLine = ({
  chartId,
  curveType,
  onShimmerExit,
}: {
  chartId: string;
  curveType: CurveType;
  onShimmerExit: () => void;
}) => {
  return (
    <>
      <RechartsLine
        type={curveType}
        dataKey={LOADING_LINE_DATA_KEY}
        min={0}
        max={100}
        stroke="currentColor"
        strokeOpacity={0.5}
        isAnimationActive={false}
        legendType="none"
        tooltipType="none"
        activeDot={false}
        dot={false}
        strokeWidth={STROKE_WIDTH}
        style={{ mask: `url(#${chartId}-loading-mask)` }}
      />
      <defs>
        <LoadingPattern chartId={chartId} onShimmerExit={onShimmerExit} />
      </defs>
    </>
  );
};

/**
 * Animated shimmer pattern for the loading skeleton.
 *
 * The visible chart area is normalized to 0-1, the shimmer gradient has width 1,
 * and the pattern is 3x wide so the shimmer has buffer on both sides. The motion
 * rect travels x from -1 to 2; onShimmerExit fires as it crosses x=1, letting the
 * data swap happen while the shimmer is off-screen for a seamless loop.
 */
const LoadingPattern = ({
  chartId,
  onShimmerExit,
}: {
  chartId: string;
  onShimmerExit: () => void;
}) => {
  const gradientStops = generateEasedGradientStops();

  // 1 (left buffer) + 1 (visible) + 1 (right buffer)
  const patternWidth = 3;
  const startX = -1;
  const endX = 2;

  // Tracks the last x value to detect the exit threshold crossing
  const lastXRef = useRef(startX);

  return (
    <>
      <linearGradient
        id={`${chartId}-loading-gradient`}
        x1="0"
        y1="0"
        x2="1"
        y2="0"
      >
        {gradientStops.map(({ offset, opacity }) => (
          <stop
            key={offset}
            offset={offset}
            stopColor="white"
            stopOpacity={opacity}
          />
        ))}
      </linearGradient>
      <pattern
        id={`${chartId}-loading-pattern`}
        patternUnits="objectBoundingBox"
        patternContentUnits="objectBoundingBox"
        patternTransform="rotate(25)"
        width={patternWidth}
        height="1"
        x="0"
        y="0"
      >
        <motion.rect
          y="0"
          width="1"
          height="1"
          fill={`url(#${chartId}-loading-gradient)`}
          initial={{ x: startX }}
          animate={{ x: endX }}
          transition={{
            duration: LOADING_ANIMATION_DURATION / 1000,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
          onUpdate={(latest) => {
            const xValue = typeof latest.x === 'number' ? latest.x : startX;
            const lastX = lastXRef.current;

            // Fire once per loop, when the shimmer fully exits the visible area
            if (xValue >= 1 && lastX < 1) {
              onShimmerExit();
            }

            lastXRef.current = xValue;
          }}
        />
      </pattern>
      <mask id={`${chartId}-loading-mask`} maskUnits="userSpaceOnUse">
        <rect
          width="100%"
          height="100%"
          fill={`url(#${chartId}-loading-pattern)`}
        />
      </mask>
    </>
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

          Finally, create last file called `dot.tsx` inside the `evilcharts/ui` folder and paste the code there.


          ### components/evilcharts/ui/dot.tsx

```tsx
import { cn } from '@/lib/utils';
import * as React from 'react';

export type DotVariant = 'default' | 'border' | 'colored-border';

type ChartDotProps = {
  cx?: number;
  cy?: number;
  dataKey: string;
  chartId: string;
  className?: string;
  fillOpacity?: number;
  type?: DotVariant;
  /** Optional SVG <mask> id — lets the dot share an area's intro reveal wipe. */
  maskId?: string;
};

const ChartDot = React.memo(function ChartDot({
  cx,
  cy,
  dataKey,
  chartId,
  className,
  fillOpacity = 1,
  type = 'default',
  maskId,
}: ChartDotProps) {
  const dotId = React.useId().replace(/:/g, '');
  const gradientUrl = `url(#${chartId}-colors-${String(dataKey)})`;

  if (cx === undefined || cy === undefined) return null;

  switch (type) {
    case 'border':
      return (
        <PrimaryBorderDot
          cx={cx}
          cy={cy}
          dotId={dotId}
          fillOpacity={fillOpacity}
          gradientUrl={gradientUrl}
          className={className}
          maskId={maskId}
        />
      );
    case 'colored-border':
      return (
        <ColoredBorderDot
          cx={cx}
          cy={cy}
          dotId={dotId}
          fillOpacity={fillOpacity}
          gradientUrl={gradientUrl}
          className={className}
          maskId={maskId}
        />
      );
    default:
      return (
        <DefaultDot
          cx={cx}
          cy={cy}
          dotId={dotId}
          fillOpacity={fillOpacity}
          gradientUrl={gradientUrl}
          className={className}
          maskId={maskId}
        />
      );
  }
});

type DotVariantProps = {
  cx: number;
  cy: number;
  dotId: string;
  fillOpacity: number;
  gradientUrl: string;
  className?: string;
  maskId?: string;
};

const DefaultDot = React.memo(
  ({
    cx,
    cy,
    dotId,
    fillOpacity,
    gradientUrl,
    className,
    maskId,
  }: DotVariantProps) => {
    const r = 3;
    return (
      <g className={className} mask={maskId ? `url(#${maskId})` : undefined}>
        <defs>
          <clipPath id={`dot-clip-${dotId}`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        {/* Full-width gradient rectangle clipped to dot shape */}
        <rect
          x="0"
          y={cy - r}
          width="100%"
          height={r * 2}
          fill={gradientUrl}
          fillOpacity={fillOpacity}
          clipPath={`url(#dot-clip-${dotId})`}
        />
      </g>
    );
  },
);

DefaultDot.displayName = 'DefaultDot';

const PrimaryBorderDot = React.memo(
  ({
    cx,
    cy,
    dotId,
    fillOpacity,
    gradientUrl,
    className,
    maskId,
  }: DotVariantProps) => {
    const r = 6;
    const strokeWidth = 5;
    return (
      <g
        className={cn(className, 'text-background')}
        mask={maskId ? `url(#${maskId})` : undefined}
      >
        <defs>
          <clipPath id={`dot-clip-${dotId}`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        {/* Background stroke (border) */}
        <circle cx={cx} cy={cy} r={r} fill="currentColor" />
        {/* Inner gradient circle clipped */}
        <rect
          x="0"
          y={cy - (r - strokeWidth / 2)}
          width="100%"
          height={(r - strokeWidth / 2) * 2}
          fill={gradientUrl}
          fillOpacity={fillOpacity}
          clipPath={`url(#dot-clip-inner-${dotId})`}
        />
        <defs>
          <clipPath id={`dot-clip-inner-${dotId}`}>
            <circle cx={cx} cy={cy} r={r - strokeWidth / 2} />
          </clipPath>
        </defs>
      </g>
    );
  },
);

PrimaryBorderDot.displayName = 'PrimaryBorderDot';

const ColoredBorderDot = React.memo(
  ({
    cx,
    cy,
    dotId,
    fillOpacity,
    gradientUrl,
    className,
    maskId,
  }: DotVariantProps) => {
    const r = 3;
    const strokeWidth = 1;
    return (
      <g
        className={cn(className, 'text-background')}
        mask={maskId ? `url(#${maskId})` : undefined}
      >
        <defs>
          <clipPath id={`dot-clip-${dotId}`}>
            <circle cx={cx} cy={cy} r={r + strokeWidth / 2} />
          </clipPath>
        </defs>
        {/* Gradient stroke (border) via clipped rect */}
        <rect
          x="0"
          y={cy - r - strokeWidth / 2}
          width="100%"
          height={(r + strokeWidth / 2) * 2}
          fill={gradientUrl}
          fillOpacity={fillOpacity}
          clipPath={`url(#dot-clip-${dotId})`}
        />
        {/* Inner solid fill */}
        <circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill="currentColor" />
      </g>
    );
  },
);

ColoredBorderDot.displayName = 'ColoredBorderDot';

export { ChartDot };
```

## Usage

The line chart is composible. `<EvilLineChart>` is the container, and you compose only the parts you need — `<Grid>`, `<XAxis>`, `<YAxis>`, `<Legend>`, `<Tooltip>`, and one or more `<Line>` — as its children. Each `<Line>` carries its own `strokeVariant`, `curveType`, `glowing`, `enableBufferLine`, and `isClickable`, so a single chart can mix stroke styles and make only some series interactive.

```tsx
import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Grid,
  Tooltip,
  Legend,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
```

```tsx
<EvilLineChart data={data} config={chartConfig} curveType="monotone">
  <Grid />
  <XAxis dataKey="month" />
  <YAxis />
  <Legend isClickable />
  <Tooltip />
  <Line dataKey="desktop" strokeVariant="solid" isClickable>
    <Dot variant="border" />
    <ActiveDot variant="colored-border" />
  </Line>
  <Line dataKey="mobile" strokeVariant="dashed" glowing>
    <ActiveDot variant="default" />
  </Line>
</EvilLineChart>
```

### Interactive Selection

Add `isClickable` to any `<Line>` (and to `<Legend>`) to make those series selectable. Use the `onSelectionChange` callback on `<EvilLineChart>` to handle selection events:

```tsx
<EvilLineChart
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
  <XAxis dataKey="month" />
  <Legend isClickable />
  <Tooltip />
  <Line dataKey="desktop" strokeVariant="solid" isClickable />
  <Line dataKey="mobile" strokeVariant="solid" isClickable />
</EvilLineChart>
```

### Loading State

### isLoading='true'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={[]} // if isLoading is true, pass empty array → i.e isLoading ? [] : data
      config={chartConfig}
      className="h-full w-full p-4"
      isLoading={true} // [!code highlight]
      curveType="bump"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <YAxis dataKey="desktop" />
      <Legend isClickable />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" isClickable>
        <ActiveDot variant="default" />
      </Line>
      <Line dataKey="mobile" strokeVariant="solid" isClickable>
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

>

    The line chart supports loading state. You can pass the `isLoading` prop to the chart to show the loading state. You can also pass `curveType` to customize the curve type of the loading state. Here, im using `curveType='bump'` to make the loading state more realistic.

### Buffer Line

### enableBufferLine='true'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
      showBrush
      xDataKey="month"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend isClickable />
      <Tooltip />
      <Line
        dataKey="desktop"
        strokeVariant="solid"
        enableBufferLine // [!code highlight]
        isClickable
      >
        <Dot variant="border" />
        <ActiveDot variant="colored-border" />
      </Line>
      <Line
        dataKey="mobile"
        strokeVariant="solid"
        enableBufferLine // [!code highlight]
        isClickable
      >
        <Dot variant="border" />
        <ActiveDot variant="colored-border" />
      </Line>
    </EvilLineChart>
  );
}
```

>

    When `enableBufferLine` is enabled, the last segment of each line is rendered as a dashed/dotted pattern while the rest of the line stays solid. This is useful for indicating projected, estimated, or incomplete data at the end of a series — commonly seen in financial charts and forecasting dashboards.

## Examples

Below are some examples of the line chart with different `variants`. where you can change the `curveType` & `strokeVariant`.

### Gradient Colors

### gradient colors

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['red', 'orange', 'rosybrown', 'purple', 'blue'], // [!code highlight]
      dark: ['red', 'orange', 'rosybrown', 'purple', 'blue'], // [!code highlight]
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['gray'],
      dark: ['gray'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend isClickable />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" isClickable>
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Line>
      <Line dataKey="mobile" strokeVariant="solid" isClickable>
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### gradient colors - bump

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['red', 'orange', 'rosybrown', 'purple', 'blue'],
      dark: ['red', 'orange', 'rosybrown', 'purple', 'blue'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['gray'],
      dark: ['gray'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
      curveType="bump" // [!code highlight]
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend isClickable />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" isClickable>
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Line>
      <Line dataKey="mobile" strokeVariant="solid" isClickable>
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### Curve Types

### curveType='bump'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
      curveType="bump" // [!code highlight]
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <YAxis dataKey="desktop" />
      <Legend isClickable />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" isClickable>
        <Dot variant="default" />
        <ActiveDot variant="default" />
      </Line>
      <Line dataKey="mobile" strokeVariant="solid" isClickable>
        <Dot variant="default" />
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### curveType='step'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
      curveType="step" // [!code highlight]
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <YAxis dataKey="desktop" />
      <Legend isClickable />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" isClickable>
        <Dot variant="default" />
        <ActiveDot variant="default" />
      </Line>
      <Line dataKey="mobile" strokeVariant="solid" isClickable>
        <Dot variant="default" />
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### curveType='monotoneY'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
      curveType="monotoneY" // [!code highlight]
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <YAxis dataKey="desktop" />
      <Legend isClickable />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" isClickable>
        <Dot variant="default" />
        <ActiveDot variant="default" />
      </Line>
      <Line dataKey="mobile" strokeVariant="solid" isClickable>
        <Dot variant="default" />
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### Stroke Variants

### strokeVariant='solid'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <YAxis dataKey="desktop" />
      <Legend isClickable />
      <Tooltip />
      <Line
        dataKey="desktop"
        strokeVariant="solid" // [!code highlight]
        isClickable
      >
        <ActiveDot variant="default" />
      </Line>
      <Line
        dataKey="mobile"
        strokeVariant="solid" // [!code highlight]
        isClickable
      >
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### strokeVariant='dashed'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <YAxis dataKey="desktop" />
      <Legend isClickable />
      <Tooltip />
      <Line
        dataKey="desktop"
        strokeVariant="dashed" // [!code highlight]
        isClickable
      >
        <ActiveDot variant="default" />
      </Line>
      <Line
        dataKey="mobile"
        strokeVariant="dashed" // [!code highlight]
        isClickable
      >
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### strokeVariant='animated-dashed'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <YAxis dataKey="desktop" />
      <Legend isClickable />
      <Tooltip />
      <Line
        dataKey="desktop"
        strokeVariant="animated-dashed" // [!code highlight]
        isClickable
      >
        <ActiveDot variant="default" />
      </Line>
      <Line
        dataKey="mobile"
        strokeVariant="animated-dashed" // [!code highlight]
        isClickable
      >
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### Glowing Lines

### glowing - gradient colors

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['red', 'orange', 'rosybrown', 'purple', 'blue'],
      dark: ['red', 'orange', 'rosybrown', 'purple', 'blue'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['gray'],
      dark: ['gray'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend isClickable />
      <Tooltip />
      <Line
        dataKey="desktop"
        strokeVariant="solid"
        glowing // [!code highlight]
        isClickable
      >
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Line>
      <Line dataKey="mobile" strokeVariant="solid" isClickable>
        <Dot variant="colored-border" />
        <ActiveDot variant="default" />
      </Line>
    </EvilLineChart>
  );
}
```

### glowing - solid colors

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
  Dot,
  ActiveDot,
} from '@/components/evilcharts/charts/line-chart';
import { type ChartConfig } from '@/components/evilcharts/ui/chart';

const data = [
  { month: 'January', desktop: 342, mobile: 184 },
  { month: 'February', desktop: 876, mobile: 491 },
  { month: 'March', desktop: 512, mobile: 290 },
  { month: 'April', desktop: 629, mobile: 391 },
  { month: 'May', desktop: 458, mobile: 309 },
  { month: 'June', desktop: 781, mobile: 449 },
  { month: 'July', desktop: 394, mobile: 234 },
  { month: 'August', desktop: 925, mobile: 557 },
  { month: 'September', desktop: 647, mobile: 367 },
  { month: 'October', desktop: 532, mobile: 357 },
  { month: 'November', desktop: 803, mobile: 515 },
  { month: 'December', desktop: 271, mobile: 149 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    colors: {
      light: ['#047857'],
      dark: ['#10b981'],
    },
  },
  mobile: {
    label: 'Mobile',
    colors: {
      light: ['#be123c'],
      dark: ['#f43f5e'],
    },
  },
} satisfies ChartConfig;

export function EvilExampleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend isClickable />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" isClickable>
        <Dot variant="border" />
        <ActiveDot variant="colored-border" />
      </Line>
      <Line
        dataKey="mobile"
        strokeVariant="solid"
        glowing // [!code highlight]
        isClickable
      >
        <Dot variant="border" />
        <ActiveDot variant="colored-border" />
      </Line>
    </EvilLineChart>
  );
}
```

## API Reference

The chart is composed of several parts. The props below are grouped by the component they belong to.

<ApiHeading>EvilLineChart</ApiHeading>

The root container. It owns the data, the shared selection state, the loading skeleton, and the optional brush. Everything visual is composed as its children.

### `data` (required)

type: `TData[]`

Data used to display the chart. An array of objects where each object represents a data point (`TData extends Record<string, unknown>`).

### `config`

" required>
Configuration object that defines the chart's series. Each key should match a data key in your data array, with a corresponding color or color array.

### `children` (required)

type: `ReactNode`

The composed chart parts — `<Grid />`, `<XAxis />`, `<YAxis />`, `<Legend />`, `<Tooltip />`, and one or more `<Line />`.

### `className`

type: `string`

Additional CSS classes to apply to the chart container.

### `curveType`

type: `"basis" | "bumpX" | "bumpY" | "bump" | "linear" | "natural" | "monotoneX" | "monotoneY" | "monotone" | "step" | …` · default: `"linear"`

The default curve interpolation inherited by every `<Line />`. Each `<Line />` may override it locally.

### `animationType`

type: `"none" | "left-to-right" | "right-to-left" | "center-out" | "edges-in"` · default: `"left-to-right"`

Direction of the custom intro reveal inherited by every `<Line />`. `"none"` disables it — devices with the OS reduce-motion preference fall back to `"none"` automatically.

### `defaultSelectedDataKey`

type: `string | null` · default: `null`

The data key that should be selected by default.

### `onSelectionChange`

void">
Callback fired when a series is selected or deselected — by clicking a clickable `<Line />` or `<Legend />` entry. Receives the selected data key, or `null` when deselected.

### `isLoading`

type: `boolean` · default: `false`

Shows a loading skeleton animation with a shimmer effect when data is being fetched.

### `loadingPoints`

type: `number` · default: `14`

Number of data points to display in the loading skeleton.

### `showBrush`

type: `boolean` · default: `false`

When enabled, displays a brush control below the chart for selecting and zooming into a range of data.

### `xDataKey`

type: `keyof TData & string`

The data key used for the x-axis. Only needed by the brush footer — the axis itself reads its key from `<XAxis dataKey="…" />`.

### `brushHeight`

type: `number`

The height of the brush preview area in pixels.

### `brushFormatLabel`

string">
Custom formatter for the brush axis labels.

### `onBrushChange`

void">
Callback invoked when the user changes the brush selection range.

### `chartProps`

">
Additional props forwarded to the underlying Recharts LineChart component. Read the [Recharts LineChart documentation](https://recharts.github.io/en-US/api/LineChart/) for available props.

<ApiHeading>Line</ApiHeading>

A single line series. Each `<Line />` is self-contained and generates its own gradient and glow definitions, so a chart can hold any number of lines — each with its own stroke, glow, and clickability.

### `dataKey` (required)

type: `string`

The series key. Must exist on both the data rows and the chart `config`.

### `strokeVariant`

type: `"solid" | "dashed" | "animated-dashed"` · default: `"solid"`

The visual style for this line's stroke. Applies to this line only.

### `curveType`

type: `"basis" | "bump" | "linear" | "natural" | "monotoneX" | "monotoneY" | "monotone" | "step" | "stepBefore" | "stepAfter" | …`

The curve interpolation for this line. Falls back to the chart's `curveType` when omitted.

### `animationType`

type: `"none" | "left-to-right" | "right-to-left" | "center-out" | "edges-in"`

The intro reveal animation for this line. Falls back to the chart's `animationType` when omitted.

### `connectNulls`

type: `boolean` · default: `false`

Whether to connect line segments across null or missing values.

### `isClickable`

type: `boolean` · default: `false`

Lets this line be selected by clicking it. When any line is selected, unselected lines become semi-transparent.

### `glowing`

type: `boolean` · default: `false`

Applies a soft outer glow to this line.

### `enableBufferLine`

type: `boolean` · default: `false`

Renders this line's last segment as a dashed buffer while the rest stays solid. Useful for indicating projected or incomplete data at the end of a series.

### `children`

type: `ReactNode`

Optional `<Dot />` and `<ActiveDot />` composition that adds point markers to this line.

### `lineProps`

">
Escape hatch for raw props forwarded to the underlying Recharts Line component.

<ApiHeading>Dot and ActiveDot</ApiHeading>

Point markers composed inside a `<Line />`. `<Dot />` is the resting marker; `<ActiveDot />` is the hovered marker. They render nothing on their own — the parent `<Line />` reads their `variant`.

### `variant`

type: `"default" | "border" | "colored-border"`

The visual style of the point marker.

<ApiHeading>XAxis and YAxis</ApiHeading>

The category and value axes. Both ship with the chart's flat default styling and forward every Recharts axis prop, so `dataKey`, `tickFormatter`, `tickMargin`, etc. pass straight through. They are hidden automatically while the chart is loading.

### `dataKey`

type: `string`

The data key for the axis values.

### `…axisProps`

Every other Recharts XAxis / YAxis prop is forwarded as-is. Read the [Recharts XAxis](https://recharts.github.io/en-US/api/XAxis/) and [Recharts YAxis](https://recharts.github.io/en-US/api/YAxis/) documentation for available props.

<ApiHeading>Grid</ApiHeading>

The background grid lines. Defaults to horizontal-only dashed lines and forwards every Recharts CartesianGrid prop.

### `…gridProps`

Every Recharts CartesianGrid prop is forwarded as-is. Read the [Recharts CartesianGrid documentation](https://recharts.github.io/en-US/api/CartesianGrid/) for available props.

<ApiHeading>Tooltip</ApiHeading>

The hover tooltip. It reads the chart's selection state so its content dims unselected series.

### `variant`

type: `"default" | "frosted-glass"` · default: `"default"`

The visual style of the tooltip surface.

### `roundness`

type: `"sm" | "md" | "lg" | "xl"` · default: `"lg"`

Controls the border-radius of the tooltip.

### `defaultIndex`

type: `number`

When set, the tooltip is visible by default at the specified data point index.

### `cursor`

type: `boolean` · default: `true`

Whether the vertical cursor line follows the pointer on hover.

<ApiHeading>Legend</ApiHeading>

The series legend. When the chart is clickable, each entry toggles selection of its series.

### `variant`

type: `"square" | "circle" | "circle-outline" | "rounded-square" | "rounded-square-outline" | "vertical-bar" | "horizontal-bar"`

The visual style of the legend indicators.

### `align`

type: `"left" | "center" | "right"` · default: `"right"`

Horizontal placement of the legend.

### `verticalAlign`

type: `"top" | "middle" | "bottom"` · default: `"top"`

Vertical placement of the legend.

### `isClickable`

type: `boolean` · default: `false`

Lets each legend entry toggle selection of its series.
