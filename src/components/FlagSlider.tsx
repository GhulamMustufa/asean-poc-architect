'use client';

import Image from 'next/image';
import { ASEAN_MEMBERS, type AseanMemberCode } from '@/data/aseanCountries';
import { Marquee } from '@/components/ui/marquee';

interface FlagSliderProps {
  counts: Record<AseanMemberCode, number>;
  onSelectCountry: (code: AseanMemberCode) => void;
}

export function FlagSlider({ counts, onSelectCountry }: FlagSliderProps) {
  return (
    <section aria-labelledby="flag-slider-title" className="flag-slider no-print my-14">
      <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-amber">One region</p>
        <h2 id="flag-slider-title" className="text-2xl font-bold tracking-tight text-foreground">
          11 ASEAN member states
        </h2>
        <p className="text-sm text-text-secondary">Pick a country to browse its startups.</p>
      </div>

      <Marquee duration={45} gap="0.875rem" className="marquee-fade py-2">
        {ASEAN_MEMBERS.map((m) => {
          const n = counts[m.code] ?? 0;
          const status = n > 0 ? `${n} startup${n === 1 ? '' : 's'}` : 'Coming soon';
          return (
            <button
              key={m.code}
              type="button"
              onClick={() => onSelectCountry(m.code)}
              aria-label={`${m.name}, ${status}. Open startup directory`}
              className="flag-card group/flag flex w-44 shrink-0 items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-3 text-left transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-asean-yellow/70 hover:shadow-lg focus-visible:border-asean-yellow"
            >
              <Image
                src={m.flagSrc}
                alt=""
                width={44}
                height={30}
                unoptimized
                className="flag-card-img h-[30px] w-11 shrink-0 rounded-md object-cover ring-1 ring-border"
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">{m.name}</span>
                <span className={n > 0 ? 'text-xs text-text-secondary' : 'text-xs text-text-muted italic'}>{status}</span>
              </span>
            </button>
          );
        })}
      </Marquee>
    </section>
  );
}
