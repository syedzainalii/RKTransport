import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

const PACKAGES = [
  {
    name: "Single Passenger Seat",
    price: "AED 50",
    period: "one way",
    desc: "Ideal for daily commuters between Dubai & Abu Dhabi",
    popular: false,
    feats: [
      "Door-to-door pickup & drop-off",
      "Spacious air-conditioned cabin",
      "Professional & licensed driver",
      "Fixed daily timing schedule",
    ],
  },
  {
    name: "Full Private Car",
    price: "AED 250",
    period: "one way",
    desc: "Exclusive luxury ride for families or business trips",
    popular: true,
    feats: [
      "100% private vehicle",
      "Custom pickup time & location",
      "Flexible luggage capacity",
      "Direct nonstop highway route",
      "Priority 24/7 dispatch",
    ],
  },
  {
    name: "Monthly Commuter Pass",
    price: "AED 1,200",
    period: "per month",
    desc: "Best value for regular daily travel between cities",
    popular: false,
    feats: [
      "Guaranteed seat reservation",
      "Flexible morning/evening slots",
      "Discounted per-trip rate",
      "Dedicated account manager",
    ],
  },
];

export default function PackagesSection() {
  return (
    <section
      id="packages"
      data-snap-section
      data-label="Packages"
      className="snap-section relative isolate overflow-hidden bg-slate-950 px-4 text-white sm:px-6"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.15),transparent_60%)]"
      />
      <div className="mx-auto w-full max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-white/60">
            Transparent Pricing
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            Choose Your Travel Package
          </h2>
          <p className="mt-4 text-slate-300">
            Affordable rates for individual seats or private rides between Dubai & Abu Dhabi.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative flex flex-col justify-between rounded-3xl border p-8 backdrop-blur transition duration-300 hover:-translate-y-1 ${
                pkg.popular
                  ? "border-amber-400/50 bg-white/10 shadow-2xl shadow-amber-500/10"
                  : "border-white/10 bg-white/5 shadow-xl"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3.5 right-8 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-950">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-2xl font-bold">{pkg.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{pkg.desc}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tabular-nums">{pkg.price}</span>
                  <span className="text-xs text-slate-400">{pkg.period}</span>
                </div>

                <ul className="mt-8 space-y-3 border-t border-white/10 pt-6">
                  {pkg.feats.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-slate-200">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="size-3.5" />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/contact"
                className={`mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full font-semibold transition ${
                  pkg.popular
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                    : "bg-white text-slate-950 hover:bg-slate-200"
                }`}
              >
                Book Package
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}