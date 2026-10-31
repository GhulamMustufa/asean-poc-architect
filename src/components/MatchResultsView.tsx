'use client';

import React, { useState } from 'react';
import { CountryFlag } from '@/components/CountryFlag';
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

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterMode('all')}
          >
            All ({matches.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterMode === 'verified-only' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderColor: 'rgba(var(--rgb-blue), 0.5)', color: filterMode === 'verified-only' ? '#fff' : 'var(--accent-emerald)' }}
            onClick={() => setFilterMode('verified-only')}
          >
            🟢 Real ASEAN Companies ({verifiedCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterMode === 'synthetic-only' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderColor: 'rgba(var(--rgb-fg), 0.5)', color: filterMode === 'synthetic-only' ? '#fff' : 'var(--text-secondary)' }}
            onClick={() => setFilterMode('synthetic-only')}
          >
            🟣 Sample Practice Startups ({syntheticCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterMode === 'high-score' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterMode('high-score')}
          >
            Top Matches (≥ 80%)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterMode === 'same-country' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterMode('same-country')}
          >
            In Your Country ({challenge.country})
          </button>
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
                      <span className="badge" style={{ background: 'rgba(var(--rgb-blue), 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(var(--rgb-blue), 0.4)', fontWeight: 700, fontSize: '0.72rem' }}>
                        ✓ VERIFIED REAL COMPANY: {m.startup.sourceOrganisation || 'Enterprise Singapore / Cradle'}
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(var(--rgb-fg), 0.12)', color: 'var(--text-secondary)', border: '1px solid rgba(var(--rgb-fg), 0.35)', fontWeight: 600, fontSize: '0.72rem' }}>
                        🟣 SAMPLE DEMO COMPANY
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
                        <span>Official Website</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>

                  {/* Top Bar with Score */}
                  <div className="match-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <CountryFlag code={m.startup.country} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {m.startup.stage} • Founded {m.startup.foundedYear}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                        {m.startup.name}
                      </h3>
                      <p style={{ fontSize: '0.825rem', color: 'var(--accent-cyan)', fontWeight: 500, marginTop: '0.15rem' }}>
                        {m.startup.tagline}
                      </p>
                    </div>

                    <div className="match-score-badge">
                      <span className="score-num">{m.overallScore}%</span>
                      <span className="score-label">Match Score</span>
                    </div>
                  </div>

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
                      Detailed Match Score Breakdown
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem', fontSize: '0.75rem' }}>
                      <div className="score-chip" title="Capability coverage score">
                        Skills ({Math.round(m.dimensionScores.capabilityMatch.weight * 100)}%): <strong>{m.dimensionScores.capabilityMatch.rawScore}/100</strong>
                      </div>
                      <div className="score-chip" title="Industry and concrete use-case relevance">
                        Experience ({Math.round(m.dimensionScores.industryUseCaseRelevance.weight * 100)}%): <strong>{m.dimensionScores.industryUseCaseRelevance.rawScore}/100</strong>
                      </div>
                      <div className="score-chip" title="Security & technical compatibility">
                        Safety & Tech ({Math.round(m.dimensionScores.technicalCompatibility.weight * 100)}%): <strong>{m.dimensionScores.technicalCompatibility.rawScore}/100</strong>
                      </div>
                      <div className="score-chip" title="Customer segment & geographic residency fit">
                        Location ({Math.round(m.dimensionScores.targetMarketRelevance.weight * 100)}%): <strong>{m.dimensionScores.targetMarketRelevance.rawScore}/100</strong>
                      </div>
                      <div className="score-chip" title="Integration protocol & readiness">
                        Ease of Connection ({Math.round(m.dimensionScores.integrationReadiness.weight * 100)}%): <strong>{m.dimensionScores.integrationReadiness.rawScore}/100</strong>
                      </div>
                    </div>
                  </div>

                  {/* Startup Summary */}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.75rem 0', lineHeight: 1.5 }}>
                    {m.startup.productDescription || m.startup.summary}
                  </p>

                  {/* Capability Overlap & Gaps */}
                  <div style={{ margin: '0.75rem 0' }}>
                    <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Skills & Features Match ({m.matchedCapabilities.length} matched, {m.capabilityGaps.length} missing)
                    </div>
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

                  {/* Matching Evidence from Factual Records */}
                  {m.matchingEvidence && m.matchingEvidence.length > 0 && (
                    <div style={{ margin: '0.75rem 0' }}>
                      <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                        Why This Startup Is a Great Fit:
                      </div>
                      <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        {m.matchingEvidence.slice(0, 3).map((evidence, eIdx) => (
                          <li key={eIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                            <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                            <span>{evidence}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Information in Challenge vs Genuine Mismatch */}
                  {m.missingInformation && m.missingInformation.length > 0 && (
                    <div style={{ margin: '0.5rem 0', padding: '0.45rem 0.65rem', background: 'rgba(var(--rgb-blue), 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(var(--rgb-blue), 0.2)', fontSize: '0.775rem', color: 'var(--accent-cyan)' }}>
                      ℹ {m.missingInformation[0]}
                    </div>
                  )}

                  {/* Risks & Known Limitations */}
                  <div style={{ background: 'var(--bg-sunken)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', margin: '0.75rem 0', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Profile Verification:</span>
                      <span className={`badge ${m.evidenceQuality === 'Audited Tier-1' ? 'badge-verified' : 'badge-supplied'}`}>
                        {m.evidenceQuality}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      <strong>Security Standards:</strong> {m.startup.dataSecurityConsiderations.certifications.join(', ')}
                    </div>
                    {m.potentialRisks && m.potentialRisks.length > 0 && (
                      <div style={{ color: 'var(--accent-amber)', fontSize: '0.775rem', marginTop: '0.25rem' }}>
                        <strong>Good to Know Before Starting:</strong> {m.potentialRisks[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => handleSelect(m)}
                    disabled={isGeneratingProposal}
                  >
                    {isSelected ? (
                      <>
                        <span className="spinner" style={{ width: '16px', height: '16px' }} />
                        <span>Writing your pilot plan with AI...</span>
                      </>
                    ) : (
                      <span>Select Startup & Create Pilot Plan →</span>
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
