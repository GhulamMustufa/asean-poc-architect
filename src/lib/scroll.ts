type ScrollHandler = (top: number) => void;

let handler: ScrollHandler | null = null;

/** Lets a smooth-scroll engine (Lenis) take over scrolling. Pass null to release. */
export function registerScrollHandler(next: ScrollHandler | null) {
  handler = next;
}

export function scrollToTop() {
  if (typeof window === 'undefined') return;
  if (handler) {
    handler(0);
    return;
  }
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}
