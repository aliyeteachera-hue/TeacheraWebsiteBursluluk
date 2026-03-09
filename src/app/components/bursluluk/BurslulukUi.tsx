import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight, MessageCircle, PhoneCall } from 'lucide-react';
import TeacheraLogo from '../../../imports/TeacheraLogo';
import { BURSLULUK_SUPPORT } from '../../bursluluk/config';

export function BurslulukBackground({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-[#00000B] text-white ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(231,0,0,0.18),_transparent_35%),radial-gradient(circle_at_80%_15%,_rgba(50,77,71,0.4),_transparent_28%),linear-gradient(180deg,#09090F_0%,#0F131A_48%,#111819_100%)]" />
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:30px_30px]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function BurslulukTopBar() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-10 lg:px-12">
      <a href="/" className="inline-flex items-center gap-3 text-white/80 transition-colors hover:text-white">
        <div className="h-[24px] w-[120px]" style={{ '--fill-0': '#EEEBF5' } as CSSProperties}>
          <TeacheraLogo />
        </div>
      </a>
      <div className="hidden items-center gap-3 md:flex">
        <a
          href={BURSLULUK_SUPPORT.phoneHref}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <PhoneCall size={14} />
          {BURSLULUK_SUPPORT.phoneLabel}
        </a>
        <a
          href={BURSLULUK_SUPPORT.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#1FAF67]/30 bg-[#1FAF67]/15 px-4 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] text-white transition-colors hover:bg-[#1FAF67]/25"
        >
          <MessageCircle size={14} />
          {BURSLULUK_SUPPORT.whatsappLabel}
        </a>
      </div>
    </div>
  );
}

export function BurslulukSectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <span className="text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.24em] text-[#E70000]">
        {eyebrow}
      </span>
      <h2 className="max-w-[760px] font-['Neutraface_2_Text:Bold',sans-serif] text-[2rem] leading-[1.02] text-white md:text-[3rem]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-[680px] text-[15px] leading-[1.8] text-white/70 md:text-[16px]">{description}</p>
      ) : null}
    </div>
  );
}

export function BurslulukPrimaryButton({
  children,
  type = 'button',
  href,
  onClick,
  className = '',
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const baseClassName =
    `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#E70000] px-6 py-3 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff2f35] ${className}`;

  if (href) {
    return (
      <a href={href} onClick={onClick} className={baseClassName}>
        {children}
        <ArrowRight size={14} />
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClassName}>
      {children}
      <ArrowRight size={14} />
    </button>
  );
}

export function BurslulukSecondaryButton({
  children,
  href,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.1em] text-white/90 transition-colors hover:bg-white/10 hover:text-white";

  if (href) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function BurslulukPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:rounded-[28px] sm:p-6 ${className}`}>
      {children}
    </div>
  );
}
