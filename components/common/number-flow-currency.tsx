'use client';

import NumberFlow, { type Format } from '@number-flow/react';

type NumberFlowCurrencyProps = {
  /** The numeric value to display */
  value: number;
  /** Currency code (default: INR) */
  currency?: string;
  /** Locale for formatting (default: en-IN) */
  locale?: string;
  /** Additional className */
  className?: string;
  /** Whether to show the sign (+/-) */
  showSign?: boolean;
};

const defaultFormat: Format = {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

/**
 * Animated currency display using NumberFlow.
 * Use this throughout the app for all money values.
 */
export function NumberFlowCurrency({
  value,
  currency = 'INR',
  locale = 'en-IN',
  className,
  showSign = false,
}: NumberFlowCurrencyProps) {
  const format: Format = {
    ...defaultFormat,
    currency,
    signDisplay: showSign ? 'exceptZero' : 'auto',
  };

  return (
    <NumberFlow
      value={value}
      format={format}
      locales={locale}
      className={className}
      willChange
    />
  );
}
