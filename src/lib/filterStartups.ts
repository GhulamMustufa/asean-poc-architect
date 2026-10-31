import type { CuratedStartup } from '@/types';

export type StartupTier = 'ALL' | 'VERIFIED' | 'SYNTHETIC';

export interface StartupFilter {
  /** ISO country code, or 'ALL'. Case-insensitive. */
  country?: string;
  tier?: StartupTier;
  query?: string;
}

/** Filters the directory by country, verification tier and free-text search. */
export function filterStartups<T extends Pick<CuratedStartup, 'country' | 'isSyntheticDemo' | 'name' | 'tagline' | 'primaryIndustry' | 'capabilities'>>(
  startups: readonly T[],
  { country = 'ALL', tier = 'ALL', query = '' }: StartupFilter = {}
): T[] {
  const wantCountry = country.trim().toUpperCase();
  const q = query.trim().toLowerCase();

  return startups.filter((s) => {
    if (wantCountry !== 'ALL' && s.country.toUpperCase() !== wantCountry) return false;
    if (tier === 'VERIFIED' && s.isSyntheticDemo) return false;
    if (tier === 'SYNTHETIC' && !s.isSyntheticDemo) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      s.primaryIndustry.toLowerCase().includes(q) ||
      s.capabilities.some((c) => c.toLowerCase().includes(q))
    );
  });
}
