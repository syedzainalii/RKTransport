import type { Metadata } from "next";
import { BreadcrumbStructuredData } from "../Components/structured-data";
import { generatePageMetadata } from "../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await generatePageMetadata("/track", {
      title: "Track a Booking | RK Transport",
      description: "Check the status of an RK Transport booking using your booking reference.",
    })),
    robots: { index: false, follow: false },
  };
}

export default function TrackLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Track a booking", path: "/track" }]} />
    {children}
  </>;
}
