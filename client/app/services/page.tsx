import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, MessageCircle, Phone } from "lucide-react";
import { BreadcrumbStructuredData, StructuredData } from "../Components/structured-data";
import { apiImageUrl, isImageOptimizable, publicApi, type Faq, type Service } from "../../lib/transport-api";
import { faqJsonLd, generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

export function generateMetadata() {
  return generatePageMetadata("/services", {
    title: "Car Transport Services Dubai to Abu Dhabi | RK Transport",
    description: "Safe, reliable car transport between Dubai and Abu Dhabi, available 24/7. Explore RK Transport services and request a quote.",
  });
}

export default async function ServicesPage() {
  const [serviceResult, copyResult, settingsResult, faqResult] = await Promise.allSettled([
    publicApi.services(),
    publicApi.pageCopy(),
    publicApi.settings(),
    publicApi.faqs(),
  ]);
  const services: Service[] = serviceResult.status === "fulfilled" ? serviceResult.value : [];
  const copy = copyResult.status === "fulfilled" ? copyResult.value : [];
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const faqs: Faq[] = faqResult.status === "fulfilled" ? faqResult.value.filter((faq) => !faq.page_key || faq.page_key === "services") : [];
  const text = (key: string, fallback: string) => copy.find((item: { key: string }) => item.key === key)?.value || fallback;

  const [featured, ...others] = services;
  const hours = settings?.available_24_7 ? settings.hours_label : "";
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "");

  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]} />
      {faqs.length > 0 && <StructuredData data={faqJsonLd(faqs.map(({ question, answer }) => ({ question, answer })))} />}

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-slate-950 text-white">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.28),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px]" />
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:pb-28 lg:pt-40">
            {hours && (
              <p className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold backdrop-blur">
                <span aria-hidden="true" className="size-2 rounded-full bg-amber-400" />
                {hours}
              </p>
            )}
            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {text("services.heading", "Car transport, done right")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
              {text("services.subheading", settings?.tagline || "Safe, reliable car transport between Dubai and Abu Dhabi.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quote" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200">
                Get a quote
                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {whatsappDigits && (
                <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 font-semibold backdrop-blur transition hover:bg-white/20">
                  <MessageCircle aria-hidden="true" className="size-5" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          {services.length === 0 && (
            <p className="rounded-2xl bg-stone-100 p-6 dark:bg-slate-900">{text("empty.services", "Service information is currently unavailable.")}</p>
          )}

          {/* Featured service */}
          {featured && (
            <Link
              href={`/services/${featured.slug}`}
              className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2"
            >
              <div className="relative min-h-72 bg-slate-200 dark:bg-slate-800 lg:min-h-[28rem]">
                {featured.image_url ? (
                  <Image
                    src={apiImageUrl(featured.image_url) || featured.image_url}
                    alt={featured.image_alt || ""}
                    fill
                    priority
                    unoptimized={!isImageOptimizable(featured.image_url)}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900 backdrop-blur">Most popular</span>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">01</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{featured.title}</h2>
                <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{featured.short_description}</p>
                {featured.features?.length ? (
                  <ul className="mt-6 space-y-2">
                    {featured.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
                        <Check aria-hidden="true" className="mt-1 size-4 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  {featured.starting_price_note && <span className="text-lg font-bold">{featured.starting_price_note}</span>}
                  <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-6 font-semibold text-white transition group-hover:gap-3 dark:bg-white dark:text-slate-950">
                    {text("services.details", "Learn more")}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Other services */}
          {others.length > 0 && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {others.map((service, index) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative h-56 bg-slate-200 dark:bg-slate-800">
                    {service.image_url ? (
                      <Image
                        src={apiImageUrl(service.image_url) || service.image_url}
                        alt={service.image_alt || ""}
                        fill
                        unoptimized={!isImageOptimizable(service.image_url)}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                    )}
                    <span className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-sm font-bold text-slate-900 backdrop-blur">
                      {String(index + 2).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-2xl font-bold tracking-tight">{service.title}</h2>
                    <p className="mt-3 flex-1 leading-7 text-slate-600 dark:text-slate-300">{service.short_description}</p>
                    {service.starting_price_note && <p className="mt-4 font-semibold">{service.starting_price_note}</p>}
                    <span className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold transition-all group-hover:gap-3">
                      {text("services.details", "Learn more")}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Call to action */}
        <section className="px-4 sm:px-6">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-7 py-12 text-white sm:px-12 sm:py-16">
            <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to move your car?</h2>
                <p className="mt-3 text-lg text-white/75">Tell us the pickup and drop-off and we will confirm the details with you.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/quote" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200">
                  Get a quote
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
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

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">Answers</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Service questions</h2>
            <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
              {faqs.map((faq) => (
                <details key={faq.id} className="group py-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span aria-hidden="true" className="text-2xl leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-2 pt-2 leading-7 text-slate-700 dark:text-slate-200">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}