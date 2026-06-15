import { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  dark?: boolean;
}

export function BrandLogo({ className = '', compact = false, dark = false }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const titleColor = dark ? 'text-white' : 'text-[var(--ali-ink)]';
  const subtitleColor = dark ? 'text-cyan-100/80' : 'text-[var(--ali-muted)]';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!imageError ? (
        <img
          src="/assets/ali-digital-logo.png"
          alt="ALI Digital"
          className={`object-contain ${compact ? 'h-10 w-10' : 'h-12 w-12 sm:h-14 sm:w-14'}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-2xl shadow-sm ${compact ? 'h-10 w-10 text-lg' : 'h-12 w-12 sm:h-14 sm:w-14 text-xl sm:text-2xl'} ${dark ? 'bg-white/10 text-[var(--ali-cyan)]' : 'bg-[var(--ali-navy)] text-[var(--ali-cyan)]'}`}
        >
          <span className="font-black">A</span>
        </div>
      )}

      {!compact && (
        <div>
          <div className={`text-lg font-semibold leading-none sm:text-xl ${titleColor}`}>ALI Digital</div>
          <div className={`mt-1 text-xs font-medium uppercase tracking-[0.16em] ${subtitleColor}`}>
            CRM comercial
          </div>
        </div>
      )}
    </div>
  );
}
