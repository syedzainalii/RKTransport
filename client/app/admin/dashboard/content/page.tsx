"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "../../../../lib/transport-api";

type EditableRow = Record<string, unknown> & { id?: number };
type ContentType = { label: string; path: string; template: EditableRow[] };

const collections: ContentType[] = [
  { label: "Hero banners", path: "/hero-banners", template: [{ title: "", subtitle: "", description: "", badge_text: "", button_text: "", button_link: "/quote", image_url: "", image_alt: "", sort_order: 0, is_active: true }] },
  { label: "Services", path: "/services", template: [{ title: "", short_description: "", detailed_description: "", features: [], image_url: "", image_alt: "", gallery: [], icon: "", category: "transport", sort_order: 0, is_active: true }] },
  { label: "Locations", path: "/locations", template: [{ name: "", emirate: "", address: "", lat: null, lng: null, is_hub: false, notes: "", sort_order: 0, is_active: true }] },
  { label: "Routes", path: "/routes", template: [{ origin_location_id: 1, destination_location_id: 2, title: "", is_core: false, base_price_aed: null, eta_minutes: null, is_active: true, sort_order: 0 }] },
  { label: "Vehicle types", path: "/vehicle-types", template: [{ name: "", description: "", image_url: "", image_alt: "", surcharge_aed: 0, sort_order: 0, is_active: true }] },
  { label: "Storage plans", path: "/storage-plans", template: [{ title: "", description: "", billing_period: "month", price_aed: 0, features: [], covered: true, image_url: "", image_alt: "", sort_order: 0, is_active: true }] },
  { label: "FAQs", path: "/faqs", template: [{ question: "", answer: "", sort_order: 0, is_active: true }] },
  { label: "Testimonials", path: "/testimonials", template: [{ customer_name: "", quote: "", rating: 5, vehicle_note: "", is_active: true, sort_order: 0 }] },
  { label: "Page copy", path: "/page-copy", template: [{ key: "", value: "" }] },
  { label: "About", path: "/about", template: [{ title: "", subtitle: "", description: "", mission: "", vision: "", values: [], images: [], stats: [], story_image_side: "left", why_choose_us: [] }] },
];

function endpoints(content: ContentType) {
  if (content.path === "/routes" || content.path === "/about") {
    return { list: `/admin${content.path}`, create: `/admin${content.path}`, item: (id: number) => `/admin${content.path}/${id}` };
  }
  return { list: `/admin${content.path}`, create: `/admin${content.path}`, item: (id: number) => `/admin${content.path}/${id}` };
}

export default function AdminContentPage() {
  const [selected, setSelected] = useState(collections[0]);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function loadContent(content: ContentType) {
    setSelected(content);
    setEditing(null);
    setError("");
    apiRequest<EditableRow[]>(endpoints(content).list)
      .then(setRows)
      .catch((reason: Error) => setError(reason.message));
  }

  useEffect(() => {
    apiRequest("/auth/me").then(() => loadContent(selected)).catch((reason: Error) => setError(reason.message));
  // Initial authorization and collection load are intentionally one-time.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function beginEdit(row?: EditableRow) {
    const value = row ? { ...row } : { ...selected.template[0] };
    if (row) delete value.id;
    setEditing(row?.id ?? "new");
    setDraft(JSON.stringify(value, null, 2));
    setError("");
    setNotice("");
  }

  async function save() {
    let value: EditableRow;
    try {
      value = JSON.parse(draft) as EditableRow;
      if (!value || Array.isArray(value) || typeof value !== "object") throw new Error("Enter a JSON object.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invalid JSON.");
      return;
    }
    const routes = endpoints(selected);
    try {
      await apiRequest(editing === "new" ? routes.create : routes.item(Number(editing)), {
        method: editing === "new" ? "POST" : "PUT",
        body: JSON.stringify(value),
      });
      setNotice("Content saved.");
      setEditing(null);
      loadContent(selected);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save content.");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this content item?")) return;
    try {
      await apiRequest(endpoints(selected).item(id), { method: "DELETE" });
      setNotice("Content deleted.");
      loadContent(selected);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete content.");
    }
  }

  return <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6"><div className="mx-auto max-w-6xl">
    <Link href="/admin/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link>
    <div className="my-5 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">Website content</h1><button onClick={() => beginEdit()} className="min-h-11 rounded-xl bg-emerald-900 px-4 font-semibold text-white hover:bg-emerald-800">Add item</button></div>
    <label className="mb-5 block max-w-md text-sm font-semibold">Content collection<select value={selected.path} onChange={(event) => { const content = collections.find((item) => item.path === event.target.value); if (content) loadContent(content); }} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">{collections.map((item) => <option key={item.path} value={item.path}>{item.label}</option>)}</select></label>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    {editing !== null && <section className="mb-6 rounded-2xl border border-emerald-800/30 bg-white p-5 dark:bg-slate-900"><h2 className="font-bold">{editing === "new" ? "New item" : "Edit item"} · {selected.label}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Edit the content as JSON. Routes use origin_location_id, destination_location_id, and base_price_aed; locations set pickup and drop-off choices; vehicle types support surcharge_aed; storage plans use price_aed. Image URLs and alt text are stored with the content.</p><label htmlFor="content-json" className="sr-only">Content JSON editor</label><textarea id="content-json" value={draft} onChange={(event) => setDraft(event.target.value)} rows={16} spellCheck={false} className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-sm text-white dark:border-slate-700" /><div className="mt-4 flex flex-wrap gap-3"><button onClick={save} className="min-h-11 rounded-lg bg-emerald-900 px-4 font-semibold text-white">Save</button><button onClick={() => setEditing(null)} className="min-h-11 rounded-lg border border-slate-300 px-4 font-semibold dark:border-slate-700">Cancel</button></div></section>}
    {rows.length ? <div className="grid gap-3 sm:grid-cols-2">{rows.map((row, index) => <article key={row.id ?? index} className="flex min-h-24 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="min-w-0"><h2 className="truncate font-semibold">{String(row.title || row.name || row.question || row.key || row.customer_name || `Item ${row.id ?? index + 1}`)}</h2><p className="mt-1 truncate text-xs text-slate-500">{String(row.slug || row.value || row.short_description || row.description || "")}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => beginEdit(row)} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700">Edit</button>{row.id && <button onClick={() => remove(row.id!)} className="min-h-11 rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-800">Delete</button>}</div></article>)}</div> : <p className="rounded-xl bg-white p-5 dark:bg-slate-900">No items in this collection.</p>}
  </div></main>;
}
