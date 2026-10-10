import { Clock, ShieldCheck, MapPin, Sparkles, HeartHandshake, Banknote } from "lucide-react";

const ADVANTAGES = [
  {
    icon: Clock,
    title: "Available 24/7",
    desc: "Day or night, our drivers and dispatch team are on call to suit your flexible travel schedule.",
  },
  {
    icon: Banknote,
    title: "Fixed Transparent Rates",
    desc: "No hidden charges or surge pricing. You know your exact fare before you step into the car.",
  },
  {
    icon: MapPin,
    title: "Door-to-Door Pickups",
    desc: "We pick you up directly from your home, hotel, or building and drop you right at your destination.",
  },
  {
    icon: ShieldCheck,
    title: "Licensed & Safety Verified",
    desc: "All drivers are professional UAE license holders with proven highway safety records.",
  },
  {
    icon: Sparkles,
    title: "Clean & Comfortable Fleet",
    desc: "Sanitized AC vehicles equipped with fast charging and plush seating for smooth highway rides.",
  },
  {
    icon: HeartHandshake,
    title: "Reliable Daily Commutes",
    desc: "Trusted by regular intercity commuters traveling between Dubai and Abu Dhabi every single day.",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section
      id="why-choose-us"
      data-snap-section
      data-label="Why Choose Us"
      className="snap-section relative isolate overflow-hidden bg-slate-950 px-4 text-white sm:px-6"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(148,163,184,0.15),transparent_60%)]"
      />
      <div className="mx-auto w-full max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-white/60">
            The RK Advantage
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            Why Choose Us For Your Journey
          </h2>
          <p className="mt-4 text-slate-300">
            We make traveling between Dubai and Abu Dhabi effortless, comfortable, and dependable.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition duration-300 hover:border-white/20 hover:bg-white/10"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-amber-400 text-slate-950 font-bold">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}