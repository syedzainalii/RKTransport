import ReviewForm from "../Components/review-form";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import { publicApi } from "../../lib/transport-api";
import { generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

export function generateMetadata() {
  return generatePageMetadata("/contact", {
    title: "Contact & Reviews | RK Transport Dubai to Abu Dhabi Car Transport",
    description: "Contact RK Transport or leave a review about your Dubai to Abu Dhabi car transport experience.",
  });
}

export default async function ContactPage() {
  const [settingsResult, copyResult] = await Promise.allSettled([publicApi.settings(), publicApi.pageCopy()]);
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const copy = copyResult.status === "fulfilled" ? copyResult.value : [];
  const text = (key: string, fallback: string) => copy.find((item: { key: string }) => item.key === key)?.value || fallback;
  const phone = settings?.phone_primary;

  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings ? settings.available_24_7 ? settings.hours_label : "" : "Available 24/7"}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{text("review.heading", "Leave a review")}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{text("review.subheading", "Your feedback helps other drivers choose RK Transport and helps us improve. It only takes a minute.")}</p>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section className="space-y-5 rounded-3xl bg-emerald-950 p-7 text-white">
            <h2 className="text-xl font-bold">Contact us</h2>
            {settings?.core_route_label && <div><h3 className="font-semibold">Service route</h3><p className="mt-1 text-emerald-100">{settings.core_route_label}</p></div>}
            {phone && <div><h3 className="font-semibold">Phone</h3><a className="mt-1 inline-flex min-h-11 items-center text-emerald-100 underline-offset-4 hover:underline" href={`tel:${phone}`}>{phone}</a></div>}
            {settings?.whatsapp && <div><h3 className="font-semibold">WhatsApp</h3><a className="mt-1 inline-flex min-h-11 items-center text-emerald-100 underline-offset-4 hover:underline" href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}>Message us on WhatsApp</a></div>}
            {settings?.email && <div><h3 className="font-semibold">Email</h3><a className="mt-1 inline-flex min-h-11 items-center text-emerald-100 underline-offset-4 hover:underline" href={`mailto:${settings.email}`}>{settings.email}</a></div>}
            {settings?.address_line && <div><h3 className="font-semibold">Location</h3><p className="mt-1 text-emerald-100">{settings.address_line}</p></div>}
            {settings?.available_24_7 && <p className="border-t border-white/20 pt-5 font-bold text-emerald-200">{settings.hours_label}</p>}
          </section>
          <ReviewForm />
        </div>
      </main>
    </>
  );
}