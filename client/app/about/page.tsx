import Image from "next/image";
import CountUpStat from "../Components/count-up-stat";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import { apiImageUrl, isImageOptimizable, publicApi } from "../../lib/transport-api";
import { generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

export function generateMetadata() {
  return generatePageMetadata("/about", {
    title: "About RK Transport | UAE Vehicle Transport Team",
    description: "Learn about RK Transport and our vehicle transport, recovery, and storage services across Dubai, Abu Dhabi, and the UAE.",
  });
}

export default async function AboutPage() {
  const [aboutResult, settingsResult] = await Promise.allSettled([
    publicApi.about(),
    publicApi.settings(),
  ]);
  const about = aboutResult.status === "fulfilled" ? aboutResult.value[0] ?? null : null;
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const storyImage = about?.images?.find((image) => image.url);

  return <>
    <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
    <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">{settings?.available_24_7 ? settings.hours_label : ""}</p>
    <h1 className="mt-3 text-4xl font-bold">{about?.title || "About RK Transport"}</h1>
    {about?.subtitle && <p className="mt-3 text-xl text-slate-700 dark:text-slate-200">{about.subtitle}</p>}
    {about && <section className="mt-8 grid items-center gap-8 lg:grid-cols-2">
      {storyImage && <div className={`relative min-h-72 overflow-hidden rounded-3xl ${about.story_image_side === "right" ? "lg:order-2" : ""}`}>
        <Image src={apiImageUrl(storyImage.url) || storyImage.url!} alt={storyImage.alt || ""} fill unoptimized={!isImageOptimizable(storyImage.url)} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>}
      <div>
        <p className="whitespace-pre-line text-lg leading-8 text-slate-800 dark:text-slate-100">{about.description}</p>
        {about.mission && <section className="mt-6 rounded-2xl bg-stone-100 p-5 dark:bg-slate-900"><h2 className="font-bold">Our mission</h2><p className="mt-2 leading-6">{about.mission}</p></section>}
        {about.vision && <section className="mt-4 rounded-2xl bg-stone-100 p-5 dark:bg-slate-900"><h2 className="font-bold">Our vision</h2><p className="mt-2 leading-6">{about.vision}</p></section>}
      </div>
    </section>}
    {about?.stats?.length ? <section className="mt-12"><h2 className="text-2xl font-bold">RK Transport at a glance</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{about.stats.map((stat, index) => <CountUpStat key={`${stat.label}-${index}`} value={stat.value || "0"} label={stat.label || ""} />)}</div></section> : null}
    {about?.why_choose_us?.length ? <section className="mt-12"><h2 className="text-2xl font-bold">Why choose RK Transport</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{about.why_choose_us.map((item, index) => <article key={`${item.title}-${index}`} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><h3 className="font-bold">{item.title}</h3><p className="mt-2 leading-6 text-slate-700 dark:text-slate-200">{item.description}</p></article>)}</div></section> : null}
    {about?.values?.length ? <section className="mt-12"><h2 className="text-2xl font-bold">Our values</h2><ul className="mt-4 grid gap-4 sm:grid-cols-3">{about.values.map((value, index) => <li key={`${value.title}-${index}`} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><h3 className="font-bold">{value.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{value.description}</p></li>)}</ul></section> : null}
    {!about && <p className="mt-6 text-slate-700 dark:text-slate-200">Company information is currently unavailable.</p>}
    </main>
  </>;
}
