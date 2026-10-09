import Image from "next/image";
import Link from "next/link";
import CountUpStat from "../Components/count-up-stat";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import SimpleRichText from "../Components/simple-rich-text";
import {
  ArrowRight, Award, CarFront, CircleCheck, Clock3, Eye, Gauge, Headset, Heart,
  MapPin, MessageCircle, Phone, ShieldCheck, Star, Target, Truck, Wrench, type LucideIcon,
} from "lucide-react";
import { apiImageUrl, isImageOptimizable, publicApi } from "../../lib/transport-api";
import { generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

const reasonIcons: Record<string, LucideIcon> = {
  Truck, Shield: ShieldCheck, Clock: Clock3, Location: MapPin, Care: Heart, Award,
  Trusted: CircleCheck, Support: Headset, Performance: Gauge, "Top rated": Star, Repair: Wrench, Car: CarFront,
};

export function generateMetadata() {
  return generatePageMetadata("/about", {
    title: "About RK Transport | Dubai to Abu Dhabi Car Transport",
    description: "Learn about RK Transport, the team behind safe and reliable car transport between Dubai and Abu Dhabi, available 24/7.",
  });
}

export default async function AboutPage() {
  const [aboutResult, settingsResult] = await Promise.allSettled([publicApi.about(), publicApi.settings()]);
  const about = aboutResult.status === "fulfilled" ? aboutResult.value[0] ?? null : null;
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const storyImage = about?.images?.find((image) => image.url);
  const hours = settings?.available_24_7 ? settings.hours_label : "";
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "") || "971561379697";
  const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent("Hello RK Transport, I would like a quote for car transport. Please contact me with details.")}`;
  const firstStat = about?.stats?.[0];

  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />

      <style>{`
        @keyframes about-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes about-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes about-shine { from { transform: translateX(-120%); } to { transform: translateX(220%); } }
        .about-float { animation: about-float 5s ease-in-out infinite; }
        .about-rise > * { opacity: 0; animation: about-rise .7s ease-out forwards; }
        .about-rise > *:nth-child(2) { animation-delay: .1s; }
        .about-rise > *:nth-child(3) { animation-delay: .2s; }
        .about-rise > *:nth-child(4) { animation-delay: .3s; }
        .about-shine::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(110deg, transparent, rgba(255,255,255,.25), transparent); transform: translateX(-120%); }
        .about-shine:hover::after { animation: about-shine .9s ease; }
        @media (prefers-reduced-motion: reduce) {
          .about-float, .about-rise > *, .about-shine:hover::after { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-slate-950 text-white">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.28),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
          <div className="about-rise mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:pb-28 lg:pt-40">
            {hours ? (
              <p className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold backdrop-blur">
                <span aria-hidden="true" className="size-2 rounded-full bg-amber-400" />
                {hours}
              </p>
            ) : <span />}
            <p className="mt-6 text-sm font-semibold uppercase tracking-[.22em] text-white/60">About us</p>
            <h1 className="mt-3 max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {about?.title || "About RK Transport"}
            </h1>
            {about?.subtitle ? (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">{about.subtitle}</p>
            ) : <span />}
          </div>
        </section>

        {!about && (
          <p className="mx-auto max-w-3xl px-4 py-16 text-slate-700 dark:text-slate-200">Company information is currently unavailable.</p>
        )}

        {/* Story */}
        {about && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {storyImage && (
                <div className={`relative ${about.story_image_side === "right" ? "lg:order-2" : ""}`}>
                  <div aria-hidden="true" className="absolute -bottom-5 -right-5 h-full w-full rounded-[2rem] border-2 border-slate-300 dark:border-slate-700" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-200 shadow-2xl shadow-slate-900/20 dark:bg-slate-800 sm:aspect-[5/4] lg:aspect-[4/5]">
                    <Image
                      src={apiImageUrl(storyImage.url) || storyImage.url!}
                      alt={storyImage.alt || ""}
                      fill
                      unoptimized={!isImageOptimizable(storyImage.url)}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  {firstStat && (
                    <div className="about-float absolute -bottom-6 left-4 rounded-2xl border border-white/30 bg-slate-950/85 px-6 py-4 text-white shadow-xl backdrop-blur-md sm:left-8">
                      <p className="text-3xl font-bold tabular-nums">{firstStat.value}</p>
                      <p className="text-sm text-white/75">{firstStat.label}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">Our story</p>
                <SimpleRichText value={about.description} className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-200" />
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-6 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    <MessageCircle aria-hidden="true" className="size-5" />
                    Get a quote
                    <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                  <Link href="/services" className="inline-flex min-h-12 items-center rounded-full border border-slate-300 px-6 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                    Our services
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Mission and vision */}
        {(about?.mission || about?.vision) && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-6 md:grid-cols-2">
              {about.mission && (
                <article className="group relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
                  <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-125" />
                  <Target aria-hidden="true" className="relative size-9" />
                  <h2 className="relative mt-5 text-2xl font-bold">Our mission</h2>
                  <p className="relative mt-3 leading-7 text-white/75">{about.mission}</p>
                </article>
              )}
              {about.vision && (
                <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 sm:p-10">
                  <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-slate-200 blur-2xl transition-transform duration-700 group-hover:scale-125 dark:bg-slate-700/50" />
                  <Eye aria-hidden="true" className="relative size-9" />
                  <h2 className="relative mt-5 text-2xl font-bold">Our vision</h2>
                  <p className="relative mt-3 leading-7 text-slate-600 dark:text-slate-300">{about.vision}</p>
                </article>
              )}
            </div>
          </section>
        )}

        {/* Stats */}
        {about?.stats?.length ? (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">In numbers</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">RK Transport at a glance</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {about.stats.map((stat, index) => (
                <CountUpStat key={`${stat.label}-${index}`} value={stat.value || "0"} label={stat.label || ""} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Why choose us */}
        {about?.why_choose_us?.length ? (
          <section className="bg-stone-100 px-4 py-16 dark:bg-slate-900/60 sm:px-6 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">Why us</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Why choose RK Transport</h2>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {about.why_choose_us.map((item, index) => {
                  const Icon = reasonIcons[item.icon || ""] || CircleCheck;
                  return (
                    <article key={`${item.title}-${index}`} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
                      <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-4 select-none text-8xl font-black tabular-nums text-slate-100 transition-colors duration-300 group-hover:text-slate-200 dark:text-slate-800 dark:group-hover:text-slate-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(148,163,184,0.18),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="relative grid size-14 place-items-center rounded-2xl bg-slate-950 text-white transition duration-300 group-hover:rotate-6 group-hover:scale-110 dark:bg-white dark:text-slate-950">
                        <Icon aria-hidden="true" className="size-7" />
                      </span>
                      <h3 className="relative mt-5 text-xl font-bold tracking-tight">{item.title}</h3>
                      <p className="relative mt-2 leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* Values */}
        {about?.values?.length ? (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">What we stand for</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Our values</h2>
            <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {about.values.map((value, index) => (
                <li key={`${value.title}-${index}`} className="group grid gap-2 py-6 transition sm:grid-cols-[80px_260px_1fr] sm:items-baseline sm:gap-8">
                  <span className="text-sm font-bold tabular-nums text-slate-400 transition group-hover:text-slate-950 dark:group-hover:text-white">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="text-xl font-bold tracking-tight transition-transform group-hover:translate-x-1">{value.title}</h3>
                  <p className="leading-7 text-slate-600 dark:text-slate-300">{value.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Call to action */}
        <section className="px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-7 py-14 text-white sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden="true" className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">Ready to move your car between Dubai and Abu Dhabi?</h2>
                <p className="mt-4 text-lg text-white/75">Message us on WhatsApp and we will confirm the price and timing with you.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="about-shine group relative inline-flex min-h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200">
                  <MessageCircle aria-hidden="true" className="size-5" />
                  Get a quote
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
                {settings?.phone_primary && (
                  <a href={`tel:${settings.phone_primary}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 font-semibold transition hover:bg-white/10">
                    <Phone aria-hidden="true" className="size-5" />
                    Call us
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}