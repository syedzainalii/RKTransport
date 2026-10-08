import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
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
      description: service.seo_description || service.short_description || service.detailed_description || `${service.title} from RK Transport across Dubai, Abu Dhabi, and the UAE.`,
    }, `seo.service.${service.slug}`);
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 404) {
      return generatePageMetadata(`/services/${slug}`, {
        title: "Vehicle Service | RK Transport UAE",
        description: "Explore vehicle transport and support services from RK Transport in the UAE.",
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
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings?.available_24_7 ? settings.hours_label : ""}</p>
      <h1 className="mt-3 text-4xl font-bold">{service.title}</h1>
      {service.image_url && <div className="relative mt-8 h-72 overflow-hidden rounded-3xl sm:h-[420px]"><Image src={apiImageUrl(service.image_url) || service.image_url} alt={service.image_alt || ""} fill priority unoptimized={!isImageOptimizable(service.image_url)} sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" /></div>}
      {service.starting_price_note && <p className="mt-4 text-lg font-semibold text-emerald-800 dark:text-emerald-300">{service.starting_price_note}</p>}
      {service.detailed_description && <SimpleRichText value={service.detailed_description} className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300" />}
      {service.gallery.length > 0 && <section className="mt-8"><h2 className="text-2xl font-bold">Service gallery</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{service.gallery.map((image, index) => <div key={`${image.url}-${index}`} className="relative h-64 overflow-hidden rounded-2xl"><Image src={apiImageUrl(image.url) || image.url} alt={image.alt || ""} fill unoptimized={!isImageOptimizable(image.url)} sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" /></div>)}</div></section>}
      {service.features?.length ? <ul className="mt-6 grid gap-3 sm:grid-cols-2">{service.features.map((feature) => <li key={feature} className="rounded-xl bg-stone-100 p-4 dark:bg-slate-900">{feature}</li>)}</ul> : null}
      <Link href="/quote" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-emerald-900 px-6 font-semibold text-white hover:bg-emerald-800">{cta}</Link>
    </main>
    </>
  );
}
