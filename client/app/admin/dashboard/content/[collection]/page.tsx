"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, CarFront, CircleCheck, Clock3, Gauge, Headset, Heart, MapPin, ShieldCheck, Star, Truck, Wrench } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { apiRequest, type About, type AdminSiteSettings, type PageCopy } from "../../../../../lib/transport-api";
import ImageUpload, { type UploadedImage } from "../../components/image-upload";
import useUnsavedChanges from "../../components/use-unsaved-changes";

type Row = Record<string, unknown> & { id?: number };
type Field = { key: string; label: string; help?: string; kind?: "text" | "textarea" | "rich" | "number" | "select" | "boolean" | "single-image" | "multi-image"; options?: [string, string][]; required?: boolean; min?: number; max?: number };
type Collection = { title: string; path: string; singular: string; fields: Field[]; defaults: Row; view?: (row: Row, rows: Row[]) => string; advanced?: Field[] };

const pageDestinations: [string, string][] = [
  ["/quote", "Book now"], ["/services", "Services"], ["/contact", "Contact"], ["/about", "About"], ["/storage", "Storage"], ["/", "Home"],
];
const cityOptions: [string, string][] = [["Dubai", "Dubai"], ["Abu Dhabi", "Abu Dhabi"]];
const serviceTypes: [string, string][] = [["transport", "Car transport"], ["recovery", "Recovery"], ["storage", "Storage"]];

const collections: Record<string, Collection> = {
  banners: { title: "Homepage banners", singular: "banner", path: "/hero-banners", defaults: { title: "", subtitle: "", description: "", badge_text: "", button_text: "Book now", button_link: "/quote", button_custom_link: "", image_url: "", image_alt: "", sort_order: 0, is_active: true }, fields: [
    { key: "title", label: "Heading", help: "The big text on the banner.", required: true },
    { key: "subtitle", label: "Sub-heading" },
    { key: "description", label: "Short description", kind: "textarea", help: "Optional supporting text." },
    { key: "badge_text", label: "Small badge text", help: 'For example, "Open 24/7".' },
    { key: "button_text", label: "Button text", required: true },
    { key: "button_link", label: "Button destination", kind: "select", options: [...pageDestinations, ["custom", "Custom link"]] },
    { key: "image_url", label: "Banner picture", kind: "single-image", help: "Recommended size: 1920 × 900 pixels." },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
  services: { title: "Services", singular: "service", path: "/services", defaults: { title: "", short_description: "", detailed_description: "", starting_price_note: "", features: [], gallery: [], image_url: "", image_alt: "", icon: "Truck", category: "transport", seo_title: "", seo_description: "", sort_order: 0, is_active: true }, fields: [
    { key: "title", label: "Service name", required: true },
    { key: "short_description", label: "Short summary", kind: "textarea", help: "One or two lines shown on service cards.", required: true },
    { key: "detailed_description", label: "Full description", kind: "rich", help: "Use the buttons for bold text, bullet points, and links." },
    { key: "starting_price_note", label: "Starting price note", help: 'Optional, for example "From AED 350".' },
    { key: "category", label: "Service type", kind: "select", options: serviceTypes },
    { key: "image_url", label: "Main picture", kind: "single-image" },
    { key: "gallery", label: "Extra pictures", kind: "multi-image" },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ], advanced: [
    { key: "slug", label: "Page address", help: "Created automatically from the service name." },
    { key: "seo_title", label: "Page title for Google" },
    { key: "seo_description", label: "Description for Google", kind: "textarea" },
  ] },
  locations: { title: "Locations", singular: "location", path: "/locations", defaults: { name: "", emirate: "Dubai", pickup_enabled: true, dropoff_enabled: true, is_hub: true, sort_order: 0, is_active: true }, fields: [
    { key: "name", label: "Location name", required: true },
    { key: "emirate", label: "City", kind: "select", options: cityOptions },
    { key: "pickup_enabled", label: "Can be used for pickup", kind: "boolean" },
    { key: "dropoff_enabled", label: "Can be used for drop-off", kind: "boolean" },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
  routes: { title: "Routes and prices", singular: "route", path: "/routes", defaults: { origin_location_id: "", destination_location_id: "", title: "", is_core: true, base_price_aed: "", eta_minutes: "", is_active: true, sort_order: 0 }, fields: [
    { key: "origin_location_id", label: "From", kind: "select", required: true },
    { key: "destination_location_id", label: "To", kind: "select", required: true },
    { key: "base_price_aed", label: "Base price (AED)", kind: "number", min: 0, required: true },
    { key: "eta_minutes", label: "Estimated travel time (minutes)", kind: "number", min: 1, help: "Optional estimate." },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ], view: (row) => `AED ${String(row.base_price_aed || 0)}` },
  vehicles: { title: "Vehicle types", singular: "vehicle type", path: "/vehicle-types", defaults: { name: "", description: "", surcharge_aed: 0, sort_order: 0, is_active: true }, fields: [
    { key: "name", label: "Name", required: true, help: "For example, SUV." },
    { key: "surcharge_aed", label: "Extra charge (AED)", kind: "number", min: 0, help: "0 means no extra charge." },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
  storage: { title: "Storage plans", singular: "storage plan", path: "/storage-plans", defaults: { title: "", description: "", billing_period: "month", price_aed: 0, features: [], covered: false, sort_order: 0, is_active: true }, fields: [
    { key: "title", label: "Plan name", required: true },
    { key: "description", label: "Description", kind: "textarea" },
    { key: "price_aed", label: "Price (AED)", kind: "number", min: 0 },
    { key: "billing_period", label: "Billing period", kind: "select", options: [["day", "Per day"], ["week", "Per week"], ["month", "Per month"]] },
    { key: "covered", label: "Covered storage", kind: "boolean" },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
  faqs: { title: "FAQs", singular: "question", path: "/faqs", defaults: { question: "", answer: "", page_key: "home", sort_order: 0, is_active: true }, fields: [
    { key: "question", label: "Question", required: true },
    { key: "answer", label: "Answer", kind: "textarea", required: true },
    { key: "page_key", label: "Which page?", kind: "select", options: [["home", "Home"], ["services", "Services"], ["booking", "Booking"], ["storage", "Storage"], ["", "All pages"]] },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
  testimonials: { title: "Testimonials", singular: "testimonial", path: "/testimonials", defaults: { customer_name: "", quote: "", rating: 5, vehicle_note: "", image_url: "", image_alt: "", is_active: true, sort_order: 0 }, fields: [
    { key: "customer_name", label: "Customer name", required: true },
    { key: "quote", label: "What they said", kind: "textarea", required: true },
    { key: "rating", label: "Star rating", kind: "number", min: 1, max: 5 },
    { key: "image_url", label: "Customer photo", kind: "single-image" },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
};

function locationName(rows: Row[], id: unknown) {
  const found = rows.find((row) => String(row.id) === String(id));
  return found ? stringValue(found.name) : "Choose a location";
}
function stringValue(value: unknown): string { return typeof value === "string" ? value : value == null ? "" : String(value); }
function booleanValue(value: unknown): boolean { return value === true; }
function asRecord(value: unknown): Row { return typeof value === "object" && value !== null ? value as Row : {}; }
function slugValue(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function titleOf(collection: Collection, row: Row, locations: Row[]) {
  if (collection.path === "/routes") return `${locationName(locations, row.origin_location_id)} → ${locationName(locations, row.destination_location_id)}`;
  return stringValue(row.title || row.name || row.question || row.customer_name || row.key) || collection.singular;
}
function apiErrorMessage(reason: unknown) {
  if (reason instanceof Error && "status" in reason && reason.status === 422) return "Please check the required fields and try again.";
  return "We could not complete that change. Please check your connection and try again.";
}

const PAGE_TEXT: Record<string, { page: string; label: string; hint: string }> = {
  "seo.home.title": { page: "Home", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.home.description": { page: "Home", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.about.title": { page: "About", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.about.description": { page: "About", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.services.title": { page: "Services", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.services.description": { page: "Services", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.quote.title": { page: "Booking", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.quote.description": { page: "Booking", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.contact.title": { page: "Contact", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.contact.description": { page: "Contact", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.track.title": { page: "Track booking", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.track.description": { page: "Track booking", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.storage.title": { page: "Storage", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.storage.description": { page: "Storage", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.dubai-to-abu-dhabi.title": { page: "Dubai to Abu Dhabi", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.dubai-to-abu-dhabi.description": { page: "Dubai to Abu Dhabi", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.abu-dhabi-to-dubai.title": { page: "Abu Dhabi to Dubai", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.abu-dhabi-to-dubai.description": { page: "Abu Dhabi to Dubai", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "seo.car-lift-recovery.title": { page: "Car lift and recovery", label: "Page title for Google", hint: "A short title shown in search results and browser tabs." },
  "seo.car-lift-recovery.description": { page: "Car lift and recovery", label: "Description for Google", hint: "A clear summary shown below your page title in search results." },
  "home.hero.title": { page: "Home", label: "Main heading", hint: "The large text in the homepage banner." },
  "home.hero.description": { page: "Home", label: "Banner description", hint: "Short sentence below the homepage heading." },
  "home.booking.heading": { page: "Home", label: "Booking form heading", hint: "Heading above the homepage booking form." },
  "home.booking.description": { page: "Home", label: "Booking form introduction", hint: "A short note above the form." },
  "home.services.heading": { page: "Home", label: "Services section heading", hint: "Heading above homepage service cards." },
  "home.steps.heading": { page: "Home", label: "How booking works heading", hint: "Heading above the three booking steps." },
  "quote.heading": { page: "Booking", label: "Main heading", hint: "Heading at the top of the booking form." },
  "quote.subheading": { page: "Booking", label: "Introduction", hint: "Short introduction below the heading." },
  "services.heading": { page: "Services", label: "Main heading", hint: "Heading above the service cards." },
  "services.subheading": { page: "Services", label: "Introduction", hint: "Short introduction below the heading." },
  "landing.dubai-to-abu-dhabi.h1": { page: "Dubai to Abu Dhabi", label: "Main heading", hint: "The large heading at the top of this route page." },
  "landing.dubai-to-abu-dhabi.intro": { page: "Dubai to Abu Dhabi", label: "Introduction", hint: "The short introduction below the heading." },
  "landing.dubai-to-abu-dhabi.body": { page: "Dubai to Abu Dhabi", label: "Additional details", hint: "The main information section on this route page." },
  "landing.abu-dhabi-to-dubai.h1": { page: "Abu Dhabi to Dubai", label: "Main heading", hint: "The large heading at the top of this route page." },
  "landing.abu-dhabi-to-dubai.intro": { page: "Abu Dhabi to Dubai", label: "Introduction", hint: "The short introduction below the heading." },
  "landing.abu-dhabi-to-dubai.body": { page: "Abu Dhabi to Dubai", label: "Additional details", hint: "The main information section on this route page." },
  "landing.car-lift-recovery.h1": { page: "Car lift and recovery", label: "Main heading", hint: "The large heading at the top of this service page." },
  "landing.car-lift-recovery.intro": { page: "Car lift and recovery", label: "Introduction", hint: "The short introduction below the heading." },
  "landing.car-lift-recovery.body": { page: "Car lift and recovery", label: "Additional details", hint: "The main information section on this service page." },
  "contact.heading": { page: "Contact", label: "Main heading", hint: "Heading at the top of the contact page." },
  "contact.subheading": { page: "Contact", label: "Introduction", hint: "Short introduction below the heading." },
  "storage.heading": { page: "Storage", label: "Main heading", hint: "Heading above storage plans." },
  "storage.subheading": { page: "Storage", label: "Introduction", hint: "Short introduction below the heading." },
};

export default function AdminCollectionPage() {
  const params = useParams<{ collection: string }>();
  const collectionKey = params.collection;
  if (collectionKey === "availability") return <AvailabilityEditor />;
  if (collectionKey === "about") return <AboutEditor />;
  if (collectionKey === "page-text") return <PageTextEditor />;
  const collection = collections[collectionKey];
  if (!collection) return <main className="p-6">This editor is not available.</main>;
  return <CollectionEditor key={collectionKey} collectionKey={collectionKey} collection={collection} />;
}

function CollectionEditor({ collection, collectionKey }: { collection: Collection; collectionKey: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [locations, setLocations] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>(collection.defaults);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  const load = useCallback(async () => {
    try {
      const data = await apiRequest<unknown[]>(`/admin${collection.path}`);
      setRows(data.map(asRecord));
      if (collection.path === "/routes" || collection.path === "/locations") {
        const allLocations = await apiRequest<unknown[]>("/admin/locations");
        setLocations(allLocations.map(asRecord));
      }
      setError("");
    } catch {
      setError("We could not load this list. Please refresh and try again.");
    } finally { setLoading(false); }
  }, [collection.path]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function beginEdit(row?: Row) {
    setEditing(row ?? { ...collection.defaults });
    setDraft(row ? { ...row } : { ...collection.defaults, sort_order: rows.length });
    setDirty(false);
    setToast("");
    setError("");
  }
  function closeEdit() {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setEditing(null);
    setDirty(false);
  }
  function update(key: string, value: unknown) {
    setDirty(true);
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missingField = collection.fields.find((field) => field.required && !stringValue(draft[field.key]).trim());
    if (missingField) { setError(`Please add ${missingField.label.toLowerCase()} before saving.`); return; }
    setBusy(true); setError(""); setToast("");
    const payload: Row = { ...draft };
    for (const field of collection.fields.filter((candidate) => candidate.kind === "single-image")) {
      const image = payload[field.key];
      if (image && typeof image === "object" && "url" in image) {
        const uploaded = image as UploadedImage;
        payload[field.key] = uploaded.url;
        payload[field.key.replace(/_url$/, "_alt")] = uploaded.alt || "";
      } else if (image === null || image === "") {
        payload[field.key.replace(/_url$/, "_alt")] = null;
      }
    }
    if (collectionKey === "banners") {
      if (payload.button_link === "custom") payload.button_link = payload.button_custom_link || "";
      delete payload.button_custom_link;
    }
    if (collectionKey === "services") {
      payload.seo_title = payload.seo_title || `${stringValue(payload.title)} | RK Transport`;
      payload.seo_description = payload.seo_description || stringValue(payload.short_description);
    }
    if (collection.path === "/locations") {
      payload.is_hub = true;
      payload.sort_order = Number(payload.sort_order ?? rows.length);
    }
    if (collection.path === "/routes") {
      const from = locationName(locations, payload.origin_location_id);
      const to = locationName(locations, payload.destination_location_id);
      payload.title = `${from} → ${to}`;
      payload.is_core = true;
      payload.origin_location_id = Number(payload.origin_location_id);
      payload.destination_location_id = Number(payload.destination_location_id);
      payload.base_price_aed = payload.base_price_aed === "" ? null : Number(payload.base_price_aed);
      payload.eta_minutes = payload.eta_minutes === "" ? null : Number(payload.eta_minutes);
    }
    if (collectionKeyForPath(collection.path) === "testimonials") payload.rating = Number(payload.rating);
    const itemId = typeof draft.id === "number" ? draft.id : null;
    try {
      await apiRequest(itemId ? `/admin${collection.path}/${itemId}` : `/admin${collection.path}`, {
        method: itemId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setEditing(null); setDirty(false);
      setToast(`${collection.singular[0].toUpperCase()}${collection.singular.slice(1)} saved.`);
      await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  }

  async function toggleVisibility(row: Row) {
    const id = row.id;
    if (typeof id !== "number") return;
    try {
      await apiRequest(`/admin${collection.path}/${id}`, { method: "PUT", body: JSON.stringify({ ...row, is_active: !booleanValue(row.is_active) }) });
      setToast(booleanValue(row.is_active) ? "Hidden from the website." : "Now shown on the website.");
      await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
  }

  async function remove(row: Row) {
    if (typeof row.id !== "number" || !window.confirm(`Delete this ${collection.singular}? This cannot be undone.`)) return;
    try {
      await apiRequest(`/admin${collection.path}/${row.id}`, { method: "DELETE" });
      setToast(`${collection.singular[0].toUpperCase()}${collection.singular.slice(1)} deleted.`);
      await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
  }

  async function move(rowIndex: number, direction: -1 | 1) {
    const target = rowIndex + direction;
    if (target < 0 || target >= rows.length) return;
    const reordered = [...rows];
    [reordered[rowIndex], reordered[target]] = [reordered[target], reordered[rowIndex]];
    try {
      for (const [index, item] of reordered.entries()) {
        if (typeof item.id === "number") await apiRequest(`/admin${collection.path}/${item.id}`, { method: "PUT", body: JSON.stringify({ ...item, sort_order: index }) });
      }
      setRows(reordered); setToast("Order updated.");
    } catch (reason) { setError(apiErrorMessage(reason)); await load(); }
  }

  const pageLink = collection.path === "/hero-banners" ? "/" : collection.path === "/services" ? "/services" : collection.path === "/faqs" ? "/" : undefined;

  return <main className="min-h-screen bg-stone-50 px-4 py-8 pt-16 dark:bg-slate-950 sm:px-6 md:pt-8"><div className="mx-auto max-w-5xl">
    <Link href="/admin/dashboard" className="inline-flex min-h-11 items-center font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link>
    <header className="my-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">{collection.title}</h1>{collectionKey === "banners" && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Banners play in this order on the home page.</p>}</div><button type="button" onClick={() => beginEdit()} className="min-h-11 rounded-xl bg-emerald-900 px-4 font-semibold text-white">Add new {collection.singular}</button></header>
    {pageLink && <Link href={pageLink} target="_blank" className="inline-flex min-h-11 items-center text-sm font-semibold underline">View on website ↗</Link>}
    {toast && <p role="status" className="my-3 rounded-xl bg-emerald-100 p-3 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">{toast}</p>}
    {error && <p role="alert" className="my-3 rounded-xl bg-red-100 p-3 text-red-900 dark:bg-red-950 dark:text-red-100">{error}</p>}
    {loading ? <div aria-label="Loading list" className="mt-5 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>
      : rows.length === 0 ? <p className="mt-5 rounded-2xl bg-white p-6 dark:bg-slate-900">No {collection.title.toLowerCase()} yet. Add your first {collection.singular}.</p>
      : <div className="mt-5 space-y-3">{rows.map((row, index) => <article key={String(row.id ?? index)} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        {typeof row.image_url === "string" && row.image_url && <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-28"><Image src={row.image_url} alt="" fill unoptimized sizes="112px" className="object-cover" /></div>}
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-semibold">{titleOf(collection, row, locations)}</h2>{"is_active" in row && <span className={`rounded-full px-2 py-1 text-xs font-bold ${booleanValue(row.is_active) ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-700"}`}>{booleanValue(row.is_active) ? "Visible" : "Hidden"}</span>}</div><p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{collection.view ? collection.view(row, locations) : stringValue(row.short_description || row.quote || row.description || row.subtitle)}</p></div>
        <div className="flex flex-wrap gap-1">
          <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => void move(index, -1)} className="min-h-11 min-w-11 rounded-lg border text-lg disabled:opacity-40 dark:border-slate-700">↑</button><button type="button" aria-label="Move down" disabled={index === rows.length - 1} onClick={() => void move(index, 1)} className="min-h-11 min-w-11 rounded-lg border text-lg disabled:opacity-40 dark:border-slate-700">↓</button>
        </div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => beginEdit(row)} className="min-h-11 rounded-lg border px-3 text-sm font-semibold dark:border-slate-700">Edit</button>{"is_active" in row && <button type="button" onClick={() => void toggleVisibility(row)} className="min-h-11 rounded-lg border px-3 text-sm font-semibold dark:border-slate-700">{booleanValue(row.is_active) ? "Hide" : "Show"}</button>}<button type="button" onClick={() => void remove(row)} className="min-h-11 rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-800">Delete</button></div>
      </article>)}</div>}

    {editing && <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/50 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEdit(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="editor-title" className="mx-auto my-4 max-w-2xl rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-6">
        <header className="flex items-center justify-between gap-3"><h2 id="editor-title" className="text-xl font-bold">{typeof draft.id === "number" ? "Edit" : "Add"} {collection.singular}</h2><button type="button" onClick={closeEdit} aria-label="Close form" className="min-h-11 min-w-11 rounded-lg border dark:border-slate-700">×</button></header>
        <form ref={formRef} onSubmit={(event) => void save(event)} className="mt-4 space-y-4">
            {collection.fields.map((field) => <FieldControl key={field.key} field={field} value={draft[field.key]} imageAlt={draft[field.key.replace(/_url$/, "_alt")]} onChange={(value) => { update(field.key, value); if (field.key === "title" && collectionKey === "services") update("slug", slugValue(stringValue(value))); }} locations={locations} />)}
            {collectionKey === "banners" && draft.button_link === "custom" && <FieldControl field={{ key: "button_custom_link", label: "Custom page or website address", help: "For example, https://example.com/offer.", required: true }} value={draft.button_custom_link} onChange={(value) => update("button_custom_link", value)} locations={locations} />}
          {collection.advanced && <details className="rounded-xl border p-4 dark:border-slate-700"><summary className="min-h-11 cursor-pointer content-center font-semibold">Advanced: search engine settings</summary><div className="mt-3 space-y-4">{collection.advanced.map((field) => <FieldControl key={field.key} field={field} value={draft[field.key]} onChange={(value) => update(field.key, value)} locations={locations} />)}</div></details>}
                  {collectionKey === "banners" && <section aria-label="Banner preview" className="overflow-hidden rounded-xl border dark:border-slate-700"><h3 className="p-3 font-semibold">Live banner preview</h3><div className="relative min-h-52 bg-emerald-950 p-6 text-white">{(typeof draft.image_url === "string" ? draft.image_url : stringValue(asRecord(draft.image_url).url)) && <Image src={typeof draft.image_url === "string" ? draft.image_url : stringValue(asRecord(draft.image_url).url)} alt="" fill unoptimized sizes="640px" className="object-cover opacity-70" />}<div className="relative z-10"><p className="font-bold">{stringValue(draft.badge_text)}</p><h4 className="mt-3 text-2xl font-bold">{stringValue(draft.title) || "Your banner heading"}</h4><p className="mt-2 text-lg">{stringValue(draft.subtitle)}</p><p className="mt-2">{stringValue(draft.description)}</p><span className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-4 font-semibold text-emerald-950">{stringValue(draft.button_text) || "Button text"}</span></div></div></section>}
          <footer className="sticky bottom-0 flex gap-3 bg-white py-3 dark:bg-slate-900"><button type="submit" disabled={busy} className="min-h-12 flex-1 rounded-xl bg-emerald-900 px-4 font-semibold text-white disabled:opacity-60">{busy ? <><span aria-hidden="true" className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-r-transparent align-[-3px]" />Saving…</> : "Save changes"}</button><button type="button" onClick={closeEdit} className="min-h-12 rounded-xl border px-4 font-semibold dark:border-slate-700">Cancel</button></footer>
        </form>
      </section>
    </div>}
  </div></main>;
}

function collectionKeyForPath(path: string) { return Object.keys(collections).find((key) => collections[key].path === path); }

function FieldControl({ field, value, imageAlt, onChange, locations }: { field: Field; value: unknown; imageAlt?: unknown; onChange: (value: unknown) => void; locations: Row[] }) {
  const inputClass = "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950";
  if (field.key === "slug") return <p className="text-sm"><span className="font-semibold">{field.label}</span>{field.help && <span className="mt-1 block text-slate-600 dark:text-slate-300">{field.help}</span>}<span className="mt-1 block rounded-lg bg-slate-100 p-3 font-mono dark:bg-slate-800">{stringValue(value) || "Created when you save the service name."}</span></p>;
  if (field.kind === "single-image") {
    const imageValue = value && typeof value === "object" && "url" in value ? value as UploadedImage : null;
    const image: UploadedImage | null = imageValue ?? (stringValue(value) ? { url: stringValue(value), alt: stringValue(imageAlt) } : null);
    return <ImageUpload label={field.label} hint={field.help} value={image} onChange={(next) => onChange(next && !Array.isArray(next) ? next : null)} />;
  }
  if (field.kind === "multi-image") {
    const images = Array.isArray(value) ? value.map((item) => asRecord(item)).filter((item) => typeof item.url === "string") as UploadedImage[] : [];
    return <ImageUpload label={field.label} value={images} multiple onChange={(next) => onChange(Array.isArray(next) ? next : [])} />;
  }
  if (field.kind === "boolean") return <label className="flex min-h-12 items-center gap-3 rounded-lg border p-3 text-sm font-semibold dark:border-slate-700"><input type="checkbox" checked={booleanValue(value)} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-emerald-800" />{field.label}</label>;
  if (field.key === "rating") return <fieldset><legend className="font-semibold">{field.label}</legend><div className="mt-1 flex gap-1" role="radiogroup" aria-label="Star rating">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" role="radio" aria-checked={Number(value) === rating} aria-label={`${rating} star${rating === 1 ? "" : "s"}`} onClick={() => onChange(rating)} className="min-h-11 min-w-11 rounded-lg text-2xl text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800"> {Number(value) >= rating ? "★" : "☆"} </button>)}</div></fieldset>;
  if (field.kind === "select") {
    const options = field.key === "origin_location_id"
      ? locations.filter((row) => booleanValue(row.pickup_enabled) && booleanValue(row.is_active)).map((row) => [stringValue(row.id), stringValue(row.name)] as [string, string])
      : field.key === "destination_location_id"
        ? locations.filter((row) => booleanValue(row.dropoff_enabled) && booleanValue(row.is_active)).map((row) => [stringValue(row.id), stringValue(row.name)] as [string, string])
        : field.options ?? [];
    return <label className="block text-sm font-semibold">{field.label}{field.required && <span className="text-red-700"> *</span>}{field.help && <span className="mt-1 block font-normal text-slate-600">{field.help}</span>}<select required={field.required} value={stringValue(value)} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Choose…</option>{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>;
  }
  if (field.kind === "rich") return <RichTextField label={field.label} value={stringValue(value)} onChange={onChange} help={field.help} required={field.required} />;
  const common = { value: stringValue(value), onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field.kind === "number" ? event.target.value === "" ? "" : Number(event.target.value) : event.target.value), required: field.required, min: field.min, max: field.max, className: inputClass };
  return <label className="block text-sm font-semibold">{field.label}{field.required && <span className="text-red-700"> *</span>}{field.help && <span className="mt-1 block font-normal text-slate-600 dark:text-slate-300">{field.help}</span>}{field.kind === "textarea" ? <textarea {...common} rows={4} /> : <input {...common} type={field.kind === "number" ? "number" : "text"} />}</label>;
}

function RichTextField({ label, value, onChange, help, required }: { label: string; value: string; onChange: (value: string) => void; help?: string; required?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState("");
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) ref.current.innerHTML = markdownToEditorHtml(value);
  }, [value]);
  function command(action: "bold" | "insertUnorderedList") {
    ref.current?.focus();
    document.execCommand(action);
    if (ref.current) onChange(editorHtmlToMarkdown(ref.current));
  }
  function insertLink() {
    ref.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) { setHint("Select the words to turn into a link first."); return; }
    const address = window.prompt("Enter the link address, for example https://example.com");
    if (!address) return;
    if (!/^(https?:\/\/|\/(?!\/)|#)/i.test(address)) { setHint("Use a page path or a link beginning with https://."); return; }
    document.execCommand("createLink", false, address);
    if (ref.current) onChange(editorHtmlToMarkdown(ref.current));
    setHint("");
  }
  return <div className="block text-sm font-semibold"><label>{label}{required && <span className="text-red-700"> *</span>}{help && <span className="mt-1 block font-normal text-slate-600 dark:text-slate-300">{help}</span>}</label><div className="mt-2 flex flex-wrap gap-2"><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => command("bold")} className="min-h-11 rounded border px-3 dark:border-slate-700">Bold</button><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => command("insertUnorderedList")} className="min-h-11 rounded border px-3 dark:border-slate-700">Bullets</button><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={insertLink} className="min-h-11 rounded border px-3 dark:border-slate-700">Link</button></div><div ref={ref} contentEditable role="textbox" aria-label={label} aria-multiline="true" aria-required={required} onInput={() => ref.current && onChange(editorHtmlToMarkdown(ref.current))} className="mt-1 min-h-40 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />{hint && <p role="status" className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300">{hint}</p>}</div>;
}

function safeLink(value: string) { return value.startsWith("/") && !value.startsWith("//") || value.startsWith("#") || /^https?:\/\//i.test(value); }
function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }

function markdownToEditorHtml(value: string) {
  const inline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part) => {
      const bold = /^\*\*(.+)\*\*$/.exec(part);
      if (bold) return `<strong>${escapeHtml(bold[1])}</strong>`;
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (link && safeLink(link[2])) return `<a href="${escapeHtml(link[2])}">${escapeHtml(link[1])}</a>`;
      return escapeHtml(part);
    }).join("");
  };
  const lines = value.split(/\r?\n/);
  const output: string[] = [];
  let bullets: string[] = [];
  const flush = () => { if (bullets.length) { output.push(`<ul>${bullets.map((line) => `<li>${inline(line)}</li>`).join("")}</ul>`); bullets = []; } };
  for (const line of lines) {
    if (line.startsWith("- ")) bullets.push(line.slice(2));
    else { flush(); if (line) output.push(`<p>${inline(line)}</p>`); }
  }
  flush();
  return output.join("");
}

function editorHtmlToMarkdown(editor: HTMLElement): string {
  const serialize = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (!(node instanceof HTMLElement)) return "";
    const body = Array.from(node.childNodes, serialize).join("");
    if (node.tagName === "STRONG" || node.tagName === "B") return `**${body}**`;
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      return safeLink(href) ? `[${body}](${href})` : body;
    }
    if (node.tagName === "LI") return `- ${body}`;
    if (node.tagName === "UL") return `${Array.from(node.children, serialize).join("\n")}\n`;
    if (node.tagName === "BR") return "\n";
    if (node.tagName === "P" || node.tagName === "DIV") return `${body}\n`;
    return body;
  };
  return Array.from(editor.childNodes, serialize).join("").replace(/\n+$/, "");
}

function AboutEditor() {
  const [item, setItem] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  const icons = [
    { name: "Truck", Icon: Truck }, { name: "Shield", Icon: ShieldCheck }, { name: "Clock", Icon: Clock3 },
    { name: "Location", Icon: MapPin }, { name: "Care", Icon: Heart }, { name: "Award", Icon: Award },
    { name: "Trusted", Icon: CircleCheck }, { name: "Support", Icon: Headset }, { name: "Performance", Icon: Gauge },
    { name: "Top rated", Icon: Star }, { name: "Repair", Icon: Wrench }, { name: "Car", Icon: CarFront },
  ];
  const load = useCallback(async () => {
    try {
      const result = await apiRequest<About[]>("/admin/about");
      const about = result[0] as unknown as Row | undefined;
      setItem(about ?? null);
      setDraft(about ? { ...about } : { title: "About RK Transport", subtitle: "", description: "", mission: "", vision: "", images: [], stats: [], story_image_side: "left", why_choose_us: [] });
      setError("");
    } catch { setError("We could not load the About page. Please try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  const update = (key: string, value: unknown) => { setDirty(true); setDraft((current) => ({ ...current, [key]: value })); };
  const stats = Array.isArray(draft.stats) ? draft.stats.map(asRecord) : [];
  const reasons = Array.isArray(draft.why_choose_us) ? draft.why_choose_us.map(asRecord) : [];
  const images = Array.isArray(draft.images) ? draft.images.map(asRecord) : [];
  const storyImage: UploadedImage | null = typeof images[0]?.url === "string" ? { url: stringValue(images[0].url), alt: stringValue(images[0].alt) } : null;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stringValue(draft.title).trim()) { setError("Please add an About page heading before saving."); return; }
    if (!stringValue(draft.description).trim()) { setError("Please add your story before saving."); return; }
    setBusy(true); setError(""); setToast("");
    const payload = { ...draft, stats: stats.slice(0, 4).map((stat) => ({ value: `${stringValue(stat.number)}${booleanValue(stat.plus) ? "+" : ""}`, label: stringValue(stat.label) })), images: storyImage ? [{ url: storyImage.url, alt: storyImage.alt || "", side: stringValue(draft.story_image_side) }] : [] };
    try {
      if (typeof item?.id === "number") await apiRequest(`/admin/about/${item.id}`, { method: "PUT", body: JSON.stringify(payload) });
      else await apiRequest("/admin/about", { method: "POST", body: JSON.stringify(payload) });
      setDirty(false); setToast("About page saved."); await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  }
  function updateArray(key: "stats" | "why_choose_us", index: number, patch: Row) {
    const list = key === "stats" ? stats : reasons;
    update(key, list.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...patch } : entry));
  }
  function moveArray(key: "stats" | "why_choose_us", index: number, direction: -1 | 1) {
    const list = [...(key === "stats" ? stats : reasons)];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    update(key, list);
  }
  return <main className="min-h-screen bg-stone-50 px-4 py-8 pt-16 dark:bg-slate-950 sm:px-6 md:pt-8"><div className="mx-auto max-w-4xl">
    <Link href="/admin/dashboard" className="inline-flex min-h-11 items-center font-semibold">← Dashboard</Link><h1 className="my-5 text-3xl font-bold">About page</h1><Link href="/about" target="_blank" className="inline-flex min-h-11 items-center font-semibold text-emerald-800 underline dark:text-emerald-300">View on website ↗</Link>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-100 p-3 text-red-900">{error}</p>}{toast && <p role="status" className="mb-4 rounded-xl bg-emerald-100 p-3">{toast}</p>}
    {loading ? <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /> : <form onSubmit={(event) => void save(event)} className="space-y-5">
      <fieldset className="space-y-4 rounded-2xl bg-white p-4 dark:bg-slate-900"><legend className="px-2 text-lg font-bold">1. Our story</legend>
        <TextField label="Heading" value={stringValue(draft.title)} required onChange={(value) => update("title", value)} /><TextField label="Sub-heading" value={stringValue(draft.subtitle)} onChange={(value) => update("subtitle", value)} /><RichTextField label="Our story" value={stringValue(draft.description)} onChange={(value) => update("description", value)} required />
        <ImageUpload label="Story picture" value={storyImage} onChange={(next) => update("images", next && !Array.isArray(next) ? [{ url: next.url, alt: next.alt }] : [])} folder="about" />
        <fieldset><legend className="font-semibold">Picture position</legend><div className="flex gap-3">{(["left", "right"] as const).map((side) => <label key={side} className="flex min-h-12 flex-1 items-center gap-2 rounded border p-3 dark:border-slate-700"><input type="radio" checked={draft.story_image_side === side} onChange={() => update("story_image_side", side)} />Picture on the {side}</label>)}</div></fieldset>
      </fieldset>
      <fieldset className="space-y-3 rounded-2xl bg-white p-4 dark:bg-slate-900"><legend className="px-2 text-lg font-bold">2. Numbers</legend><p className="text-sm text-slate-600">Add up to four number cards.</p>
        {stats.map((stat, index) => <div key={index} className="grid gap-2 rounded-xl border p-3 dark:border-slate-700 sm:grid-cols-[1fr_1fr_auto_auto]"><TextField label="Number" value={stringValue(stat.number ?? stringValue(stat.value).replace(/\+$/, ""))} onChange={(value) => updateArray("stats", index, { number: value })} /><TextField label="Label" value={stringValue(stat.label)} onChange={(value) => updateArray("stats", index, { label: value })} /><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={booleanValue(stat.plus) || stringValue(stat.value).endsWith("+")} onChange={(event) => updateArray("stats", index, { plus: event.target.checked })} />Add +</label><div className="flex gap-1"><button type="button" aria-label="Move number up" onClick={() => moveArray("stats", index, -1)} className="min-h-11 min-w-11 rounded border">↑</button><button type="button" aria-label="Move number down" onClick={() => moveArray("stats", index, 1)} className="min-h-11 min-w-11 rounded border">↓</button><button type="button" onClick={() => update("stats", stats.filter((_, i) => i !== index))} className="min-h-11 rounded border border-red-300 px-2 text-red-800">Remove</button></div></div>)}
        <button type="button" disabled={stats.length >= 4} onClick={() => update("stats", [...stats, { number: "", label: "", plus: false }])} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">Add a number</button>
      </fieldset>
      <fieldset className="space-y-3 rounded-2xl bg-white p-4 dark:bg-slate-900"><legend className="px-2 text-lg font-bold">3. Why choose us</legend>
        {reasons.map((reason, index) => <div key={index} className="space-y-3 rounded-xl border p-3 dark:border-slate-700"><label className="block font-semibold">Choose an icon<div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">{icons.map(({ name, Icon }) => <button key={name} type="button" aria-label={`Choose ${name} icon`} aria-pressed={reason.icon === name} onClick={() => updateArray("why_choose_us", index, { icon: name })} className={`min-h-16 rounded-lg border p-1 text-xs ${reason.icon === name ? "border-emerald-700 bg-emerald-100 dark:bg-emerald-950" : "dark:border-slate-700"}`}><Icon aria-hidden="true" className="mx-auto size-5" /><span className="mt-1 block">{name}</span></button>)}</div></label><TextField label="Title" value={stringValue(reason.title)} onChange={(value) => updateArray("why_choose_us", index, { title: value })} /><TextField label="Description" value={stringValue(reason.description)} onChange={(value) => updateArray("why_choose_us", index, { description: value })} /><div className="flex gap-2"><button type="button" aria-label="Move reason up" onClick={() => moveArray("why_choose_us", index, -1)} className="min-h-11 min-w-11 rounded border">↑</button><button type="button" aria-label="Move reason down" onClick={() => moveArray("why_choose_us", index, 1)} className="min-h-11 min-w-11 rounded border">↓</button><button type="button" onClick={() => update("why_choose_us", reasons.filter((_, i) => i !== index))} className="min-h-11 rounded border border-red-300 px-3 text-red-800">Remove</button></div></div>)}
        <button type="button" onClick={() => update("why_choose_us", [...reasons, { icon: "Star", title: "", description: "" }])} className="min-h-11 rounded-lg border px-4">Add a reason</button>
      </fieldset>
      <fieldset className="grid gap-4 rounded-2xl bg-white p-4 dark:bg-slate-900 sm:grid-cols-2"><legend className="px-2 text-lg font-bold">4. Mission and vision (optional)</legend><TextField label="Our mission" value={stringValue(draft.mission)} onChange={(value) => update("mission", value)} multiline /><TextField label="Our vision" value={stringValue(draft.vision)} onChange={(value) => update("vision", value)} multiline /></fieldset>
      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-emerald-900 px-4 font-semibold text-white disabled:opacity-60">{busy ? <><span aria-hidden="true" className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-r-transparent align-[-3px]" />Saving…</> : "Save About page"}</button>
    </form>}
  </div></main>;
}

function TextField({ label, value, onChange, required, multiline }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; multiline?: boolean }) {
  const cls = "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950";
  return <label className="block text-sm font-semibold">{label}{required && <span className="text-red-700"> *</span>}{multiline ? <textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={`${cls} py-2`} /> : <input required={required} value={value} onChange={(event) => onChange(event.target.value)} className={cls} />}</label>;
}

function PageTextEditor() {
  const [rows, setRows] = useState<PageCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});
  useUnsavedChanges(dirty);
  const load = useCallback(async () => {
    try {
      const data = await apiRequest<PageCopy[]>("/admin/page-copy");
      setRows(data.filter((row) => PAGE_TEXT[row.key]));
      const loadedValues = Object.fromEntries(data.map((row) => [row.key, row.value]));
      setValues(loadedValues); setSavedValues(loadedValues); setDirty(false);
    } catch { setError("We could not load page text. Please try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  const grouped = Object.entries(PAGE_TEXT).reduce<Record<string, [string, typeof PAGE_TEXT[string]][]>>((result, [key, meta]) => {
    (result[meta.page] ??= []).push([key, meta]);
    return result;
  }, {});
  async function save(row: PageCopy) {
    setSaving(row.key); setError(""); setToast("");
    try {
      await apiRequest(`/admin/page-copy/${row.id}`, { method: "PUT", body: JSON.stringify({ key: row.key, value: values[row.key] ?? row.value }) });
      const saved = { ...savedValues, [row.key]: values[row.key] ?? row.value };
      setSavedValues(saved); setDirty(Object.entries(values).some(([key, value]) => (saved[key] ?? "") !== value)); setToast("Page text saved.");
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setSaving(null); }
  }
  return <main className="min-h-screen bg-stone-50 px-4 py-8 pt-16 dark:bg-slate-950 sm:px-6 md:pt-8"><div className="mx-auto max-w-4xl"><Link href="/admin/dashboard" className="inline-flex min-h-11 items-center font-semibold">← Dashboard</Link><h1 className="my-5 text-3xl font-bold">Page text</h1>
    <p className="mb-5 text-slate-600 dark:text-slate-300">Update public-page headings and short introductions. Labels explain where each item appears.</p>{toast && <p role="status" className="mb-3 rounded-xl bg-emerald-100 p-3">{toast}</p>}{error && <p role="alert" className="mb-3 rounded-xl bg-red-100 p-3">{error}</p>}
    {loading ? <div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" /> : Object.entries(grouped).map(([page, fields]) => <section key={page} className="mb-4 rounded-2xl bg-white p-4 dark:bg-slate-900"><h2 className="mb-3 text-xl font-bold">{page}</h2><div className="space-y-4">{fields.map(([key, meta]) => { const row = rows.find((item) => item.key === key); return <div key={key}><label className="block text-sm font-semibold">{page} page: {meta.label}<span className="mt-1 block font-normal text-slate-600 dark:text-slate-300">{meta.hint}</span><textarea value={values[key] ?? ""} onChange={(event) => { setDirty(true); setValues((previous) => ({ ...previous, [key]: event.target.value })); }} rows={2} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700" /></label><button type="button" disabled={!row || saving === key} onClick={() => row && void save(row)} className="mt-2 min-h-11 rounded-lg border px-4 font-semibold disabled:opacity-50">{saving === key ? <><span aria-hidden="true" className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-3px]" />Saving…</> : "Save this text"}</button></div>; })}</div></section>)}
  </div></main>;
}

function AvailabilityEditor() {
  const [settings, setSettings] = useState<AdminSiteSettings | null>(null);
  const [available, setAvailable] = useState(true);
  const [slots, setSlots] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState("09:00");
  const [newDate, setNewDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const dirty = settings !== null && (available !== settings.available_24_7 || JSON.stringify(slots) !== JSON.stringify(settings.booking_time_slots) || JSON.stringify(blocked) !== JSON.stringify(settings.blocked_dates));
  useUnsavedChanges(dirty);
  const load = useCallback(async () => {
    try {
      const data = await apiRequest<AdminSiteSettings>("/admin/settings");
      setSettings(data); setAvailable(data.available_24_7); setSlots(data.booking_time_slots); setBlocked(data.blocked_dates);
    } catch { setError("We could not load booking availability. Please try again."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!settings) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await apiRequest("/admin/settings", { method: "PUT", body: JSON.stringify({ available_24_7: available, booking_time_slots: slots, blocked_dates: blocked }) });
      setSettings({ ...settings, available_24_7: available, booking_time_slots: slots, blocked_dates: blocked });
      setNotice("Booking availability saved.");
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-stone-50 px-4 py-8 pt-16 dark:bg-slate-950 sm:px-6 md:pt-8"><div className="mx-auto max-w-3xl"><Link href="/admin/dashboard" className="inline-flex min-h-11 items-center font-semibold">← Dashboard</Link><h1 className="my-5 text-3xl font-bold">Booking availability</h1>{notice && <p role="status" className="mb-3 rounded-xl bg-emerald-100 p-3">{notice}</p>}{error && <p role="alert" className="mb-3 rounded-xl bg-red-100 p-3">{error}</p>}
    {loading ? <div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" /> : <form onSubmit={(event) => void save(event)} className="space-y-5 rounded-2xl bg-white p-5 dark:bg-slate-900">
      <label className="flex min-h-12 items-center gap-3 font-semibold"><input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} className="size-5 accent-emerald-800" />Available 24/7</label>
      <section className={available ? "space-y-3 opacity-50" : "space-y-3"}><h2 className="font-bold">Available time slots</h2><p className="text-sm text-slate-600">Choose the times customers can request. Disabled while 24/7 availability is on.</p><div className="flex flex-wrap gap-2">{slots.map((slot) => <span key={slot} className="flex min-h-11 items-center gap-2 rounded-full bg-slate-100 px-3 dark:bg-slate-800">{slot}<button type="button" disabled={available} aria-label={`Remove ${slot}`} onClick={() => setSlots(slots.filter((item) => item !== slot))} className="min-h-8 min-w-8 rounded-full text-red-700">×</button></span>)}</div><div className="flex gap-2"><input type="time" value={newSlot} disabled={available} onChange={(event) => setNewSlot(event.target.value)} className="min-h-11 rounded-lg border px-3 dark:border-slate-700 dark:bg-slate-950" /><button type="button" disabled={available || !newSlot || slots.includes(newSlot)} onClick={() => setSlots([...slots, newSlot].sort())} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">Add time</button></div></section>
      <section className="space-y-3"><h2 className="font-bold">Days we are closed or fully booked</h2><div className="flex flex-wrap gap-2">{blocked.map((date) => <span key={date} className="flex min-h-11 items-center gap-2 rounded-full bg-slate-100 px-3 dark:bg-slate-800">{new Date(`${date}T00:00:00`).toLocaleDateString()}<button type="button" aria-label={`Remove blocked date ${date}`} onClick={() => setBlocked(blocked.filter((item) => item !== date))} className="min-h-8 min-w-8 rounded-full text-red-700">×</button></span>)}</div><div className="flex gap-2"><input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} className="min-h-11 rounded-lg border px-3 dark:border-slate-700 dark:bg-slate-950" /><button type="button" disabled={!newDate || blocked.includes(newDate)} onClick={() => { setBlocked([...blocked, newDate].sort()); setNewDate(""); }} className="min-h-11 rounded-lg border px-4 disabled:opacity-50">Block date</button></div></section>
      <button disabled={busy} className="min-h-12 w-full rounded-xl bg-emerald-900 font-semibold text-white disabled:opacity-60">{busy ? <><span aria-hidden="true" className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-r-transparent align-[-3px]" />Saving…</> : "Save availability"}</button>
    </form>}
  </div></main>;
}
