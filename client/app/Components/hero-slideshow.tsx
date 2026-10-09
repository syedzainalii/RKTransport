"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, Phone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiImageUrl, isImageOptimizable, type HeroBanner } from "../../lib/transport-api";

const SLIDE_MS = 6000;

export default function HeroSlideshow({ slides }: { slides: HeroBanner[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const touchStart = useRef<number | null>(null);
  const slide = slides[active];
  const count = slides.length;

  const next = useCallback(() => setActive((index) => (index + 1) % count), [count]);
  const previous = useCallback(() => setActive((index) => (index - 1 + count) % count), [count]);
  const goTo = (index: number) => { setActive(index); setCycle((value) => value + 1); };
  const resume = () => { setPaused(false); setCycle((value) => value + 1); };

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = window.setTimeout(next, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [active, cycle, paused, count, next]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="RK Transport"
      className="relative isolate flex h-[100dvh] min-h-[100dvh] flex-col justify-between overflow-hidden bg-slate-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={resume}
      onFocus={() => setPaused(true)}
      onBlur={resume}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 45) {
          if (delta < 0) next();
          else previous();
          setCycle((value) => value + 1);
        }
        touchStart.current = null;
      }}
    >
      <style>{`
        @keyframes hero-zoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes hero-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes hero-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hero-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        .hero-zoom { animation: hero-zoom 9s ease-out forwards; }
        .hero-rise > * { opacity: 0; animation: hero-rise .7s ease-out forwards; }
        .hero-rise > *:nth-child(2) { animation-delay: .08s; }
        .hero-rise > *:nth-child(3) { animation-delay: .16s; }
        .hero-rise > *:nth-child(4) { animation-delay: .24s; }
        .hero-rise > *:nth-child(5) { animation-delay: .32s; }
        @media (prefers-reduced-motion: reduce) {
          .hero-zoom, .hero-rise > *, .hero-bounce { animation: none !important; opacity: 1 !important; }
          .hero-bar { animation: none !important; transform: scaleX(1) !important; }
        }
      `}</style>

      {/* Background images */}
      {slides.map((banner, index) => {
        const landscapeImage = banner.image_url || banner.portrait_image_url;
        const portraitImage = banner.portrait_image_url || landscapeImage;
        if (!landscapeImage) return null;
        const landscapeSrc = apiImageUrl(landscapeImage) || landscapeImage;
        const portraitSrc = portraitImage ? apiImageUrl(portraitImage) || portraitImage : undefined;
        const isActive = active === index;
        return (
          <picture
            key={banner.id}
            className={`absolute inset-0 -z-30 transition-opacity duration-1000 ${isActive ? "opacity-100" : "opacity-0"}`}
          >
            {banner.portrait_image_url && portraitSrc && <source media="(max-width: 1023px)" srcSet={portraitSrc} />}
            <Image
              src={landscapeSrc}
              alt={banner.image_alt || ""}
              fill
              priority={index === 0}
              unoptimized={!isImageOptimizable(landscapeImage)}
              sizes="100vw"
              className={`object-cover ${isActive ? "hero-zoom" : ""}`}
            />
          </picture>
        );
      })}

      <div className="absolute inset-0 -z-40 bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.25),transparent_55%),linear-gradient(135deg,#0f172a,#020617)]" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-black/85 via-black/35 to-black/20 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/40 lg:to-black/10" />
      <div className="absolute inset-x-0 top-0 -z-20 h-32 bg-gradient-to-b from-black/70 to-transparent" />

      {/* Main Content Area */}
      {slide ? (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-20 pt-20 sm:px-6 sm:pb-24">
          <div key={`${active}-${slide.id}`} className="hero-rise max-w-3xl">
            {slide.badge_text ? (
              <p className="mb-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white backdrop-blur-md sm:mb-4 sm:text-sm">
                <span aria-hidden="true" className="size-2 rounded-full bg-amber-400" />
                {slide.badge_text}
              </p>
            ) : <span />}

            {slide.subtitle ? (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-white/75 sm:text-sm">{slide.subtitle}</p>
            ) : <span />}

            <h1 className="text-balance text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{slide.title}</h1>

            {slide.description ? (
              <p className="mt-4 max-w-xl text-base leading-7 text-white/85 sm:text-lg lg:text-xl">{slide.description}</p>
            ) : <span />}

            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
              {slide.button_text && slide.button_link && (
                <Link
                  href={slide.button_link}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:bg-slate-100 sm:min-h-12 sm:px-6 sm:text-base"
                >
                  {slide.button_text}
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <a
                href="https://wa.me/971561379697"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-green-600 sm:min-h-12 sm:px-6 sm:text-base"
              >
                <MessageCircle aria-hidden="true" className="size-4 sm:size-5" />
                WhatsApp us
              </a>
              <a
                href="tel:+971561379697"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:min-h-12 sm:px-6 sm:text-base"
              >
                <Phone aria-hidden="true" className="size-4 sm:size-5" />
                Call us
              </a>
            </div>
          </div>
        </div>
      ) : <div className="flex-1" />}

      {/* Bottom controls */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-6 sm:px-6 sm:pb-8">
          <div className="flex flex-1 items-center gap-3 sm:max-w-md" role="group" aria-label="Choose a slide">
            <span className="text-xs font-semibold tabular-nums text-white/90 sm:text-sm">
              {String(active + 1).padStart(2, "0")}
              <span className="text-white/50"> / {String(count).padStart(2, "0")}</span>
            </span>
            <div className="flex flex-1 items-center gap-2">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={active === index ? "true" : undefined}
                  className="relative h-6 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/30">
                    {index < active && <span className="absolute inset-0 bg-white" />}
                    {index === active && (
                      <span
                        key={`${active}-${cycle}`}
                        className="hero-bar absolute inset-0 origin-left bg-white"
                        style={{
                          animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { previous(); setCycle((value) => value + 1); }}
              aria-label="Previous slide"
              className="grid size-9 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 sm:size-11"
            >
              <ChevronLeft aria-hidden="true" className="size-4 sm:size-5" />
            </button>
            <button
              type="button"
              onClick={() => { next(); setCycle((value) => value + 1); }}
              aria-label="Next slide"
              className="grid size-9 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 sm:size-11"
            >
              <ChevronRight aria-hidden="true" className="size-4 sm:size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Scroll cue */}
      <a
        href="#services"
        aria-label="Scroll down"
        className="hero-bounce absolute bottom-20 left-1/2 hidden -translate-x-1/2 text-white/70 hover:text-white lg:block"
        style={{ animation: "hero-bounce 2s ease-in-out infinite" }}
      >
        <ChevronDown aria-hidden="true" className="size-6" />
      </a>
    </section>
  );
}