'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light']}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
