import type { Metadata } from "next";
import { publicApi, type SiteSettings } from "./transport-api";

type SeoDefaults = {
  title: string;
  description: string;
};

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function canonicalUrl(path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await publicApi.settings();
  } catch (error) {
    console.error("Unable to load site settings for SEO:", errorMessage(error));
    return null;
  }
}

export async function generatePageMetadata(
  path: string,
  defaults: SeoDefaults,
  copyKey = `seo.${path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replaceAll("/", ".")}`,
): Promise<Metadata> {
  const [settingsResult, copyResult] = await Promise.allSettled([
    publicApi.settings(),
    publicApi.pageCopy(),
  ]);
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const copy = copyResult.status === "fulfilled" ? copyResult.value : [];
  if (settingsResult.status === "rejected") {
    console.error("Unable to load site settings for page metadata:", errorMessage(settingsResult.reason));
  }
  if (copyResult.status === "rejected") {
    console.error("Unable to load editable page metadata:", errorMessage(copyResult.reason));
  }

  const pageValue = (suffix: "title" | "description") =>
    copy.find((item) => item.key === `${copyKey}.${suffix}`)?.value.trim();
  const title = pageValue("title") || (path === "/" ? settings?.seo_title : null) || defaults.title;
  const description = pageValue("description") || (path === "/" ? settings?.seo_description : null) || defaults.description;
  const url = canonicalUrl(path);
  const image = settings?.og_image_url || undefined;

  return {
    metadataBase: new URL(`${siteUrl}/`),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: settings?.brand_name || "RK Transport",
      url,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function businessJsonLd(settings: SiteSettings | null) {
  const brand = settings?.brand_name || "RK Transport";
  const socialProfiles = [
    settings?.facebook_url,
    settings?.instagram_url,
    settings?.tiktok_url,
  ].filter((url): url is string => Boolean(url));
  const address = settings?.address_line || settings?.city || settings?.emirate || settings?.country
    ? {
        "@type": "PostalAddress",
        ...(settings.address_line ? { streetAddress: settings.address_line } : {}),
        ...(settings.city ? { addressLocality: settings.city } : {}),
        ...(settings.emirate ? { addressRegion: settings.emirate } : {}),
        ...(settings.country ? { addressCountry: settings.country } : {}),
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    name: brand,
    url: canonicalUrl("/"),
    ...(settings?.tagline ? { description: settings.tagline } : {}),
    ...(settings?.phone_primary ? { telephone: settings.phone_primary } : {}),
    ...(address ? { address } : {}),
    areaServed: ["Dubai", "Abu Dhabi", "United Arab Emirates"],
    ...(settings?.available_24_7
      ? {
          openingHoursSpecification: [{
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          }],
        }
      : {}),
    ...(socialProfiles.length ? { sameAs: socialProfiles } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
