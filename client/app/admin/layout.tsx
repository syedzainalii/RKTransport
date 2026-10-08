import type { Metadata } from "next";
import AdminShell from "./admin-shell";

export const metadata: Metadata = {
  title: "Admin | RK Transport",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminShell>{children}</AdminShell>;
}
