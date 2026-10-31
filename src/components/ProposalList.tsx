'use client';

import { ChevronRight } from 'lucide-react';
import type { PilotProposal } from '@/types';
import { CountryFlag } from '@/components/CountryFlag';
import { cn } from '@/lib/utils';

const STATUS_DOT: Record<string, string> = {
  Draft: 'bg-text-muted',
  'Under Review': 'bg-asean-yellow',
  'In Review': 'bg-asean-yellow',
  Approved: 'bg-asean-blue',
  Rejected: 'bg-asean-red',
};

/** Mobile list layout for proposals (the desktop table is hidden below md). */
export function ProposalList({
  proposals,
  onOpenProposal,
}: {
  proposals: PilotProposal[];
  onOpenProposal: (p: PilotProposal) => void;
}) {
  return (
    <ul className="flex flex-col gap-2 md:hidden" aria-label="Pilot projects">
      {proposals.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onOpenProposal(p)}
            className="glass flex w-full items-center gap-3 rounded-[22px] p-3 text-left transition-transform duration-200 ease-out active:scale-[0.99]"
          >
            <span className="glass flex size-12 shrink-0 items-center justify-center rounded-full p-0.5">
              <CountryFlag code={p.startupCountry} variant="round" size="lg" showLabel={false} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[0.95rem] font-semibold text-foreground">{p.challengeTitle}</span>
              <span className="flex min-w-0 items-center gap-1.5 text-[0.8rem] text-text-secondary">
                <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT[p.status] ?? 'bg-text-muted')} aria-hidden />
                <span className="shrink-0">{p.status}</span>
                <span aria-hidden>·</span>
                <span className="truncate">{p.startupName}</span>
              </span>
            </span>
            <span className="glass flex size-9 shrink-0 items-center justify-center rounded-full" aria-hidden>
              <ChevronRight className="size-4 text-foreground" />
            </span>
            <span className="sr-only">Open proposal</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
