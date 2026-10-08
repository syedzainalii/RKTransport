"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiRequest } from "../../../../lib/transport-api";

export default function AdminAccountPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("current_password") || "");
    const newPassword = String(form.get("new_password") || "");
    const confirmPassword = String(form.get("confirm_password") || "");
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      setBusy(false);
      return;
    }
    try {
      await apiRequest("/auth/password", {
        method: "PUT",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      event.currentTarget.reset();
      setSuccess("Your password has been updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update password.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-slate-950 sm:px-6">
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/dashboard" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← Dashboard</Link>
      <h1 className="my-5 text-3xl font-bold">Admin account</h1>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      <form onSubmit={updatePassword} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Change password</h2>
        <label className="text-sm font-semibold">Current password<input required type="password" name="current_password" autoComplete="current-password" className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
        <label className="text-sm font-semibold">New password (at least 12 characters)<input required minLength={12} type="password" name="new_password" autoComplete="new-password" className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
        <label className="text-sm font-semibold">Confirm new password<input required minLength={12} type="password" name="confirm_password" autoComplete="new-password" className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></label>
        {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{success}</p>}
        <button disabled={busy} className="min-h-11 rounded-xl bg-emerald-900 px-4 font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Update password"}</button>
      </form>
    </div>
  </main>;
}
