"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiRequest, type BookingVehicle } from "../../lib/transport-api";

type TrackedBooking = { ref: string; type: string; status: string; scheduled_at: string | null; created_at: string; vehicles: BookingVehicle[] | null; vehicle_make: string | null; vehicle_model: string | null; vehicle_year: number | null; plate_number: string | null };

export default function TrackBookingPage() {
  const [booking, setBooking] = useState<TrackedBooking | null>(null);
  const [error, setError] = useState("");
  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBooking(null);
    const data = new FormData(event.currentTarget);
    try {
      const ref = encodeURIComponent(String(data.get("ref") || "").trim());
      setBooking(await apiRequest<TrackedBooking>(`/bookings/track/${ref}`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to find this booking.");
    }
  }
  return <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-20">
    <h1 className="text-4xl font-bold">Track your booking</h1>
    <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Enter the reference supplied when you submitted your request.</p>
    <form onSubmit={track} className="mt-7 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="booking-ref">Booking reference</label><input id="booking-ref" name="ref" required className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-3 uppercase dark:border-slate-700 dark:bg-slate-900" /><button className="min-h-12 rounded-xl bg-emerald-900 px-6 font-semibold text-white hover:bg-emerald-800">Track</button></form>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {booking && <section aria-live="polite" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold">Booking {booking.ref}</h2><p className="mt-2 capitalize">{booking.type} · {booking.status.replace("_", " ")}</p>{booking.scheduled_at && <p className="mt-1">Scheduled: {new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(new Date(booking.scheduled_at))} (Asia/Dubai)</p>}{booking.vehicles?.length ? <div className="mt-4"><h3 className="font-semibold">Your car{booking.vehicles.length > 1 ? "s" : ""}</h3><ul className="mt-2 space-y-2">{booking.vehicles.map((vehicle, index) => <li key={`${booking.ref}-${index}`} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">{vehicle.year} {vehicle.make} {vehicle.model}{vehicle.colour ? `, ${vehicle.colour}` : ""}{vehicle.plate ? `, plate ${vehicle.plate}` : ""}{vehicle.runs === false ? ", does not start" : ""}</li>)}</ul></div> : (booking.vehicle_make || booking.vehicle_model) && <p className="mt-4">{[booking.vehicle_year, booking.vehicle_make, booking.vehicle_model, booking.plate_number].filter(Boolean).join(" ")}</p>}</section>}
    <Link href="/quote" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800 underline dark:text-emerald-300">Request transport or recovery</Link>
  </main>;
}
