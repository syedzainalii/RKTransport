import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight, Car, Check, Clock3, Luggage, Mail, MapPin, MessageCircle, Navigation,
  Phone, Plus, ShieldCheck, Snowflake, Sparkles, UserCheck, Wallet,
} from "lucide-react";
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

/* =========================================================
   STATIC CONTENT
========================================================= */
const PACKAGES = [
  { name: "Single Passenger Seat", price: "AED 50", period: "one way", desc: "Ideal for daily commuters", popular: false, feats: ["Door-to-door pickup", "AC comfort", "Professional driver"] },
  { name: "Full Private Car", price: "AED 250", period: "one way", desc: "Exclusive ride for families and VIPs", popular: true, feats: ["100% private vehicle", "Custom timing", "Nonstop direct route"] },
  { name: "Monthly Commuter Pass", price: "AED 1,200", period: "per month", desc: "Best value for regular travel", popular: false, feats: ["Guaranteed seat", "Flexible slots", "Dedicated support"] },
];

const FLEET = [
  { title: "Sedan Comfort", desc: "Smooth, air-conditioned sedans perfect for individual travelers and couples.", seats: "4 passengers", chips: ["AC", "2 bags", "Wi-Fi ready"] },
  { title: "SUV Family & Group", desc: "Spacious SUVs with extra legroom and luggage space for comfortable journeys.", seats: "6-7 passengers", chips: ["AC", "5 bags", "Extra legroom"] },
  { title: "Executive Van", desc: "Premium vans designed for group travel and corporate commuters between cities.", seats: "9-12 passengers", chips: ["AC", "10 bags", "Group travel"] },
];

const CAR_FEATURES = [
  { title: "Sanitized Daily", desc: "Thoroughly cleaned and disinfected before every single trip.", icon: Sparkles },
  { title: "Climate Controlled", desc: "Powerful AC units optimized for UAE weather conditions.", icon: Snowflake },
  { title: "GPS Tracked", desc: "Real-time monitoring for maximum safety and punctual arrival.", icon: Navigation },
  { title: "Extra Luggage Room", desc: "Dedicated storage compartments for all your bags and belongings.", icon: Luggage },
];

const WHY_US = [
  { title: "Available 24/7", desc: "Day or night, our drivers and dispatch team are ready for your schedule.", icon: Clock3 },
  { title: "Fixed Transparent Rates", desc: "No hidden charges or surge pricing. You know your fare before you book.", icon: Wallet },
  { title: "Door-to-Door Service", desc: "We pick you up directly from your location and drop you right at your destination.", icon: MapPin },
];

const DUBAI_AREAS: string[] = ["JLT", "Dubai Marina", "Deira", "Bur Dubai", "Downtown"];
const ABU_DHABI_AREAS: string[] = ["Khalifa City", "Mussafah", "Yas Island", "Al Reem Island"];

const DRIVERS = [
  { name: "Verified & Licensed", desc: "All our drivers hold official UAE driving licenses with clean driving records." },
  { name: "Punctual & Courteous", desc: "Committed to timely pickups and respectful, helpful customer service." },
  { name: "Route Experts", desc: "Extensive knowledge of all highways and shortcuts between Dubai and Abu Dhabi." },
];

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
            1. HERO
        ========================================================= */}
        <div data-snap-section data-label="Home" className="snap-hero">
          <HeroSlideshow slides={slides} />
        </div>

        {/* =========================================================
            2. SERVICES
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
            3. PACKAGES (Slate Background bg-slate-950)
        ========================================================= */}
        <section
          id="packages"
          data-snap-section
          data-label="Packages"
          className="snap-section relative overflow-hidden bg-slate-950 px-4 text-white sm:px-6"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-xs font-bold uppercase tracking-[.2em] text-white/80 backdrop-blur">
                <span aria-hidden="true" className="size-2 rounded-full bg-amber-400" />
                {text("home.packages.eyebrow", "Transparent pricing")}
              </p>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl text-white">
                {text("home.packages.heading", "Choose your travel package")}
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                {text("home.packages.subheading", "Affordable rates for individual seats or private rides between Dubai and Abu Dhabi.")}
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3 md:items-center">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`relative flex flex-col rounded-3xl p-8 transition duration-300 hover:-translate-y-1 ${
                    pkg.popular
                      ? "bg-white text-slate-950 shadow-2xl shadow-slate-900/30 md:scale-105 md:py-12"
                      : "border border-white/10 bg-white/5 shadow-xl backdrop-blur"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-950">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{pkg.name}</h3>
                  <p className={`mt-1 text-sm ${pkg.popular ? "text-slate-600" : "text-slate-300"}`}>{pkg.desc}</p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tabular-nums tracking-tight">{pkg.price}</span>
                    <span className={`text-sm ${pkg.popular ? "text-slate-500" : "text-slate-400"}`}>{pkg.period}</span>
                  </div>
                  <ul className={`mt-7 space-y-3 border-t pt-6 ${pkg.popular ? "border-slate-200" : "border-white/10"}`}>
                    {pkg.feats.map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-sm">
                        <span className={`grid size-5 shrink-0 place-items-center rounded-full ${pkg.popular ? "bg-slate-950 text-white" : "bg-amber-400 text-slate-950"}`}>
                          <Check aria-hidden="true" className="size-3" />
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`group mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full font-semibold transition ${
                      pkg.popular
                        ? "bg-slate-950 text-white hover:bg-slate-800"
                        : "bg-white text-slate-950 hover:bg-slate-200"
                    }`}
                  >
                    Book package
                    <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            4. CARS
        ========================================================= */}
        <section
          id="cars"
          data-snap-section
          data-label="Vehicles"
          className="snap-section bg-white px-4 dark:bg-slate-950 sm:px-6"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">
                  {text("home.cars.eyebrow", "Our fleet")}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  {text("home.cars.heading", "Travel in comfort and safety")}
                </h2>
              </div>
              <Link href="/cars" className="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline">
                View all cars
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {FLEET.map((car, index) => (
                <Link
                  key={car.title}
                  href="/cars"
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-stone-50 p-7 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900"
                >
                  <Car aria-hidden="true" className="pointer-events-none absolute -right-6 -top-4 size-40 text-slate-900/[0.04] transition-transform duration-500 group-hover:-translate-x-2 group-hover:rotate-[-6deg] dark:text-white/[0.05]" />
                  <div className="relative flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Car aria-hidden="true" className="size-6" />
                    </span>
                    <span className="text-sm font-bold tabular-nums text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="relative mt-6 text-2xl font-bold tracking-tight">{car.title}</h3>
                  <p className="relative mt-2 flex-1 leading-7 text-slate-600 dark:text-slate-300">{car.desc}</p>
                  <ul className="relative mt-5 flex flex-wrap gap-2">
                    {car.chips.map((chip) => (
                      <li key={chip} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                        {chip}
                      </li>
                    ))}
                  </ul>
                  <div className="relative mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-500">{car.seats}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold transition-all group-hover:gap-2">
                      Explore <ArrowUpRight aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-amber-400 transition-transform duration-500 group-hover:scale-x-100" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            5. CAR FEATURES (Slate Background bg-slate-950)
        ========================================================= */}
        <section
          id="cars-special"
          data-snap-section
          data-label="Car features"
          className="snap-section relative isolate overflow-hidden bg-slate-950 px-4 text-white sm:px-6"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
          <div aria-hidden="true" className="absolute -left-32 top-1/4 -z-10 size-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-white/60">
                {text("home.carfeatures.eyebrow", "Unmatched quality")}
              </p>
              <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                {text("home.carfeatures.heading", "What makes our cars special for travel")}
              </h2>
              <p className="mt-5 max-w-md leading-7 text-white/70">
                {text("home.carfeatures.subheading", "Every vehicle in our fleet is meticulously maintained for long-distance city-to-city trips.")}
              </p>
              <Link href="/cars" className="group mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200">
                See the fleet
                <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {CAR_FEATURES.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur transition duration-300 hover:border-white/30 hover:bg-white/10 ${index % 2 === 1 ? "sm:translate-y-6" : ""}`}
                  >
                    <div aria-hidden="true" className="absolute -right-10 -top-10 size-40 rounded-full bg-amber-400/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="relative grid size-14 place-items-center rounded-2xl bg-amber-400 text-slate-950 transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon aria-hidden="true" className="size-7" />
                    </span>
                    <h3 className="relative mt-5 text-xl font-bold">{feat.title}</h3>
                    <p className="relative mt-2 text-sm leading-6 text-white/70">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            6. ABOUT US
        ========================================================= */}
        {about && (
          <section
            id="about"
            data-snap-section
            data-label="About us"
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
            7. WHY CHOOSE US (Slate Background bg-slate-950)
        ========================================================= */}
        <section
          id="why-choose-us"
          data-snap-section
          data-label="Why choose us"
          className="snap-section bg-slate-950 text-white px-4 sm:px-6"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-white/60">
                {text("home.why.eyebrow", "The RK advantage")}
              </p>
              <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl text-white">
                {text("home.why.heading", "Why choose us for your journey")}
              </h2>
              <p className="mt-5 max-w-md leading-7 text-slate-300">
                {text("home.why.subheading", "We make traveling between Dubai and Abu Dhabi effortless and dependable.")}
              </p>
            </div>

            <ul className="divide-y divide-white/10 border-y border-white/10">
              {WHY_US.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="group flex items-start gap-5 py-8 sm:gap-8">
                    <span className="w-14 shrink-0 text-5xl font-black tabular-nums text-white/20 transition-colors duration-300 group-hover:text-amber-400 sm:w-20 sm:text-6xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 transition-transform duration-300 group-hover:translate-x-2">
                      <h3 className="text-xl font-bold tracking-tight sm:text-2xl text-white">{item.title}</h3>
                      <p className="mt-2 max-w-lg leading-7 text-slate-300">{item.desc}</p>
                    </div>
                    <span className="hidden size-12 shrink-0 place-items-center rounded-full border border-white/20 transition duration-300 group-hover:bg-white group-hover:text-slate-950 sm:grid">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* =========================================================
            8. ROUTES WE COVER
        ========================================================= */}
        <section
          id="routes"
          data-snap-section
          data-label="Location"
          className="snap-section bg-stone-100 px-4 dark:bg-slate-900/70 sm:px-6"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">Coverage areas</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Routes we cover</h2>
              </div>
              <Link href="/routes" className="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline">
                View all pickup & drop points
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-amber-500">Dubai</p>
                  <h3 className="mt-2 text-2xl font-bold">Pickup Neighborhoods</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">We pick you up directly from your doorstep across Dubai.</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {DUBAI_AREAS.map((area) => (
                      <li key={area} className="rounded-xl border border-slate-200 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/routes" className="text-sm font-bold hover:underline">See all 14+ Dubai pickup points →</Link>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-amber-500">Abu Dhabi</p>
                  <h3 className="mt-2 text-2xl font-bold">Drop-off Zones</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Reliable drop-offs across major Abu Dhabi districts.</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {ABU_DHABI_AREAS.map((area) => (
                      <li key={area} className="rounded-xl border border-slate-200 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/routes" className="text-sm font-bold hover:underline">See all 10+ Abu Dhabi drop points →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            9. TESTIMONIALS (Fixed Image Scroll)
        ========================================================= */}
        {testimonials.length > 0 && (
          <section
            id="reviews-wall"
            data-snap-section
            data-label="Reviews Wall"
            className="snap-section relative isolate overflow-hidden bg-slate-950 text-white [clip-path:inset(0)]"
          >
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
            10. OUR DRIVERS
        ========================================================= */}
        <section
          id="drivers"
          data-snap-section
          data-label="Drivers"
          className="snap-section bg-white px-4 dark:bg-slate-950 sm:px-6"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">Professional team</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Meet our expert drivers</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">Licensed, experienced, and dedicated to your safe arrival.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {DRIVERS.map((d) => (
                <div key={d.name} className="rounded-3xl border border-slate-200 bg-stone-50 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <UserCheck className="size-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{d.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            11. FAQ (Slate Background bg-slate-950)
        ========================================================= */}
        {visibleHomeFaqs.length > 0 && (
          <section
            id="faq"
            data-snap-section
            data-label="FAQ"
            className="snap-section relative bg-slate-950 text-white px-4 sm:px-6"
          >
            <style>{`
              details[open] .faq-answer { animation: faq-open .35s ease; }
              @keyframes faq-open { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
              @media (prefers-reduced-motion: reduce) { details[open] .faq-answer { animation: none; } }
            `}</style>
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/3 -z-10 size-80 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[380px_1fr] lg:gap-16">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-white/60">
                  {text("home.faqs.eyebrow", "Answers")}
                </p>
                <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl text-white">
                  {text("home.faqs.heading", "Frequently asked questions")}
                </h2>
                <p className="mt-4 leading-7 text-slate-300">
                  Quick answers about booking, pricing and your car&apos;s journey between Dubai and Abu Dhabi.
                </p>
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-xl">
                  <p className="text-lg font-bold text-white">Still have questions?</p>
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
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        <Phone aria-hidden="true" className="size-4" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {visibleHomeFaqs.map((faq: Faq, index: number) => (
                  <details
                    key={faq.id}
                    className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all duration-300 hover:border-white/30 hover:shadow-lg open:border-white/60 open:bg-white/10"
                  >
                    <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                      <span className="text-sm font-bold tabular-nums text-white/50 transition-colors group-open:text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-base font-semibold sm:text-lg text-white">{faq.question}</span>
                      <span
                        aria-hidden="true"
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-all duration-300 group-open:rotate-45 group-open:bg-white group-open:text-slate-950"
                      >
                        <Plus className="size-4" />
                      </span>
                    </summary>
                    <div className="faq-answer px-5 pb-5 sm:pl-[4.25rem]">
                      <p className="leading-7 text-slate-300">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            12. REVIEW
        ========================================================= */}
        <section
          id="review"
          data-snap-section
          data-label="Review"
          className="snap-section bg-stone-100 px-4 dark:bg-slate-900/70 sm:px-6"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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
            <ReviewForm />
          </div>
        </section>
      </main>

      {/* SECTION SNAP STYLES & MOBILE SCROLL FIX */}
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
          html {
            scroll-snap-type: none; /* Disable rigid snapping on mobile for smooth, natural touch scrolling */
          }
          .snap-hero,
          .snap-section {
            scroll-snap-align: none;
            min-height: auto;
            padding-top: 5rem !important;
            padding-bottom: 4rem !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-snap-type: none; }
        }
      `}</style>

      {/* TESTIMONIAL STYLES */}
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