"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest, type Booking } from "../../../../lib/transport-api";

const statuses = ["new", "quoted", "confirmed", "in_progress", "completed", "cancelled"];

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const load = () => apiRequest<Booking[]>("/admin/bookings").then(setRows).catch((reason: Error) => setError(reason.message));
  const filteredRows = rows.filter((booking) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [booking.ref, booking.customer_name, booking.customer_phone, booking.customer_email || ""].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (!serviceFilter || booking.type === serviceFilter) && (!statusFilter || booking.status === statusFilter);
  });
  useEffect(() => { apiRequest("/auth/me").then(() => { setAuthorized(true); return load(); }).catch((reason: Error) => setError(reason.message)); }, []);

  async function update(event: FormEvent<HTMLFormElement>, booking: Booking) {
    event.preventDefault();
    setBusyId(booking.id);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await apiRequest(`/admin/bookings/${booking.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: data.get("status"),
          quoted_amount_aed: data.get("quoted_amount_aed") || null,
          admin_notes: data.get("admin_notes") || null,
        }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update booking.");
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const columns = ["Reference", "Name", "Phone", "Email", "Service", "Status", "Pickup", "Drop-off", "Vehicle", "Created"];
    const escapeCell = (value: string | number | null) => {
      const cell = String(value ?? "").replace(/^[=+\-@]/, "'$&");
      return `"${cell.replace(/"/g, '""')}"`;
    };
    const lines = [columns, ...filteredRows.map((booking) => [
      booking.ref,
      booking.customer_name,
      booking.customer_phone,
      booking.customer_email,
      booking.type,
      booking.status,
      booking.pickup_address || booking.pickup_location_id,
      booking.dropoff_address || booking.dropoff_location_id,
      [booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(" "),
      booking.created_at,
    ])].map((row) => row.map(escapeCell).join(","));
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rk-transport-bookings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <AdminPage title="Bookings">
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {!authorized && <p>Checking admin session…</p>}
    {authorized && <section aria-label="Booking search and filters" className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm font-semibold">Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, reference, phone or email" className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
      <label className="text-sm font-semibold">Service<select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">All services</option>{["transport", "recovery", "storage"].map((service) => <option key={service} value={service}>{service}</option>)}</select></label>
      <label className="text-sm font-semibold">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label>
      <button type="button" onClick={exportCsv} disabled={filteredRows.length === 0} className="min-h-11 self-end rounded-lg bg-emerald-900 px-4 font-semibold text-white disabled:opacity-50">Export CSV</button>
    </section>}
    {authorized && rows.length === 0 && <p>No bookings have been submitted.</p>}
    {authorized && rows.length > 0 && filteredRows.length === 0 && <p>No bookings match these filters.</p>}
    <div className="space-y-5">{filteredRows.map((booking) => <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{booking.customer_name} <span className="font-mono text-sm text-emerald-800">#{booking.ref}</span>{booking.status === "new" && <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-900">New</span>}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{booking.customer_phone} · {booking.type} · {new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(new Date(booking.created_at))} (Asia/Dubai)</p></div><div className="flex flex-wrap gap-2"><a className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700" href={`tel:${booking.customer_phone}`}>Call</a><a className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700" href={`https://wa.me/${booking.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>{booking.customer_email && <a className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700" href={`mailto:${booking.customer_email}`}>Email</a>}</div></div>
      <p className="mt-3 text-sm">{booking.pickup_address || (booking.pickup_location_id ? `Location #${booking.pickup_location_id}` : "")} → {booking.dropoff_address || (booking.dropoff_location_id ? `Location #${booking.dropoff_location_id}` : "Location not provided")}{booking.vehicle_make || booking.vehicle_model ? ` · ${[booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(" ")}` : ""}</p>
      {booking.notes && <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{booking.notes}</p>}
      <form onSubmit={(event) => update(event, booking)} className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold">Status<select name="status" defaultValue={booking.status} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-950">{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label>
        <label className="text-sm font-semibold">Quote (AED)<input name="quoted_amount_aed" type="number" min="0" step="0.01" defaultValue={booking.quoted_amount_aed ?? ""} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-950" /></label>
        <label className="text-sm font-semibold">Admin notes<input name="admin_notes" defaultValue={booking.admin_notes ?? ""} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-950" /></label>
        <button disabled={busyId === booking.id} className="min-h-11 rounded-lg bg-emerald-900 px-4 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:col-span-3">{busyId === booking.id ? "Saving…" : "Save booking"}</button>
      </form>
    </article>)}</div>
  </AdminPage>;
}

function AdminPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6"><div className="mx-auto max-w-5xl"><Link href="/admin/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link><h1 className="my-5 text-3xl font-bold">{title}</h1>{children}</div></main>;
}
