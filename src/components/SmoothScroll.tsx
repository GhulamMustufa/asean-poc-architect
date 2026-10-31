'use client';

import { useEffect, type ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { registerScrollHandler } from '@/lib/scroll';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useAppStore } from '@/stores/appStore';

/** Hooks Lenis into scrollToTop() and pauses it while the directory overlay is open. */
function LenisBridge() {
  const lenis = useLenis();
  const directoryOpen = useAppStore((s) => s.directory.open);

  useEffect(() => {
    if (!lenis) return;
    registerScrollHandler((top) => lenis.scrollTo(top, { duration: 0.6 }));
    return () => registerScrollHandler(null);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;
    if (directoryOpen) lenis.stop();
    else lenis.start();
  }, [lenis, directoryOpen]);

  return null;
}

/**
 * Smooth wheel scrolling on desktop. Touch scrolling stays native, and users
 * who prefer reduced motion get the browser's normal scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = usePrefersReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, syncTouch: false, anchors: true }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
