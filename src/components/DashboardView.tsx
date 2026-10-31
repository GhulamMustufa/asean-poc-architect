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
import Image from 'next/image';
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Download,
  FileSignature,
  Globe2,
  PencilLine,
  Plus,
  Scale,
  Sparkles,
  Target,
} from 'lucide-react';
import { ASEAN_LOGO_SRC } from '@/data/aseanCountries';
import { Button } from '@/components/ui/button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Reveal, RevealItem } from '@/components/Reveal';
import { HeroGlobe } from '@/components/HeroGlobe';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

const STEPS = [
  { icon: ClipboardList, tone: 'bg-asean-blue/15 text-accent-blue', title: 'Describe your problem', body: 'Tell us the business challenge, your country, and your timeline.' },
  { icon: Target, tone: 'bg-asean-blue/15 text-accent-blue', title: 'Accurate matching', body: 'Real and sample startups are scored on skills, experience, and data safety.' },
  { icon: Scale, tone: 'bg-asean-yellow/15 text-accent-amber', title: 'Clear reasons why', body: 'Honest scores: what each startup can do, and what it cannot do yet.' },
  { icon: Sparkles, tone: 'bg-foreground/10 text-foreground', title: 'Generate a pilot plan', body: 'A ready 60-day roadmap with team responsibilities and success goals.' },
  { icon: FileSignature, tone: 'bg-asean-red/15 text-accent-red', title: 'Review, sign off, export', body: 'Edit with your team, record approval, and download a clean PDF.' },
];

interface DashboardViewProps {
  metrics: PipelineMetrics;
  proposals: PilotProposal[];
  onStartNewPoc: () => void;
  onOpenProposal: (proposal: PilotProposal) => void;
  onOpenStartupsModal: () => void;
}

export function DashboardView({
  proposals,
  onStartNewPoc,
  onOpenProposal,
  onOpenStartupsModal
}: DashboardViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | ProposalStatus>('All');
  const openDirectory = useAppStore((s) => s.openDirectory);
  const flagCounts = useMemo(() => countStartupsByCountry(ALL_STARTUPS), []);
  const reduceMotion = usePrefersReducedMotion();

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

  const metricCards: { label: string; value: number; sub: string; color?: string }[] = [
    { label: 'Total saved projects', value: proposals.length, sub: 'Active pilot proposals' },
    { label: 'Under team review', value: underReviewCount, sub: 'Needs manager sign-off', color: 'var(--accent-amber)' },
    { label: 'Approved pilots', value: approvedCount, sub: 'Ready to start', color: 'var(--accent-cyan)' },
    { label: 'Draft proposals', value: draftsCount, sub: 'In-progress planning' },
    { label: 'Startups in directory', value: ALL_STARTUPS.length, sub: 'SG · MY · ID · VN · TH · PH' },
  ];

  return (
    <div>
      {/* Hero: one headline, one gradient phrase, one red primary action */}
      <section className="dash-hero grid items-center gap-10 pb-6 pt-10 md:grid-cols-[1.15fr_0.85fr] md:pt-16">
        <Reveal className="flex flex-col items-center text-center md:items-start md:text-left">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-asean-yellow/40 bg-asean-yellow/10 px-3.5 py-1 text-xs font-semibold text-accent-amber">
            <Globe2 className="size-3.5" aria-hidden /> Southeast Asia innovation platform
          </p>
          <h1 className="text-balance text-[2.25rem] font-bold leading-[1.08] tracking-[-0.035em] text-foreground md:text-[3.5rem]">
            Match business challenges with <span className="gradient-text">verified ASEAN</span> tech startups.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-text-secondary md:text-lg">
            See exactly why a startup fits, generate a complete pilot plan, and review it with your team.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button variant="cta" size="lg" className="rounded-full" onClick={onStartNewPoc}>
              <Plus aria-hidden /> Match a business problem
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full" onClick={onOpenStartupsModal}>
              Browse {ALL_STARTUPS.length} startups <ArrowRight aria-hidden />
            </Button>
          </div>
        </Reveal>

        <div className="relative mx-auto hidden w-full max-w-[460px] md:block">
          {reduceMotion ? (
            <div className="flex aspect-square items-center justify-center">
              <Image src={ASEAN_LOGO_SRC} alt="ASEAN logo" width={260} height={260} className="size-[260px]" />
            </div>
          ) : (
            <HeroGlobe />
          )}
        </div>
      </section>

      {/* Live pipeline counts */}
      <section className="metrics-grid" aria-label="Pipeline summary">
        {metricCards.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.04} className="metric-card">
            <span className="metric-label">{m.label}</span>
            <div className="metric-value" style={m.color ? { color: m.color } : undefined}>
              <NumberTicker value={m.value} />
            </div>
            <div className="metric-sub">
              <span>{m.sub}</span>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ASEAN flag slider: opens the directory filtered by country */}
      <FlagSlider counts={flagCounts} onSelectCountry={(code) => openDirectory(code)} />

      {/* Deal Pipeline Dashboard */}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Pilot projects & proposals</h2>
            <p className="mt-1 text-sm text-text-secondary">Track progress, review stages, and next actions with your team.</p>
          </div>

          <Button variant="outline" size="sm" className="rounded-full max-md:hidden" onClick={onStartNewPoc}>
            <Plus aria-hidden /> New project
          </Button>
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
          <div className="card state-box">
            <p className="text-text-muted">
              No proposals with status <strong className="text-foreground">{statusFilter}</strong>.
            </p>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setStatusFilter('All')}>
              View all deals
            </Button>
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
                          <span className="inline-flex items-center gap-1 text-[0.7rem] text-accent-amber">
                            <PencilLine className="size-3" aria-hidden /> {p.editedFields.length} user edit{p.editedFields.length > 1 ? 's' : ''}
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
                          <span className="size-1.5 rounded-full bg-current" aria-hidden /> {p.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: isApproved ? 'var(--accent-emerald)' : isUnderReview ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
                          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
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
                              <Download className="size-3.5" aria-hidden /> PDF
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => onOpenProposal(p)}
                          >
                            Open <ArrowRight className="size-3.5" aria-hidden />
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

      {/* How it works */}
      <section className="mt-20" aria-labelledby="how-title">
        <Reveal className="mb-8 text-center">
          <h2 id="how-title" className="text-2xl font-bold tracking-tight text-foreground">How it works</h2>
          <p className="mt-1 text-sm text-text-secondary">Five steps from a business problem to a signed-off pilot.</p>
        </Reveal>

        <ol className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {STEPS.map((s, i) => (
            <RevealItem key={s.title} delay={i * 0.05} className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                <span className={cn('flex size-9 items-center justify-center rounded-full', s.tone)}>
                  <s.icon className="size-4" aria-hidden />
                </span>
                <span className="text-xs font-semibold tabular-nums text-text-muted">Step {i + 1}</span>
                <h3 className="-mt-2 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-[0.85rem] leading-relaxed text-text-secondary">{s.body}</p>
            </RevealItem>
          ))}
        </ol>
      </section>
    </div>
  );
}
