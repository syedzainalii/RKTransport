"use client";

import { useEffect } from "react";

export default function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const confirmNavigation = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      if (link.href === window.location.href) return;
      if (!window.confirm("You have unsaved changes. Leave this page and discard them?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("click", confirmNavigation, true);
    return () => document.removeEventListener("click", confirmNavigation, true);
  }, [dirty]);
}
