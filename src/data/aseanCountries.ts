/**
 * ASEAN member states (11, including Timor-Leste, admitted October 2025).
 * Flag SVGs and the ASEAN logo are served locally from /public.
 *
 * Note: this is separate from `ASEANCountry` in src/types, which lists only
 * the countries the matcher currently covers.
 */

export type AseanMemberCode =
  | 'BN'
  | 'KH'
  | 'ID'
  | 'LA'
  | 'MY'
  | 'MM'
  | 'PH'
  | 'SG'
  | 'TH'
  | 'VN'
  | 'TL';

export interface AseanMember {
  code: AseanMemberCode;
  name: string;
  flagSrc: string;
  capital: { name: string; lat: number; lng: number };
}

export const ASEAN_LOGO_SRC = '/brand/asean-logo.png';
export const ASEAN_LOGO_WIDTH = 2400;
export const ASEAN_LOGO_HEIGHT = 2400;

// Sorted alphabetically by name.
export const ASEAN_MEMBERS: readonly AseanMember[] = Object.freeze([
  { code: 'BN', name: 'Brunei', flagSrc: '/flags/bn.svg', capital: { name: 'Bandar Seri Begawan', lat: 4.9031, lng: 114.9398 } },
  { code: 'KH', name: 'Cambodia', flagSrc: '/flags/kh.svg', capital: { name: 'Phnom Penh', lat: 11.5564, lng: 104.9282 } },
  { code: 'ID', name: 'Indonesia', flagSrc: '/flags/id.svg', capital: { name: 'Jakarta', lat: -6.2088, lng: 106.8456 } },
  { code: 'LA', name: 'Laos', flagSrc: '/flags/la.svg', capital: { name: 'Vientiane', lat: 17.9757, lng: 102.6331 } },
  { code: 'MY', name: 'Malaysia', flagSrc: '/flags/my.svg', capital: { name: 'Kuala Lumpur', lat: 3.139, lng: 101.6869 } },
  { code: 'MM', name: 'Myanmar', flagSrc: '/flags/mm.svg', capital: { name: 'Naypyidaw', lat: 19.7633, lng: 96.0785 } },
  { code: 'PH', name: 'Philippines', flagSrc: '/flags/ph.svg', capital: { name: 'Manila', lat: 14.5995, lng: 120.9842 } },
  { code: 'SG', name: 'Singapore', flagSrc: '/flags/sg.svg', capital: { name: 'Singapore', lat: 1.3521, lng: 103.8198 } },
  { code: 'TH', name: 'Thailand', flagSrc: '/flags/th.svg', capital: { name: 'Bangkok', lat: 13.7563, lng: 100.5018 } },
  { code: 'TL', name: 'Timor-Leste', flagSrc: '/flags/tl.svg', capital: { name: 'Dili', lat: -8.5569, lng: 125.5603 } },
  { code: 'VN', name: 'Vietnam', flagSrc: '/flags/vn.svg', capital: { name: 'Hanoi', lat: 21.0278, lng: 105.8342 } },
] as const satisfies readonly AseanMember[]);

const MEMBER_BY_CODE = new Map<string, AseanMember>(ASEAN_MEMBERS.map((m) => [m.code, m]));

/** Case-insensitive lookup by ISO 3166-1 alpha-2 code. */
export function getMember(code: string): AseanMember | undefined {
  return MEMBER_BY_CODE.get(code.trim().toUpperCase());
}

/** Counts startups per ASEAN member. All 11 keys are present (default 0); non-ASEAN codes are ignored. */
export function countStartupsByCountry(startups: { country: string }[]): Record<AseanMemberCode, number> {
  const counts = Object.fromEntries(ASEAN_MEMBERS.map((m) => [m.code, 0])) as Record<AseanMemberCode, number>;
  for (const s of startups) {
    const member = getMember(s.country);
    if (member) counts[member.code] += 1;
  }
  return counts;
}
