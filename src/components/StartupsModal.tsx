'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, BadgeCheck, FlaskConical, Search } from 'lucide-react';
import { ALL_STARTUPS } from '@/data/startups';
import { ASEAN_MEMBERS, countStartupsByCountry, getMember } from '@/data/aseanCountries';
import { filterStartups, type StartupTier } from '@/lib/filterStartups';
import { useAppStore } from '@/stores/appStore';
import { CountryFlag } from '@/components/CountryFlag';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import type { CuratedStartup } from '@/types';

interface StartupsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRY_COUNTS = countStartupsByCountry(ALL_STARTUPS);
const VERIFIED_COUNT = ALL_STARTUPS.filter((s) => !s.isSyntheticDemo).length;
const SAMPLE_COUNT = ALL_STARTUPS.length - VERIFIED_COUNT;

export function StartupsModal({ isOpen, onClose }: StartupsModalProps) {
  const initialCountry = useAppStore((s) => s.directory.country);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="bottom"
          className="glass-strong h-[92dvh] border-x-0 border-b-0"
          // Don't focus the search box on open: it would pop the phone keyboard.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.focus();
          }}
          tabIndex={-1}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-foreground/25" aria-hidden />
          <SheetHeader className="pb-3 pt-3">
            <SheetTitle>ASEAN startups</SheetTitle>
            <SheetDescription>Real and sample companies across Southeast Asia.</SheetDescription>
          </SheetHeader>
          {isOpen && <DirectoryBody key={initialCountry} initialCountry={initialCountry} compact />}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-w-[880px] flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle>Browse ASEAN tech startups</DialogTitle>
          <DialogDescription>Real and sample technology companies across Southeast Asia.</DialogDescription>
        </DialogHeader>
        {/* Keyed so filters reset to the requested country each time it opens */}
        {isOpen && <DirectoryBody key={initialCountry} initialCountry={initialCountry} />}
      </DialogContent>
    </Dialog>
  );
}

export function DirectoryBody({ initialCountry, compact = false }: { initialCountry: string; compact?: boolean }) {
  const [country, setCountry] = useState(initialCountry || 'ALL');
  const [tier, setTier] = useState<StartupTier>('ALL');
  const [query, setQuery] = useState('');

  const results = useMemo(() => filterStartups(ALL_STARTUPS, { country, tier, query }), [country, tier, query]);
  const countryRowRef = useRef<HTMLDivElement>(null);

  // Bring the pre-selected country chip into view (the row scrolls sideways).
  useEffect(() => {
    const row = countryRowRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (row && chip) row.scrollLeft = chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2;
  }, []);
  const member = country === 'ALL' ? undefined : getMember(country);
  const countryIsEmpty = member !== undefined && COUNTRY_COUNTS[member.code] === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn('flex flex-col gap-3 border-b border-border py-4', compact ? 'px-5 pt-0' : 'px-6')}>
        <div className={cn('flex gap-2', compact ? 'flex-col' : 'flex-wrap')}>
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Search startups</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
            <input
              type="search"
              placeholder="Search by name, technology or feature"
              className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-text-muted focus:border-ring"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="chip-row flex gap-1.5 overflow-x-auto" role="group" aria-label="Verification">
            <Chip active={tier === 'ALL'} onClick={() => setTier('ALL')}>All {ALL_STARTUPS.length}</Chip>
            <Chip active={tier === 'VERIFIED'} onClick={() => setTier('VERIFIED')}>
              <BadgeCheck className="size-3.5" aria-hidden /> Real {VERIFIED_COUNT}
            </Chip>
            <Chip active={tier === 'SYNTHETIC'} onClick={() => setTier('SYNTHETIC')}>
              <FlaskConical className="size-3.5" aria-hidden /> Sample {SAMPLE_COUNT}
            </Chip>
          </div>
        </div>

        <div
          ref={countryRowRef}
          className={cn('chip-row relative flex gap-1.5 overflow-x-auto pb-1', compact ? '-mx-5 px-5 scroll-px-5' : '-mx-6 px-6 scroll-px-6')}
          role="group"
          aria-label="Country"
        >
          <Chip active={country === 'ALL'} onClick={() => setCountry('ALL')}>All ASEAN</Chip>
          {ASEAN_MEMBERS.map((m) => (
            <Chip key={m.code} active={country === m.code} onClick={() => setCountry(m.code)}>
              <CountryFlag code={m.code} showLabel={false} />
              {m.name}
              <span className="tabular-nums opacity-70">{COUNTRY_COUNTS[m.code]}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div
        className={cn('min-h-0 flex-1 overflow-y-auto py-4', compact ? 'px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]' : 'px-6')}
        data-lenis-prevent
      >
        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            {member && <CountryFlag code={member.code} size="lg" showLabel={false} />}
            <p className="font-semibold text-foreground">
              {countryIsEmpty ? `No startups listed in ${member!.name} yet` : 'No startups match these filters'}
            </p>
            <p className="max-w-sm text-sm text-text-secondary">
              {countryIsEmpty
                ? 'We are still onboarding companies from this member state. Browse the rest of the region in the meantime.'
                : 'Try a different search or clear the filters.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setCountry('ALL');
                setTier('ALL');
                setQuery('');
              }}
              className="mt-1 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View all ASEAN startups
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {results.map((s) => (
              <li key={s.id}>
                <StartupCard s={s} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[0.8rem] font-medium transition-colors duration-200 ease-out',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-transparent text-text-secondary hover:border-input hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function StartupCard({ s }: { s: CuratedStartup }) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 basis-full">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <CountryFlag code={s.country} />
            <h3 className="text-base font-bold text-foreground">{s.name}</h3>
            <span className="text-xs text-text-muted">
              {s.stage} · Est. {s.foundedYear}
            </span>
          </div>
          <p className="text-sm font-medium text-accent-blue">{s.tagline}</p>
        </div>

        <div className="flex basis-full flex-wrap items-center gap-1.5">
          {!s.isSyntheticDemo ? (
            <span className="badge badge-verified">
              <BadgeCheck className="size-3.5" aria-hidden /> Verified · {s.sourceOrganisation || 'Enterprise SG / Cradle / HUB.ID'}
            </span>
          ) : (
            <span className="badge badge-draft">
              <FlaskConical className="size-3.5" aria-hidden /> Sample demo company
            </span>
          )}
          <span className={cn('badge', s.evidenceQuality === 'Audited Tier-1' ? 'badge-verified' : 'badge-supplied')}>
            {s.evidenceQuality}
          </span>
          {s.website && (
            <a
              href={s.website}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-0.5 text-xs text-accent-blue hover:underline"
            >
              Official website <ArrowUpRight className="size-3" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>

      <p className="my-3 text-sm text-text-secondary">{s.summary}</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {s.capabilities.map((cap) => (
          <span key={cap} className="capability-tag">
            {cap}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3 text-xs text-text-muted">
        <span>
          <strong className="font-semibold text-text-secondary">Past work:</strong> {s.notableDeployments.join(', ')}
        </span>
        <span>
          <strong className="font-semibold text-text-secondary">Security:</strong> {s.verifiedCertifications.join(', ') || '—'}
        </span>
      </div>
    </article>
  );
}
