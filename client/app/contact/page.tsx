import ContactForm from "../Components/contact-form";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import { publicApi } from "../../lib/transport-api";
import { generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

export function generateMetadata() {
  return generatePageMetadata("/contact", {
    title: "Contact RK Transport | UAE Car Transport & Recovery",
    description: "Contact RK Transport about car transport, recovery, or storage in Dubai, Abu Dhabi, and the UAE.",
  });
}

export default async function ContactPage() {
  const [settingsResult, copyResult] = await Promise.allSettled([publicApi.settings(), publicApi.pageCopy()]);
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const copy = copyResult.status === "fulfilled" ? copyResult.value : [];
  const text = (key: string, fallback: string) => copy.find((item: { key: string }) => item.key === key)?.value || fallback;
  const phone = settings?.phone_primary;
  const recoveryPhone = settings?.phone_recovery;

  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings ? settings.available_24_7 ? settings.hours_label : "" : "Available 24/7"}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">{text("contact.heading", "Contact us")}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{text("contact.subheading", settings?.tagline || "")}</p>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <section className="space-y-5 rounded-3xl bg-emerald-950 p-7 text-white">
          {settings?.core_route_label && <div><h2 className="font-semibold">Service route</h2><p className="mt-1 text-emerald-100">{settings.core_route_label}</p></div>}
          {phone && <div><h2 className="font-semibold">General enquiries</h2><a className="mt-1 inline-flex min-h-11 items-center text-emerald-100 underline-offset-4 hover:underline" href={`tel:${phone}`}>{phone}</a></div>}
          {recoveryPhone && <div><h2 className="font-semibold">Recovery line</h2><a className="mt-1 inline-flex min-h-11 items-center text-emerald-100 underline-offset-4 hover:underline" href={`tel:${recoveryPhone}`}>{recoveryPhone}</a></div>}
          {settings?.email && <div><h2 className="font-semibold">Email</h2><a className="mt-1 inline-flex min-h-11 items-center text-emerald-100 underline-offset-4 hover:underline" href={`mailto:${settings.email}`}>{settings.email}</a></div>}
          {settings?.address_line && <div><h2 className="font-semibold">Location</h2><p className="mt-1 text-emerald-100">{settings.address_line}</p></div>}
          {settings?.available_24_7 && <p className="border-t border-white/20 pt-5 font-bold text-emerald-200">{settings.hours_label}</p>}
        </section>
        <ContactForm />
      </div>
    </main>
    </>
  );
}
