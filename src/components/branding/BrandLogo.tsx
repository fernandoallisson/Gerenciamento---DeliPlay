import { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  dark?: boolean;
}

export function BrandLogo({ className = '', compact = false, dark = false }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const titleColor = dark ? 'text-white' : 'text-[var(--dp-ink)]';
  const subtitleColor = dark ? 'text-cyan-100/80' : 'text-[var(--dp-muted)]';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!imageError ? (
        <img
          src="/assets/ali-digital-logo.png"
          alt="DeliPlay CRM"
          className={`object-contain ${compact ? 'h-10 w-10' : 'h-12 w-12 sm:h-14 sm:w-14'}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-2xl shadow-sm ${compact ? 'h-10 w-10 text-lg' : 'h-12 w-12 sm:h-14 sm:w-14 text-xl sm:text-2xl'} ${dark ? 'bg-white/10 text-[var(--dp-cyan)]' : 'bg-[var(--dp-navy)] text-[var(--dp-cyan)]'}`}
        >
          <span className="font-black">D</span>
        </div>
      )}

      {!compact && (
        <div>
          <div className={`text-lg font-semibold leading-none sm:text-xl ${titleColor}`}>DeliPlay</div>
          <div className={`mt-1 text-xs font-medium uppercase tracking-[0.16em] ${subtitleColor}`}>
            CRM
          </div>
        </div>
      )}
    </div>
  );
}
