'use client';

import { useState, type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { SmoothScroll } from '@/components/SmoothScroll';
import { MotionConfig } from 'motion/react';
import 'lenis/dist/lenis.css';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
      })
  );

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light']}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {/* reducedMotion="user": transform/layout animations turn off for users who ask for it */}
        <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <SmoothScroll>{children}</SmoothScroll>
        </MotionConfig>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
