import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { BurslulukBackground, BurslulukPanel, BurslulukTopBar } from './BurslulukUi';

export function BurslulukCandidateShell({
  eyebrow,
  title,
  description,
  backHref,
  children,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  backHref?: string;
  children: ReactNode;
}) {
  const hasHeroContent = Boolean(eyebrow || title || description);

  return (
    <BurslulukBackground className="pb-20">
      <BurslulukTopBar />
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 sm:px-6 lg:gap-8 lg:px-12">
        {backHref ? (
          <a
            href={backHref}
            className="inline-flex min-h-[40px] items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-4 text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.18em] text-white/52 transition-colors hover:border-white/18 hover:text-white/80"
          >
            <ChevronLeft size={14} />
            Geri
          </a>
        ) : null}

        {hasHeroContent ? (
          <div className="max-w-[920px]">
            {eyebrow ? (
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-7 bg-[#E70000]" />
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#E70000] sm:text-[11px]">{eyebrow}</p>
              </div>
            ) : null}
            {title ? (
              <h1 className="mt-5 font-['Neutraface_2_Text:Bold',sans-serif] text-[2.35rem] leading-[0.98] text-white sm:text-[3rem] md:text-[4.2rem]">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-5 max-w-[760px] text-[15px] leading-[1.85] text-white/68 sm:text-[16px]">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        {children}
      </div>
    </BurslulukBackground>
  );
}

export function BurslulukDataPanel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <BurslulukPanel className={className}>
      <div className="flex items-center gap-3">
        <div className="h-[2px] w-6 bg-[#E70000]" />
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{title}</p>
      </div>
      <div className="mt-4">{children}</div>
    </BurslulukPanel>
  );
}
