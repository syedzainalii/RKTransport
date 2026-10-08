"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ApiError, apiRequest, type Booking, type BookingRouteAggregate, type Inquiry } from "../../../lib/transport-api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [bookingsByRoute, setBookingsByRoute] = useState<BookingRouteAggregate[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const [bookingRows, inquiryRows, routeRows] = await Promise.all([
        apiRequest<Booking[]>("/admin/bookings"),
        apiRequest<Inquiry[]>("/admin/inquiries"),
        apiRequest<BookingRouteAggregate[]>("/admin/bookings/by-route"),
      ]);
      setBookings(bookingRows);
      setInquiries(inquiryRows);
      setBookingsByRoute(routeRows);
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
          <div><Link href="/" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← View site</Link><h1 className="mt-2 text-3xl font-bold">RK Transport admin</h1></div>
          <div className="flex items-center gap-2 pr-14"><button onClick={logout} className="min-h-11 rounded-xl border border-slate-300 px-4 font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900">Sign out</button></div>
        </header>
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
        {!ready && !error && <p role="status" className="mt-8">Loading secure dashboard…</p>}
        {ready && <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total bookings" value={bookings.length} />
            <Stat label="New bookings" value={bookings.filter((item) => item.status === "new").length} badge />
            <Stat label="Today" value={bookings.filter((item) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date(item.created_at)) === new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date())).length} />
            <Stat label="Confirmed" value={bookings.filter((item) => item.status === "confirmed").length} />
            <Stat label="Completed" value={bookings.filter((item) => item.status === "completed").length} />
            <Stat label="Cancelled" value={bookings.filter((item) => item.status === "cancelled").length} />
            <Stat label="Messages" value={inquiries.length} />
          </section>
          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <Chart title="Bookings over time" data={Array.from({ length: 7 }, (_, index) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - index));
              const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(date);
              return { label: new Intl.DateTimeFormat("en-AE", { day: "numeric", month: "short", timeZone: "Asia/Dubai" }).format(date), total: bookings.filter((item) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date(item.created_at)) === key).length };
            })} />
            <Chart title="Bookings by route" data={bookingsByRoute} />
            <Chart title="Bookings by service" data={["transport", "recovery", "storage"].map((service) => ({ label: service, total: bookings.filter((item) => item.type === service).length }))} />
            <Chart title="Bookings by status" data={["new", "quoted", "confirmed", "in_progress", "completed", "cancelled"].map((status) => ({ label: status.replace("_", " "), total: bookings.filter((item) => item.status === status).length }))} />
          </section>
          <nav aria-label="Admin management" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AdminCard href="/admin/dashboard/bookings" title="Bookings" description="Review requests, update status, and add quotes." />
            <AdminCard href="/admin/dashboard/notifications" title="Notifications" description="View email and WhatsApp delivery attempts; retry failures." />
            <AdminCard href="/admin/dashboard/inquiries" title="Inquiries" description="Read messages and mark follow-up status." />
            <AdminCard href="/admin/dashboard/settings" title="Site settings" description="Edit contact details, route, availability and SEO." />
            <AdminCard href="/admin/dashboard/account" title="Admin account" description="Change the password for your administrator account." />
            <AdminCard href="/admin/dashboard/content" title="Website content" description="Manage service copy, banners, FAQs and options." />
            <AdminCard href="/admin/dashboard/media" title="Media library" description="Upload site photos to the configured image provider and manage alt text." />
          </nav>
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold">Recent bookings</h2>
            {bookings.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700"><th className="py-3 pr-3">Reference</th><th className="py-3 pr-3">Customer</th><th className="py-3 pr-3">Type</th><th className="py-3 pr-3">Status</th></tr></thead>
              <tbody>{bookings.slice(0, 8).map((booking) => <tr key={booking.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-3 pr-3 font-mono">{booking.ref}</td><td className="py-3 pr-3">{booking.customer_name}</td><td className="py-3 pr-3 capitalize">{booking.type}</td><td className="py-3 pr-3 capitalize">{booking.status.replace("_", " ")}</td></tr>)}</tbody>
            </table></div> : <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">There are no bookings yet.</p>}
          </section>
        </>}
      </div>
    </main>
  );
}

function Stat({ label, value, badge = false }: { label: string; value: number; badge?: boolean }) {
  return <div className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-600 dark:text-slate-300">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p>{badge && value > 0 && <span aria-label={`${value} new bookings`} className="absolute right-4 top-4 rounded-full bg-red-700 px-2.5 py-1 text-xs font-bold text-white">{value} new</span>}</div>;
}
function AdminCard({ href, title, description }: { href: string; title: string; description: string }) {
  return <Link href={href} className="min-h-36 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p></Link>;
}

function Chart({ title, data }: { title: string; data: { label: string; total: number }[] }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <h2 className="font-bold">{title}</h2>
    <div className="mt-4 h-56" role="img" aria-label={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="total" name="Bookings" fill="#047857" radius={[6, 6, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </section>;
}
