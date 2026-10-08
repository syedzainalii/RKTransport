"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "../../lib/transport-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest("/auth/me").then(() => router.replace("/admin/dashboard")).catch(() => undefined);
  }, [router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const nextPath = new URL(window.location.href).searchParams.get("next");
      router.replace(nextPath?.startsWith("/admin/dashboard") ? nextPath : "/admin/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 px-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <Link href="/" className="text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">← RK Transport</Link>
        <h1 className="mt-7 text-3xl font-bold">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to manage bookings and website content.</p>
        <form onSubmit={login} className="mt-6 space-y-4">
          <div><label htmlFor="username" className="mb-1.5 block text-sm font-semibold">Username</label><input autoComplete="username" id="username" name="username" required className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></div>
          <div><label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label><input autoComplete="current-password" id="password" name="password" type="password" required className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" /></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={busy} className="min-h-12 w-full rounded-xl bg-emerald-900 px-5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
        </form>
      </section>
    </main>
  );
}
