'use client';

import React, { useState } from 'react';
import { ALL_STARTUPS } from '@/data/startups';
import { ASEANCountry, CuratedStartup } from '@/types';

interface StartupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStartup?: (startup: CuratedStartup) => void;
}

export function StartupsModal({ isOpen, onClose, onSelectStartup }: StartupsModalProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'SYNTHETIC'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const countries: { code: string; label: string }[] = [
    { code: 'ALL', label: 'All ASEAN' },
    { code: 'SG', label: '🇸🇬 Singapore' },
    { code: 'ID', label: '🇮🇩 Indonesia' },
    { code: 'MY', label: '🇲🇾 Malaysia' },
    { code: 'VN', label: '🇻🇳 Vietnam' },
    { code: 'TH', label: '🇹🇭 Thailand' },
    { code: 'PH', label: '🇵🇭 Philippines' }
  ];

  const filteredStartups = ALL_STARTUPS.filter((s) => {
    const matchCountry = selectedCountry === 'ALL' || s.country === selectedCountry;
    const matchTier =
      verificationFilter === 'ALL' ||
      (verificationFilter === 'VERIFIED' && !s.isSyntheticDemo) ||
      (verificationFilter === 'SYNTHETIC' && s.isSyntheticDemo);
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.primaryIndustry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCountry && matchTier && matchSearch;
  });

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" style={{ maxWidth: '880px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="modal-title" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Browse ASEAN Tech Startups
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              A trusted directory of real and sample technology companies across Southeast Asia.
            </p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search by name, technology, or feature..."
            className="form-input"
            style={{ flex: 1, minWidth: '240px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${verificationFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setVerificationFilter('ALL')}
            >
              All (32)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${verificationFilter === 'VERIFIED' ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderColor: 'rgba(16, 185, 129, 0.5)', color: verificationFilter === 'VERIFIED' ? '#fff' : '#34d399' }}
              onClick={() => setVerificationFilter('VERIFIED')}
            >
              🟢 Real Startups (18)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${verificationFilter === 'SYNTHETIC' ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderColor: 'rgba(168, 85, 247, 0.5)', color: verificationFilter === 'SYNTHETIC' ? '#fff' : '#c084fc' }}
              onClick={() => setVerificationFilter('SYNTHETIC')}
            >
              🟣 Sample Startups (14)
            </button>
          </div>
        </div>

        {/* Country filters */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              className={`btn btn-sm ${selectedCountry === c.code ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedCountry(c.code)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Startup Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto' }}>
          {filteredStartups.length === 0 ? (
            <div className="state-box">
              <p style={{ color: 'var(--text-muted)' }}>No startups match your search filter.</p>
            </div>
          ) : (
            filteredStartups.map((s) => (
              <div
                key={s.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-country">{s.country}</span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{s.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {s.stage} (Est. {s.foundedYear})</span>
                      {!s.isSyntheticDemo ? (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '0.7rem', fontWeight: 700 }}>
                          ✓ VERIFIED REAL: {s.sourceOrganisation || 'Enterprise SG / Cradle / HUB.ID'}
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.35)', fontSize: '0.7rem' }}>
                          🟣 Sample Demo Company
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>
                      {s.tagline}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <span className={`badge ${s.evidenceQuality === 'Audited Tier-1' ? 'badge-verified' : 'badge-supplied'}`}>
                      {s.evidenceQuality}
                    </span>
                    {s.website && (
                      <a
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}
                      >
                        Official Website ↗
                      </a>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.75rem 0' }}>
                  {s.summary}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {s.capabilities.map((cap) => (
                    <span key={cap} className="capability-tag">
                      {cap}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span><strong>Past Work:</strong> {s.notableDeployments.join(', ')}</span>
                  </div>
                  <div>
                    <span><strong>Security Standards:</strong> {s.verifiedCertifications.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
