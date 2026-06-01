---
title: Legend
description: Display chart legends to identify different data series in your visualizations
image: /og/legend.png
---

## Usage

```tsx
<EvilLineChart
  xDataKey="month"
  data={data}
  chartConfig={chartConfig}
  legendVariant="circle" | "square" | "circle-outline" // and so on
/>
```

## Variants

Control the legend indicator style with the `legendVariant` prop.

### Square

### legendVariant='square'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
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

export function EvilExampleLegendSquareLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend
        variant="square" // [!code highlight]
      />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" />
      <Line dataKey="mobile" strokeVariant="solid" />
    </EvilLineChart>
  );
}
```

### Circle

### legendVariant='circle'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
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

export function EvilExampleLegendCircleLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend
        variant="circle" // [!code highlight]
      />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" />
      <Line dataKey="mobile" strokeVariant="solid" />
    </EvilLineChart>
  );
}
```

### Circle Outline

### legendVariant='circle-outline'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
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

export function EvilExampleLegendCircleOutlineLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend
        variant="circle-outline" // [!code highlight]
      />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" />
      <Line dataKey="mobile" strokeVariant="solid" />
    </EvilLineChart>
  );
}
```

### Rounded Square (Default)

### legendVariant='rounded-square'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
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

export function EvilExampleLegendRoundedSquareLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend
        variant="rounded-square" // [!code highlight]
      />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" />
      <Line dataKey="mobile" strokeVariant="solid" />
    </EvilLineChart>
  );
}
```

### Rounded Square Outline

### legendVariant='rounded-square-outline'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
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

export function EvilExampleLegendRoundedSquareOutlineLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend
        variant="rounded-square-outline" // [!code highlight]
      />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" />
      <Line dataKey="mobile" strokeVariant="solid" />
    </EvilLineChart>
  );
}
```

### Vertical Bar

### legendVariant='vertical-bar'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
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

export function EvilExampleLegendVerticalBarLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend
        variant="vertical-bar" // [!code highlight]
      />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" />
      <Line dataKey="mobile" strokeVariant="solid" />
    </EvilLineChart>
  );
}
```

### Horizontal Bar

### legendVariant='horizontal-bar'

```tsx
'use client';

import {
  EvilLineChart,
  Line,
  XAxis,
  Legend,
  Tooltip,
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

export function EvilExampleLegendHorizontalBarLineChart() {
  return (
    <EvilLineChart
      data={data}
      config={chartConfig}
      className="h-full w-full p-4"
    >
      <XAxis dataKey="month" tickFormatter={(value) => value.substring(0, 3)} />
      <Legend
        variant="horizontal-bar" // [!code highlight]
      />
      <Tooltip />
      <Line dataKey="desktop" strokeVariant="solid" />
      <Line dataKey="mobile" strokeVariant="solid" />
    </EvilLineChart>
  );
}
```

## API Reference

### `legendVariant`

type: `"square" | "circle" | "circle-outline" | "rounded-square" | "rounded-square-outline" | "vertical-bar" | "horizontal-bar"` · default: `"rounded-square"`

Controls the style of the legend indicator icon.

### `hideLegend`

type: `boolean` · default: `false`

When `true`, hides the legend entirely.

### `hideIcon`

type: `boolean` · default: `false`

When `true`, hides the color indicator icon next to each legend item. Only the label text is shown.

### `align`

type: `"left" | "center" | "right"` · default: `"right"`

Controls the horizontal alignment of the legend items.
