'use client';

import React from 'react';

interface NavbarProps {
  currentView: 'dashboard' | 'new-challenge' | 'match-results' | 'proposal';
  onNavigate: (view: 'dashboard' | 'new-challenge') => void;
  onOpenStartupsModal: () => void;
}

export function Navbar({ currentView, onNavigate, onOpenStartupsModal }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand-group" role="button" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <span className="brand-logo-badge">ASEAN</span>
          <span className="brand-title">POC-Architect</span>
          <span className="brand-tag">Pilot Platform</span>
        </div>

        <div className="nav-links">
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
            Startup Directory (32)
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('new-challenge')}
          >
            <span>+</span> Start New Project
          </button>
        </div>
      </div>
    </nav>
  );
}
