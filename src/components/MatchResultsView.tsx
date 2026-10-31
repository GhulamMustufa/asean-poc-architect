'use client';

import React, { useState } from 'react';
import { CountryFlag } from '@/components/CountryFlag';
import { ArrowUpRight, BadgeCheck, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnterpriseChallenge, MatchResult } from '@/types';

interface MatchResultsViewProps {
  challenge: EnterpriseChallenge;
  matches: MatchResult[];
  onSelectStartup: (match: MatchResult) => void;
  onBackToChallenge: () => void;
  isGeneratingProposal?: boolean;
}

export function MatchResultsView({
  challenge,
  matches,
  onSelectStartup,
  onBackToChallenge,
  isGeneratingProposal = false
}: MatchResultsViewProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'verified-only' | 'synthetic-only' | 'high-score' | 'same-country'>('all');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [verifyingStartupId, setVerifyingStartupId] = useState<string | null>(null);
  const [govVerifications, setGovVerifications] = useState<Record<string, any>>({});

  const verifiedCount = matches.filter((m) => !m.startup.isSyntheticDemo).length;
  const syntheticCount = matches.filter((m) => m.startup.isSyntheticDemo).length;

  const filteredMatches = matches.filter((m) => {
    if (filterMode === 'verified-only') return !m.startup.isSyntheticDemo;
    if (filterMode === 'synthetic-only') return m.startup.isSyntheticDemo;
    if (filterMode === 'high-score') return m.overallScore >= 80;
    if (filterMode === 'same-country') return m.startup.country === challenge.country;
    return true;
  });

  const handleLiveGovCheck = async (e: React.MouseEvent, startup: any) => {
    e.stopPropagation();
    setVerifyingStartupId(startup.id);
    try {
      const q = startup.uenOrRegistrationNumber || startup.name.replace(/\s*\(Synthetic Demo\)/i, '');
      const res = await fetch(`/api/verify-entity?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setGovVerifications((prev) => ({ ...prev, [startup.id]: data }));
    } catch (err) {
      setGovVerifications((prev) => ({
        ...prev,
        [startup.id]: { success: false, error: 'Network timeout during live verification' }
      }));
    } finally {
      setVerifyingStartupId(null);
    }
  };

  const handleSelect = (match: MatchResult) => {
    setSelectedMatchId(match.startup.id);
    onSelectStartup(match);
  };

  return (
    <div>
      {/* Header with Challenge Context */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(var(--rgb-blue), 0.08) 0%, var(--bg-card) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-supplied">Your Project Request</span>
              <CountryFlag code={challenge.country} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>• {challenge.enterpriseName}</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {challenge.title}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '850px' }}>
              {challenge.problemDescription}
            </p>
          </div>

          <button type="button" className="btn btn-outline btn-sm" onClick={onBackToChallenge}>
            ← Edit Details
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span><strong>Desired Goal:</strong> {challenge.desiredOutcome.slice(0, 100)}...</span>
          <span><strong>Duration:</strong> {challenge.expectedDurationWeeks} weeks</span>
          <span><strong>Data Location:</strong> {challenge.requiresLocalDataResidency ? `Must stay in ${challenge.country}` : 'Regional Cloud OK'}</span>
        </div>
      </div>

      {/* Filter and Results Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Recommended Startup Matches ({filteredMatches.length} available)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Ranked by technical skills, past experience, regional rules, and how easily they connect to your systems.
          </p>
        </div>

        <div className="chip-row -mx-4 flex scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filter matches">
          {([
            { id: 'all', label: 'All', count: matches.length },
            { id: 'verified-only', label: 'Real companies', count: verifiedCount, icon: <BadgeCheck className="size-3.5" aria-hidden /> },
            { id: 'synthetic-only', label: 'Sample startups', count: syntheticCount, icon: <FlaskConical className="size-3.5" aria-hidden /> },
            { id: 'high-score', label: 'Top matches ≥ 80%' },
            { id: 'same-country', label: 'In your country', icon: <CountryFlag code={challenge.country} showLabel={false} /> },
          ] as { id: typeof filterMode; label: string; count?: number; icon?: React.ReactNode }[]).map((t) => {
            const active = filterMode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilterMode(t.id)}
                className={cn(
                  'inline-flex h-9 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[0.8rem] font-semibold transition-colors duration-200 ease-out',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent text-text-secondary hover:text-foreground max-md:glass'
                )}
              >
                {t.icon}
                {t.label}
                {t.count !== undefined && <span className="tabular-nums opacity-70">{t.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Startup Match Cards Grid */}
      {filteredMatches.length === 0 ? (
        <div className="card state-box" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            No Matching Startups Found
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1rem auto', fontSize: '0.85rem' }}>
            No startup in this category meets all your requirements. Try changing your filters or browse our full ASEAN startup directory.
          </p>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setFilterMode('all')}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="matches-grid">
          {filteredMatches.map((m, idx) => {
            const isFeatured = idx === 0 && filterMode === 'all';
            const isSelected = selectedMatchId === m.startup.id && isGeneratingProposal;
            const govCheck = govVerifications[m.startup.id];

            return (
              <div
                key={m.startup.id}
                className={`match-card ${isFeatured ? 'featured' : ''}`}
              >
                <div>
                  {/* Provenance Tier Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {!m.startup.isSyntheticDemo ? (
                      <span className="badge badge-verified max-w-full" title={m.startup.sourceOrganisation || undefined}>
                        <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">Verified · {m.startup.sourceOrganisation?.split(/[(/]/)[0].trim() || 'Enterprise Singapore'}</span>
                      </span>
                    ) : (
                      <span className="badge badge-draft">
                        <FlaskConical className="size-3.5" aria-hidden /> Sample demo company
                      </span>
                    )}

                    {m.startup.website && (
                      <a
                        href={m.startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Website</span>
                        <ArrowUpRight className="size-3" aria-hidden />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </div>

                  {/* Top Bar with Score */}
                  <div className="match-header">
                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <CountryFlag code={m.startup.country} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {m.startup.stage} • Founded {m.startup.foundedYear}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, wordBreak: 'break-word' }}>
                        {m.startup.name}
                      </h3>
                      <p style={{ fontSize: '0.825rem', color: 'var(--accent-cyan)', fontWeight: 500, marginTop: '0.15rem' }}>
                        {m.startup.tagline}
                      </p>
                    </div>

                    <div className="match-score-badge" style={{ padding: '0.5rem 0.85rem', minWidth: '76px', flexShrink: 0 }}>
                      <span className="score-num" style={{ fontSize: '1.85rem' }}>{m.overallScore}%</span>
                      <span className="score-label" style={{ fontSize: '0.7rem' }}>Match Fit</span>
                    </div>
                  </div>

                  {/* Executive Glance Box - 3-Second Absorption */}
                  <div className="pill-fit-box">
                    <div className="pill-item">
                      <span className="pill-dot-green"></span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {m.matchingEvidence?.[0] || (m.matchedCapabilities && m.matchedCapabilities.length > 0 ? `Matches: ${m.matchedCapabilities.slice(0, 2).join(' & ')}` : 'Verified technical fit')}
                      </span>
                    </div>
                    <div className="pill-item">
                      <span className="pill-dot-blue"></span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Security: {m.startup.dataSecurityConsiderations.certifications.slice(0, 2).join(' • ') || 'Bank Standard Aligned'}
                      </span>
                    </div>
                    {m.potentialRisks && m.potentialRisks.length > 0 && (
                      <div className="pill-item">
                        <span className="pill-dot-yellow"></span>
                        <span style={{ color: 'var(--accent-amber)', fontSize: '0.8rem' }}>
                          Prerequisite: {m.potentialRisks[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progressive Disclosure: Deep Technical Analysis */}
                  <details className="clean-accordion">
                    <summary>
                      <span>Show Detailed Technical Evaluation</span>
                      <span>▾</span>
                    </summary>
                    <div style={{ paddingTop: '0.85rem' }}>
                      {/* Startup Summary */}
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {m.startup.productDescription || m.startup.summary}
                      </p>

                      {/* Live Statutory Gov Verification (data.gov.sg ACRA) */}
                      {m.startup.country === 'SG' && (
                        <div style={{ margin: '0.5rem 0' }}>
                          {govCheck ? (
                            <div style={{ background: 'rgba(var(--rgb-blue), 0.1)', border: '1px solid rgba(var(--rgb-blue), 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
                              <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>🏛️</span>
                                <span>{govCheck.source}</span>
                              </div>
                              <div style={{ color: 'var(--text-primary)', marginTop: '0.2rem', fontWeight: 600 }}>
                                {govCheck.legalName} (UEN: {govCheck.uen})
                              </div>
                              <div style={{ color: 'var(--text-secondary)', marginTop: '0.1rem', fontSize: '0.72rem' }}>
                                Status: <strong style={{ color: 'var(--accent-emerald)' }}>{govCheck.status}</strong> • {govCheck.ssic} ({govCheck.responseTimeMs}ms)
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderColor: 'rgba(var(--rgb-blue), 0.35)', color: 'var(--accent-cyan)', width: '100%', justifyContent: 'center' }}
                              disabled={verifyingStartupId === m.startup.id}
                              onClick={(e) => handleLiveGovCheck(e, m.startup)}
                            >
                              {verifyingStartupId === m.startup.id ? (
                                <>
                                  <span className="spinner" style={{ width: '12px', height: '12px' }} />
                                  <span>Checking official Singapore government registry...</span>
                                </>
                              ) : (
                                <span>⚡ Check Official Government Registry (data.gov.sg)</span>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* 5-Dimension Deterministic Breakdown */}
                      <div style={{ background: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', margin: '0.75rem 0', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                          Match Score Breakdown Across 5 Dimensions
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem', fontSize: '0.75rem' }}>
                          <div className="score-chip">
                            Skills: <strong>{m.dimensionScores.capabilityMatch.rawScore}/100</strong>
                          </div>
                          <div className="score-chip">
                            Experience: <strong>{m.dimensionScores.industryUseCaseRelevance.rawScore}/100</strong>
                          </div>
                          <div className="score-chip">
                            Tech & Safety: <strong>{m.dimensionScores.technicalCompatibility.rawScore}/100</strong>
                          </div>
                          <div className="score-chip">
                            Location: <strong>{m.dimensionScores.targetMarketRelevance.rawScore}/100</strong>
                          </div>
                          <div className="score-chip">
                            Connection: <strong>{m.dimensionScores.integrationReadiness.rawScore}/100</strong>
                          </div>
                        </div>
                      </div>

                      {/* Capability Overlap & Gaps */}
                      <div style={{ margin: '0.75rem 0' }}>
                        <div className="tag-list">
                          {m.matchedCapabilities.map((cap) => (
                            <span key={cap} className="capability-tag matched">
                              ✓ {cap}
                            </span>
                          ))}
                          {m.capabilityGaps.map((cap) => (
                            <span key={cap} className="capability-tag gap">
                              ✕ Missing: {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Card Action */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', fontSize: '0.95rem', fontWeight: 700 }}
                    onClick={() => handleSelect(m)}
                    disabled={isGeneratingProposal}
                  >
                    {isSelected ? (
                      <>
                        <span className="spinner" style={{ width: '16px', height: '16px' }} />
                        <span>Generating 60-Day Pilot Plan with AI...</span>
                      </>
                    ) : (
                      <span>Select Startup & Build 60-Day Pilot →</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
