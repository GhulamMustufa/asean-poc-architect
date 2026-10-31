/**
 * Marquee, adapted from Magic UI (https://magicui.design, MIT).
 * Changes: only the first copy is interactive/accessible (the repeats are
 * `inert` + aria-hidden), and reduced motion renders one static, wrapping row
 * (see `.marquee` rules in globals.css).
 */
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** Total copies rendered; >= 2 for a seamless loop. */
  repeat?: number;
  /** Seconds for one full loop. */
  duration?: number;
  gap?: string;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  repeat = 2,
  duration = 40,
  gap = '1rem',
  children,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn('marquee group flex overflow-hidden', pauseOnHover && 'marquee-pausable', className)}
      style={{ ...style, ['--duration' as string]: `${duration}s`, ['--gap' as string]: gap, gap }}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          className={cn('marquee-track flex shrink-0 justify-around', reverse && 'marquee-reverse', i > 0 && 'marquee-copy')}
          style={{ gap }}
          aria-hidden={i > 0 || undefined}
          inert={i > 0 || undefined}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
