"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ApiError, apiRequest, type Inquiry } from "../../../lib/transport-api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const inquiryRows = await apiRequest<Inquiry[]>("/admin/inquiries");
      setInquiries(inquiryRows);
      setReady(true);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) router.replace("/admin");
      else setError(reason instanceof Error ? reason.message : "Unable to refresh dashboard.");
    }
  }, [router]);

  useEffect(() => {
    apiRequest("/auth/me")
      .then(() => load())
      .catch((reason: Error) => {
        if (reason instanceof ApiError && reason.status === 401) router.replace("/admin");
        else setError(reason.message);
      });
    const interval = window.setInterval(() => { void load(); }, 15_000);
    return () => window.clearInterval(interval);
  }, [load, router]);

  async function logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      router.replace("/admin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign out.");
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><Link href="/" className="text-sm font-semibold text-slate-800 hover:underline dark:text-slate-300">← View site</Link><h1 className="mt-2 text-3xl font-bold">RK Transport admin</h1></div>
          <div className="flex items-center gap-2 pr-14"><button onClick={logout} className="min-h-11 rounded-xl border border-slate-300 px-4 font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900">Sign out</button></div>
        </header>
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
        {!ready && !error && <p role="status" className="mt-8">Loading secure dashboard…</p>}
        {ready && <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Messages" value={inquiries.length} />
          </section>
          <div className="mt-8 space-y-8">
            <ManagementGroup title="Dashboard">
              <AdminCard href="/admin/dashboard/inquiries" title="Enquiries" description="Read customer messages and mark follow-up status." />
              <AdminCard href="/admin/dashboard/notifications" title="Notifications" description="View and retry email or WhatsApp delivery attempts." />
            </ManagementGroup>
            <ManagementGroup title="Website pages">
              <AdminCard href="/admin/dashboard/content/banners" title="Homepage banners" description="Edit and arrange the home page slideshow." />
              <AdminCard href="/admin/dashboard/settings#homepage-section-backgrounds" title="Homepage section backgrounds" description="Upload or remove backgrounds for the Packages, Car Features, Why Choose Us, and FAQ sections." />
              <AdminCard href="/admin/dashboard/content/services" title="Services" description="Manage service pages, pictures, and Google descriptions." />
              <AdminCard href="/admin/dashboard/content/cars" title="Cars and fleet" description="Manage fleet vehicles, images, passenger capacity, and feature chips." />
              <AdminCard href="/admin/dashboard/content/locations" title="Locations" description="Manage pickup and drop-off locations, hubs, and map coordinates." />
              <AdminCard href="/admin/dashboard/content/about" title="About page" description="Update your story, numbers, and reasons customers choose you." />
              <AdminCard href="/admin/dashboard/content/faqs" title="FAQs" description="Add answers to common customer questions." />
              <AdminCard href="/admin/dashboard/content/testimonials" title="Testimonials" description="Manage customer reviews and ratings." />
            </ManagementGroup>
            <ManagementGroup title="Settings">
              <AdminCard href="/admin/dashboard/settings" title="Business settings" description="Update contact information, hours, logos, and admin notifications." />
              <AdminCard href="/admin/dashboard/account" title="My account" description="Change the administrator password." />
            </ManagementGroup>
          </div>
        </>}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-600 dark:text-slate-300">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}
function AdminCard({ href, title, description }: { href: string; title: string; description: string }) {
  return <Link href={href} className="min-h-36 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-700 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p></Link>;
}
function ManagementGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section><h2 className="mb-3 text-xl font-bold">{title}</h2><nav aria-label={title} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</nav></section>;
}
