import Link from "next/link";
import Image from "next/image";
import { BreadcrumbStructuredData, StructuredData } from "../Components/structured-data";
import { apiImageUrl, isImageOptimizable, publicApi, type Faq, type StoragePlan } from "../../lib/transport-api";
import { faqJsonLd, generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

const storageFaqs = [
  { question: "How do I choose a car storage plan?", answer: "Review the available plans and their listed features, then contact RK Transport with how long you expect to store the vehicle and any specific requirements. The team can help clarify which listed option suits your needs." },
  { question: "What should I include in a storage enquiry?", answer: "Share the vehicle make and model, your preferred storage dates or duration, and any relevant requirements such as covered storage. The team will confirm the available option and terms." },
  { question: "Can I request collection or transport to storage?", answer: "Include the vehicle's current location and ask about transport when submitting your enquiry. Collection arrangements depend on the vehicle, route, and availability and will be confirmed separately." },
];

export function generateMetadata() {
  return generatePageMetadata("/storage", {
    title: "Car Storage in the UAE | RK Transport",
    description: "Explore vehicle storage plans from RK Transport. Compare listed features and ask our team about storing your car in the UAE.",
  });
}

export default async function StoragePage() {
  const results = await Promise.allSettled([publicApi.storagePlans(), publicApi.pageCopy(), publicApi.settings(), publicApi.faqs()]);
  const plans: StoragePlan[] = results[0].status === "fulfilled" ? results[0].value : [];
  const copy = results[1].status === "fulfilled" ? results[1].value : [];
  const settings = results[2].status === "fulfilled" ? results[2].value : null;
  const adminFaqs: Faq[] = results[3].status === "fulfilled" ? results[3].value.filter((faq) => !faq.page_key || faq.page_key === "storage") : [];
  const visibleFaqs = adminFaqs.length ? adminFaqs.map(({ question, answer }) => ({ question, answer })) : storageFaqs;
  const text = (key: string, fallback: string) => copy.find((item: { key: string }) => item.key === key)?.value || fallback;

  return (
    <>
    <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Car storage", path: "/storage" }]} />
    <StructuredData data={faqJsonLd(visibleFaqs)} />
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings?.available_24_7 ? settings.hours_label : ""}</p>
      <h1 className="mt-3 text-4xl font-bold">{text("storage.heading", "Car storage")}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{text("storage.subheading", "Looking for a place to keep your vehicle? Review the storage options below and contact us with your vehicle details and intended storage period. We will confirm plan availability and arrangements with you.")}</p>
      {plans.length > 0 ? <div className="mt-10 grid gap-6 md:grid-cols-2">{plans.map((plan) => (
        <article key={plan.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {plan.image_url && <div className="relative h-56"><Image src={apiImageUrl(plan.image_url) || plan.image_url} alt={plan.image_alt || ""} fill unoptimized={!isImageOptimizable(plan.image_url)} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>}
          <div className="p-6"><h2 className="text-2xl font-bold">{plan.title}</h2><p className="mt-3 leading-6 text-slate-600 dark:text-slate-300">{plan.description}</p><Link href="/contact" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-emerald-900 px-5 font-semibold text-white hover:bg-emerald-800">{text("storage.cta", "Ask about storage")}</Link></div>
        </article>
      ))}</div> : <p className="mt-8 rounded-xl bg-stone-100 p-5 dark:bg-slate-900">{text("empty.storage", "Storage options are currently unavailable.")}</p>}
      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold">Car storage questions</h2>
        <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">{visibleFaqs.map((faq) => <details key={faq.question} className="group py-4">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">{faq.question}</summary>
          <p className="pb-2 leading-7 text-slate-700 dark:text-slate-200">{faq.answer}</p>
        </details>)}</div>
      </section>
      <nav aria-label="Related pages" className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/services" className="font-semibold text-emerald-800 underline dark:text-emerald-300">All vehicle services</Link>
        <Link href="/car-lift-recovery" className="font-semibold text-emerald-800 underline dark:text-emerald-300">Car lift and recovery</Link>
        <Link href="/dubai-to-abu-dhabi-car-transport" className="font-semibold text-emerald-800 underline dark:text-emerald-300">Dubai to Abu Dhabi transport</Link>
        <Link href="/contact" className="font-semibold text-emerald-800 underline dark:text-emerald-300">Ask about storage</Link>
      </nav>
    </main>
    </>
  );
}
