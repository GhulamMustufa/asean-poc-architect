'use client';

/**
 * NumberTicker, adapted from Magic UI (https://magicui.design, MIT).
 * Counts up once when scrolled into view; shows the final value immediately
 * under reduced motion and before hydration (so SSR output is correct).
 */
import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

interface NumberTickerProps extends ComponentPropsWithoutRef<'span'> {
  value: number;
  startValue?: number;
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({ value, startValue = 0, delay = 0, decimalPlaces = 0, className, ...props }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(startValue);
  const spring = useSpring(motionValue, { damping: 40, stiffness: 140, restDelta: 0.001 });
  const inView = useInView(ref, { once: true, margin: '0px' });

  const format = (n: number) =>
    Intl.NumberFormat('en-US', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(
      Number(n.toFixed(decimalPlaces))
    );

  useEffect(() => {
    if (!ref.current) return;
    if (reduce) {
      ref.current.textContent = format(value);
      return;
    }
    if (!inView) return;
    // Start from startValue on first reveal, then glide to later values.
    const t = setTimeout(() => motionValue.set(value), delay * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce, delay, motionValue]);

  useEffect(
    () =>
      spring.on('change', (latest) => {
        if (ref.current && !reduce) ref.current.textContent = format(latest);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spring, reduce, decimalPlaces]
  );

  return (
    <span ref={ref} className={cn('inline-block tabular-nums', className)} {...props}>
      {format(value)}
    </span>
  );
}
