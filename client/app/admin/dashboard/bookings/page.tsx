"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { apiRequest, type Booking, type BookingVehicle, type Location, type StoragePlan, type VehicleType } from "../../../../lib/transport-api";

const statuses = ["new", "quoted", "confirmed", "in_progress", "completed", "cancelled"];

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationNames, setLocationNames] = useState<Record<number, string>>({});
  const [vehicleTypeNames, setVehicleTypeNames] = useState<Record<number, string>>({});
  const [storagePlanNames, setStoragePlanNames] = useState<Record<number, string>>({});
  const [lookupWarning, setLookupWarning] = useState("");
  const load = () => apiRequest<Booking[]>("/admin/bookings").then(setRows).catch((reason: Error) => setError(reason.message));
  async function loadReferenceNames() {
    try {
      const [locations, vehicleTypes, storagePlans] = await Promise.all([
        apiRequest<Location[]>("/locations"),
        apiRequest<VehicleType[]>("/vehicle-types"),
        apiRequest<StoragePlan[]>("/storage-plans"),
      ]);
      setLocationNames(Object.fromEntries(locations.map((location) => [location.id, location.name])));
      setVehicleTypeNames(Object.fromEntries(vehicleTypes.map((vehicleType) => [vehicleType.id, vehicleType.name])));
      setStoragePlanNames(Object.fromEntries(storagePlans.map((plan) => [plan.id, plan.title])));
      setLookupWarning("");
    } catch {
      setLookupWarning("Some saved selections may appear as IDs because their names could not be loaded.");
    }
  }
  const filteredRows = rows.filter((booking) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || [booking.ref, booking.customer_name, booking.customer_phone, booking.customer_email || ""].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (!statusFilter || booking.status === statusFilter);
  });
  useEffect(() => { apiRequest("/auth/me").then(() => { setAuthorized(true); void loadReferenceNames(); return load(); }).catch((reason: Error) => setError(reason.message)); }, []);

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
    const columns = ["Reference", "Name", "Phone", "Email", "Status", "Pickup", "Drop-off", "Vehicles", "Created"];
    const escapeCell = (value: string | number | null) => {
      const cell = String(value ?? "").replace(/^[=+\-@]/, "'$&");
      return `"${cell.replace(/"/g, '""')}"`;
    };
    const lines = [columns, ...filteredRows.map((booking) => [
      booking.ref,
      booking.customer_name,
      booking.customer_phone,
      booking.customer_email,
      booking.status,
      booking.pickup_address || booking.pickup_location_id,
      booking.dropoff_address || booking.dropoff_location_id,
      booking.vehicles?.length ? booking.vehicles.map(vehicleLabel).join("; ") : [booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(" "),
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
    {lookupWarning && <p role="status" className="mb-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{lookupWarning}</p>}
    {!authorized && <p>Checking admin session…</p>}
    {authorized && <section aria-label="Booking search and filters" className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm font-semibold">Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, reference, phone or email" className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
      <label className="text-sm font-semibold">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label>
      <button type="button" onClick={exportCsv} disabled={filteredRows.length === 0} className="min-h-11 self-end rounded-lg bg-emerald-900 px-4 font-semibold text-white disabled:opacity-50">Export CSV</button>
    </section>}
    {authorized && rows.length === 0 && <p>No bookings have been submitted.</p>}
    {authorized && rows.length > 0 && filteredRows.length === 0 && <p>No bookings match these filters.</p>}
    <div className="space-y-5">{filteredRows.map((booking) => <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{booking.customer_name} <span className="font-mono text-sm text-emerald-800">#{booking.ref}</span>{booking.status === "new" && <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-900">New</span>}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{booking.customer_phone} · {new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(new Date(booking.created_at))} (Asia/Dubai)</p></div><div className="flex flex-wrap gap-2"><a className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700" href={`tel:${booking.customer_phone}`}>Call</a><a className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700" href={`https://wa.me/${booking.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>{booking.customer_email && <a className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700" href={`mailto:${booking.customer_email}`}>Email</a>}</div></div>
      <section aria-label="Customer booking details" className="mt-4 grid gap-3 rounded-xl bg-stone-50 p-4 text-sm dark:bg-slate-950 sm:grid-cols-2">
        <Detail label="Service" value={booking.type} />
        <Detail label="Customer email" value={booking.customer_email || "Not provided"} />
        <Detail label="Pickup" value={booking.pickup_location_id ? locationNames[booking.pickup_location_id] || `Location #${booking.pickup_location_id}` : booking.pickup_address || "Not provided"} />
        {booking.pickup_address && booking.pickup_location_id && <Detail label="Pickup address" value={booking.pickup_address} />}
        <Detail label="Drop-off" value={booking.dropoff_location_id ? locationNames[booking.dropoff_location_id] || `Location #${booking.dropoff_location_id}` : booking.dropoff_address || "Not provided"} />
        {booking.dropoff_address && booking.dropoff_location_id && <Detail label="Drop-off address" value={booking.dropoff_address} />}
        <Detail label="Preferred date and time" value={formatBookingDate(booking.scheduled_at)} />
        {booking.storage_plan_id && <Detail label="Storage option" value={storagePlanNames[booking.storage_plan_id] || `Plan #${booking.storage_plan_id}`} />}
        {booking.storage_start_date && <Detail label="Storage starts" value={booking.storage_start_date} />}
        {booking.storage_end_date && <Detail label="Storage ends" value={booking.storage_end_date} />}
      </section>
      {booking.vehicles?.length ? <section aria-label="Booked cars" className="mt-3 space-y-3">{booking.vehicles.map((vehicle, index) => <div key={`${booking.id}-car-${index}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <div className="flex flex-wrap gap-2">{(vehicle.photo_urls.length ? vehicle.photo_urls : vehicle.photo_url ? [vehicle.photo_url] : []).map((photo, photoIndex) => <a key={photo} href={photo} target="_blank" rel="noreferrer" aria-label={`Open vehicle ${index + 1} photo ${photoIndex + 1}`}><Image src={photo} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} photo ${photoIndex + 1}`} width={120} height={80} unoptimized className="h-20 w-28 rounded-lg object-cover" /></a>)}</div>
        <div><p className="font-semibold">{vehicleLabel(vehicle)}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Type: {vehicleTypeNames[vehicle.vehicle_type_id] || `#${vehicle.vehicle_type_id}`}</p>{vehicle.runs !== null && <p className="text-sm text-slate-600 dark:text-slate-300">Starts and drives: {vehicle.runs ? "Yes" : "No"}</p>}</div>
      </div>)}</section> : (booking.vehicle_make || booking.vehicle_model) && <section aria-label="Booked vehicle" className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950"><p className="font-semibold">{[booking.vehicle_year, booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(" ")}</p>{booking.vehicle_type_id && <p className="mt-1 text-slate-600 dark:text-slate-300">Type: {vehicleTypeNames[booking.vehicle_type_id] || `#${booking.vehicle_type_id}`}</p>}{booking.plate_number && <p className="mt-1 text-slate-600 dark:text-slate-300">Plate: {booking.plate_number}</p>}</section>}
      {booking.notes && <section className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><h3 className="text-sm font-semibold">Customer notes</h3><p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{booking.notes}</p></section>}
      <form onSubmit={(event) => update(event, booking)} className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold">Status<select name="status" defaultValue={booking.status} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-950">{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label>
        <label className="text-sm font-semibold">Quote (AED)<input name="quoted_amount_aed" type="number" min="0" step="0.01" defaultValue={booking.quoted_amount_aed ?? ""} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-950" /></label>
        <label className="text-sm font-semibold">Admin notes<input name="admin_notes" defaultValue={booking.admin_notes ?? ""} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-950" /></label>
        <button disabled={busyId === booking.id} className="min-h-11 rounded-lg bg-emerald-900 px-4 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:col-span-3">{busyId === booking.id ? "Saving…" : "Save booking"}</button>
      </form>
    </article>)}</div>
  </AdminPage>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="font-semibold text-slate-700 dark:text-slate-200">{label}</p><p className="mt-0.5 break-words text-slate-600 dark:text-slate-300">{value}</p></div>;
}

function formatBookingDate(value: string | null): string {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(date)} (Asia/Dubai)`;
}

function vehicleLabel(vehicle: BookingVehicle): string {
  return [
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" "),
    vehicle.colour,
    vehicle.plate ? `plate ${vehicle.plate}` : null,
    vehicle.runs === false ? "does not start" : null,
  ].filter(Boolean).join(", ");
}

function AdminPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6"><div className="mx-auto max-w-5xl"><Link href="/admin/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link><h1 className="my-5 text-3xl font-bold">{title}</h1>{children}</div></main>;
}