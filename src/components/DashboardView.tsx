'use client';

import React, { useState } from 'react';
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

  // Filter proposals by selected status tab
  const filteredProposals = proposals.filter((p) => {
    if (statusFilter === 'All') return true;
    return p.status === statusFilter;
  });

  const draftsCount = proposals.filter((p) => p.status === 'Draft').length;
  const underReviewCount = proposals.filter((p) => p.status === 'Under Review' || (p.status as any) === 'In Review').length;
  const approvedCount = proposals.filter((p) => p.status === 'Approved').length;
  const rejectedCount = proposals.filter((p) => p.status === 'Rejected').length;

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
            Browse Startup Directory ({metrics.matchedStartups})
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
          <div className="metric-value">{metrics.matchedStartups}</div>
          <div className="metric-sub">
            <span>SG • MY • ID • VN • TH • PH</span>
          </div>
        </div>
      </section>

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

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'All' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('All')}
          >
            All Deals ({proposals.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'Draft' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('Draft')}
          >
            Drafts ({draftsCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'Under Review' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('Under Review')}
          >
            Under Review ({underReviewCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'Approved' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter('Approved')}
          >
            Approved ({approvedCount})
          </button>
          {rejectedCount > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'Rejected' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('Rejected')}
            >
              Rejected ({rejectedCount})
            </button>
          )}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredProposals.map((p) => {
              const isApproved = p.status === 'Approved';
              const isUnderReview = p.status === 'Under Review' || (p.status as any) === 'In Review';
              const isRejected = p.status === 'Rejected';

              return (
                <div key={p.id} className="deal-card">
                  {/* Left: Enterprise & Startup Info */}
                  <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-country">{p.startupCountry}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {p.enterpriseName}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>➔</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {p.startupName}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0', wordBreak: 'break-word' }}>
                      {p.challengeTitle}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>⏱ {p.milestones?.reduce((acc, m) => acc + m.durationWeeks, 0) || 8}-Week Pilot</span>
                      <span>•</span>
                      <span>Updated {new Date(p.updatedAt).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {p.nextAction && (
                        <>
                          <span>•</span>
                          <span style={{ color: isApproved ? 'var(--accent-emerald)' : isUnderReview ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
                            Next: {p.nextAction}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                    >
                      ● {p.status}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isApproved && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}
                          onClick={() => downloadProposalPdf(p)}
                          title="Download official PDF"
                        >
                          PDF ↓
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenProposal(p)}
                      >
                        Open Proposal →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
