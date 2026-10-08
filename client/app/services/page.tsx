import Link from "next/link";
import Image from "next/image";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import { apiImageUrl, isImageOptimizable, publicApi, type Service } from "../../lib/transport-api";
import { generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

export function generateMetadata() {
  return generatePageMetadata("/services", {
    title: "Car Transport, Recovery & Storage Services | RK Transport",
    description: "Explore vehicle transport, car lift and recovery, and car storage services from RK Transport in Dubai, Abu Dhabi, and across the UAE.",
  });
}

export default async function ServicesPage() {
  const [serviceResult, copyResult, settingsResult] = await Promise.allSettled([publicApi.services(), publicApi.pageCopy(), publicApi.settings()]);
  const services: Service[] = serviceResult.status === "fulfilled" ? serviceResult.value : [];
  const copy = copyResult.status === "fulfilled" ? copyResult.value : [];
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const text = (key: string, fallback: string) => copy.find((item: { key: string }) => item.key === key)?.value || fallback;
  return (
    <>
    <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]} />
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings?.available_24_7 ? settings.hours_label : ""}</p>
      <h1 className="mt-3 text-4xl font-bold">{text("services.heading", "Transport and vehicle services")}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{text("services.subheading", settings?.tagline || "")}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => <article key={service.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {service.image_url && <div className="relative h-48"><Image src={apiImageUrl(service.image_url) || service.image_url} alt={service.image_alt || ""} fill unoptimized={!isImageOptimizable(service.image_url)} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>}
          <div className="p-6"><h2 className="text-xl font-bold">{service.title}</h2><p className="mt-3 leading-6 text-slate-600 dark:text-slate-300">{service.short_description}</p><Link href={`/services/${service.slug}`} className="mt-5 inline-flex min-h-11 items-center font-semibold text-emerald-800 hover:underline dark:text-emerald-300">{text("services.details", "Learn more")} →</Link></div>
        </article>)}
      </div>
      {!services.length && <p className="mt-8 rounded-xl bg-stone-100 p-5 dark:bg-slate-900">{text("empty.services", "Service information is currently unavailable.")}</p>}
    </main>
    </>
  );
}
