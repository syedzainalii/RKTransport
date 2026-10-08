"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import ThemeToggle from "../Components/theme-toggle";

const groups = [
  { title: "Dashboard", links: [["Bookings", "/admin/dashboard/bookings"], ["Enquiries", "/admin/dashboard/inquiries"], ["Notifications", "/admin/dashboard/notifications"]] },
  { title: "Website pages", links: [["Homepage banners", "/admin/dashboard/content/banners"], ["Services", "/admin/dashboard/content/services"], ["About page", "/admin/dashboard/content/about"], ["FAQs", "/admin/dashboard/content/faqs"], ["Testimonials", "/admin/dashboard/content/testimonials"]] },
  { title: "Booking options", links: [["Locations", "/admin/dashboard/content/locations"], ["Routes and prices", "/admin/dashboard/content/routes"], ["Vehicle types", "/admin/dashboard/content/vehicles"], ["Storage plans", "/admin/dashboard/content/storage"], ["Booking availability", "/admin/dashboard/content/availability"]] },
  { title: "Settings", links: [["Business settings", "/admin/dashboard/settings"], ["My account", "/admin/dashboard/account"]] },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLogin = pathname === "/admin" || pathname === "/login";
  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen md:pl-64">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 overflow-y-auto border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:block">
        <Link href="/admin/dashboard" className="mb-6 block min-h-12 content-center text-lg font-bold">RK Transport admin</Link>
        <Navigation pathname={pathname} />
      </aside>
      <div className="fixed left-3 top-3 z-[60] flex gap-2 md:hidden">
        <button type="button" aria-expanded={menuOpen} aria-label="Open admin menu" onClick={() => setMenuOpen((open) => !open)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 font-semibold dark:border-slate-700 dark:bg-slate-900">Menu</button>
        <ThemeToggle />
      </div>
      {menuOpen && <div className="fixed inset-0 z-50 bg-white p-4 pt-16 dark:bg-slate-950 md:hidden"><Navigation pathname={pathname} onNavigate={() => setMenuOpen(false)} /></div>}
      <div className="fixed right-3 top-3 z-[60] hidden md:block"><ThemeToggle /></div>
      {children}
    </div>
  );
}

function Navigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <nav aria-label="Admin navigation" className="space-y-5">
    {groups.map((group) => <section key={group.title}>
      <h2 className="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-slate-500">{group.title}</h2>
      <ul className="space-y-1">{group.links.map(([label, href]) => <li key={href}>
        <Link href={href} onClick={onNavigate} aria-current={pathname === href ? "page" : undefined} className={`flex min-h-11 items-center rounded-lg px-3 text-sm font-medium ${pathname === href ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-900 dark:text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{label}</Link>
      </li>)}</ul>
    </section>)}
  </nav>;
}
