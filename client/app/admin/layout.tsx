import ThemeToggle from "../Components/theme-toggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | RK Transport",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="fixed right-4 top-4 z-[60]">
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
