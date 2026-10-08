import { breadcrumbJsonLd, jsonLd } from "../../lib/seo";

export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />;
}

export function BreadcrumbStructuredData({ items }: {
  items: { name: string; path: string }[];
}) {
  return <StructuredData data={breadcrumbJsonLd(items)} />;
}
