import { ShieldCheck, Sparkles, Wind, Navigation, Luggage } from "lucide-react";

const SPECIAL_FEATURES = [
  {
    icon: Sparkles,
    title: "Sanitized Daily",
    desc: "Thoroughly cleaned and disinfected before every single trip for your peace of mind.",
  },
  {
    icon: Wind,
    title: "Climate Controlled",
    desc: "Powerful dual-zone AC units optimized for UAE weather conditions year-round.",
  },
  {
    icon: Navigation,
    title: "GPS Tracked",
    desc: "Real-time navigation and monitoring for maximum safety and punctual arrival.",
  },
  {
    icon: Luggage,
    title: "Extra Luggage Room",
    desc: "Dedicated storage compartments designed to fit suitcases and travel bags comfortably.",
  },
];

export default function CarsSpecialSection() {
  return (
    <section
      id="cars-special"
      data-snap-section
      data-label="Car Features"
      className="snap-section relative isolate overflow-hidden bg-slate-900 px-4 text-white sm:px-6"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-white/60">
            Unmatched Quality
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            What Makes Our Cars Special For Travel
          </h2>
          <p className="mt-4 text-slate-300">
            Every vehicle in our fleet is meticulously maintained for long-distance intercity trips between Dubai and Abu Dhabi.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SPECIAL_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:border-white/20 hover:bg-white/10"
              >
                <Icon className="size-8 text-amber-400" />
                <h3 className="mt-4 text-lg font-bold">{feat.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}