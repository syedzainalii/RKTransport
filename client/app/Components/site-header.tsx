"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
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
  const cta = settings?.header_cta_label || "Our Reviews";
  const href = settings?.header_cta_href || "/review";
  const safeCtaHref = href.startsWith("/") && !href.startsWith("//") && href !== "/quote" && href !== "/track" ? href : "/review";
  const logo = transparent || resolvedTheme === "dark"
    ? settings?.logo_dark_url || settings?.logo_url
    : settings?.logo_url;
  const navClass = transparent ? "text-white hover:text-white/80" : "text-slate-700 hover:text-slate-800 dark:text-slate-200 dark:hover:text-white";
  const isActive = (path: string) => path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className={`${isHome ? "fixed inset-x-0 top-0" : "sticky top-0"} z-40 transition-[background-color,border-color,box-shadow] duration-300 ${transparent ? "border-b border-transparent bg-transparent shadow-none" : "border-b border-slate-200/80 bg-stone-50/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"}`}>
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`flex min-h-11 items-center gap-3 font-bold tracking-tight ${transparent ? "text-white" : "text-slate-900 dark:text-white"}`}>
          {logo ? (
            <Image src={logo} alt="" width={144} height={48} unoptimized className="h-9 w-auto object-contain" />
          ) : (
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-slate-900 text-sm text-white">RK</span>
          )}
          <span className="text-sm sm:text-base">{settings?.brand_name || "RK Transport"}</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {links.map(([label, path]) => (
            <Link key={path} href={path} aria-current={isActive(path) ? "page" : undefined} className={`min-h-11 content-center text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-700 ${navClass} ${isActive(path) ? "underline decoration-2 underline-offset-8" : ""}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {hours && <span className={`text-xs font-semibold ${transparent ? "text-white" : "text-slate-800 dark:text-slate-300"}`}>{hours}</span>}
          <ThemeToggle transparent={transparent} />
          <Link href={safeCtaHref} className="inline-flex min-h-11 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">
            {cta}
          </Link>
        </div>
        {hours && <span className={`hidden max-[767px]:inline text-[11px] font-semibold ${transparent ? "text-white" : "text-slate-800 dark:text-slate-300"}`}>{hours}</span>}
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
      {menuOpen && (
        <nav aria-label="Mobile navigation" className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-stone-50 px-4 py-3 text-slate-900 shadow-xl md:hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          {links.map(([label, path]) => (
            <Link key={path} href={path} aria-current={isActive(path) ? "page" : undefined} onClick={() => setMenuPath(null)} className={`flex min-h-12 items-center border-b border-slate-100 text-sm font-medium dark:border-slate-800 ${isActive(path) ? "font-bold text-slate-800 dark:text-slate-300" : ""}`}>
              {label}
            </Link>
          ))}
          {hours && <p className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-300">{hours}</p>}
          <div className="flex min-h-12 items-center"><ThemeToggle /></div>
        </nav>
      )}
    </header>
  );
}