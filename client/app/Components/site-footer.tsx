"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, type SiteSettings } from "../../lib/transport-api";

export default function SiteFooter() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiRequest<SiteSettings>("/settings"),
  });
  const phone = settings?.phone_primary;

  return (
    <footer className="bg-emerald-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">{settings?.brand_name || "RK Transport"}</p>
          {settings?.footer_blurb && <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-100">{settings.footer_blurb}</p>}
          <p className="mt-4 text-sm font-semibold text-emerald-200">{settings ? settings.available_24_7 ? settings.hours_label : "" : "Available 24/7"}</p>
        </div>
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-3 text-sm text-emerald-100">
          <Link className="min-h-11 content-center hover:text-white" href="/services">Services</Link>
          <Link className="min-h-11 content-center hover:text-white" href="/storage">Car storage</Link>
          <Link className="min-h-11 content-center hover:text-white" href="/about">About</Link>
          <Link className="min-h-11 content-center hover:text-white" href="/contact">Contact</Link>
          <Link className="min-h-11 content-center hover:text-white" href="/track">Track booking</Link>
        </nav>
        <div className="space-y-3 text-sm text-emerald-100">
          {settings?.core_route_label && <p>{settings.core_route_label}</p>}
          {settings?.address_line && <p>{settings.address_line}</p>}
          {phone && <a className="block min-h-11 content-center hover:text-white" href={`tel:${phone}`}>{phone}</a>}
          {settings?.email && <a className="block min-h-11 content-center hover:text-white" href={`mailto:${settings.email}`}>{settings.email}</a>}
        </div>
      </div>
      <div className="border-t border-white/15 px-4 py-4 text-center text-xs text-emerald-200">
        © {new Date().getFullYear()} {settings?.brand_name || "RK Transport"}
      </div>
    </footer>
  );
}
