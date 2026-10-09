import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, MessageCircle, Phone } from "lucide-react";
import { apiImageUrl, apiRequest, ApiError, isImageOptimizable, publicApi, type Service } from "../../../lib/transport-api";
import { BreadcrumbStructuredData, StructuredData } from "../../Components/structured-data";
import SimpleRichText from "../../Components/simple-rich-text";
import { canonicalUrl, generatePageMetadata } from "../../../lib/seo";

export const revalidate = 60;

async function findService(slug: string): Promise<Service> {
  return apiRequest<Service>(`/services/slug/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const service = await findService(slug);
    return generatePageMetadata(`/services/${service.slug}`, {
      title: service.seo_title || `${service.title} | RK Transport UAE`,
      description: service.seo_description || service.short_description || service.detailed_description || `${service.title} from RK Transport between Dubai and Abu Dhabi.`,
    }, `seo.service.${service.slug}`);
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 404) {
      return generatePageMetadata(`/services/${slug}`, {
        title: "Car Transport Service | RK Transport UAE",
        description: "Explore car transport services from RK Transport between Dubai and Abu Dhabi.",
      }, `seo.service.${slug}`);
    }
    throw reason;
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let service: Service;
  try {
    service = await findService(slug);
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 404) notFound();
    throw reason;
  }
  if (!service) {
    notFound();
  }

  const [settingsResult, copyResult] = await Promise.allSettled([publicApi.settings(), publicApi.pageCopy()]);
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const copy = copyResult.status === "fulfilled" ? copyResult.value : [];
  const cta = copy.find((item: { key: string }) => item.key === "services.detail.cta")?.value || "Request this service";
  const hours = settings?.available_24_7 ? settings.hours_label : "";
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "") || "971561379697";
  const requestMessage = `Hello RK Transport, I would like to request this service: ${service.title}. Please contact me with details.`;
  const requestWhatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(requestMessage)}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    ...(service.short_description || service.detailed_description
      ? { description: service.short_description || service.detailed_description }
      : {}),
    url: canonicalUrl(`/services/${service.slug}`),
    areaServed: ["Dubai", "Abu Dhabi", "United Arab Emirates"],
    provider: {
      "@type": "AutomotiveBusiness",
      name: settings?.brand_name || "RK Transport",
      url: canonicalUrl("/"),
      ...(settings?.phone_primary ? { telephone: settings.phone_primary } : {}),
    },
  };

  return (
    <>
      <BreadcrumbStructuredData items={[
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: service.title, path: `/services/${service.slug}` },
      ]} />
      <StructuredData data={serviceSchema} />

      <main>
        {/* Image hero */}
        <section className="relative isolate flex min-h-[460px] items-end overflow-hidden bg-slate-950 text-white sm:min-h-[560px]">
          {service.image_url ? (
            <Image
              src={apiImageUrl(service.image_url) || service.image_url}
              alt={service.image_alt || ""}
              fill
              priority
              unoptimized={!isImageOptimizable(service.image_url)}
              sizes="100vw"
              className="-z-20 object-cover"
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.28),transparent_55%),linear-gradient(135deg,#0f172a,#020617)]" />
          )}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/70 to-transparent" />

          <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-32 sm:px-6 sm:pb-16">
            <Link href="/services" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white">
              <ArrowLeft aria-hidden="true" className="size-4" />
              All services
            </Link>
            {hours && (
              <p className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold backdrop-blur">
                <Clock aria-hidden="true" className="size-4" />
                {hours}
              </p>
            )}
            <h1 className="mt-4 max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{service.title}</h1>
            {service.short_description && <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">{service.short_description}</p>}
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_380px] lg:py-20">
          <div>
            {service.detailed_description && (
              <SimpleRichText value={service.detailed_description} className="max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-200" />
            )}

            {service.features?.length ? (
              <div className="mt-10">
                <h2 className="text-2xl font-bold tracking-tight">What is included</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Check aria-hidden="true" className="size-3.5" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {service.gallery.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight">Gallery</h2>
                <div className="mt-5 grid auto-rows-[200px] gap-3 sm:grid-cols-2 sm:auto-rows-[240px]">
                  {service.gallery.map((image, index) => (
                    <div key={`${image.url}-${index}`} className={`group relative overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800 ${index % 5 === 0 ? "sm:row-span-2" : ""}`}>
                      <Image
                        src={apiImageUrl(image.url) || image.url}
                        alt={image.alt || ""}
                        fill
                        unoptimized={!isImageOptimizable(image.url)}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky booking card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">Book this service</p>
              {service.starting_price_note ? (
                <p className="mt-3 text-3xl font-bold tracking-tight">{service.starting_price_note}</p>
              ) : (
                <p className="mt-3 text-2xl font-bold tracking-tight">Get a free quote</p>
              )}
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Tell us the pickup and drop-off and we will confirm the price and timing with you.</p>

              <a
                href={requestWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <MessageCircle aria-hidden="true" className="size-5" />
                {cta}
                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
              </a>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Link href="/quote" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 px-4 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                  <ArrowRight aria-hidden="true" className="size-5" />
                  Use form
                </Link>
                {settings?.phone_primary && (
                  <a href={`tel:${settings.phone_primary}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 px-4 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                    <Phone aria-hidden="true" className="size-5" />
                    Call
                  </a>
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}