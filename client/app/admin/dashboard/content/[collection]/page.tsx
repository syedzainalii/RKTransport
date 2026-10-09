"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, CarFront, CircleCheck, Clock3, Gauge, Headset, Heart, MapPin, ShieldCheck, Star, Truck, Wrench } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { notFound, useParams } from "next/navigation";
import { apiRequest, type About } from "../../../../../lib/transport-api";
import ImageUpload, { type UploadedImage } from "../../components/image-upload";
import useUnsavedChanges from "../../components/use-unsaved-changes";

type Row = Record<string, unknown> & { id?: number };
type Field = { key: string; label: string; help?: string; kind?: "text" | "textarea" | "rich" | "number" | "select" | "boolean" | "single-image" | "string-list"; options?: [string, string][]; required?: boolean; min?: number; max?: number; showDescription?: boolean };
type Collection = { title: string; path: string; singular: string; fields: Field[]; defaults: Row };

const pageDestinations: [string, string][] = [
  ["/services", "Services"], ["/contact", "Contact"], ["/about", "About"], ["/storage", "Storage"], ["/", "Home"],
];
const serviceTypes: [string, string][] = [["transport", "Car transport"]];

const collections: Record<string, Collection> = {
  banners: { title: "Homepage banners", singular: "banner", path: "/hero-banners", defaults: { title: "", subtitle: "", description: "", badge_text: "", button_text: "Contact us", button_link: "/contact", button_custom_link: "", image_url: "", image_alt: "", portrait_image_url: "", sort_order: 0, is_active: true }, fields: [
    { key: "title", label: "Heading", help: "The big text on the banner.", required: true },
    { key: "subtitle", label: "Sub-heading" },
    { key: "description", label: "Short description", kind: "textarea", help: "Optional supporting text." },
    { key: "badge_text", label: "Small badge text", help: 'For example, "Open 24/7".' },
    { key: "button_text", label: "Button text", required: true },
    { key: "button_link", label: "Button destination", kind: "select", options: [...pageDestinations, ["custom", "Custom link"]] },
    { key: "image_url", label: "Landscape image", kind: "single-image", help: "Shown on laptops and desktops. Recommended size: 1920 × 900 pixels." },
    { key: "portrait_image_url", label: "Portrait image", kind: "single-image", showDescription: false, help: "Shown on phones and tablets. Recommended size: 1080 × 1600 pixels. Shares the landscape image description." },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
  services: { title: "Services", singular: "service", path: "/services", defaults: { title: "", short_description: "", detailed_description: "", starting_price_note: "", features: [], image_url: "", image_alt: "", banner_image_url: "", icon: "Truck", category: "transport", sort_order: 0, is_active: true }, fields: [
    { key: "title", label: "Service name", required: true },
    { key: "short_description", label: "Short summary", kind: "textarea", help: "One or two lines shown on service cards.", required: true },
    { key: "detailed_description", label: "Full description", kind: "rich", help: "Use the buttons for bold text, bullet points, and links." },
    { key: "features", label: "Service detail cards", kind: "string-list", help: "Add one card per line. These appear on this service's detail page, for example: Both directions, Door-to-door options, Available 24/7." },
    { key: "starting_price_note", label: "Starting price note", help: 'Optional, for example "From AED 350".' },
    { key: "category", label: "Service type", kind: "select", options: serviceTypes },
    { key: "image_url", label: "Main picture", kind: "single-image" },
    { key: "banner_image_url", label: "Section Banner Background Image", kind: "single-image", help: "Custom background image for this section banner." },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
  faqs: { title: "FAQs", singular: "question", path: "/faqs", defaults: { question: "", answer: "", page_key: "home", sort_order: 0, is_active: true }, fields: [
    { key: "question", label: "Question", required: true },
    { key: "answer", label: "Answer", kind: "textarea", required: true },
    { key: "page_key", label: "Which page?", kind: "select", options: [["home", "Home"], ["services", "Services"], ["storage", "Storage"], ["", "All pages"]] },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
  testimonials: { title: "Testimonials", singular: "testimonial", path: "/testimonials", defaults: { customer_name: "", quote: "", rating: 5, vehicle_note: "", banner_image_url: "", is_active: true, sort_order: 0 }, fields: [
    { key: "customer_name", label: "Customer name", required: true },
    { key: "quote", label: "What they said", kind: "textarea", required: true },
    { key: "rating", label: "Star rating", kind: "number", min: 1, max: 5 },
    { key: "banner_image_url", label: "Section Banner Background Image", kind: "single-image", help: "Custom background image for this section banner." },
    { key: "is_active", label: "Show on website", kind: "boolean" },
  ] },
};

function stringValue(value: unknown): string { return typeof value === "string" ? value : value == null ? "" : String(value); }
function booleanValue(value: unknown): boolean { return value === true; }
function asRecord(value: unknown): Row { return typeof value === "object" && value !== null ? value as Row : {}; }
function titleOf(collection: Collection, row: Row) {
  return stringValue(row.title || row.name || row.question || row.customer_name || row.key) || collection.singular;
}
function apiErrorMessage(reason: unknown) {
  if (reason instanceof Error && "status" in reason && reason.status === 422) return "Please check the required fields and try again.";
  return "We could not complete that change. Please check your connection and try again.";
}

export default function AdminCollectionPage() {
  const params = useParams<{ collection: string }>();
  const collectionKey = params.collection;
  if (collectionKey === "about") return <AboutEditor />;
  const collection = collections[collectionKey];
  if (!collection) notFound();
  return <CollectionEditor key={collectionKey} collectionKey={collectionKey} collection={collection} />;
}

function CollectionEditor({ collection, collectionKey }: { collection: Collection; collectionKey: string }) {
  const [rows, setRows] = useState<Row[]>([]);
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
      const altKey = field.key.replace(/_url$/, "_alt");
      if (image && typeof image === "object" && "url" in image) {
        const uploaded = image as UploadedImage;
        payload[field.key] = uploaded.url;
        if (altKey in payload) payload[altKey] = uploaded.alt || "";
      } else if (image === null || image === "") {
        if (altKey in payload) payload[altKey] = null;
      }
    }
    for (const field of collection.fields.filter((candidate) => candidate.kind === "string-list")) {
      payload[field.key] = stringValue(payload[field.key])
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (collectionKey === "banners") {
      if (payload.button_link === "custom") payload.button_link = payload.button_custom_link || "";
      delete payload.button_custom_link;
    }
    if (collectionKey === "services") {
      payload.seo_title = payload.seo_title || `${stringValue(payload.title)} | RK Transport`;
      payload.seo_description = payload.seo_description || stringValue(payload.short_description);
    }
    if (collectionKey === "testimonials") payload.rating = Number(payload.rating);
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
  const landscapePreview = imageUrlValue(draft.image_url) || imageUrlValue(draft.portrait_image_url);
  const portraitPreview = imageUrlValue(draft.portrait_image_url);

  return <main className="min-h-screen bg-stone-50 px-4 py-8 pt-16 dark:bg-slate-950 sm:px-6 md:pt-8"><div className="mx-auto max-w-5xl">
    <Link href="/admin/dashboard" className="inline-flex min-h-11 items-center font-semibold text-slate-800 hover:underline dark:text-slate-300">← Dashboard</Link>
    <header className="my-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">{collection.title}</h1>{collectionKey === "banners" && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Banners play in this order on the home page.</p>}</div><button type="button" onClick={() => beginEdit()} className="min-h-11 rounded-xl bg-slate-900 px-4 font-semibold text-white">Add new {collection.singular}</button></header>
    {pageLink && <Link href={pageLink} target="_blank" className="inline-flex min-h-11 items-center text-sm font-semibold underline">View on website ↗</Link>}
    {toast && <p role="status" className="my-3 rounded-xl bg-slate-100 p-3 text-slate-950 dark:bg-slate-950 dark:text-slate-100">{toast}</p>}
    {error && <p role="alert" className="my-3 rounded-xl bg-red-100 p-3 text-red-900 dark:bg-red-950 dark:text-red-100">{error}</p>}
    {loading ? <div aria-label="Loading list" className="mt-5 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>
      : rows.length === 0 ? <p className="mt-5 rounded-2xl bg-white p-6 dark:bg-slate-900">No {collection.title.toLowerCase()} yet. Add your first {collection.singular}.</p>
      : <div className="mt-5 space-y-3">{rows.map((row, index) => <article key={String(row.id ?? index)} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        {typeof row.image_url === "string" && row.image_url && <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-28"><Image src={row.image_url} alt="" fill unoptimized sizes="112px" className="object-cover" /></div>}
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-semibold">{titleOf(collection, row)}</h2>{"is_active" in row && <span className={`rounded-full px-2 py-1 text-xs font-bold ${booleanValue(row.is_active) ? "bg-slate-100 text-slate-900" : "bg-slate-200 text-slate-700"}`}>{booleanValue(row.is_active) ? "Visible" : "Hidden"}</span>}</div><p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{stringValue(row.short_description || row.quote || row.description || row.subtitle)}</p></div>
        <div className="flex flex-wrap gap-1">
          <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => void move(index, -1)} className="min-h-11 min-w-11 rounded-lg border text-lg disabled:opacity-40 dark:border-slate-700">↑</button><button type="button" aria-label="Move down" disabled={index === rows.length - 1} onClick={() => void move(index, 1)} className="min-h-11 min-w-11 rounded-lg border text-lg disabled:opacity-40 dark:border-slate-700">↓</button>
        </div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => beginEdit(row)} className="min-h-11 rounded-lg border px-3 text-sm font-semibold dark:border-slate-700">Edit</button>{"is_active" in row && <button type="button" onClick={() => void toggleVisibility(row)} className="min-h-11 rounded-lg border px-3 text-sm font-semibold dark:border-slate-700">{booleanValue(row.is_active) ? "Hide" : "Show"}</button>}<button type="button" onClick={() => void remove(row)} className="min-h-11 rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-800">Delete</button></div>
      </article>)}</div>}

    {editing && <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/50 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEdit(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="editor-title" className="mx-auto my-4 max-w-2xl rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-6">
        <header className="flex items-center justify-between gap-3"><h2 id="editor-title" className="text-xl font-bold">{typeof draft.id === "number" ? "Edit" : "Add"} {collection.singular}</h2><button type="button" onClick={closeEdit} aria-label="Close form" className="min-h-11 min-w-11 rounded-lg border dark:border-slate-700">×</button></header>
        <form ref={formRef} onSubmit={(event) => void save(event)} className="mt-4 space-y-4">
            {collection.fields.map((field) => <FieldControl key={field.key} field={field} value={draft[field.key]} imageAlt={draft[field.key.replace(/_url$/, "_alt")]} onChange={(value) => update(field.key, value)} />)}
            {collectionKey === "banners" && draft.button_link === "custom" && <FieldControl field={{ key: "button_custom_link", label: "Custom page or website address", help: "For example, https://example.com/offer.", required: true }} value={draft.button_custom_link} onChange={(value) => update("button_custom_link", value)} />}
                  {collectionKey === "banners" && <section aria-label="Banner preview" className="overflow-hidden rounded-xl border dark:border-slate-700"><h3 className="p-3 font-semibold">Live banner preview</h3><div className="relative min-h-52 bg-slate-950 p-6 text-white">{landscapePreview && <picture className="absolute inset-0"><source media="(max-width: 1023px)" srcSet={portraitPreview || landscapePreview} /><Image src={landscapePreview} alt="" fill unoptimized sizes="640px" className="object-cover opacity-70" /></picture>}<div className="relative z-10"><p className="font-bold">{stringValue(draft.badge_text)}</p><h4 className="mt-3 text-2xl font-bold">{stringValue(draft.title) || "Your banner heading"}</h4><p className="mt-2 text-lg">{stringValue(draft.subtitle)}</p><p className="mt-2">{stringValue(draft.description)}</p><span className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-4 font-semibold text-slate-950">{stringValue(draft.button_text) || "Button text"}</span></div></div></section>}
          <footer className="sticky bottom-0 flex gap-3 bg-white py-3 dark:bg-slate-900"><button type="submit" disabled={busy} className="min-h-12 flex-1 rounded-xl bg-slate-900 px-4 font-semibold text-white disabled:opacity-60">{busy ? <><span aria-hidden="true" className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-r-transparent align-[-3px]" />Saving…</> : "Save changes"}</button><button type="button" onClick={closeEdit} className="min-h-12 rounded-xl border px-4 font-semibold dark:border-slate-700">Cancel</button></footer>
        </form>
      </section>
    </div>}
  </div></main>;
}

function imageUrlValue(value: unknown) {
  if (typeof value === "string") return value;
  const url = asRecord(value).url;
  return typeof url === "string" ? url : "";
}

function FieldControl({ field, value, imageAlt, onChange }: { field: Field; value: unknown; imageAlt?: unknown; onChange: (value: unknown) => void }) {
  const inputClass = "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950";
  if (field.kind === "single-image") {
    const imageValue = value && typeof value === "object" && "url" in value ? value as UploadedImage : null;
    const image: UploadedImage | null = imageValue ?? (stringValue(value) ? { url: stringValue(value), alt: stringValue(imageAlt) } : null);
    return <ImageUpload label={field.label} hint={field.help} value={image} onChange={(next) => onChange(next && !Array.isArray(next) ? next : null)} showDescription={field.showDescription} />;
  }
  if (field.kind === "boolean") return <label className="flex min-h-12 items-center gap-3 rounded-lg border p-3 text-sm font-semibold dark:border-slate-700"><input type="checkbox" checked={booleanValue(value)} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-slate-800" />{field.label}</label>;
  if (field.key === "rating") return <fieldset><legend className="font-semibold">{field.label}</legend><div className="mt-1 flex gap-1" role="radiogroup" aria-label="Star rating">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" role="radio" aria-checked={Number(value) === rating} aria-label={`${rating} star${rating === 1 ? "" : "s"}`} onClick={() => onChange(rating)} className="min-h-11 min-w-11 rounded-lg text-2xl text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800"> {Number(value) >= rating ? "★" : "☆"} </button>)}</div></fieldset>;
  if (field.kind === "select") {
    const options = field.options ?? [];
    return <label className="block text-sm font-semibold">{field.label}{field.required && <span className="text-red-700"> *</span>}{field.help && <span className="mt-1 block font-normal text-slate-600">{field.help}</span>}<select required={field.required} value={stringValue(value)} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Choose…</option>{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>;
  }
  if (field.kind === "rich") return <RichTextField label={field.label} value={stringValue(value)} onChange={onChange} help={field.help} required={field.required} />;
  if (field.kind === "string-list") return <label className="block text-sm font-semibold">{field.label}{field.help && <span className="mt-1 block font-normal text-slate-600 dark:text-slate-300">{field.help}</span>}<textarea value={Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : stringValue(value)} onChange={(event) => onChange(event.target.value)} rows={4} className={inputClass} /></label>;
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

  const load = useCallback(async () => {
    try {
      const result = await apiRequest<About[]>("/admin/about");
      const about = result[0] as unknown as Row | undefined;
      setItem(about ?? null);
      setDraft(about ? { ...about } : { title: "About RK Transport", subtitle: "", description: "", mission: "", vision: "", images: [], stats: [], story_image_side: "left", why_choose_us: [], banner_image_url: "" });
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
  const bannerImage: UploadedImage | null = typeof draft.banner_image_url === "string" && draft.banner_image_url ? { url: stringValue(draft.banner_image_url), alt: "" } : null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stringValue(draft.title).trim()) { setError("Please add an About page heading before saving."); return; }
    if (!stringValue(draft.description).trim()) { setError("Please add your story before saving."); return; }
    setBusy(true); setError(""); setToast("");
    const payload = {
      ...draft,
      stats: stats.slice(0, 4).map((stat) => ({ value: `${stringValue(stat.number)}${booleanValue(stat.plus) ? "+" : ""}`, label: stringValue(stat.label) })),
      images: storyImage ? [{ url: storyImage.url, alt: storyImage.alt || "", side: stringValue(draft.story_image_side) }] : [],
      banner_image_url: stringValue(draft.banner_image_url),
    };
    try {
      if (typeof item?.id === "number") await apiRequest(`/admin/about/${item.id}`, { method: "PUT", body: JSON.stringify(payload) });
      else await apiRequest("/admin/about", { method: "POST", body: JSON.stringify(payload) });
      setDirty(false); setToast("About page saved."); await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-stone-50 px-4 py-8 pt-16 dark:bg-slate-950 sm:px-6 md:pt-8"><div className="mx-auto max-w-4xl">
    <Link href="/admin/dashboard" className="inline-flex min-h-11 items-center font-semibold">← Dashboard</Link>
    <h1 className="my-5 text-3xl font-bold">About page</h1>
    <Link href="/about" target="_blank" className="inline-flex min-h-11 items-center font-semibold text-slate-800 underline dark:text-slate-300">View on website ↗</Link>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-100 p-3 text-red-900">{error}</p>}
    {toast && <p role="status" className="mb-4 rounded-xl bg-slate-100 p-3">{toast}</p>}
    {loading ? <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /> : <form onSubmit={(event) => void save(event)} className="mt-5 space-y-6 bg-white p-6 rounded-2xl shadow dark:bg-slate-900">
      <label className="block text-sm font-semibold">Heading <input type="text" value={stringValue(draft.title)} onChange={(e) => update("title", e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" required /></label>
      <label className="block text-sm font-semibold">Subtitle <input type="text" value={stringValue(draft.subtitle)} onChange={(e) => update("subtitle", e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
      
      <ImageUpload 
        label="About Banner Background Image" 
        hint="Custom background image for the About page hero banner." 
        value={bannerImage} 
        onChange={(next) => update("banner_image_url", next && !Array.isArray(next) ? next.url : "")} 
      />

      <label className="block text-sm font-semibold">Our Story / Description <textarea rows={6} value={stringValue(draft.description)} onChange={(e) => update("description", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950" required /></label>
      
      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-slate-900 px-4 font-semibold text-white disabled:opacity-60">{busy ? "Saving..." : "Save About Page"}</button>
    </form>}
  </div></main>;
}