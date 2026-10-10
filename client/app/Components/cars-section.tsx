import Link from "next/link";
import { ArrowUpRight, Car, Users } from "lucide-react";

const FLEET_PREVIEWS = [
  {
    slug: "sedan",
    title: "Executive Sedan",
    desc: "Smooth, air-conditioned sedans perfect for individual travelers and daily commuters.",
    seats: "1 - 4 Passengers",
  },
  {
    slug: "suv",
    title: "Luxury Family SUV",
    desc: "Spacious SUVs offering extra legroom and luggage space for comfortable family journeys.",
    seats: "Up to 7 Passengers",
  },
  {
    slug: "van",
    title: "Executive Commuter Van",
    desc: "Premium vans designed for group travel and corporate commuters between cities.",
    seats: "Up to 12 Passengers",
  },
];

export default function CarsSection() {
  return (
    <section
      id="cars"
      data-snap-section
      data-label="Cars"
      className="snap-section mx-auto w-full max-w-7xl px-4 sm:px-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">
            Our Fleet
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Travel in Comfort & Safety
          </h2>
        </div>
        <Link
          href="/cars"
          className="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline"
        >
          View all cars & fleet <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {FLEET_PREVIEWS.map((car) => (
          <div
            key={car.title}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white">
                <Car className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{car.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {car.desc}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Users className="size-3.5" /> {car.seats}
              </span>
              <Link
                href={`/cars/${car.slug}`}
                className="text-sm font-bold text-slate-950 hover:underline dark:text-white"
              >
                View details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}