import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FlippableAccountCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accountName: string;
  accountHolderName?: string;
  balanceElement: React.ReactNode;
  accountType: string;
  currency: string;
  color?: string;
  iconElement?: React.ReactNode;
  hideGlow?: boolean;
  solidBackground?: boolean;
}

const FlippableAccountCard = React.forwardRef<
  HTMLDivElement,
  FlippableAccountCardProps
>(
  (
    {
      className,
      accountName,
      accountHolderName,
      balanceElement,
      accountType,
      currency,
      color,
      iconElement,
      hideGlow,
      solidBackground,
      ...props
    },
    ref,
  ) => {
    // Generate a subtle gradient based on the account color, fallback to slate if none
    const baseColor = color || '#475569';
    const holder = accountHolderName || 'USER';

    return (
      <div
        className={cn(
          'group relative h-48 w-full max-w-sm overflow-hidden rounded-2xl text-white shadow-xl transition-all hover:shadow-2xl',
          className,
        )}
        style={{
          background: solidBackground
            ? baseColor
            : `linear-gradient(135deg, ${baseColor}cc 0%, ${baseColor} 100%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 24px -8px ${baseColor}80`,
        }}
        ref={ref}
        {...props}
      >
        {/* Background texture/glow effect */}
        {!hideGlow && (
          <>
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
          </>
        )}

        <div className="relative flex h-full flex-col justify-between p-5">
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                {iconElement}
              </div>
              <p className="text-sm font-semibold tracking-wide capitalize">
                {accountType}
              </p>
            </div>
            {/* Simulated Chip */}
            <svg
              className="h-8 w-8 opacity-80"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 50 50"
            >
              <image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB6VBMVEUAAACNcTiVeUKVeUOYfEaafEeUeUSYfEWZfEaykleyklaXe0SWekSZZjOYfEWYe0WXfUWXe0WcgEicfkiXe0SVekSXekSWekKYe0a9nF67m12ZfUWUeEaXfESVekOdgEmVeUWWekSniU+VeUKVeUOrjFKYfEWliE6WeESZe0GSe0WYfES7ml2Xe0WXeESUeEOWfEWcf0eWfESXe0SXfEWYekSVeUKXfEWxklawkVaZfEWWekOUekOWekSYfESZe0eXekWYfEWZe0WZe0eVeUSWeETAnmDCoWLJpmbxy4P1zoXwyoLIpWbjvXjivnjgu3bfu3beunWvkFWxkle/nmDivXiWekTnwXvkwHrCoWOuj1SXe0TEo2TDo2PlwHratnKZfEbQrWvPrWua fUfbt3PJp2agg0v0zYX0zYSfgkvKp2frxX7mwHrlv3rsxn/yzIPgvHfduXWXe0XuyIDzzISsjVO1lVm0lFitjVPzzIPqxX7duna0lVncuHTLqGjvyIHeuXXxyYGZfUayk1iyk1e2lln1zYTEomO2llrb tnOafkjFpGSbfkfZtXLhvHfkv3nqxH3mwXujhU3KqWizlFilh06khk2fgkqsjlPHpWXJp2erjVOhg0yWe0SliE+XekShhEvAn2D///+gx8TWAAAARnRSTlMACVCTtsRl7Pv7+vxkBab7pZv5+ZlL/UnU/f3SJCVe+Fx39naA9/75XSMh0/3SSkia+pil/KRj7Pr662JPkrbP7OLQ0JFOijI1MwAAAAFiS0dEorDd34wAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IDx2lsiuJAAACLElEQVRIx2NgGAXkAUYmZhZWPICFmYkRVQcbOwenmzse4MbFzc6DpIGXj8PD04sA8PbhF+CFaxEU8iWkAQT8hEVgOkTF/InR4eUVICYO1SIhCRMLDAoKDvFDVhUaEhwUFAjjSUlDdMiEhcOEItzdI6OiYxA6YqODIt3dI2DcuDBZsBY5eVTr4xMSYcyk5BRUOXkFsBZFJTQnp6alQxgZmVloUkrKYC0qqmji2WE5EEZuWB6alKoKdi35YQUQRkFYPpFaCouKIYzi6EDitJSUlsGY5RWVRGjJLyxNy4ZxqtIqqvOxaVELQwZFZdkIJVU1RSiSalAt6rUwUBdWG1CP6pT6gNqwOrgCdQyHNYR5YQFhDXj8MiK1IAeyN6aORiyBjByVTc0FqBoKWpqwRCVSgilOaY2OaUPw29qjOzqLvTAchpos47u6EZyYnngUSRwpuTe6D+6qaFQdOPNLRzOM1dzhRZyW+CZouHk3dWLXglFcFIflQhj9YWjJGlZcaKAVSvjyPrRQ0oQVKDAQHlYFYUwIm4gqExGmBSkutaVQJeomwViTJqPK6OhCy2Q9sQBk8cY0DxjTJw0lAQWK6cOKfgNhpKK7ZMpUeF3jPa28BCETamiEqJKM+X1gxvWXpoUjVIVPnwErw71nmpgiqiQGBjNzbgs3j1nus+fMndc+Cwm0T52/oNR9lsdCS24ra7Tq1cbWjpXV3sHRCb1idXZ0sGdltXNxRateRwHRAACYHutzk/2I5QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMi0xM1QwODoxNToyOSswMDowMEUnN7UAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDItMTNUMDg6MTU6MjkrMDA6MDA0eo8JAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAyLTEzVDA4OjE1OjI5KzAwOjAwY2+u1gAAAABJRU5ErkJggg==" />
            </svg>
          </div>

          {/* Bank Name / Balance */}
          <div className="mt-2 flex flex-col gap-1">
            <div className="max-w-[200px] truncate text-base font-semibold tracking-wide uppercase opacity-90">
              {accountName}
            </div>
            <div className="text-3xl font-bold tracking-tighter drop-shadow-md">
              {balanceElement}
            </div>
          </div>

          {/* Card Footer */}
          <div className="mt-auto flex items-end justify-between">
            <div className="text-left">
              <p className="mb-0.5 text-[10px] font-semibold uppercase opacity-70">
                Account Holder
              </p>
              <p className="max-w-[160px] truncate font-mono text-sm font-medium tracking-wide uppercase">
                {holder}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-0.5 text-[10px] font-semibold uppercase opacity-70">
                Currency
              </p>
              <p className="font-mono text-sm font-medium">
                {currency || 'INR'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
FlippableAccountCard.displayName = 'FlippableAccountCard';

export { FlippableAccountCard };
