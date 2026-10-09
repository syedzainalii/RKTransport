"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUp, Clock, Mail, MapPin, MessageCircle, Phone, Route } from "lucide-react";
import { apiRequest, type SiteSettings } from "../../lib/transport-api";

const FALLBACK_WHATSAPP = "971561379697";
const QUOTE_MESSAGE = "Hello RK Transport, I would like a quote for car transport between Dubai and Abu Dhabi. Please contact me with details.";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About us", href: "/about" },
  { label: "Track booking", href: "/track" },
  { label: "Contact & reviews", href: "/contact" },
];

export default function SiteFooter() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiRequest<SiteSettings>("/settings"),
  });

  const brand = settings?.brand_name || "RK Transport";
  const phone = settings?.phone_primary;
  const whatsappDigits = settings?.whatsapp?.replace(/\D/g, "") || FALLBACK_WHATSAPP;
  const quoteUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(QUOTE_MESSAGE)}`;
  const hours = settings ? (settings.available_24_7 ? settings.hours_label : "") : "Available 24/7";

  const socials = [
    { label: "Facebook", href: settings?.facebook_url, icon: <FacebookIcon /> },
    { label: "Instagram", href: settings?.instagram_url, icon: <InstagramIcon /> },
    { label: "TikTok", href: settings?.tiktok_url, icon: <TikTokIcon /> },
  ].filter((item) => item.href);

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      {/* soft glow */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />

      {/* Call-to-action band */}
      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-7 backdrop-blur sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Need your car moved between Dubai and Abu Dhabi?
            </h2>
            <p className="mt-2 text-slate-300">Get a quick quote on WhatsApp. Our team is ready to help, any time of day.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={quoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              Get a quote
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 font-semibold text-white transition hover:bg-white/10"
              >
                <Phone aria-hidden="true" className="size-5" />
                Call
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main columns */}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
        {/* Brand */}
        <div>
          <p className="text-xl font-bold tracking-tight text-white">{brand}</p>
          {settings?.footer_blurb && <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">{settings.footer_blurb}</p>}
          {hours && (
            <p className="mt-5 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white">
              <span aria-hidden="true" className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
              </span>
              {hours}
            </p>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-3">
              {socials.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white hover:text-slate-950"
                  >
                    {item.icon}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <nav aria-label="Footer navigation">
          <h3 className="text-sm font-semibold uppercase tracking-[.18em] text-white">Quick links</h3>
          <ul className="mt-4 space-y-1">
            <li>
              <Link href="/" className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:translate-x-1 hover:text-white">Home</Link>
            </li>
            <li>
              <Link href="/services" className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:translate-x-1 hover:text-white">Services</Link>
            </li>
            <li>
              <Link href="/about" className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:translate-x-1 hover:text-white">About us</Link>
            </li>
            <li>
              <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:translate-x-1 hover:text-white">Get a quote</a>
            </li>
            {quickLinks.slice(3).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:translate-x-1 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[.18em] text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {phone && (
              <li>
                <a href={`tel:${phone}`} className="flex min-h-11 items-center gap-3 text-slate-400 transition hover:text-white">
                  <Phone aria-hidden="true" className="size-5 shrink-0 text-white" />
                  {phone}
                </a>
              </li>
            )}
            {settings?.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex min-h-11 items-center gap-3 break-all text-slate-400 transition hover:text-white">
                  <Mail aria-hidden="true" className="size-5 shrink-0 text-white" />
                  {settings.email}
                </a>
              </li>
            )}
            {settings?.address_line && (
              <li className="flex items-start gap-3 py-2 text-slate-400">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-white" />
                <span>{settings.address_line}</span>
              </li>
            )}
            {hours && (
              <li className="flex items-center gap-3 py-2 text-slate-400">
                <Clock aria-hidden="true" className="size-5 shrink-0 text-white" />
                <span>{hours}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Route card */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[.18em] text-white">We cover</h3>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <Route aria-hidden="true" className="size-6 text-white" />
            <p className="mt-3 font-semibold text-white">{settings?.core_route_label || "Dubai ⇄ Abu Dhabi"}</p>
            <p className="mt-1 text-sm text-slate-400">Safe, reliable car transport between the two cities.</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {brand}. All rights reserved.</p>
          <a
            href="#top"
            onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-slate-300 transition hover:text-white"
          >
            Back to top
            <ArrowUp aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4V21h3.1Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.9c-1.4.1-2.6-.3-3.8-1.1v5.3c0 3.4-2.4 5.6-5.4 5.6-3 0-5.3-2.3-5.3-5.2 0-3.2 2.7-5.5 6-5v3c-1.7-.4-3 .6-3 2 0 1.2.9 2.1 2.1 2.1 1.3 0 2.2-.8 2.2-2.5V3h2.3Z" />
    </svg>
  );
}