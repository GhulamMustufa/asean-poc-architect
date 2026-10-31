'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === 'light' ? 'light' : 'dark'}
      position="top-center"
      offset={{ top: 80 }}
      mobileOffset={{ top: 72 }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': '16px',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
