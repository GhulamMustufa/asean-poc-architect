'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ASEAN_LOGO_SRC } from '@/data/aseanCountries';
import { ALL_STARTUPS } from '@/data/startups';
import { cn } from '@/lib/utils';

interface NavbarProps {
  currentView: 'dashboard' | 'new-challenge' | 'match-results' | 'proposal';
  onNavigate: (view: 'dashboard' | 'new-challenge') => void;
  onOpenStartupsModal: () => void;
}

export function Navbar({ currentView, onNavigate, onOpenStartupsModal }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-inner gap-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 rounded-lg bg-transparent p-1 -m-1 text-left"
          aria-label="POC-Architect home"
        >
          <Image
            src={ASEAN_LOGO_SRC}
            alt="ASEAN logo"
            width={36}
            height={36}
            priority
            className="size-9 shrink-0"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-[1.05rem] font-bold tracking-tight text-foreground">POC-Architect</span>
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-text-muted">
              ASEAN Pilot Platform
            </span>
          </span>
        </button>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            aria-current={currentView === 'dashboard' ? 'page' : undefined}
            className={cn(
              'hidden rounded-full bg-transparent px-3 py-1.5 text-sm font-medium transition-colors duration-200 ease-out md:inline-flex',
              currentView === 'dashboard' ? 'text-foreground' : 'text-text-secondary hover:text-foreground'
            )}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={onOpenStartupsModal}
            className="hidden rounded-full bg-transparent px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 ease-out hover:text-foreground md:inline-flex"
          >
            Startup Directory
            <span className="ml-1.5 tabular-nums text-text-muted">{ALL_STARTUPS.length}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('new-challenge')}
            className="ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-asean-red px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px hover:bg-asean-red/90 md:inline-flex"
          >
            <Plus className="size-4" aria-hidden />
            New Project
          </button>

          <ThemeToggle className="ml-1" />
        </nav>
      </div>
    </header>
  );
}
