"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import StickyActions from "./sticky-actions";

export default function ConditionalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <SiteHeader />}
      {children}
      {!isAdmin && <StickyActions />}
      {!isAdmin && <SiteFooter />}
    </>
  );
}
