"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";
import { apiRequest, type SiteSettings } from "../../lib/transport-api";
import ThemeToggle from "./theme-toggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiRequest<SiteSettings>("/settings"),
  });
  const { resolvedTheme } = useTheme();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  const links = [
    ["Home", "/"],
    ["Services", "/services"],
    ["Vehicles", "/cars"],
    ["Location", "/routes"],
    ["About us", "/about"],
    ["Review", "/review"],
  ];

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 32);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMenuPath(null));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  const transparent = isHome && !scrolled;
  const hours = settings
    ? settings.available_24_7 ? settings.hours_label : null
    : "Available 24/7";
  const cta = settings?.header_cta_label || "Get a quote";
  const href = settings?.header_cta_href || "/review";
  const safeCtaHref = href.startsWith("/") && !href.startsWith("//") && href !== "/quote" && href !== "/track" ? href : "/review";
  const logo = transparent || resolvedTheme === "dark"
    ? settings?.logo_dark_url || settings?.logo_url
    : settings?.logo_url;
  
  const isActive = (path: string) => path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      <header className={`${isHome ? "fixed inset-x-0 top-0" : "sticky top-0"} z-40 transition-[background-color,border-color,box-shadow] duration-300 ${transparent ? "border-b border-transparent bg-transparent shadow-none" : "border-b border-slate-200/80 bg-stone-50/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"}`}>
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-8">
          {/* Logo on far left */}
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`flex min-h-11 items-center gap-3 font-bold tracking-tight ${transparent ? "text-white" : "text-slate-900 dark:text-white"}`}>
            {logo ? (
              <Image src={logo} alt="" width={144} height={48} unoptimized className="h-9 w-auto object-contain" />
            ) : (
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-slate-900 text-sm text-white">RK</span>
            )}
            <span className="text-sm sm:text-base">{settings?.brand_name || "RK Transport"}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden items-center gap-2 sm:gap-3 md:flex">
            {links.map(([label, path]) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    transparent
                      ? "text-white hover:bg-white/15 hover:text-white"
                      : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  } ${
                    active
                      ? transparent
                        ? "bg-white/25 font-semibold text-white shadow-sm backdrop-blur-sm"
                        : "bg-slate-900 font-semibold text-white dark:bg-white dark:text-slate-950"
                      : ""
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side items on desktop */}
          <div className="hidden items-center gap-3 md:flex">
            {hours && <span className={`text-xs font-semibold ${transparent ? "text-white" : "text-slate-800 dark:text-slate-300"}`}>{hours}</span>}
            <ThemeToggle transparent={transparent} />
            <Link href={safeCtaHref} className="inline-flex min-h-11 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              {cta}
            </Link>
          </div>

          {hours && <span className={`hidden max-[767px]:inline text-[11px] font-semibold ${transparent ? "text-white" : "text-slate-800 dark:text-slate-300"}`}>{hours}</span>}
          
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className={`inline-grid size-11 place-items-center rounded-lg border transition-colors md:hidden ${transparent ? "border-white/50 text-white hover:bg-white/10" : "border-slate-300 text-slate-900 dark:border-slate-700 dark:text-white"}`}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(menuOpen ? null : pathname)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Backdrop Overlay */}
      {menuOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setMenuPath(null)}
        />
      )}

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <nav aria-label="Mobile navigation" className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-stone-50/95 px-6 py-6 text-slate-900 shadow-2xl backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-950/95 dark:text-white">
          <div className="flex flex-col gap-2">
            {links.map(([label, path]) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuPath(null)}
                  className={`flex min-h-12 items-center justify-between rounded-2xl px-4 text-base font-medium transition ${
                    active
                      ? "bg-slate-900 font-semibold text-white dark:bg-white dark:text-slate-950"
                      : "hover:bg-slate-200/60 dark:hover:bg-slate-900"
                  }`}
                >
                  <span>{label}</span>
                  <ArrowUpRight aria-hidden="true" className="size-4 opacity-50" />
                </Link>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-200/80 pt-6 dark:border-slate-800">
            {hours && (
              <div className="flex items-center justify-between px-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span>Status</span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  {hours}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href={safeCtaHref}
              onClick={() => setMenuPath(null)}
              className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {cta}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}