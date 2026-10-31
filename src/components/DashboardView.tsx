'use client';

import React, { useMemo, useState } from 'react';
import { FlagSlider } from '@/components/FlagSlider';
import { ProposalList } from '@/components/ProposalList';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { countStartupsByCountry } from '@/data/aseanCountries';
import { ALL_STARTUPS } from '@/data/startups';
import { CountryFlag } from '@/components/CountryFlag';
import { PilotProposal, PipelineMetrics, ProposalStatus } from '@/types';
import { downloadProposalPdf } from '@/lib/pdfExport';

interface DashboardViewProps {
  metrics: PipelineMetrics;
  proposals: PilotProposal[];
  onStartNewPoc: () => void;
  onOpenProposal: (proposal: PilotProposal) => void;
  onOpenStartupsModal: () => void;
}

export function DashboardView({
  metrics,
  proposals,
  onStartNewPoc,
  onOpenProposal,
  onOpenStartupsModal
}: DashboardViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | ProposalStatus>('All');
  const openDirectory = useAppStore((s) => s.openDirectory);
  const flagCounts = useMemo(() => countStartupsByCountry(ALL_STARTUPS), []);

  // Filter proposals by selected status tab
  const filteredProposals = proposals.filter((p) => {
    if (statusFilter === 'All') return true;
    return p.status === statusFilter;
  });

  const draftsCount = proposals.filter((p) => p.status === 'Draft').length;
  const underReviewCount = proposals.filter((p) => p.status === 'Under Review' || (p.status as any) === 'In Review').length;
  const approvedCount = proposals.filter((p) => p.status === 'Approved').length;
  const rejectedCount = proposals.filter((p) => p.status === 'Rejected').length;

  const statusTabs: { value: 'All' | ProposalStatus; label: string; count: number }[] = [
    { value: 'All', label: 'All deals', count: proposals.length },
    { value: 'Draft', label: 'Drafts', count: draftsCount },
    { value: 'Under Review', label: 'Under review', count: underReviewCount },
    { value: 'Approved', label: 'Approved', count: approvedCount },
    { value: 'Rejected', label: 'Rejected', count: rejectedCount },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <span>🌏 Southeast Asia Innovation Platform</span>
        </div>

        <h1 className="hero-title">
          Connect your business challenges with <span className="gradient-text">verified ASEAN tech startups</span>.
        </h1>

        <p className="hero-subtitle">
          Find the right technology partner in minutes. See exactly why a startup matches your needs, generate a complete pilot plan, and review it with your team.
        </p>

        <div className="hero-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onStartNewPoc}>
            <span>+</span> Match a Business Problem
          </button>

          <button type="button" className="btn btn-secondary btn-lg" onClick={onOpenStartupsModal}>
            Browse Startup Directory ({ALL_STARTUPS.length})
          </button>
        </div>
      </section>

      {/* Metrics Row - Live Pipeline Counts */}
      <section className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Saved Projects</span>
          <div className="metric-value">{proposals.length}</div>
          <div className="metric-sub">
            <span>Active pilot proposals</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Under Team Review</span>
          <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>
            {underReviewCount}
          </div>
          <div className="metric-sub">
            <span>Needs manager sign-off</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Approved Pilots</span>
          <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
            {approvedCount}
          </div>
          <div className="metric-sub">
            <span>Ready to start project</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Draft Proposals</span>
          <div className="metric-value">
            {draftsCount}
          </div>
          <div className="metric-sub">
            <span>In-progress planning</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Startups in Directory</span>
          <div className="metric-value">{ALL_STARTUPS.length}</div>
          <div className="metric-sub">
            <span>SG • MY • ID • VN • TH • PH</span>
          </div>
        </div>
      </section>

      {/* ASEAN flag slider: opens the directory filtered by country */}
      <FlagSlider counts={flagCounts} onSelectCountry={(code) => openDirectory(code)} />

      {/* Deal Pipeline Dashboard */}
      <section style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Pilot Projects & Proposals
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Track project progress, review stages, and next actions with your team.
            </p>
          </div>

          <button type="button" className="btn btn-primary btn-sm" onClick={onStartNewPoc}>
            + Start New Project
          </button>
        </div>

        {/* Status Filter Tabs (pill row; scrolls sideways on mobile) */}
        <div className="chip-row -mx-4 mb-4 flex scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filter by status">
          {statusTabs
            .filter((t) => t.value !== 'Rejected' || rejectedCount > 0)
            .map((t) => {
              const active = statusFilter === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatusFilter(t.value)}
                  className={cn(
                    'inline-flex h-9 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[0.8rem] font-semibold transition-colors duration-200 ease-out',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-transparent text-text-secondary hover:text-foreground max-md:glass'
                  )}
                >
                  {t.label}
                  <span className="tabular-nums opacity-70">{t.count}</span>
                </button>
              );
            })}
        </div>

        {filteredProposals.length === 0 ? (
          <div className="card state-box" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              No proposals found with status: <strong>{statusFilter}</strong>
            </p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatusFilter('All')}>
              View All Pipeline Deals
            </button>
          </div>
        ) : (
          <>
          <div className="table-wrapper max-md:hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challenge & Enterprise</th>
                  <th>Matched Startup</th>
                  <th>Status</th>
                  <th>Next Action</th>
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((p) => {
                  const isApproved = p.status === 'Approved';
                  const isUnderReview = p.status === 'Under Review' || (p.status as any) === 'In Review';
                  const isRejected = p.status === 'Rejected';

                  return (
                    <tr key={p.id}>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.challengeTitle}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.enterpriseName} • {p.milestones?.reduce((acc, m) => acc + m.durationWeeks, 0) || 8} wks
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{p.startupName}</span>
                          <CountryFlag code={p.startupCountry} />
                        </div>
                        {p.editedFields && p.editedFields.length > 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>
                            ✎ {p.editedFields.length} user edit{p.editedFields.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isApproved
                              ? 'badge-approved'
                              : isUnderReview
                              ? 'badge-under-review'
                              : isRejected
                              ? 'badge-rejected'
                              : 'badge-draft'
                          }`}
                        >
                          ● {p.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: isApproved ? 'var(--accent-emerald)' : isUnderReview ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
                          <span>▸</span>
                          <span>{p.nextAction || 'Review proposal'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(p.updatedAt).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {isApproved && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '0.25rem 0.5rem' }}
                              onClick={() => downloadProposalPdf(p)}
                              title="Download official PDF"
                            >
                              PDF ↓
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => onOpenProposal(p)}
                          >
                            Open →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ProposalList proposals={filteredProposals} onOpenProposal={onOpenProposal} />
          </>
        )}
      </section>

      {/* Value Proposition Workflow Walkthrough */}
      <section style={{ marginTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>How It Works in 5 Simple Steps</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            A clear, step-by-step path from finding a problem to launching a pilot project.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>01</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0' }}>Step 1: Describe Your Problem</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Tell us what business challenge you want to solve, your country, and your timeline.
            </p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>02</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0' }}>Step 2: Smart Accuracy Matching</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Our system scores real and sample startups based on skills, experience, and data safety.
            </p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>03</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0' }}>Step 3: Clear Reasons Why</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              See honest match scores, what the startup can do, and what they can&apos;t do yet.
            </p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>04</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0' }}>Step 4: Generate a Pilot Plan</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Get a ready-to-use 60-day roadmap, team responsibilities, and success goals.
            </p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-rose)' }}>05</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0' }}>Step 5: Review, Edit & PDF</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Easily customize the plan with your team and download a clean PDF report.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
