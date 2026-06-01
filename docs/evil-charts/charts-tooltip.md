---
title: Tooltip
description: Display interactive tooltips when hovering over chart data points
image: /og/tooltip.png
---

## Usage

```tsx
<EvilBarChart
  xDataKey="month"
  data={data}
  tooltipRoundness="md" | "sm" | "lg" | "xl"
  chartConfig={chartConfig}
  tooltipVariant="frosted-glass" | "default" // and so on
/>
```

## Variants

Control the visual style of the tooltip with the `tooltipVariant` prop. Accepts `"default"` or `"frosted-glass"`.

### Default

The default variant uses a solid background.

### tooltipVariant='default'

```tsx
'use client';

import {
  EvilBarChart,
  Bar,
  XAxis,
  Grid,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/bar-chart';
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

export function EvilExampleTooltipDefaultBarChart() {
  return (
    <EvilBarChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <Grid />
      <XAxis
        dataKey="month"
        tickFormatter={(value: string) => value.substring(0, 3)}
      />
      <Legend />
      <Tooltip
        variant="default" // [!code highlight]
        defaultIndex={4}
      />
      <Bar dataKey="desktop" variant="default" />
      <Bar dataKey="mobile" variant="default" />
    </EvilBarChart>
  );
}
```

### Frosted Glass

The frosted-glass variant applies a semi-transparent background with a backdrop blur effect for a frosted-glass look.

### tooltipVariant='frosted-glass'

```tsx
'use client';

import {
  EvilBarChart,
  Bar,
  XAxis,
  Grid,
  Tooltip,
  Legend,
} from '@/components/evilcharts/charts/bar-chart';
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

export function EvilExampleTooltipFrostedGlassBarChart() {
  return (
    <EvilBarChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <Grid />
      <XAxis
        dataKey="month"
        tickFormatter={(value: string) => value.substring(0, 3)}
      />
      <Legend />
      <Tooltip
        variant="frosted-glass" // [!code highlight]
        defaultIndex={4}
      />
      <Bar dataKey="desktop" variant="default" />
      <Bar dataKey="mobile" variant="default" />
    </EvilBarChart>
  );
}
```

## API Reference

### `tooltipVariant`

type: `"default" | "frosted-glass"` · default: `"default"`

Controls the visual style of the tooltip.

### `tooltipRoundness`

type: `"sm" | "md" | "lg" | "xl"` · default: `"lg"`

Controls the border-radius of the tooltip.

### `tooltipDefaultIndex`

type: `number`

When set, the tooltip will be visible by default at the specified data point index.

### `hideTooltip`

type: `boolean` · default: `false`

When `true`, hides the tooltip entirely.

### `indicator`

type: `"line" | "dot" | "dashed"` · default: `"dot"`

The style of the color indicator shown next to each tooltip item.

### `hideLabel`

type: `boolean` · default: `false`

When `true`, hides the label (e.g. month name) at the top of the tooltip.

### `hideIndicator`

type: `boolean` · default: `false`

When `true`, hides the color indicator dot/line next to each tooltip item.
