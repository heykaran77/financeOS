'use client';

import { useEffect, useState } from 'react';
import NumberFlow, { type NumberFlowProps } from '@number-flow/react';

export function AnimatedNumber({ value, ...props }: NumberFlowProps) {
  // Start at 0 so it animates up to the target value on mount
  const [currentValue, setCurrentValue] = useState<number>(0);

  useEffect(() => {
    // A small timeout ensures the browser paints 0 first, triggering the animation
    const timer = setTimeout(() => {
      setCurrentValue(Number(value));
    }, 50);
    return () => clearTimeout(timer);
  }, [value]);

  return <NumberFlow value={currentValue} {...props} />;
}
