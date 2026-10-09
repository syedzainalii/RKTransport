import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ReviewForm from "./Components/review-form";
import HeroSlideshow from "./Components/hero-slideshow";
import SectionPager from "./Components/section-pager";
import SimpleRichText from "./Components/simple-rich-text";
import {
  BreadcrumbStructuredData,
  StructuredData,
} from "./Components/structured-data";
import {
  apiImageUrl,
  isImageOptimizable,
  publicApi,
  type Faq,
  type HeroBanner,
  type PageCopy,
  type Service,
  type Testimonial,
} from "../lib/transport-api";
import { faqJsonLd } from "../lib/seo";

export const revalidate = 60;

async function getContent() {
  const results = await Promise.allSettled([
    publicApi.settings(),
    publicApi.heroBanners(),
    publicApi.services(),
    publicApi.pageCopy(),
    publicApi.faqs(),
    publicApi.about(),
    publicApi.testimonials(),
  ]);

  return {
    settings: results[0].status === "fulfilled" ? results[0].value : null,
    banners: results[1].status === "fulfilled" ? results[1].value : [],
    services: results[2].status === "fulfilled" ? results[2].value : [],
    copy: results[3].status === "fulfilled" ? results[3].value : [],
    faqs: results[4].status === "fulfilled" ? results[4].value : [],
    about: results[5].status === "fulfilled" ? results[5].value[0] ?? null : null,
    testimonials: results[6].status === "fulfilled" ? results[6].value : [],
  };
}

export default async function HomePage() {
  const { settings, banners, services, copy, faqs, about, testimonials } =
    await getContent();

  const text = (key: string, fallback: string) =>
    copy.find((item: PageCopy) => item.key === key)?.value || fallback;

  const slides: HeroBanner[] = banners.length
    ? banners
    : [
        {
          id: 0,
          title: text("home.hero.title", "Car transport Dubai ⇄ Abu Dhabi"),
          subtitle: settings?.brand_name || "RK Transport",
          description: text(
            "home.hero.description",
            "Reliable car transport between Dubai and Abu Dhabi. Available 24/7."
          ),
          badge_text: settings
            ? settings.available_24_7
              ? settings.hours_label
              : ""
            : "Available 24/7",
          button_text: text("home.hero.button", "Give us a review"),
          button_link: "/contact",
          image_url: null,
          image_alt: "",
          portrait_image_url: null,
        },
      ];

  const aboutImage = about?.images?.find((image) => image.url);

  const visibleHomeFaqs = faqs.filter(
    (faq: Faq) => !faq.page_key || faq.page_key === "home"
  );

  const homeFaqs = visibleHomeFaqs.map((faq: Faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  const averageRating = testimonials.length
    ? (
        testimonials.reduce((sum: number, t: Testimonial) => sum + t.rating, 0) /
        testimonials.length
      ).toFixed(1)
    : "0.0";

  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }]} />

      {homeFaqs.length > 0 && <StructuredData data={faqJsonLd(homeFaqs)} />}

      <SectionPager />

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}
        <div data-snap-section data-label="Home" className="snap-hero">
          <HeroSlideshow slides={slides} />
        </div>

        {/* =========================================================
            SERVICES
        ========================================================= */}
        <section
          id="services"
          data-snap-section
          data-label="Services"
          className="snap-section mx-auto w-full max-w-7xl px-4 sm:px-6"
        >
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">
                {text("home.services.eyebrow", "How we help")}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {text("home.services.heading", "Car transport, when you need it")}
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline"
            >
              {text("home.services.link", "Explore services")}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          {services.length ? (
            <div
              className={
                services.length === 1
                  ? "grid gap-6"
                  : services.length === 2
                    ? "grid gap-6 md:grid-cols-2"
                    : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              }
            >
              {services.map((service: Service, index: number) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/15 dark:border-slate-800 dark:bg-slate-900 ${
                    services.length === 1 ? "md:grid md:grid-cols-2" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 ${
                      services.length === 1 ? "h-72 md:h-full md:min-h-[24rem]" : "h-64 sm:h-72"
                    }`}
                  >
                    {service.image_url ? (
                      <Image
                        src={apiImageUrl(service.image_url) || service.image_url}
                        alt={service.image_alt || ""}
                        fill
                        unoptimized={!isImageOptimizable(service.image_url)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-950"
                      />
                    )}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"
                    />
                    <span className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-white/90 text-sm font-bold text-slate-900 backdrop-blur">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/90 text-slate-900 backdrop-blur transition group-hover:bg-slate-950 group-hover:text-white">
                      <ArrowUpRight aria-hidden="true" className="size-5" />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-center p-6 sm:p-7">
                    <h3 className="text-2xl font-bold tracking-tight">{service.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                      {service.short_description}
                    </p>
                    {service.starting_price_note && (
                      <p className="mt-3 font-semibold">{service.starting_price_note}</p>
                    )}
                    <span className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold transition-all group-hover:gap-3">
                      {text("home.services.details", "Service details")}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-stone-100 p-6 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {text("empty.services", "Service information is currently unavailable.")}
            </p>
          )}
        </section>

        {/* =========================================================
            ABOUT
        ========================================================= */}
        {about && (
          <section
            id="about"
            data-snap-section
            data-label="About"
            className="snap-section relative overflow-hidden bg-stone-100 px-4 dark:bg-slate-900/60 sm:px-6"
          >
            <style>{`
              @keyframes home-about-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
              .home-about-float { animation: home-about-float 5s ease-in-out infinite; }
              @media (prefers-reduced-motion: reduce) { .home-about-float { animation: none !important; } }
            `}</style>

            <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
              {aboutImage && (
                <div className={`group relative ${about.story_image_side === "right" ? "lg:order-2" : ""}`}>
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -rotate-3 rounded-[2rem] bg-slate-950 transition-transform duration-500 group-hover:rotate-0 dark:bg-slate-700"
                  />
                  <div className="relative aspect-[4/5] rotate-2 overflow-hidden rounded-[2rem] bg-slate-200 shadow-2xl shadow-slate-900/25 transition-transform duration-500 group-hover:rotate-0 dark:bg-slate-800 sm:aspect-[5/4] lg:aspect-[4/5]">
                    <Image
                      src={apiImageUrl(aboutImage.url) || aboutImage.url!}
                      alt={aboutImage.alt || ""}
                      fill
                      unoptimized={!isImageOptimizable(aboutImage.url)}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  {about.stats[0] && (
                    <div className="home-about-float absolute -bottom-6 right-4 rounded-2xl border border-white/30 bg-slate-950/85 px-6 py-4 text-white shadow-xl backdrop-blur-md sm:right-8">
                      <p className="text-3xl font-bold tabular-nums">{about.stats[0].value}</p>
                      <p className="text-sm text-white/75">{about.stats[0].label}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">
                  {text("home.about.eyebrow", "About us")}
                </p>
                <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{about.title}</h2>
                {about.subtitle && (
                  <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{about.subtitle}</p>
                )}
                <SimpleRichText
                  value={about.description}
                  className="mt-5 leading-8 text-slate-700 dark:text-slate-200"
                />

                {about.stats.length > 1 && (
                  <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {about.stats.slice(1, 4).map((stat, index) => (
                      <div
                        key={`${stat.label}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                      >
                        <dt className="order-2 mt-1 text-sm text-slate-600 dark:text-slate-300">{stat.label}</dt>
                        <dd className="text-2xl font-bold tabular-nums sm:text-3xl">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <Link
                  href="/about"
                  className="group mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-6 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  {text("home.about.link", "More about RK Transport")}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            TESTIMONIALS
        ========================================================= */}
        {testimonials.length > 0 && (
          <section
            id="reviews-wall"
            data-snap-section
            data-label="Reviews"
            className="snap-section relative isolate overflow-hidden bg-slate-950 text-white"
          >
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.22),transparent_60%)]" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <p className="text-sm font-bold uppercase tracking-[.2em] text-white/60">
                    {text("home.testimonials.eyebrow", "Customer feedback")}
                  </p>
                  <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                    {text("home.testimonials.heading", "Trusted to move what matters")}
                  </h2>
                </div>

                <div className="inline-flex items-center gap-4 self-start rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur lg:self-auto">
                  <span className="text-4xl font-bold tabular-nums">{averageRating}</span>
                  <div>
                    <p className="text-lg leading-none text-amber-400" aria-hidden="true">★★★★★</p>
                    <p className="mt-1 text-sm text-white/70">
                      from {testimonials.length} customer {testimonials.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 1: moves left */}
            <div className="tm-row mt-12">
              <div className="tm-track tm-left">
                <div className="tm-group">
                  {fillCards(testimonials).map((testimonial: Testimonial, index: number) => (
                    <TestimonialCard key={`a1-${testimonial.id}-${index}`} testimonial={testimonial} />
                  ))}
                </div>
                <div className="tm-group" aria-hidden="true">
                  {fillCards(testimonials).map((testimonial: Testimonial, index: number) => (
                    <TestimonialCard key={`a2-${testimonial.id}-${index}`} testimonial={testimonial} />
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: moves right */}
            <div className="tm-row mt-5">
              <div className="tm-track tm-right">
                <div className="tm-group">
                  {fillCards([...testimonials].reverse()).map((testimonial: Testimonial, index: number) => (
                    <TestimonialCard key={`b1-${testimonial.id}-${index}`} testimonial={testimonial} />
                  ))}
                </div>
                <div className="tm-group" aria-hidden="true">
                  {fillCards([...testimonials].reverse()).map((testimonial: Testimonial, index: number) => (
                    <TestimonialCard key={`b2-${testimonial.id}-${index}`} testimonial={testimonial} />
                  ))}
                </div>
              </div>
            </div>

            {/* Edge fades */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-slate-950 to-transparent sm:w-32" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-slate-950 to-transparent sm:w-32" />

            <div className="relative z-30 mt-12 text-center">
              <Link
                href="/contact"
                className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Share your experience
                <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        )}

        {/* =========================================================
            FAQ
        ========================================================= */}
        {visibleHomeFaqs.length > 0 && (
          <section
            id="faq"
            data-snap-section
            data-label="FAQ"
            className="snap-section relative mx-auto w-full max-w-4xl px-4 sm:px-6"
          >
            {/* Background Accent Glow */}
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="mb-8 text-center sm:mb-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-800/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-emerald-800 dark:border-emerald-400/20 dark:text-emerald-300">
                <span aria-hidden="true" className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {text("home.faqs.eyebrow", "Answers")}
              </span>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {text("home.faqs.heading", "Frequently asked questions")}
              </h2>
            </div>

            <div className="space-y-3.5">
              {visibleHomeFaqs.map((faq: Faq) => (
                <details
                  key={faq.id}
                  className="group rounded-2xl border border-slate-200/80 bg-white/80 p-1 backdrop-blur-md transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-slate-700 open:border-emerald-800/40 open:shadow-lg dark:open:border-emerald-500/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-4 font-semibold text-slate-900 transition-colors dark:text-white [&::-webkit-details-marker]:hidden">
                    <span className="text-base sm:text-lg">{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition-all duration-300 group-open:rotate-180 group-open:bg-emerald-900 group-open:text-white dark:bg-slate-800 dark:text-slate-400 dark:group-open:bg-emerald-600 dark:group-open:text-white"
                    >
                      <svg className="size-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-4 pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                    <p className="border-t border-slate-100 pt-3 dark:border-slate-800/60">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================
            REVIEWS
        ========================================================= */}
        <section
          id="review"
          data-snap-section
          data-label="Leave a review"
          className="snap-section bg-stone-100 px-4 dark:bg-slate-900/70 sm:px-6"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">
                {settings?.available_24_7 ? settings.hours_label : ""}
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {text("review.home.heading", "Leave a review")}
              </h2>

              <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">
                {text(
                  "review.home.subheading",
                  "Call or message us about car transport between Dubai and Abu Dhabi, and tell us how your trip went."
                )}
              </p>

              <div className="mt-5 space-y-2 text-sm text-slate-800 dark:text-slate-100">
                {settings?.phone_primary && (
                  <p>
                    <a className="font-semibold underline" href={`tel:${settings.phone_primary}`}>
                      {settings.phone_primary}
                    </a>
                  </p>
                )}

                {settings?.whatsapp && (
                  <p>
                    <a
                      className="font-semibold underline"
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                    >
                      WhatsApp RK Transport
                    </a>
                  </p>
                )}

                {settings?.email && (
                  <p>
                    <a className="font-semibold underline" href={`mailto:${settings.email}`}>
                      {settings.email}
                    </a>
                  </p>
                )}

                {settings?.address_line && <p>{settings.address_line}</p>}
              </div>
            </div>

            <ReviewForm />
          </div>
        </section>
      </main>

      {/* =========================================================
          SECTION SNAP STYLES
      ========================================================= */}
      <style>{`
        html { 
          scroll-snap-type: y mandatory; 
          scroll-behavior: smooth;
          overscroll-behavior-y: contain;
        }

        .snap-hero { 
          scroll-snap-align: start; 
          scroll-snap-stop: always;
          min-height: 100dvh;
        }

        .snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 5.5rem !important;
          padding-bottom: 4rem !important;
        }

        footer { 
          scroll-snap-align: start; 
          scroll-snap-stop: always;
        }

        @media (max-width: 767px) {
          .snap-section {
            min-height: 100dvh;
            padding-top: 4.5rem !important;
            padding-bottom: 4.5rem !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-snap-type: none; }
        }
      `}</style>

      {/* =========================================================
          TESTIMONIAL STYLES
      ========================================================= */}
      <style>{`
        .tm-row { position: relative; width: 100%; overflow: hidden; }
        .tm-track { display: flex; width: max-content; will-change: transform; }
        .tm-left { animation: tm-scroll 55s linear infinite; }
        .tm-right { animation: tm-scroll 65s linear infinite reverse; }
        .tm-row:hover .tm-track { animation-play-state: paused; }
        .tm-group { display: flex; flex-shrink: 0; gap: 20px; padding-right: 20px; }

        .tm-card {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 360px;
          min-width: 360px;
          padding: 28px;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
          transition: transform 350ms ease, border-color 350ms ease, box-shadow 350ms ease;
        }
        .tm-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 0%, rgba(255,255,255,0.18), transparent 55%);
          opacity: 0;
          transition: opacity 350ms ease;
          pointer-events: none;
        }
        .tm-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255, 255, 255, 0.35);
          box-shadow: 0 28px 60px rgba(0, 0, 0, 0.4);
        }
        .tm-card:hover::before { opacity: 1; }
        .tm-quote-mark {
          position: absolute;
          top: 6px;
          right: 22px;
          font-size: 110px;
          line-height: 1;
          font-family: Georgia, serif;
          color: rgba(255, 255, 255, 0.08);
          pointer-events: none;
          user-select: none;
        }

        @keyframes tm-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }

        @media (max-width: 900px) {
          .tm-card { width: 320px; min-width: 320px; }
          .tm-left { animation-duration: 45s; }
          .tm-right { animation-duration: 52s; }
        }
        @media (max-width: 640px) {
          .tm-card { width: 285px; min-width: 285px; padding: 22px; }
          .tm-group { gap: 14px; padding-right: 14px; }
          .tm-left { animation-duration: 38s; }
          .tm-right { animation-duration: 44s; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tm-left, .tm-right { animation: none; }
          .tm-row { overflow-x: auto; }
          .tm-group:last-child { display: none; }
        }
      `}</style>
    </>
  );
}

/* =========================================================
   TESTIMONIAL HELPERS
========================================================= */

function fillCards(items: Testimonial[]): Testimonial[] {
  if (items.length === 0) return items;
  const result: Testimonial[] = [];
  while (result.length < 8) result.push(...items);
  return result;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initial = testimonial.customer_name?.trim().charAt(0).toUpperCase() || "R";
  return (
    <figure className="tm-card">
      <span aria-hidden="true" className="tm-quote-mark">“</span>

      <p className="relative text-lg tracking-widest text-amber-400" aria-label={`${testimonial.rating} out of 5 stars`}>
        {"★".repeat(testimonial.rating)}
        <span className="text-white/20">{"★".repeat(Math.max(0, 5 - testimonial.rating))}</span>
      </p>

      <blockquote className="relative mt-4 flex-1 leading-7 text-white/90">
        {testimonial.quote}
      </blockquote>

      <figcaption className="relative mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
        {testimonial.image_url ? (
          <span className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20">
            <Image
              src={apiImageUrl(testimonial.image_url) || testimonial.image_url}
              alt={testimonial.image_alt || ""}
              fill
              unoptimized={!isImageOptimizable(testimonial.image_url)}
              sizes="48px"
              className="object-cover"
            />
          </span>
        ) : (
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-lg font-bold text-slate-950">
            {initial}
          </span>
        )}
        <span>
          <span className="block font-bold">{testimonial.customer_name}</span>
          {testimonial.vehicle_note && (
            <span className="block text-sm font-normal text-white/60">{testimonial.vehicle_note}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}