import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Plus } from "lucide-react";
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

function fillCards(testimonials: Testimonial[]) {
  if (testimonials.length === 0) return [];
  let list = [...testimonials];
  while (list.length < 6) {
    list = [...list, ...testimonials];
  }
  return list;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="tm-card">
      <span className="tm-quote-mark">&ldquo;</span>
      <div className="flex items-center gap-1 text-amber-400" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>{i < testimonial.rating ? "★" : "☆"}</span>
        ))}
      </div>
      <p className="mt-4 flex-1 text-sm leading-7 text-white/90">{testimonial.quote}</p>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="font-semibold">{testimonial.customer_name}</p>
          {testimonial.vehicle_note && (
            <p className="text-xs text-white/60">{testimonial.vehicle_note}</p>
          )}
        </div>
      </div>
    </div>
  );
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

  const bannerUrl =
    copy.find((item: PageCopy) => item.key === "testimonials_banner_url")?.value ||
    (
      (testimonials.find((item) => Boolean((item as Testimonial & { banner_image_url?: string | null }).banner_image_url)) as (Testimonial & { banner_image_url?: string | null }) | undefined)?.banner_image_url ??
      (testimonials[0] as (Testimonial & { banner_image_url?: string | null }) | undefined)?.banner_image_url
    );

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
            className="snap-section relative isolate overflow-hidden bg-slate-950 text-white [clip-path:inset(0)]"
          >
            {/* Fixed photo: stays still while the section scrolls over it */}
            {typeof bannerUrl === "string" && bannerUrl && (
              <div aria-hidden="true" className="fixed inset-0 -z-20">
                <Image
                  src={apiImageUrl(bannerUrl) || bannerUrl}
                  alt=""
                  fill
                  unoptimized={!isImageOptimizable(bannerUrl)}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            )}

            {/* Dark overlay so the text stays readable (scrolls with the section) */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-slate-950/80" />
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
            className="snap-section relative px-4 sm:px-6"
          >
            <style>{`
              details[open] .faq-answer { animation: faq-open .35s ease; }
              @keyframes faq-open { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
              @media (prefers-reduced-motion: reduce) { details[open] .faq-answer { animation: none; } }
            `}</style>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 top-1/3 -z-10 size-80 rounded-full bg-slate-300/40 blur-3xl dark:bg-slate-700/30"
            />
            <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[380px_1fr] lg:gap-16">
              {/* Left: heading and help card */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">
                  {text("home.faqs.eyebrow", "Answers")}
                </p>
                <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                  {text("home.faqs.heading", "Frequently asked questions")}
                </h2>
                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                  Quick answers about booking, pricing and your car&apos;s journey between Dubai and Abu Dhabi.
                </p>
                <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/20">
                  <p className="text-lg font-bold">Still have questions?</p>
                  <p className="mt-1 text-sm text-white/70">We reply fast, day or night.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, "") || "971561379697"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                    >
                      <MessageCircle aria-hidden="true" className="size-4" />
                      WhatsApp
                    </a>
                    {settings?.phone_primary && (
                      <a
                        href={`tel:${settings.phone_primary}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-semibold transition hover:bg-white/10"
                      >
                        <Phone aria-hidden="true" className="size-4" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {/* Right: accordion */}
              <div className="space-y-3">
                {visibleHomeFaqs.map((faq: Faq, index: number) => (
                  <details
                    key={faq.id}
                    className="group rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 open:border-slate-900 open:shadow-xl open:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:open:border-white/60"
                  >
                    <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                      <span className="text-sm font-bold tabular-nums text-slate-400 transition-colors group-open:text-slate-900 dark:group-open:text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-base font-semibold sm:text-lg">{faq.question}</span>
                      <span
                        aria-hidden="true"
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 group-open:rotate-45 group-open:bg-slate-950 group-open:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-open:bg-white dark:group-open:text-slate-950"
                      >
                        <Plus className="size-4" />
                      </span>
                    </summary>
                    <div className="faq-answer px-5 pb-5 sm:pl-[4.25rem]">
                      <p className="leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
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
          <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left: dark contact panel */}
            <div className="relative isolate flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
              <div aria-hidden="true" className="absolute -right-20 -top-20 -z-10 size-72 rounded-full bg-white/10 blur-3xl" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
              <div>
                {settings?.available_24_7 && (
                  <p className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold backdrop-blur">
                    <span aria-hidden="true" className="size-2 rounded-full bg-amber-400" />
                    {settings.hours_label}
                  </p>
                )}
                <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                  {text("review.home.heading", "How was your trip?")}
                </h2>
                <p className="mt-4 max-w-md leading-7 text-white/75">
                  {text(
                    "review.home.subheading",
                    "Your feedback helps other drivers choose RK Transport and helps us keep improving. It only takes a minute."
                  )}
                </p>
              </div>
              <ul className="mt-10 space-y-3">
                {settings?.phone_primary && (
                  <li>
                    <a href={`tel:${settings.phone_primary}`} className="group flex min-h-14 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 transition hover:bg-white/10">
                      <span className="grid size-10 place-items-center rounded-full bg-white text-slate-950"><Phone aria-hidden="true" className="size-4" /></span>
                      <span className="flex-1 font-semibold">{settings.phone_primary}</span>
                      <ArrowUpRight aria-hidden="true" className="size-4 text-white/50 transition group-hover:text-white" />
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href={`https://wa.me/${settings?.whatsapp?.replace(/\D/g, "") || "971561379697"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-14 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 transition hover:bg-white/10"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-white text-slate-950"><MessageCircle aria-hidden="true" className="size-4" /></span>
                    <span className="flex-1 font-semibold">Chat on WhatsApp</span>
                    <ArrowUpRight aria-hidden="true" className="size-4 text-white/50 transition group-hover:text-white" />
                  </a>
                </li>
                {settings?.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="group flex min-h-14 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 transition hover:bg-white/10">
                      <span className="grid size-10 place-items-center rounded-full bg-white text-slate-950"><Mail aria-hidden="true" className="size-4" /></span>
                      <span className="flex-1 break-all font-semibold">{settings.email}</span>
                      <ArrowUpRight aria-hidden="true" className="size-4 text-white/50 transition group-hover:text-white" />
                    </a>
                  </li>
                )}
                {settings?.address_line && (
                  <li className="flex items-center gap-4 px-4 py-2 text-white/75">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20"><MapPin aria-hidden="true" className="size-4" /></span>
                    <span>{settings.address_line}</span>
                  </li>
                )}
              </ul>
            </div>
            {/* Right: the form */}
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
          .tm-left { animation-duration: 40s; }
          .tm-right { animation-duration: 45s; }
        }
      `}</style>
    </>
  );
}