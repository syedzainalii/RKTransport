import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, ShieldCheck, Users, Luggage, Fuel, MessageCircle, Phone, Sparkles } from "lucide-react";
import { BreadcrumbStructuredData } from "../../Components/structured-data";
import { generatePageMetadata } from "../../../lib/seo";
import { publicApi } from "../../../lib/transport-api";

export const revalidate = 60;

const WHATSAPP_NUMBER = "971561379697";
const PHONE_NUMBER = "+971561379697";

const VEHICLES_DATA: Record<string, {
  title: string;
  category: string;
  passengers: string;
  luggage: string;
  tagline: string;
  description: string;
  priceNote: string;
  features: string[];
  popular: boolean;
}> = {
  sedan: {
    title: "Executive Sedan",
    category: "Standard & Comfort Commute",
    passengers: "1 - 4 Passengers",
    luggage: "2 Large Bags",
    tagline: "Sleek, quiet, and fuel-efficient for individual commuters and couples.",
    description: "Our executive sedans offer a smooth and private ride between Dubai and Abu Dhabi. Perfect for professionals, daily commuters, or solo travelers looking for reliable door-to-door transit with climate control and maximum comfort.",
    priceNote: "Starting from competitive intercity rates",
    features: [
      "Dual-zone climate control AC",
      "Leather seating comfort",
      "USB fast charging ports",
      "High-speed intercity highway capability",
      "Sanitized interior before every trip",
    ],
    popular: false,
  },
  suv: {
    title: "Luxury Family SUV",
    category: "Family & Group Travel",
    passengers: "Up to 7 Passengers",
    luggage: "4 Large Bags",
    tagline: "Extra legroom, elevated road vision, and premium luxury for full family trips.",
    description: "Travel with your family or group in absolute spaciousness. Our SUVs provide generous headroom, luggage capacity, and a smooth suspension that glides across Sheikh Zayed Road between Dubai and Abu Dhabi.",
    priceNote: "Best value for families and small groups",
    features: [
      "Plush spacious 3-row seating",
      "Rear air conditioning vents and climate control",
      "Tinted UV-protection windows for privacy",
      "Smooth air-ride long-distance suspension",
      "Ample luggage storage for multiple suitcases",
    ],
    popular: true,
  },
  van: {
    title: "Executive Commuter Van",
    category: "Group & Business Transportation",
    passengers: "Up to 12 Passengers",
    luggage: "8+ Large Bags",
    tagline: "Spacious intercity minibus tailored for corporate teams and big group daily commutes.",
    description: "Designed for corporate teams, work crews, or large family groups traveling together. Our executive vans combine high-capacity seating with extensive baggage room so everyone travels together seamlessly.",
    priceNote: "Economical per-passenger group rates",
    features: [
      "High-roof standing headroom cabin",
      "Ergonomic reclining passenger seats",
      "Dedicated high-capacity rear luggage compartment",
      "Individual overhead reading lights & AC controls",
      "Professional experienced intercity driver",
    ],
    popular: false,
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = VEHICLES_DATA[slug];
  if (!vehicle) {
    return generatePageMetadata(`/cars/${slug}`, {
      title: "Vehicle Not Found | RK Transport",
      description: "The requested vehicle details could not be found.",
    });
  }
  return generatePageMetadata(`/cars/${slug}`, {
    title: `${vehicle.title} | Car Transport Dubai to Abu Dhabi`,
    description: vehicle.tagline,
  });
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = VEHICLES_DATA[slug];

  if (!vehicle) {
    notFound();
  }

  const settingsResult = await Promise.resolve(publicApi.settings()).catch(() => null);
  const settings = settingsResult;

  const phone = settings?.phone_primary || PHONE_NUMBER;
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "") || WHATSAPP_NUMBER;
  const bookingUrl = `https://wa.me/${whatsappDigits}?text=Hello%20RK%20Transport,%20I%20would%20like%20to%20book%20the%20${encodeURIComponent(vehicle.title)}`;

  return (
    <>
      <BreadcrumbStructuredData items={[
        { name: "Home", path: "/" },
        { name: "Our Fleet", path: "/cars" },
        { name: vehicle.title, path: `/cars/${slug}` }
      ]} />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to Fleet
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Left Column: Vehicle Details */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-stone-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {vehicle.category}
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{vehicle.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{vehicle.description}</p>

            {/* Specs Badges */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Users className="size-5 text-amber-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Capacity</p>
                  <p className="font-bold">{vehicle.passengers}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Luggage className="size-5 text-amber-500" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Luggage Space</p>
                  <p className="font-bold">{vehicle.luggage}</p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-10">
              <h2 className="text-xl font-bold">Vehicle Specifications & Features</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {vehicle.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-stone-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <Check className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Booking Card (Dark Sidebar) */}
          <div className="sticky top-28 rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-400">Instant Reservation</p>
            <h2 className="mt-2 text-2xl font-bold">Book {vehicle.title}</h2>
            <p className="mt-2 text-sm text-slate-300">
              {vehicle.priceNote}. Contact us directly via WhatsApp or phone for immediate dispatch or scheduling.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-400 font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                <MessageCircle className="size-4" /> Book via WhatsApp
              </a>

              <a
                href={`tel:${phone}`}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 font-semibold text-white transition hover:bg-white/10"
              >
                <Phone className="size-4" /> Call {phone}
              </a>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <ShieldCheck className="size-5 shrink-0 text-amber-400" />
                <span>Includes fuel, Salik toll gates, and professional licensed driver.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}