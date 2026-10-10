import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { apiImageUrl, isImageOptimizable } from "../../lib/transport-api";

export type HeroHighlight = { icon: ReactNode; label: string; value: string };

type Props = {
  crumb: string;
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  hours?: string;
  highlights?: HeroHighlight[];
  children?: ReactNode; // buttons
};

export default function PageHero({
  crumb, eyebrow, title, subtitle, imageUrl, imageAlt = "", hours, highlights = [], children,
}: Props) {
  const items = highlights.filter((item) => item.value);

  return (
    <section className="relative isolate flex min-h-[540px] items-end overflow-hidden bg-slate-950 text-white sm:min-h-[620px] lg:min-h-[680px]">
      <style>{`
        @keyframes ph-zoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes ph-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .ph-zoom { animation: ph-zoom 14s ease-out forwards; }
        .ph-rise > * { opacity: 0; animation: ph-rise .7s ease-out forwards; }
        .ph-rise > *:nth-child(2) { animation-delay: .08s; }
        .ph-rise > *:nth-child(3) { animation-delay: .16s; }
        .ph-rise > *:nth-child(4) { animation-delay: .24s; }
        .ph-rise > *:nth-child(5) { animation-delay: .32s; }
        @media (prefers-reduced-motion: reduce) {
          .ph-zoom, .ph-rise > * { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* Photo */}
      {imageUrl ? (
        <Image
          src={apiImageUrl(imageUrl) || imageUrl}
          alt={imageAlt}
          fill
          priority
          unoptimized={!isImageOptimizable(imageUrl)}
          sizes="100vw"
          className="ph-zoom -z-30 object-cover object-center"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-30 bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.3),transparent_55%),linear-gradient(135deg,#0f172a,#020617)]" />
      )}

      {/* Overlays: dark behind the text, photo stays bright on the right */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-t from-black/85 via-black/20 to-black/10 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/45 lg:to-black/5" />
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-28 sm:px-6 sm:pb-10 lg:pt-32">
        <div className="ph-rise max-w-3xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <ChevronRight aria-hidden="true" className="size-4" />
            <span className="font-semibold text-white">{crumb}</span>
          </nav>

          {hours ? (
            <p className="mt-5 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold backdrop-blur-md">
              <span aria-hidden="true" className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
              </span>
              {hours}
            </p>
          ) : <span />}

          <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {eyebrow && <span className="mb-3 block text-sm font-semibold uppercase tracking-[.22em] text-white/65">{eyebrow}</span>}
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/80 sm:text-xl">{subtitle}</p>
          ) : <span />}

          {children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : <span />}
        </div>

        {/* Info strip */}
        {items.length > 0 && (
          <ul className="mt-10 grid overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:grid-cols-3 sm:divide-x sm:divide-white/15">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-3 border-b border-white/10 p-4 last:border-b-0 sm:border-b-0">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-slate-950">{item.icon}</span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wider text-white/60">{item.label}</span>
                  <span className="block truncate font-semibold">{item.value}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}