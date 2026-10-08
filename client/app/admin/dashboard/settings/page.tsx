"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest, type AdminSiteSettings } from "../../../../lib/transport-api";
import ImageUpload, { type UploadedImage } from "../components/image-upload";
import useUnsavedChanges from "../components/use-unsaved-changes";

type Settings = AdminSiteSettings;
type TextKey = "brand_name" | "tagline" | "phone_primary" | "whatsapp" | "email" | "address_line" | "city" | "emirate" | "country" | "facebook_url" | "instagram_url" | "maps_embed_url" | "hours_label" | "footer_blurb" | "notification_admin_email" | "notification_admin_phone";

const inputClass = "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950";
const PHONE_PATTERN = "^\\+971[0-9]{8,9}$";

function friendlyError(reason: unknown) {
  if (reason instanceof Error && "status" in reason && reason.status === 422) return "Please check the highlighted details and try again.";
  return "We could not save your settings. Please check your connection and try again.";
}

export default function SiteSettingsPage() {
  const [draft, setDraft] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  const load = useCallback(async () => {
    try {
      const value = await apiRequest<Settings>("/admin/settings");
      setDraft(value); setDirty(false);
    } catch { setError("We could not load business settings. Please refresh and try again."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDirty(true);
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setError(""); setNotice("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const invalidPhone = (["phone_primary", "whatsapp", "notification_admin_phone"] as const)
      .some((key) => { const value = String(formData.get(key) || "").trim(); return value !== "" && !/^\+971[0-9]{8,9}$/.test(value.replace(/\s+/g, "")); });
    const invalidUrl = (["facebook_url", "instagram_url", "maps_embed_url"] as const)
      .some((key) => { const value = String(formData.get(key) || "").trim(); if (!value) return false; try { return !["http:", "https:"].includes(new URL(value).protocol); } catch { return true; } });
    if (invalidPhone || invalidUrl) {
      setError(invalidPhone ? "Enter UAE phone numbers in +971 format, for example +971501234567." : "Enter a complete website link beginning with https://.");
      return;
    }
    setBusy(true);
    try {
      const businessSettings = Object.fromEntries(
        Object.entries(draft).filter(([key]) => key !== "booking_time_slots" && key !== "blocked_dates"),
      );
      const updated = await apiRequest<Settings>("/admin/settings", { method: "PUT", body: JSON.stringify(businessSettings) });
      setDraft(updated); setDirty(false); setNotice("Business settings saved.");
    } catch (reason) { setError(friendlyError(reason)); }
    finally { setBusy(false); }
  }

  const field = (key: TextKey, label: string, options?: { type?: string; hint?: string; multiline?: boolean; required?: boolean }) => {
    if (!draft) return null;
    const value = String(draft[key] ?? "");
    return <label key={key} className="block text-sm font-semibold">{label}{options?.required && <span className="text-red-700"> *</span>}
      {options?.hint && <span className="mt-1 block font-normal text-slate-600 dark:text-slate-300">{options.hint}</span>}
      {options?.multiline
        ? <textarea name={key} required={options.required} value={value} onChange={(event) => change(key, event.target.value as Settings[typeof key])} rows={4} className={`${inputClass} py-2`} />
        : <input name={key} type={options?.type || "text"} required={options?.required} pattern={options?.type === "tel" ? PHONE_PATTERN : undefined} value={value} onChange={(event) => change(key, event.target.value as Settings[typeof key])} className={inputClass} />}
    </label>;
  };

  const normalLogo: UploadedImage | null = draft?.logo_url ? { url: draft.logo_url, alt: draft.logo_alt } : null;
  const darkLogo: UploadedImage | null = draft?.logo_dark_url ? { url: draft.logo_dark_url, alt: draft.logo_dark_alt } : null;

  return <main className="min-h-screen bg-stone-50 px-4 py-8 pt-16 dark:bg-slate-950 sm:px-6 md:pt-8"><div className="mx-auto max-w-4xl">
    <Link href="/admin/dashboard" className="inline-flex min-h-11 items-center font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link>
    <h1 className="my-5 text-3xl font-bold">Business settings</h1>
    <Link href="/" target="_blank" className="mb-5 inline-flex min-h-11 items-center font-semibold text-emerald-800 underline dark:text-emerald-300">View website ↗</Link>
    <p className="mb-5 text-slate-600 dark:text-slate-300">These details appear across your public website and help customers contact you.</p>
    {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-100 p-3 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">{notice}</p>}
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-100 p-3 text-red-900 dark:bg-red-950 dark:text-red-100">{error}</p>}
    {loading || !draft ? <div aria-label="Loading settings" className="h-60 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /> : <form onSubmit={(event) => void save(event)} className="space-y-4">
      <details open className="rounded-2xl bg-white p-4 dark:bg-slate-900"><summary className="min-h-11 cursor-pointer content-center text-lg font-bold">Business details</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
        {field("brand_name", "Business name", { required: true })}{field("tagline", "Short description")}
        <ImageUpload label="Logo upload" value={normalLogo} onChange={(value) => { const image = value && !Array.isArray(value) ? value : null; change("logo_url", image?.url ?? null); change("logo_alt", image?.alt ?? null); }} folder="brand" hint="If no dark-mode logo is added, this logo is used in both themes." />
        <ImageUpload label="Dark-mode logo (optional)" value={darkLogo} onChange={(value) => { const image = value && !Array.isArray(value) ? value : null; change("logo_dark_url", image?.url ?? null); change("logo_dark_alt", image?.alt ?? null); }} folder="brand" />
      </div></details>

      <details open className="rounded-2xl bg-white p-4 dark:bg-slate-900"><summary className="min-h-11 cursor-pointer content-center text-lg font-bold">Contact details</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
        {field("phone_primary", "Main phone", { type: "tel", hint: "UAE format, for example +971501234567." })}
        {field("whatsapp", "WhatsApp number", { type: "tel", hint: "UAE format, for example +971501234567." })}
        {field("email", "Contact email", { type: "email" })}
        {field("address_line", "Street address")}
        {field("city", "City")}
        {field("emirate", "Emirate")}
        {field("country", "Country")}
        <div className="sm:col-span-2">{field("maps_embed_url", "Map link", { type: "url", hint: "Paste a Google Maps share link, for example https://maps.google.com/…" })}</div>
      </div></details>

      <details className="rounded-2xl bg-white p-4 dark:bg-slate-900"><summary className="min-h-11 cursor-pointer content-center text-lg font-bold">Social media links</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
        {field("facebook_url", "Facebook page", { type: "url", hint: "Example: https://facebook.com/yourbusiness" })}
        {field("instagram_url", "Instagram page", { type: "url", hint: "Example: https://instagram.com/yourbusiness" })}
      </div></details>

      <details className="rounded-2xl bg-white p-4 dark:bg-slate-900"><summary className="min-h-11 cursor-pointer content-center text-lg font-bold">Opening hours</summary><div className="mt-4 space-y-4">
        <label className="flex min-h-12 items-center gap-3 font-semibold"><input type="checkbox" checked={draft.available_24_7} onChange={(event) => change("available_24_7", event.target.checked)} className="size-5 accent-emerald-800" />Available 24/7</label>
        {!draft.available_24_7 && field("hours_label", "Opening hours shown to customers", { hint: 'For example, "Mon–Sat, 8am–8pm".' })}
      </div></details>

      <details className="rounded-2xl bg-white p-4 dark:bg-slate-900"><summary className="min-h-11 cursor-pointer content-center text-lg font-bold">Admin notifications</summary><div className="mt-4 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">Choose which alerts the team receives. Provider credentials are managed by your website administrator.</p>
        <label className="flex min-h-12 items-center gap-3 font-semibold"><input type="checkbox" checked={draft.notifications_email_enabled} onChange={(event) => change("notifications_email_enabled", event.target.checked)} className="size-5 accent-emerald-800" />Email notifications are on</label>
        <label className="flex min-h-12 items-center gap-3 font-semibold"><input type="checkbox" checked={draft.notifications_whatsapp_enabled} onChange={(event) => change("notifications_whatsapp_enabled", event.target.checked)} className="size-5 accent-emerald-800" />WhatsApp notifications are on</label>
        <div className="grid gap-4 sm:grid-cols-2">{field("notification_admin_email", "Team notification email", { type: "email" })}{field("notification_admin_phone", "Team WhatsApp number", { type: "tel", hint: "UAE format, for example +971501234567." })}</div>
      </div></details>

      <details className="rounded-2xl bg-white p-4 dark:bg-slate-900"><summary className="min-h-11 cursor-pointer content-center text-lg font-bold">Footer text</summary><div className="mt-4">{field("footer_blurb", "Short business description", { multiline: true, hint: "Shown near the bottom of each page." })}</div></details>

      <button disabled={busy} className="min-h-12 w-full rounded-xl bg-emerald-900 px-4 font-semibold text-white disabled:opacity-60">{busy ? <><span aria-hidden="true" className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-r-transparent align-[-3px]" />Saving…</> : "Save business settings"}</button>
    </form>}
  </div></main>;
}
