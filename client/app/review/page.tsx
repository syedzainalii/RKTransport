import ReviewForm from "../Components/review-form";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import { publicApi } from "../../lib/transport-api";
import { generatePageMetadata } from "../../lib/seo";

export const revalidate = 60;

const WHATSAPP_NUMBER = "971561379697";
const PHONE_NUMBER = "+971561379697";

export function generateMetadata() {
  return generatePageMetadata("/reviews", {
    title: "Customer Reviews | RK Transport Dubai to Abu Dhabi",
    description: "Read customer reviews or leave feedback about your car transport experience between Dubai and Abu Dhabi with RK Transport.",
  });
}

export default async function ReviewsPage() {
  const [settingsResult, copyResult] = await Promise.allSettled([publicApi.settings(), publicApi.pageCopy()]);
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const copy = copyResult.status === "fulfilled" ? copyResult.value : [];
  const text = (key: string, fallback: string) => copy.find((item: { key: string }) => item.key === key)?.value || fallback;
  
  const phone = settings?.phone_primary || PHONE_NUMBER;
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "") || WHATSAPP_NUMBER;

  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Reviews", path: "/reviews" }]} />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-800 dark:text-slate-300">
            {settings ? (settings.available_24_7 ? settings.hours_label : "") : "Available 24/7"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{text("review.heading", "Customer Reviews")}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
            {text("review.subheading", "Your feedback helps other drivers choose RK Transport and helps us improve. Share your experience below.")}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          {/* Direct Support & Details Sidebar */}
          <section className="space-y-5 rounded-3xl bg-slate-950 p-7 text-white">
            <h2 className="text-xl font-bold">Quick Contact</h2>
            
            {settings?.core_route_label && (
              <div>
                <h3 className="font-semibold text-slate-200">Service route</h3>
                <p className="mt-1 text-slate-400">{settings.core_route_label}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-slate-200">Phone</h3>
              <a className="mt-1 inline-flex min-h-11 items-center text-slate-300 underline-offset-4 hover:underline" href={`tel:${phone}`}>
                {phone}
              </a>
            </div>

            <div>
              <h3 className="font-semibold text-slate-200">WhatsApp</h3>
              <a 
                className="mt-1 inline-flex min-h-11 items-center text-slate-300 underline-offset-4 hover:underline" 
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message us on WhatsApp
              </a>
            </div>

            {settings?.email && (
              <div>
                <h3 className="font-semibold text-slate-200">Email</h3>
                <a className="mt-1 inline-flex min-h-11 items-center text-slate-300 underline-offset-4 hover:underline" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </div>
            )}

            {settings?.address_line && (
              <div>
                <h3 className="font-semibold text-slate-200">Location</h3>
                <p className="mt-1 text-slate-400">{settings.address_line}</p>
              </div>
            )}

            <p className="border-t border-white/20 pt-5 font-bold text-slate-300">Available 24/7 for Bookings</p>
          </section>

          {/* Review Submission Form */}
          <ReviewForm />
        </div>
      </main>
    </>
  );
}