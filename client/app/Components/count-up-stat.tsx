"use client";

import { useEffect, useRef, useState } from "react";

export default function CountUpStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = value.match(/^(\d+)(.*)$/);
    if (!match || !ref.current) return;
    const target = Number(match[1]);
    const suffix = match[2];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    let frame = 0;
    let start: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const animate = (now: number) => {
        start ??= now;
        const progress = Math.min((now - start) / 1200, 1);
        setDisplay(`${Math.round(target * progress)}${suffix}`);
        if (progress < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }, { threshold: 0.4 });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <div ref={ref} className="rounded-2xl bg-stone-100 p-5 dark:bg-slate-900">
    <p className="text-3xl font-bold text-slate-800 dark:text-slate-300">{display}</p>
    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{label}</p>
  </div>;
}
