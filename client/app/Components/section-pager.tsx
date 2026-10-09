"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Item = { label: string };

function getSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-snap-section], footer"));
}

export default function SectionPager() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);

  const refresh = useCallback(() => {
    const sections = getSections();
    if (sections.length === 0) return;
    setItems(
      sections.map((el) => ({
        label: el.dataset.label || (el.tagName === "FOOTER" ? "Contact" : "Section"),
      }))
    );
    const probe = window.innerHeight * 0.4;
    let current = 0;
    sections.forEach((el, index) => {
      if (el.getBoundingClientRect().top <= probe) current = index;
    });
    setActive(current);
  }, []);

  const goTo = useCallback((index: number) => {
    const sections = getSections();
    const target = sections[Math.max(0, Math.min(index, sections.length - 1))];
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  useEffect(() => {
    refresh();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [refresh]);

  // Keyboard navigation for desktop
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "SUMMARY"].includes(target.tagName))
      )
        return;

      const sections = getSections();
      const current = sections[active];
      if (!current) return;
      const rect = current.getBoundingClientRect();

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        if (rect.bottom > window.innerHeight + 8) return;
        event.preventDefault();
        goTo(active + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        if (rect.top < -8) return;
        event.preventDefault();
        goTo(active - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 text-white mix-blend-difference sm:right-4 sm:gap-3"
    >
      <button
        type="button"
        onClick={() => goTo(active - 1)}
        disabled={active === 0}
        aria-label="Previous section"
        className="grid size-7 place-items-center rounded-full transition hover:scale-110 disabled:opacity-30 sm:size-8"
      >
        <ChevronUp aria-hidden="true" className="size-4 sm:size-5" />
      </button>

      {items.map((item, index) => (
        <button
          key={`${item.label}-${index}`}
          type="button"
          onClick={() => goTo(index)}
          aria-label={`Go to ${item.label}`}
          aria-current={active === index ? "true" : undefined}
          title={item.label}
          className="grid size-5 place-items-center sm:size-6"
        >
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === index
                ? "size-2.5 bg-white sm:size-3"
                : "size-1.5 bg-white/40 hover:bg-white/70 sm:size-2"
            }`}
          />
        </button>
      ))}

      <button
        type="button"
        onClick={() => goTo(active + 1)}
        disabled={active === items.length - 1}
        aria-label="Next section"
        className="grid size-7 place-items-center rounded-full transition hover:scale-110 disabled:opacity-30 sm:size-8"
      >
        <ChevronDown aria-hidden="true" className="size-4 sm:size-5" />
      </button>
    </nav>
  );
}