"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiRequest, type NotificationLog } from "../../../../lib/transport-api";

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<NotificationLog[]>([]);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState<number | null>(null);
  const load = useCallback(async () => {
    try {
      setRows(await apiRequest<NotificationLog[]>("/admin/notifications"));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load notification history.");
    }
  }, []);

  useEffect(() => {
    apiRequest("/auth/me").then(load).catch((reason: Error) => setError(reason.message));
    const interval = window.setInterval(load, 15_000);
    return () => window.clearInterval(interval);
  }, [load]);

  async function retry(id: number) {
    setRetrying(id);
    setError("");
    try {
      await apiRequest(`/admin/notifications/${id}/retry`, { method: "POST" });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to retry notification.");
    } finally {
      setRetrying(null);
    }
  }

  return <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link>
      <h1 className="my-5 text-3xl font-bold">Notification history</h1>
      <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">Delivery attempts refresh automatically. Failed attempts can be retried here.</p>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {rows.length === 0 ? <p className="rounded-2xl bg-white p-5 dark:bg-slate-900">No notification attempts have been recorded.</p> : (
        <div className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold capitalize">{row.channel} · {row.event_type.replaceAll("_", " ")}</h2>
              <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">To {row.recipient} · {row.entity_type} #{row.entity_id} · {row.attempts} attempt(s)</p>
              <p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(new Date(row.updated_at))} (Asia/Dubai)</p>
              {row.last_error && <p className="mt-2 break-words rounded-lg bg-red-50 p-3 text-sm text-red-900">{row.last_error}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${row.status === "sent" ? "bg-emerald-100 text-emerald-900" : row.status === "failed" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"}`}>{row.status}</span>
              {row.status === "failed" && <button onClick={() => retry(row.id)} disabled={retrying === row.id} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-semibold disabled:opacity-60 dark:border-slate-700">{retrying === row.id ? "Retrying…" : "Retry"}</button>}
            </div>
          </div>
        </article>)}</div>
      )}
    </div>
  </main>;
}
