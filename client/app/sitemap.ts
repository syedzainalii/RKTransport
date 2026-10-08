import type { MetadataRoute } from "next";
import { canonicalUrl } from "../lib/seo";
import { publicApi } from "../lib/transport-api";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/about",
    "/services",
    "/contact",
    "/storage",
    "/dubai-to-abu-dhabi-car-transport",
    "/abu-dhabi-to-dubai-car-transport",
    "/car-lift-recovery",
  ];
  let services: Awaited<ReturnType<typeof publicApi.services>> = [];
  try {
    services = await publicApi.services();
  } catch (error) {
    console.error(
      "Unable to load dynamic services for sitemap.xml:",
      error instanceof Error ? error.message : String(error),
    );
  }
  return [
    ...staticPaths.map((path) => ({
      url: canonicalUrl(path),
      changeFrequency: path === "/" ? "daily" as const : "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...services.map((service) => ({
      url: canonicalUrl(`/services/${service.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
