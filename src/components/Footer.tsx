import Image from 'next/image';
import { ASEAN_LOGO_SRC, ASEAN_MEMBERS } from '@/data/aseanCountries';

export function Footer() {
  return (
    <footer className="site-footer no-print mt-16 border-t border-border">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <Image src={ASEAN_LOGO_SRC} alt="ASEAN logo" width={40} height={40} className="size-10" />
          <div className="leading-tight">
            <p className="font-bold tracking-tight text-foreground">ASEAN POC-Architect</p>
            <p className="mt-1 text-sm text-text-secondary">Enterprise pilots with verified Southeast Asian startups.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <ul className="flex flex-wrap gap-2" aria-label="ASEAN member states">
            {ASEAN_MEMBERS.map((m) => (
              <li key={m.code}>
                <Image
                  src={m.flagSrc}
                  alt={m.name}
                  title={m.name}
                  width={24}
                  height={16}
                  unoptimized
                  className="h-4 w-6 rounded-[3px] object-cover ring-1 ring-border"
                />
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-muted">
            Flags: flagcdn.com / Wikimedia Commons · ASEAN emblem © ASEAN · Demo platform, not affiliated with the ASEAN Secretariat.
          </p>
        </div>
      </div>
    </footer>
  );
}
