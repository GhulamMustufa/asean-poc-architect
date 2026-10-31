'use client';

/**
 * Globe, adapted from Magic UI (https://magicui.design, MIT) for cobe v2.
 * Centred on Southeast Asia with one marker per ASEAN capital. Drag to spin.
 * Rendering pauses when off-screen or when the tab is hidden.
 */
import { useEffect, useRef } from 'react';
import createGlobe, { type COBEOptions } from 'cobe';
import { useTheme } from 'next-themes';
import { ASEAN_MEMBERS } from '@/data/aseanCountries';
import { cn } from '@/lib/utils';

const MARKERS = ASEAN_MEMBERS.map((m) => ({ location: [m.capital.lat, m.capital.lng] as [number, number], size: 0.05 }));

// cobe's location-to-angle formula: face ~110°E (the middle of ASEAN)
const SEA_PHI = Math.PI - ((110 * Math.PI) / 180 - Math.PI / 2);

const THEMES = {
  dark: {
    dark: 1,
    mapBrightness: 5,
    baseColor: [0.16, 0.27, 0.6] as [number, number, number],
    markerColor: [1, 0.8, 0] as [number, number, number],
    glowColor: [0.15, 0.3, 0.75] as [number, number, number],
  },
  light: {
    dark: 0,
    mapBrightness: 1.4,
    baseColor: [1, 1, 1] as [number, number, number],
    markerColor: [0.78, 0.06, 0.18] as [number, number, number],
    glowColor: [0.85, 0.9, 1] as [number, number, number],
  },
};

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<number | null>(null);
  const drag = useRef(0);
  const { resolvedTheme } = useTheme();
  const themeKey = resolvedTheme === 'light' ? 'light' : 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth;
    let phi = SEA_PHI;
    let raf = 0;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const opts: COBEOptions = {
      width: width * dpr,
      height: width * dpr,
      devicePixelRatio: dpr,
      phi,
      theta: 0.18,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBaseBrightness: 0,
      markers: MARKERS,
      opacity: 0.9,
      ...THEMES[themeKey],
    };
    const globe = createGlobe(canvas, opts);

    const onResize = () => {
      width = canvas.offsetWidth;
      globe.update({ width: width * dpr, height: width * dpr });
    };
    window.addEventListener('resize', onResize);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(canvas);

    function tick() {
      raf = 0;
      if (!visible || document.hidden) return;
      // Slow drift that eases back toward Southeast Asia
      phi += (SEA_PHI + Math.sin(performance.now() / 6000) * 0.35 - phi) * 0.02;
      globe.update({ phi: phi + drag.current });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      if (!document.hidden && visible && !raf) raf = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVisibility);

    requestAnimationFrame(() => canvas.style.setProperty('opacity', '1'));

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      globe.destroy();
    };
  }, [themeKey]);

  return (
    <div className={cn('relative aspect-square w-full', className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Globe centred on Southeast Asia, marking the capitals of the 11 ASEAN member states"
        className="size-full cursor-grab opacity-0 transition-opacity duration-700 ease-out [contain:layout_paint_size] active:cursor-grabbing"
        onPointerDown={(e) => {
          pointer.current = e.clientX - drag.current * 200;
        }}
        onPointerUp={() => (pointer.current = null)}
        onPointerOut={() => (pointer.current = null)}
        onPointerMove={(e) => {
          if (pointer.current !== null) drag.current = (e.clientX - pointer.current) / 200;
        }}
      />
    </div>
  );
}
