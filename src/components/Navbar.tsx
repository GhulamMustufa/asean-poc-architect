'use client';

import React from 'react';
import { ModelSwitcher } from './ModelSwitcher';
import { ALL_STARTUPS } from '@/data/startups';

interface NavbarProps {
  currentView: 'dashboard' | 'new-challenge' | 'match-results' | 'proposal';
  onNavigate: (view: 'dashboard' | 'new-challenge') => void;
  onOpenStartupsModal: () => void;
}

export function Navbar({ currentView, onNavigate, onOpenStartupsModal }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand-group" role="button" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon.png"
            alt="ASEAN POC-Architect Logo"
            width={30}
            height={30}
            style={{ borderRadius: '7px', boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)' }}
          />
          <span className="brand-logo-badge">ASEAN</span>
          <span className="brand-title">POC-Architect</span>
          <span className="brand-tag">Pilot Platform</span>
        </div>

        <div className="nav-links">
          <ModelSwitcher />

          <button
            type="button"
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </button>

          <button
            type="button"
            className="nav-link"
            onClick={onOpenStartupsModal}
          >
            <span className="desktop-only">Startup Directory ({ALL_STARTUPS.length})</span>
            <span className="mobile-only">Startups ({ALL_STARTUPS.length})</span>
          </button>

          <a
            href="/presentation.html"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)' }}
            title="Open Interactive Pitch Deck"
          >
            <span>📊</span>
            <span className="desktop-only">Pitch Deck</span>
            <span className="mobile-only">Pitch</span>
          </a>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('new-challenge')}
          >
            <span>+</span>
            <span className="desktop-only">Start New Project</span>
            <span className="mobile-only">New Project</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
