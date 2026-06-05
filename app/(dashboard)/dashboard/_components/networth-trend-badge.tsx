'use client';

import { motion, MotionConfig } from 'motion/react';
import NumberFlow, { useCanAnimate } from '@number-flow/react';
import { ArrowUp } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState, type CSSProperties } from 'react';

const MotionNumberFlow = motion.create(NumberFlow);
const MotionArrowUp = motion.create(ArrowUp);

type Props = {
  value: number;
};

export function NetworthTrendBadge({ value }: Props) {
  const canAnimate = useCanAnimate();
  const [currentValue, setCurrentValue] = useState<number>(0);

  useEffect(() => {
    // A small timeout ensures the browser paints 0 first, triggering the animation
    const timer = setTimeout(() => {
      setCurrentValue(value);
    }, 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <MotionConfig
      // Disable layout animations if NumberFlow can't animate.
      transition={{
        layout: canAnimate
          ? { duration: 0.9, bounce: 0, type: 'spring' }
          : { duration: 0 },
      }}
    >
      <motion.span
        className={clsx(
          value >= 0
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
            : 'border-red-500/20 bg-red-500/10 text-red-500',
          'focus:ring-ring inline-flex items-center border px-2.5 py-0.5 text-xs transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:outline-none',
        )}
        layout
        style={{ borderRadius: 999 }}
      >
        <MotionArrowUp
          className="mr-0.5 size-3"
          absoluteStrokeWidth
          strokeWidth={3}
          layout // undo parent
          transition={{
            rotate: canAnimate
              ? { type: 'spring', duration: 0.5, bounce: 0 }
              : { duration: 0 },
          }}
          animate={{ rotate: value >= 0 ? 0 : -180 }}
          initial={false}
        />
        <MotionNumberFlow
          value={Math.abs(currentValue)}
          className="font-semibold"
          format={{
            style: 'percent',
            maximumFractionDigits: 1,
            signDisplay: 'never',
          }}
          style={{ '--number-flow-mask-height': '0.3em' } as CSSProperties}
          // Important, see note below:
          layout
          layoutRoot
        />
      </motion.span>
    </MotionConfig>
  );
}
