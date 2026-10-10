import Link from "next/link";
import { ArrowUpRight, Compass, MapPin } from "lucide-react";

export default function RoutesSection() {
  return (
    <section
      id="routes"
      data-snap-section
      data-label="Routes"
      className="snap-section mx-auto w-full max-w-7xl px-4 sm:px-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">
            Coverage Areas
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Routes We Cover
          </h2>
        </div>
        <Link
          href="/routes"
          className="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline"
        >
          View all pickup & drop points <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <Compass className="size-10 text-slate-900 dark:text-white" />
            <h3 className="mt-4 text-2xl font-bold">
              Dubai ⇄ Abu Dhabi Daily Corridors
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Covering all major neighborhoods including JLT, Dubai Marina, Deira, Bur Dubai, Downtown, Khalifa City, Mussafah, Yas Island, and Al Reem Island.
            </p>
            <div className="mt-6">
              <Link
                href="/routes"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-6 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Explore Route Points <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-stone-100 p-6 dark:bg-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <MapPin className="size-4 text-amber-500" />
                <span>Dubai Pickups</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                14+ Major areas covered daily
              </p>
            </div>
            <div className="rounded-2xl bg-stone-100 p-6 dark:bg-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <MapPin className="size-4 text-amber-500" />
                <span>Abu Dhabi Drops</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                10+ Key locations serviced
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}