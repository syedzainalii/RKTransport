"use client";

import { useCallback, useEffect, useState } from "react";

function getSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-snap-section], footer"));
}

export default function SectionPager() {
  const [items, setItems] = useState<HTMLElement[]>([]);
  const [active, setActive] = useState(0);

  const refresh = useCallback(() => {
    const sections = getSections();
    if (sections.length === 0) return;
    setItems(sections);
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

  // Keyboard navigation for desktop remains fully active
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

  // Returns null to hide the visual dots/arrows from the screen,
  // while keeping all the core functionality running in the background.
  return null;
}