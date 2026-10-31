'use client';

import { motion, useReducedMotion } from 'motion/react';
import { LayoutGrid, Plus, Store } from 'lucide-react';
import { getActiveTab, type AppViewName, type MobileTab } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface MobileTabBarProps {
  currentView: AppViewName;
  directoryOpen: boolean;
  onNavigate: (view: 'dashboard' | 'new-challenge') => void;
  onOpenStartupsModal: () => void;
}

export function MobileTabBar({ currentView, directoryOpen, onNavigate, onOpenStartupsModal }: MobileTabBarProps) {
  const active = getActiveTab(currentView, directoryOpen);
  const reduce = useReducedMotion();

  const tabs: { id: MobileTab; label: string; icon: typeof LayoutGrid; onClick: () => void }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, onClick: () => onNavigate('dashboard') },
    { id: 'new', label: 'New', icon: Plus, onClick: () => onNavigate('new-challenge') },
    { id: 'directory', label: 'Directory', icon: Store, onClick: onOpenStartupsModal },
  ];

  return (
    <nav aria-label="Primary" className="mobile-tabbar no-print md:hidden">
      <ul className="glass glass-pill flex items-center gap-1 p-1.5">
        {tabs.map(({ id, label, icon: Icon, onClick }) => {
          const isActive = active === id;
          const isCta = id === 'new';
          return (
            <li key={id} className="relative flex-1">
              {isActive && !isCta && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-foreground/10"
                  transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  aria-hidden
                />
              )}
              <button
                type="button"
                onClick={onClick}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center justify-center gap-0.5 rounded-full bg-transparent py-1.5 text-[0.68rem] font-semibold transition-colors duration-200 ease-out',
                  isCta ? 'text-foreground' : isActive ? 'text-foreground' : 'text-text-secondary'
                )}
              >
                {isCta ? (
                  <span className="flex size-10 items-center justify-center rounded-full bg-asean-red text-white shadow-[0_6px_18px_rgba(var(--rgb-red),0.45)]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                ) : (
                  <Icon className="size-[22px]" aria-hidden strokeWidth={isActive ? 2.25 : 1.75} />
                )}
                <span className={isCta ? 'sr-only' : undefined}>{isCta ? 'New project' : label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
