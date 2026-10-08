import BookingForm from "../Components/booking-form";
import { BreadcrumbStructuredData, StructuredData } from "../Components/structured-data";
import { publicApi, type Faq } from "../../lib/transport-api";
import { faqJsonLd, generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

export function generateMetadata() {
  return generatePageMetadata("/quote", {
    title: "Request a Car Transport Quote | RK Transport UAE",
    description: "Request a quote for car transport, recovery, or storage with RK Transport. Share your vehicle and route details to get started.",
  });
}

export default async function QuotePage() {
  const [settingsResult, copyResult, faqResult] = await Promise.allSettled([publicApi.settings(), publicApi.pageCopy(), publicApi.faqs()]);
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const copy = copyResult.status === "fulfilled" ? copyResult.value : [];
  const faqs: Faq[] = faqResult.status === "fulfilled" ? faqResult.value.filter((faq) => !faq.page_key || faq.page_key === "booking") : [];
  const text = (key: string, fallback: string) => copy.find((item: { key: string }) => item.key === key)?.value || fallback;
  const configuredSteps = copy.find((item: { key: string }) => item.key === "booking.steps")?.value;
  const steps = parseSteps(configuredSteps);
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Request a quote", path: "/quote" }]} />
      {faqs.length > 0 && <StructuredData data={faqJsonLd(faqs.map(({ question, answer }) => ({ question, answer })))} />}
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings?.available_24_7 ? settings.hours_label : ""}</p>
      <h1 className="mt-3 text-4xl font-bold">{text("quote.heading", "Request a quote")}</h1>
      <p className="mb-8 mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{text("quote.subheading", settings?.tagline || "")}</p>
      <BookingForm />
      <section className="mt-16">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{text("home.steps.eyebrow", "Simple and straightforward")}</p>
        <h2 className="mt-2 text-3xl font-bold">{text("home.steps.heading", "How booking works")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{steps.map((step, index) => <article key={`${step.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <span className="grid size-9 place-items-center rounded-full bg-emerald-900 font-bold text-white">{index + 1}</span>
          <h3 className="mt-3 font-bold">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{step.description}</p>
        </article>)}</div>
      </section>
      {faqs.length > 0 && <section className="mt-14"><h2 className="text-2xl font-bold">Booking questions</h2><div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">{faqs.map((faq) => <details key={faq.id} className="py-4"><summary className="min-h-11 cursor-pointer content-center font-semibold">{faq.question}</summary><p className="pb-2 leading-7 text-slate-700 dark:text-slate-200">{faq.answer}</p></details>)}</div></section>}
    </main>
    </>
  );
}

function parseSteps(value: string | undefined): { title: string; description: string }[] {
  if (value) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every(isBookingStep)) return parsed;
    } catch {
      return defaultSteps;
    }
  }
  return defaultSteps;
}

function isBookingStep(item: unknown): item is { title: string; description: string } {
  return typeof item === "object" && item !== null &&
    "title" in item && typeof item.title === "string" &&
    "description" in item && typeof item.description === "string";
}

const defaultSteps = [
  { title: "Tell us what you need", description: "Choose a service and share your vehicle details." },
  { title: "Confirm your route and time", description: "We confirm your route and preferred time with you." },
  { title: "We get you moving", description: "Our team contacts you with the next steps." },
];
