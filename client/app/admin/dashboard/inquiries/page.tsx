"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, type Inquiry } from "../../../../lib/transport-api";

export default function AdminInquiriesPage() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");
  const load = () => apiRequest<Inquiry[]>("/admin/inquiries").then(setRows).catch((reason: Error) => setError(reason.message));
  useEffect(() => { apiRequest("/auth/me").then(load).catch((reason: Error) => setError(reason.message)); }, []);

  async function updateStatus(id: number, status: string) {
    setError("");
    try {
      await apiRequest(`/admin/inquiries/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update inquiry.");
    }
  }
  return <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6"><div className="mx-auto max-w-5xl"><Link href="/admin/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link><h1 className="my-5 text-3xl font-bold">Inquiries</h1>{error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}{!rows.length ? <p>No inquiries have been received.</p> : <div className="space-y-4">{rows.map((row) => <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">{row.name}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{row.phone}{row.email ? ` · ${row.email}` : ""}</p></div><label className="text-sm font-semibold">Status<select aria-label={`Status for inquiry from ${row.name}`} value={["new", "read"].includes(row.status) ? row.status : ""} onChange={(event) => event.target.value && void updateStatus(row.id, event.target.value)} className="ml-2 min-h-11 rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-950"><option value="">Choose a status</option><option value="new">New</option><option value="read">Read</option></select></label></div><p className="mt-4 font-semibold">{row.subject}</p><p className="mt-1 whitespace-pre-line text-slate-700 dark:text-slate-200">{row.message}</p><p className="mt-3 text-xs text-slate-500">{new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(new Date(row.created_at))} (Asia/Dubai)</p></article>)}</div>}</div></main>;
}
