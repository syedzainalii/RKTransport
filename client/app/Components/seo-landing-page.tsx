import Link from "next/link";
import { BreadcrumbStructuredData, StructuredData } from "./structured-data";
import { faqJsonLd } from "../../lib/seo";

type SeoLandingPageProps = {
  title: string;
  path: string;
  intro: string;
  sections: { heading: string; text: string }[];
  faqs: { question: string; answer: string }[];
  links: { href: string; label: string }[];
};

export default function SeoLandingPage({
  title,
  path,
  intro,
  sections,
  faqs,
  links,
}: SeoLandingPageProps) {
  return <>
    <BreadcrumbStructuredData items={[
      { name: "Home", path: "/" },
      { name: title, path },
    ]} />
    <StructuredData data={faqJsonLd(faqs)} />
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-800 dark:text-emerald-300">RK Transport · UAE</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-200">{intro}</p>
      <Link href="/quote" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-emerald-900 px-6 font-semibold text-white hover:bg-emerald-800">Request a transport quote</Link>
      <div className="mt-12 space-y-8">
        {sections.map((section) => <section key={section.heading}>
          <h2 className="text-2xl font-bold">{section.heading}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-700 dark:text-slate-200">{section.text}</p>
        </section>)}
      </div>
      <section className="mt-12">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
          {faqs.map((faq) => <details key={faq.question} className="group py-4">
            <summary className="min-h-11 cursor-pointer content-center font-semibold marker:text-emerald-800">{faq.question}</summary>
            <p className="pb-2 leading-7 text-slate-700 dark:text-slate-200">{faq.answer}</p>
          </details>)}
        </div>
      </section>
      <nav aria-label="Related pages" className="mt-12 rounded-2xl bg-stone-100 p-6 dark:bg-slate-900">
        <h2 className="font-bold">Explore more from RK Transport</h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => <li key={link.href}><Link className="font-semibold text-emerald-800 underline dark:text-emerald-300" href={link.href}>{link.label}</Link></li>)}
        </ul>
      </nav>
    </main>
  </>;
}
