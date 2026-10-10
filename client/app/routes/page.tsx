import { MapPin, MessageCircle, Phone, Route } from "lucide-react";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import PageHero from "../Components/page-hero";
import { generatePageMetadata } from "../../lib/seo";
import { publicApi, type Location, type PageCopy } from "../../lib/transport-api";

export const revalidate = 60;

const WHATSAPP_NUMBER = "971561379697";
const PHONE_NUMBER = "+971561379697";

const DUBAI_PICKUPS = [
  "Bur Dubai",
  "Deira",
  "Al Quoz",
  "Jebel Ali",
  "Discovery Gardens",
  "International City",
  "Al Barsha",
  "JLT",
  "Dubai Marina",
  "Karama",
  "Satwa",
  "Al Nahda",
  "Silicon Oasis",
  "Al Qusais",
];

const ABU_DHABI_DROPS = [
  "Khalidiyah",
  "Mussafah",
  "City Center",
  "Yas Island",
  "Khalifa City",
  "MBZ City",
  "Al Reem Island",
  "Electra Street",
  "Hamdan Street",
  "Tourist Club Area",
];

export function generateMetadata() {
  return generatePageMetadata("/routes", {
    title: "Dubai to Abu Dhabi Routes & Pickup Points | RK Transport",
    description: "Explore our daily car lift and transport routes covering all major neighborhoods across Dubai and Abu Dhabi.",
  });
}

export default async function RoutesPage() {
  const [settingsResult, locationsResult, copyResult] = await Promise.allSettled([
    publicApi.settings(),
    publicApi.locations(),
    publicApi.pageCopy(),
  ]);
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const locations: Location[] = locationsResult.status === "fulfilled" ? locationsResult.value : [];
  const copy: PageCopy[] = copyResult.status === "fulfilled" ? copyResult.value : [];

  const phone = settings?.phone_primary || PHONE_NUMBER;
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "") || WHATSAPP_NUMBER;
  const routeLabel = settings?.core_route_label || "Dubai ⇄ Abu Dhabi";
  const bannerUrl =
    copy.find((item) => item.key === "locations_banner_url")?.value ||
    locations.find((location) => location.banner_image_url)?.banner_image_url;
  const hours = settings?.available_24_7 ? settings.hours_label : "";

  return (
    <>
      <BreadcrumbStructuredData items={[
        { name: "Home", path: "/" },
        { name: "Routes & Coverage", path: "/routes" }
      ]} />

      <PageHero
        crumb="Routes & Coverage"
        title="Intercity Routes & Coverage Areas"
        subtitle={`We provide reliable, door-to-door car transport and daily car lift services across the core corridor between ${routeLabel}.`}
        imageUrl={bannerUrl}
        hours={hours}
        highlights={[
          { icon: <Route aria-hidden="true" className="size-5" />, label: "Core corridor", value: routeLabel },
          { icon: <Phone aria-hidden="true" className="size-5" />, label: "Call dispatch", value: phone },
          { icon: <MapPin aria-hidden="true" className="size-5" />, label: "Coverage", value: "Dubai & Abu Dhabi" },
        ]}
      >
        <a
          href={`https://wa.me/${whatsappDigits}?text=Hello%20RK%20Transport,%20I%20would%20like%20to%20ask%20about%20your%20routes.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          Ask about a route
        </a>
      </PageHero>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        {/* Main Route Highlight Card */}
        <div className="mt-12 rounded-3xl bg-slate-950 p-8 text-white shadow-2xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/2ng bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
                <Route className="size-4 text-amber-400" /> Primary Service Corridor
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{routeLabel}</h2>
              <p className="mt-4 leading-7 text-slate-300">
                Operating 24 hours a day, 7 days a week. Whether you are commuting for work, business meetings, or family visits, our drivers take the fastest, safest highway routes to get you there on time.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={`https://wa.me/${whatsappDigits}?text=Hello%20RK%20Transport,%20I%20would%20like%20to%20book%20a%20ride%20between%20Dubai%20and%20Abu%20Dhabi.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-400 px-6 font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  <MessageCircle className="size-4" /> Book This Route
                </a>
                <a
                  href={`tel:${phone}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 font-semibold text-white transition hover:bg-white/10"
                >
                  <Phone className="size-4" /> Call Dispatch
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-3xl font-extrabold text-amber-400">14+</p>
                <p className="mt-2 text-sm font-medium text-slate-200">Dubai Pickup Neighborhoods</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-3xl font-extrabold text-amber-400">10+</p>
                <p className="mt-2 text-sm font-medium text-slate-200">Abu Dhabi Drop-off Zones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup & Drop Points Grid (Matching the theme reference) */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Dubai Pickup Points */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-red-500">📍</span> Dubai Pickup Points
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              We pick you up directly from your doorstep or preferred building across these Dubai locations:
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {DUBAI_PICKUPS.map((point) => (
                <span
                  key={point}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          {/* Abu Dhabi Drop Points */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-red-500">📍</span> Abu Dhabi Drop Points
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              We drop you safely right at your exact destination or office across these Abu Dhabi areas:
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {ABU_DHABI_DROPS.map((point) => (
                <span
                  key={point}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 rounded-3xl border border-slate-200 bg-stone-100 p-8 text-center dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="text-2xl font-bold">Don&apos;t see your specific pickup or drop-off area?</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Whether you travel from JLT to Abu Dhabi, Deira to Mussafah, or Discovery Gardens to Khalifa City — RK Transport covers custom routes every single day.
          </p>
          <div className="mt-6">
            <a
              href={`https://wa.me/${whatsappDigits}?text=Hello%20RK%20Transport,%20I%20have%20a%20custom%20pickup%20or%20drop-off%20location.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-8 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <MessageCircle className="size-4" /> Inquire About Your Location
            </a>
          </div>
        </div>
      </main>
    </>
  );
}