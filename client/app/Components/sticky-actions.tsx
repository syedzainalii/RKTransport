"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest, type SiteSettings } from "../../lib/transport-api";

export default function StickyActions() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiRequest<SiteSettings>("/settings"),
  });
  const phone = settings?.phone_primary;
  const whatsapp = settings?.whatsapp || phone;
  const phoneDigits = whatsapp?.replace(/\D/g, "");

  return <nav aria-label="Quick contact actions" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-stone-50/95 p-2 text-slate-900 shadow-[0_-6px_24px_rgba(15,23,42,.12)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95 dark:text-white">
    <a href={phone ? `tel:${phone}` : "/contact"} className="grid min-h-11 place-items-center rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900">Call</a>
    <a href={phoneDigits ? `https://wa.me/${phoneDigits}` : "/contact"} target={phoneDigits ? "_blank" : undefined} rel={phoneDigits ? "noreferrer" : undefined} className="grid min-h-11 place-items-center rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900">WhatsApp</a>
    <a href="/quote" className="grid min-h-11 place-items-center rounded-lg bg-emerald-900 text-sm font-semibold text-white hover:bg-emerald-800">Book</a>
  </nav>;
}
