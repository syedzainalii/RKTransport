"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle({ transparent = false }: { transparent?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label="Toggle color theme"
      className={`inline-grid size-11 shrink-0 place-items-center rounded-full border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${transparent ? "border-white/50 text-white hover:bg-white/10" : "border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"}`}
    >
      <Moon size={19} aria-hidden="true" className="dark:hidden" />
      <Sun size={19} aria-hidden="true" className="hidden dark:block" />
    </button>
  );
}
