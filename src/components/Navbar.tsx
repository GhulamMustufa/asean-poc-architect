'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Presentation } from 'lucide-react';
import { ModelSwitcher } from '@/components/ModelSwitcher';
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
          className="brand-group rounded-lg bg-transparent p-1 -m-1 text-left"
          style={{ gap: '0.6rem' }}
          aria-label="ASEAN POC-Architect home"
        >
          <Image
            src="/favicon.png"
            alt="ASEAN POC-Architect Logo"
            width={30}
            height={30}
            priority
            className="size-[30px] shrink-0"
            style={{ borderRadius: '7px', boxShadow: '0 0 10px rgba(var(--rgb-blue), 0.3)' }}
          />
          <span className="brand-logo-badge max-sm:hidden">ASEAN</span>
          <span className="brand-title">POC-Architect</span>
          <span className="brand-tag max-md:hidden">Pilot Platform</span>
        </button>

        <nav aria-label="Main" className="flex items-center gap-1.5 sm:gap-2">
          <ModelSwitcher />

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

          <a
            href="/presentation.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Open the interactive pitch deck"
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 ease-out hover:text-foreground lg:inline-flex"
          >
            <Presentation className="size-4" aria-hidden />
            Pitch deck
            <span className="sr-only">(opens in a new tab)</span>
          </a>

          <button
            type="button"
            onClick={() => onNavigate('new-challenge')}
            className="ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-asean-red px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px hover:bg-asean-red/90 md:inline-flex"
          >
            <Plus className="size-4" aria-hidden />
            New Project
          </button>


          <button
            type="button"
            onClick={() => onNavigate('new-challenge')}
            aria-label="Start new project"
            className="glass inline-flex size-10 items-center justify-center rounded-full text-foreground md:hidden"
          >
            <Plus className="size-5" aria-hidden />
          </button>
        </nav>
      </div>
    </header>
  );
}
