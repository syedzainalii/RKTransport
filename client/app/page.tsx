import Image from "next/image";
import Link from "next/link";
import BookingForm from "./Components/booking-form";
import ContactForm from "./Components/contact-form";
import HeroSlideshow from "./Components/hero-slideshow";
import Reveal from "./Components/reveal";
import SimpleRichText from "./Components/simple-rich-text";
import { BreadcrumbStructuredData, StructuredData } from "./Components/structured-data";
import { apiImageUrl, isImageOptimizable, publicApi, type Faq, type HeroBanner, type PageCopy, type Service, type Testimonial } from "../lib/transport-api";
import { faqJsonLd } from "../lib/seo";

export const revalidate = 60;

const defaultSteps = [
  { title: "Tell us about your car", description: "Share your car details and your pickup and drop-off locations." },
  { title: "Confirm your route and time", description: "Select locations and a suitable time; we will confirm the details with you." },
  { title: "We get you moving", description: "Our team contacts you with next steps and your service arrangement." },
];

async function getContent() {
  const results = await Promise.allSettled([
    publicApi.settings(),
    publicApi.heroBanners(),
    publicApi.services(),
    publicApi.pageCopy(),
    publicApi.faqs(),
    publicApi.about(),
    publicApi.testimonials(),
  ]);
  return {
    settings: results[0].status === "fulfilled" ? results[0].value : null,
    banners: results[1].status === "fulfilled" ? results[1].value : [],
    services: results[2].status === "fulfilled" ? results[2].value : [],
    copy: results[3].status === "fulfilled" ? results[3].value : [],
    faqs: results[4].status === "fulfilled" ? results[4].value : [],
    about: results[5].status === "fulfilled" ? results[5].value[0] ?? null : null,
    testimonials: results[6].status === "fulfilled" ? results[6].value : [],
    failed: results.some((result) => result.status === "rejected"),
  };
}

function bookingSteps(value: string | undefined) {
  if (!value) return defaultSteps;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every(isBookingStep)) {
      return parsed;
    }
  } catch {
    return defaultSteps;
  }

  function isBookingStep(item: unknown): item is { title: string; description: string } {
    return typeof item === "object" && item !== null &&
      "title" in item && typeof item.title === "string" &&
      "description" in item && typeof item.description === "string";
  }
  return defaultSteps;
}

export default async function HomePage() {
  const { settings, banners, services, copy, faqs, about, testimonials, failed } = await getContent();
  const text = (key: string, fallback: string) => copy.find((item: PageCopy) => item.key === key)?.value || fallback;
  const slides: HeroBanner[] = banners.length ? banners : [{
    id: 0,
    title: text("home.hero.title", "Car transport Dubai ⇄ Abu Dhabi"),
    subtitle: settings?.brand_name || "RK Transport",
    description: text("home.hero.description", "Reliable car transport between Dubai and Abu Dhabi. Available 24/7."),
    badge_text: settings ? settings.available_24_7 ? settings.hours_label : "" : "Available 24/7",
    button_text: text("home.hero.button", "Get a quote"),
    button_link: "/quote",
    image_url: null,
    image_alt: "",
  }];
  const steps = bookingSteps(copy.find((item: PageCopy) => item.key === "booking.steps")?.value);
  const aboutImage = about?.images?.find((image) => image.url);

  const visibleHomeFaqs = faqs.filter((faq: Faq) => !faq.page_key || faq.page_key === "home");
  const homeFaqs = visibleHomeFaqs.map((faq: Faq) => ({ question: faq.question, answer: faq.answer }));
  return <>
    <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }]} />
    {homeFaqs.length > 0 && <StructuredData data={faqJsonLd(homeFaqs)} />}
    <main>
    <HeroSlideshow slides={slides} />

    <section id="booking" className="scroll-mt-20 bg-stone-100 px-4 py-14 dark:bg-slate-900/70 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-7 text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings?.available_24_7 ? settings.hours_label : ""}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{text("home.booking.heading", "Book your car transport")}</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-700 dark:text-slate-200">{text("home.booking.description", "Share your details and our team will contact you to confirm the next steps.")}</p>
        </Reveal>
        <BookingForm compact />
        {failed && <p role="status" className="mt-4 text-center text-sm text-amber-900 dark:text-amber-200">Some live site content could not be loaded. Please try again shortly.</p>}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{text("home.services.eyebrow", "How we help")}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{text("home.services.heading", "Car transport, when you need it")}</h2>
        </div>
        <Link href="/services" className="inline-flex min-h-11 items-center font-semibold text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-300">{text("home.services.link", "Explore services")}</Link>
      </div>
      {services.length ? <div className="grid gap-5 md:grid-cols-3">
        {services.map((service: Service) => <article key={service.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {service.image_url && <div className="relative h-48 bg-slate-100 dark:bg-slate-800"><Image src={apiImageUrl(service.image_url) || service.image_url} alt={service.image_alt || ""} fill unoptimized={!isImageOptimizable(service.image_url)} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>}
          <div className="p-6">
            <h3 className="text-xl font-bold">{service.title}</h3>
            <p className="mt-3 min-h-12 leading-6 text-slate-700 dark:text-slate-200">{service.short_description}</p>
            {service.starting_price_note && <p className="mt-2 font-semibold text-emerald-800 dark:text-emerald-300">{service.starting_price_note}</p>}
            {service.features?.length ? <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">{service.features.slice(0, 3).map((feature) => <li key={feature}>✓ {feature}</li>)}</ul> : null}
            <Link href={`/services/${service.slug}`} className="mt-5 inline-flex min-h-11 items-center font-semibold text-emerald-800 hover:underline dark:text-emerald-300">{text("home.services.details", "Service details")} →</Link>
          </div>
        </article>)}
      </div> : <p className="rounded-2xl bg-white p-6 text-slate-700 dark:bg-slate-900 dark:text-slate-200">{text("empty.services", "Service information is currently unavailable.")}</p>}
    </section>

    <section className="bg-stone-100 px-4 py-16 dark:bg-slate-900/70 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{text("home.steps.eyebrow", "Simple and straightforward")}</p>
        <h2 className="mt-2 text-3xl font-bold">{text("home.steps.heading", "How booking works")}</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">{steps.map((step, index) => <article key={`${step.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <span className="grid size-10 place-items-center rounded-full bg-emerald-900 font-bold text-white">{index + 1}</span>
          <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
          <p className="mt-2 leading-6 text-slate-700 dark:text-slate-200">{step.description}</p>
        </article>)}</div>
      </div>
    </section>

    {about && <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {aboutImage && <div className={`relative min-h-72 overflow-hidden rounded-3xl ${about.story_image_side === "right" ? "lg:order-2" : ""}`}>
          <Image src={apiImageUrl(aboutImage.url) || aboutImage.url!} alt={aboutImage.alt || ""} fill unoptimized={!isImageOptimizable(aboutImage.url)} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>}
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{text("home.about.eyebrow", "About us")}</p>
          <h2 className="mt-2 text-3xl font-bold">{about.title}</h2>
          {about.subtitle && <p className="mt-3 text-lg text-slate-700 dark:text-slate-200">{about.subtitle}</p>}
          <SimpleRichText value={about.description} className="mt-4 leading-7 text-slate-700 dark:text-slate-200" />
          {about.stats.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3">{about.stats.map((stat, index) => <div key={`${stat.label}-${index}`} className="rounded-xl bg-stone-100 p-4 dark:bg-slate-900"><p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{stat.value}</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{stat.label}</p></div>)}</div>}
          <Link href="/about" className="mt-5 inline-flex min-h-11 items-center font-semibold text-emerald-800 hover:underline dark:text-emerald-300">{text("home.about.link", "More about RK Transport")} →</Link>
        </div>
      </div>
    </section>}

    {testimonials.length > 0 && <section className="bg-emerald-950 px-4 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-200">{text("home.testimonials.eyebrow", "Customer feedback")}</p>
        <h2 className="mt-2 text-3xl font-bold">{text("home.testimonials.heading", "Trusted to move what matters")}</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">{testimonials.map((testimonial: Testimonial) => <figure key={testimonial.id} className="rounded-2xl border border-white/15 bg-white/10 p-6">
          {testimonial.image_url && <div className="relative mb-4 size-14 overflow-hidden rounded-full"><Image src={apiImageUrl(testimonial.image_url) || testimonial.image_url} alt={testimonial.image_alt || ""} fill unoptimized={!isImageOptimizable(testimonial.image_url)} sizes="56px" className="object-cover" /></div>}
          <blockquote className="leading-7 text-white">“{testimonial.quote}”</blockquote>
          <p className="mt-2 text-amber-300" aria-label={`${testimonial.rating} out of 5 stars`}>{"★".repeat(testimonial.rating)}</p>
          <figcaption className="mt-4 font-bold">{testimonial.customer_name}{testimonial.vehicle_note ? <span className="block text-sm font-normal text-emerald-100">{testimonial.vehicle_note}</span> : null}</figcaption>
        </figure>)}</div>
      </div>
    </section>}

    {visibleHomeFaqs.length > 0 && <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{text("home.faqs.eyebrow", "Answers")}</p>
      <h2 className="mt-2 text-3xl font-bold">{text("home.faqs.heading", "Frequently asked questions")}</h2>
      <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">{visibleHomeFaqs.map((faq: Faq) => <details key={faq.id} className="group py-4"><summary className="min-h-11 cursor-pointer content-center font-semibold marker:text-emerald-800">{faq.question}</summary><p className="pb-2 leading-7 text-slate-700 dark:text-slate-200">{faq.answer}</p></details>)}</div>
    </section>}

    <section className="bg-stone-100 px-4 py-16 dark:bg-slate-900/70 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings?.available_24_7 ? settings.hours_label : ""}</p>
          <h2 className="mt-2 text-3xl font-bold">{text("contact.heading", "Contact RK Transport")}</h2>
          <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">{text("contact.subheading", "Get in touch about car transport between Dubai and Abu Dhabi.")}</p>
          <div className="mt-5 space-y-2 text-sm text-slate-800 dark:text-slate-100">
            {settings?.phone_primary && <p><a className="font-semibold underline" href={`tel:${settings.phone_primary}`}>{settings.phone_primary}</a></p>}
            {settings?.whatsapp && <p><a className="font-semibold underline" href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}>WhatsApp RK Transport</a></p>}
            {settings?.email && <p><a className="font-semibold underline" href={`mailto:${settings.email}`}>{settings.email}</a></p>}
            {settings?.address_line && <p>{settings.address_line}</p>}
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
    </main>
  </>;
}