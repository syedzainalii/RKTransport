"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest, type AdminSiteSettings } from "../../../../lib/transport-api";

const editableFields: { key: keyof AdminSiteSettings; label: string; type?: string }[] = [
  { key: "brand_name", label: "Business name" },
  { key: "tagline", label: "Tagline" },
  { key: "phone_primary", label: "Primary phone (+971)", type: "tel" },
  { key: "phone_recovery", label: "Recovery phone (+971)", type: "tel" },
  { key: "whatsapp", label: "WhatsApp (+971)", type: "tel" },
  { key: "email", label: "Contact email", type: "email" },
  { key: "address_line", label: "Address" },
  { key: "city", label: "City" },
  { key: "emirate", label: "Emirate" },
  { key: "country", label: "Country" },
  { key: "core_route_label", label: "Core route" },
  { key: "hours_label", label: "Availability label" },
  { key: "timezone", label: "Timezone" },
  { key: "currency_code", label: "Currency code" },
  { key: "currency_symbol", label: "Currency symbol" },
  { key: "header_cta_label", label: "Header button text" },
  { key: "header_cta_href", label: "Header button link" },
  { key: "footer_blurb", label: "Footer description" },
  { key: "logo_url", label: "Logo URL" },
  { key: "logo_dark_url", label: "Dark logo URL" },
  { key: "favicon_url", label: "Favicon URL" },
  { key: "seo_title", label: "SEO title" },
  { key: "seo_description", label: "SEO description" },
  { key: "og_image_url", label: "Social sharing image URL" },
  { key: "facebook_url", label: "Facebook URL", type: "url" },
  { key: "instagram_url", label: "Instagram URL", type: "url" },
  { key: "tiktok_url", label: "TikTok URL", type: "url" },
  { key: "maps_embed_url", label: "Map embed URL", type: "url" },
  { key: "notification_admin_email", label: "Notification recipient email", type: "email" },
  { key: "notification_admin_phone", label: "Notification recipient WhatsApp (+971)", type: "tel" },
];

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<AdminSiteSettings | null>(null);
  const [available, setAvailable] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [timeSlots, setTimeSlots] = useState("");
  const [blockedDates, setBlockedDates] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest("/auth/me")
      .then(() => apiRequest<AdminSiteSettings>("/admin/settings"))
      .then((value) => {
        setSettings(value);
        setAvailable(value.available_24_7);
        setEmailNotifications(value.notifications_email_enabled);
        setWhatsappNotifications(value.notifications_whatsapp_enabled);
        setTimeSlots(value.booking_time_slots.join("\n"));
        setBlockedDates(value.blocked_dates.join("\n"));
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setBusy(true);
    setError("");
    setSuccess("");
    const data = new FormData(event.currentTarget);
    const payload: Record<string, string | boolean | string[] | null> = {
      available_24_7: available,
      notifications_email_enabled: emailNotifications,
      notifications_whatsapp_enabled: whatsappNotifications,
      booking_time_slots: timeSlots.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
      blocked_dates: blockedDates.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
    };
    for (const field of editableFields) {
      const value = String(data.get(field.key) || "");
      payload[field.key] = value || (field.key === "notification_admin_email" || field.key === "notification_admin_phone" ? null : "");
    }
    try {
      const updated = await apiRequest<AdminSiteSettings>("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSettings(updated);
      setAvailable(updated.available_24_7);
      setEmailNotifications(updated.notifications_email_enabled);
      setWhatsappNotifications(updated.notifications_whatsapp_enabled);
      setTimeSlots(updated.booking_time_slots.join("\n"));
      setBlockedDates(updated.blocked_dates.join("\n"));
      setSuccess("Site settings saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save settings.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6"><div className="mx-auto max-w-4xl">
    <Link href="/admin/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link>
    <h1 className="my-5 text-3xl font-bold">Site settings</h1>
    {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {!settings ? <p>Loading settings…</p> : <form onSubmit={save} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
      {editableFields.map((field) => <label key={field.key} className="text-sm font-semibold">{field.label}<input name={field.key} type={field.type || "text"} defaultValue={String(settings[field.key] ?? "")} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>)}
      <label className="flex min-h-12 items-center gap-3 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} className="size-5 accent-emerald-800" />Business is available 24/7</label>
      <fieldset className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:col-span-2">
        <legend className="px-2 font-bold">Admin notifications</legend>
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={emailNotifications} onChange={(event) => setEmailNotifications(event.target.checked)} className="size-5 accent-emerald-800" />Email admins about requests and send customer confirmations</label>
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={whatsappNotifications} onChange={(event) => setWhatsappNotifications(event.target.checked)} className="size-5 accent-emerald-800" />Send admin WhatsApp notifications</label>
        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">Admin delivery addresses are configured below. Email also sends booking confirmations to customers when an email address is provided. Provider credentials are configured using server environment variables; delivery failures are recorded in the Notifications dashboard.</p>
      </fieldset>
      <fieldset className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:col-span-2">
        <legend className="px-2 font-bold">Booking availability</legend>
        <label className="text-sm font-semibold">Available time slots (24-hour HH:MM, one per line)
          <textarea value={timeSlots} onChange={(event) => setTimeSlots(event.target.value)} rows={4} placeholder={"09:00\n12:00\n15:00"} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-950" />
        </label>
        <label className="text-sm font-semibold">Blocked dates (YYYY-MM-DD, one per line)
          <textarea value={blockedDates} onChange={(event) => setBlockedDates(event.target.value)} rows={4} placeholder="2026-12-25" className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-950" />
        </label>
      </fieldset>
      {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 sm:col-span-2">{success}</p>}
      <button disabled={busy} className="min-h-12 rounded-xl bg-emerald-900 px-5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:col-span-2">{busy ? "Saving…" : "Save settings"}</button>
    </form>}
  </div></main>;
}
