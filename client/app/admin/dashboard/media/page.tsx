"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest, isImageOptimizable, type MediaItem } from "../../../../lib/transport-api";

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => apiRequest<MediaItem[]>("/admin/media").then(setItems);
  useEffect(() => {
    apiRequest("/auth/me").then(load).catch((reason: Error) => setError(reason.message));
  }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const data = new FormData(event.currentTarget);
    try {
      const item = await apiRequest<MediaItem>("/admin/media", { method: "POST", body: data });
      setNotice(`Uploaded ${item.filename || "image"}. Image URL: ${item.url}`);
      event.currentTarget.reset();
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm("Remove this media record? The hosted image itself may remain in the storage provider.")) return;
    try {
      await apiRequest(`/admin/media/${item.id}`, { method: "DELETE" });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete the media record.");
    }
  }

  return <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6"><div className="mx-auto max-w-6xl">
    <Link href="/admin/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link>
    <h1 className="my-5 text-3xl font-bold">Media library</h1>
    <form onSubmit={upload} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
      <label className="text-sm font-semibold">Image file<input name="file" type="file" accept="image/jpeg,image/png,image/gif,image/webp" required className="mt-2 block min-h-11 w-full text-sm" /></label>
      <label className="text-sm font-semibold">Folder<input name="folder" defaultValue="general" maxLength={80} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Alternative text<input name="alt" maxLength={255} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{error}</p>}
      {notice && <p role="status" className="break-all rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 sm:col-span-2">{notice}</p>}
      <button disabled={busy} className="min-h-12 rounded-xl bg-emerald-900 px-5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:col-span-2">{busy ? "Uploading…" : "Upload image"}</button>
    </form>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800"><Image src={item.url} alt={item.alt || ""} fill unoptimized={!isImageOptimizable(item.url)} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>
      <div className="p-4"><p className="truncate text-sm font-semibold">{item.filename || "Uploaded image"}</p><p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{item.url}</p><p className="mt-2 text-xs text-slate-500">Alt: {item.alt || "Not set"}</p><button onClick={() => remove(item)} className="mt-3 min-h-11 rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-800">Delete media record</button></div>
    </article>)}</div>
  </div></main>;
}
