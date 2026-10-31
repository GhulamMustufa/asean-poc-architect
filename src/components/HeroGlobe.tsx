'use client';

import dynamic from 'next/dynamic';

// WebGL globe loads after first paint and never on the server.
const Globe = dynamic(() => import('@/components/ui/globe').then((m) => m.Globe), {
  ssr: false,
  loading: () => <div className="aspect-square w-full" />,
});

export function HeroGlobe() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-[12%] rounded-full bg-asean-blue/25 blur-3xl"
        aria-hidden
      />
      <Globe />
    </div>
  );
}
