import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RK Transport",
    short_name: "RK Transport",
    description: "Car transport, recovery, and storage services across the UAE.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#102d25",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
