import { UserCheck, Award, MapPin, Clock } from "lucide-react";

const DRIVER_HIGHLIGHTS = [
  {
    icon: UserCheck,
    title: "Verified & Licensed",
    desc: "All our drivers hold official UAE driving licenses with background checks and clean driving records.",
  },
  {
    icon: Clock,
    title: "Punctual & Courteous",
    desc: "Committed to timely doorstep pickups, respectful communication, and helpful luggage assistance.",
  },
  {
    icon: MapPin,
    title: "Intercity Route Experts",
    desc: "Extensive experience navigating Sheikh Zayed Road (E11) and major neighborhood shortcuts between Dubai and Abu Dhabi.",
  },
];

export default function DriversSection() {
  return (
    <section
      id="drivers"
      data-snap-section
      data-label="Our Drivers"
      className="snap-section mx-auto w-full max-w-7xl px-4 sm:px-6"
    >
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-slate-500 dark:text-slate-400">
          Professional Team
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Meet Our Expert Drivers
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Licensed, experienced, and dedicated to your safe and comfortable arrival.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {DRIVER_HIGHLIGHTS.map((d) => {
          const Icon = d.icon;
          return (
            <div
              key={d.title}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center"
            >
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{d.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {d.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}