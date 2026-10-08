"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiImageUrl, isImageOptimizable, type HeroBanner } from "../../lib/transport-api";

export default function HeroSlideshow({ slides }: { slides: HeroBanner[] }) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const slide = slides[active];
  const next = useCallback(() => setActive((index) => (index + 1) % slides.length), [slides.length]);
  const previous = useCallback(() => setActive((index) => (index - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(next, 6000);
    return () => window.clearInterval(timer);
  }, [next, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="RK Transport services"
      className="relative isolate flex min-h-[700px] items-center overflow-hidden bg-emerald-950 pt-16 text-white sm:min-h-[800px] lg:min-h-[880px]"
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 45) {
          if (delta < 0) next();
          else previous();
        }
        touchStart.current = null;
      }}
    >
      {slides.map((banner, index) => {
        const landscapeImage = banner.image_url || banner.portrait_image_url;
        const portraitImage = banner.portrait_image_url || landscapeImage;
        if (!landscapeImage) return null;
        const landscapeSrc = apiImageUrl(landscapeImage) || landscapeImage;
        const portraitSrc = portraitImage ? apiImageUrl(portraitImage) || portraitImage : undefined;
        return (
          <picture
            key={banner.id}
            className={`absolute inset-0 -z-20 transition-opacity duration-700 ${active === index ? "opacity-100" : "opacity-0"}`}
          >
            {banner.portrait_image_url && portraitSrc && (
              <source media="(max-width: 1023px)" srcSet={portraitSrc} />
            )}
            <Image
              src={landscapeSrc}
              alt={banner.image_alt || ""}
              fill
              priority={index === 0}
              unoptimized={!isImageOptimizable(landscapeImage)}
              sizes="100vw"
              className="object-cover"
            />
          </picture>
        );
      })}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-950/80 via-emerald-950/55 to-emerald-950/25" />
      <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-slate-950/80 to-transparent" />
      {slide && (
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-3xl">
            {slide.badge_text && (
              <p className="mb-5 inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-emerald-50">
                {slide.badge_text}
              </p>
            )}
            {slide.subtitle && (
              <p className="mb-3 text-sm font-bold uppercase tracking-[.18em] text-emerald-200">
                {slide.subtitle}
              </p>
            )}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            {slide.description && (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white">
                {slide.description}
              </p>
            )}
            {slide.button_text && (
              <Link
                href={slide.button_link?.startsWith("/") && !slide.button_link.startsWith("//") ? slide.button_link : "/quote"}
                className="mt-7 inline-flex min-h-12 items-center rounded-full bg-white px-6 font-semibold text-emerald-950 hover:bg-emerald-50"
              >
                {slide.button_text}
              </Link>
            )}
            {slides.length > 1 && (
              <div className="mt-8 flex items-center gap-3">
                <button type="button" onClick={previous} aria-label="Previous slide" className="grid size-11 place-items-center rounded-full border border-white/60 bg-slate-950/20 text-white hover:bg-white/15">
                  <ChevronLeft aria-hidden="true" />
                </button>
                <div className="flex items-center gap-2" role="group" aria-label="Choose a slide">
                  {slides.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`Show slide ${index + 1}`}
                      aria-current={active === index ? "true" : undefined}
                      className={`h-3 rounded-full border border-white transition-all ${active === index ? "w-8 bg-white" : "w-3 bg-white/40"}`}
                    />
                  ))}
                </div>
                <button type="button" onClick={next} aria-label="Next slide" className="grid size-11 place-items-center rounded-full border border-white/60 bg-slate-950/20 text-white hover:bg-white/15">
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}