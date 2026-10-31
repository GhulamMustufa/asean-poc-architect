import Image from 'next/image';
import { getMember } from '@/data/aseanCountries';
import { cn } from '@/lib/utils';

interface CountryFlagProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'rect' | 'round';
  /** Show the country name next to the flag. 'code' shows the ISO code instead. */
  showLabel?: boolean | 'code';
  className?: string;
}

const RECT = { sm: [20, 14], md: [24, 16], lg: [36, 24] } as const;
const ROUND = { sm: 20, md: 28, lg: 44 } as const;

export function CountryFlag({ code, size = 'sm', variant = 'rect', showLabel = 'code', className }: CountryFlagProps) {
  const member = getMember(code);

  if (!member) {
    return <span className={cn('badge badge-country', className)}>{code}</span>;
  }

  const [w, h] = variant === 'round' ? [ROUND[size], ROUND[size]] : RECT[size];
  const label = showLabel === 'code' ? member.code : showLabel ? member.name : null;

  return (
    <span
      className={cn('country-flag inline-flex items-center gap-1.5 align-middle', className)}
      title={member.name}
    >
      <Image
        src={member.flagSrc}
        alt={label === member.name ? '' : member.name}
        width={w}
        height={h}
        unoptimized
        className={cn(
          'shrink-0 object-cover ring-1 ring-border',
          variant === 'round' ? 'rounded-full' : 'rounded-[3px]'
        )}
        style={{ width: w, height: h }}
      />
      {label && <span className="text-xs font-semibold tracking-wide text-text-secondary">{label}</span>}
    </span>
  );
}
