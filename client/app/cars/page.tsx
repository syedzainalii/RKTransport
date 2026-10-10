import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ShieldCheck, Users, Luggage, Fuel, Sparkles, MessageCircle, Phone, Route } from "lucide-react";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import PageHero from "../Components/page-hero";
import { generatePageMetadata } from "../../lib/seo";
import { publicApi, type PageCopy, type Vehicle } from "../../lib/transport-api";

export const revalidate = 60;

const WHATSAPP_NUMBER = "971561379697";
const PHONE_NUMBER = "+971561379697";

export function generateMetadata() {
  return generatePageMetadata("/cars", {
    title: "Our Fleet & Transport Vehicles | RK Transport Dubai to Abu Dhabi",
    description: "Explore our fleet of luxury sedans, family SUVs, and executive vans for comfortable travel between Dubai and Abu Dhabi.",
  });
}

const FLEET = [
  {
    id: "sedan",
    title: "Executive Sedan",
    category: "Standard & Comfort Commute",
    passengers: "1 - 4 Passengers",
    luggage: "2 Large Bags",
    tagline: "Sleek, quiet, and fuel-efficient for individual commuters and couples.",
    features: [
      "Dual-zone climate control AC",
      "Leather seating comfort",
      "USB fast charging ports",
      "High-speed intercity capability",
    ],
    popular: false,
  },
  {
    id: "suv",
    title: "Luxury Family SUV",
    category: "Family & Group Travel",
    passengers: "Up to 7 Passengers",
    luggage: "4 Large Bags",
    tagline: "Extra legroom, elevated road vision, and premium luxury for full family trips.",
    features: [
      "Plush spacious 3-row seating",
      "Rear air conditioning vents",
      "Tinted UV-protection windows",
      "Smooth air-ride suspension",
    ],
    popular: true,
  },
  {
    id: "van",
    title: "Executive Commuter Van",
    category: "Group & Business Transportation",
    passengers: "Up to 12 Passengers",
    luggage: "8+ Large Bags",
    tagline: "Spacious intercity minibus tailored for corporate teams and big group daily commutes.",
    features: [
      "High-roof standing headroom",
      "Reclining passenger seats",
      "Dedicated high-capacity luggage compartment",
      "Individual overhead reading lights",
    ],
    popular: false,
  },
];

const SPECIAL_FEATURES = [
  {
    icon: Sparkles,
    title: "Sanitized Before Every Ride",
    description: "Every car undergoes strict interior deep cleaning and anti-bacterial sanitization after every single route.",
  },
  {
    icon: ShieldCheck,
    title: "Full RTA Safety Compliance",
    description: "All vehicles undergo regular mechanical safety inspections and are licensed specifically for intercity transport.",
  },
  {
    icon: Fuel,
    title: "All-Inclusive Pricing",
    description: "Fuel, Salik tolls, and highway fees are 100% included in every quote with zero surprise surcharges.",
  },
];

export default async function CarsPage() {
  const [settingsResult, carsResult, copyResult] = await Promise.allSettled([
    publicApi.settings(),
    publicApi.cars(),
    publicApi.pageCopy(),
  ]);
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const cars: Vehicle[] = carsResult.status === "fulfilled" ? carsResult.value : [];
  const copy: PageCopy[] = copyResult.status === "fulfilled" ? copyResult.value : [];
  const bannerUrl =
    copy.find((item) => item.key === "cars_banner_url")?.value ||
    cars.find((car) => car.banner_image_url)?.banner_image_url;

  const phone = settings?.phone_primary || PHONE_NUMBER;
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "") || WHATSAPP_NUMBER;
  const hours = settings?.available_24_7 ? settings.hours_label : "";

  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Our Fleet", path: "/cars" }]} />

      <PageHero
        crumb="Our Fleet"
        title="Our Transport Fleet"
        subtitle="From sleek luxury sedans for daily commute to spacious SUVs and high-capacity executive vans, we maintain a top-tier fleet for travel between Dubai and Abu Dhabi."
        imageUrl={bannerUrl}
        hours={hours}
        highlights={[
          { icon: <Route aria-hidden="true" className="size-5" />, label: "Route", value: settings?.core_route_label || "Dubai ⇄ Abu Dhabi" },
          { icon: <Phone aria-hidden="true" className="size-5" />, label: "Call us", value: phone },
          { icon: <MessageCircle aria-hidden="true" className="size-5" />, label: "Fleet enquiries", value: "WhatsApp available" },
        ]}
      >
        <a
          href={`https://wa.me/${whatsappDigits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Ask about the fleet
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
        </a>
        <Link href="/routes" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 font-semibold backdrop-blur-md transition hover:bg-white/20">
          View our routes
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </PageHero>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        {/* Fleet Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {FLEET.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                vehicle.popular
                  ? "border-amber-500/40 bg-slate-950 text-white shadow-xl dark:border-amber-400/50"
                  : "border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              }`}
            >
              {vehicle.popular && (
                <span className="absolute -top-3.5 right-6 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-950">
                  Most Requested
                </span>
              )}

              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${vehicle.popular ? "text-amber-400" : "text-slate-500 dark:text-slate-400"}`}>
                  {vehicle.category}
                </p>
                <h2 className="mt-2 text-2xl font-bold">{vehicle.title}</h2>
                <p className={`mt-2 text-sm leading-6 ${vehicle.popular ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}>
                  {vehicle.tagline}
                </p>

                {/* Specs */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${vehicle.popular ? "bg-white/10 text-white" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"}`}>
                    <Users className="size-3.5" /> {vehicle.passengers}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${vehicle.popular ? "bg-white/10 text-white" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"}`}>
                    <Luggage className="size-3.5" /> {vehicle.luggage}
                  </span>
                </div>

                {/* Features List */}
                <ul className={`mt-8 space-y-3 border-t pt-6 ${vehicle.popular ? "border-white/10" : "border-slate-100 dark:border-slate-800"}`}>
                  {vehicle.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm">
                      <span className={`grid size-5 shrink-0 place-items-center rounded-full ${vehicle.popular ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"}`}>
                        <Check className="size-3.5" />
                      </span>
                      <span className={vehicle.popular ? "text-slate-200" : "text-slate-700 dark:text-slate-200"}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/${whatsappDigits}?text=Hello%20RK%20Transport,%20I%20want%20to%20book%20the%20${encodeURIComponent(vehicle.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full font-semibold transition ${
                    vehicle.popular
                      ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                      : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  }`}
                >
                  <MessageCircle className="size-4" /> Book This Vehicle
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* =========================================================
            WHAT MAKES OUR CARS SPECIAL (Dark Navy Section)
        ========================================================= */}
        <section className="mt-20 rounded-3xl bg-slate-900 p-8 text-white shadow-2xl sm:p-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-white/60">Fleet Standards</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">What Makes Our Vehicles Special</h2>
            <p className="mt-3 text-slate-300">
              We focus strictly on comfort, cleanliness, and long-distance safety so your commute between Dubai and Abu Dhabi feels effortless.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {SPECIAL_FEATURES.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <item.icon className="size-8 text-amber-400" />
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Contact Banner */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-stone-100 p-8 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row">
          <div>
            <h3 className="text-xl font-bold">Need a custom vehicle or large fleet arrangement?</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Speak directly with our dispatch manager on phone or WhatsApp 24/7.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${phone}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <Phone className="size-4" /> Call {phone}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}