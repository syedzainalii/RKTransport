export type SiteSettings = {
  brand_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_alt: string | null;
  logo_dark_url: string | null;
  logo_dark_alt: string | null;
  favicon_url: string | null;
  phone_primary: string | null;
  phone_recovery: string | null;
  whatsapp: string | null;
  email: string | null;
  address_line: string | null;
  city: string | null;
  emirate: string | null;
  country: string | null;
  available_24_7: boolean;
  hours_label: string;
  timezone: string;
  currency_code: string;
  currency_symbol: string;
  core_route_label: string;
  header_cta_label: string | null;
  header_cta_href: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  footer_blurb: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  maps_embed_url: string | null;
  booking_time_slots: string[];
  blocked_dates: string[];
};
export type AdminSiteSettings = SiteSettings & {
  notifications_email_enabled: boolean;
  notifications_whatsapp_enabled: boolean;
  notification_admin_email: string | null;
  notification_admin_phone: string | null;
};

export type Service = {
  id: number;
  slug: string;
  title: string;
  short_description: string | null;
  detailed_description: string | null;
  starting_price_note: string | null;
  features: string[] | null;
  gallery: { url: string; alt?: string | null }[];
  image_url: string | null;
  image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  category: string;
  is_active: boolean;
};

export type Location = { id: number; name: string; emirate: string | null };
export type Route = { id: number; title: string; origin_location_id: number; destination_location_id: number; base_price_aed: string | number | null };
export type VehicleType = { id: number; name: string; description: string | null; surcharge_aed?: string | number; is_active?: boolean };
export type Vehicle = {
  id: number;
  title: string;
  slug: string;
  description: string;
  seats: string;
  image_url: string | null;
  chips: string[];
  display_order: number;
  is_active: boolean;
};
export type CarModelOption = { id: number; make_id: number; name: string; default_vehicle_type_id: number | null; is_active: boolean };
export type CarMakeOption = { id: number; name: string; is_active: boolean; sort_order: number; models: CarModelOption[] };
export type StoragePlan = {
  id: number;
  title: string;
  description: string | null;
  billing_period: string;
  price_aed: string | number;
  features: string[] | null;
  covered: boolean;
  image_url: string | null;
  image_alt: string | null;
};
export type NotificationLog = {
  id: number;
  event_type: string;
  entity_type: string;
  entity_id: number;
  channel: "email" | "whatsapp";
  recipient: string;
  status: "pending" | "sent" | "failed";
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};
export type Inquiry = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};
export type MediaItem = {
  id: number;
  url: string;
  alt: string | null;
  filename: string | null;
  content_type: string | null;
  byte_size: number | null;
  folder: string | null;
  created_at: string;
};
export type Faq = { id: number; question: string; answer: string; page_key: string | null };
export type Testimonial = { id: number; customer_name: string; quote: string; rating: number; vehicle_note: string | null; image_url: string | null; image_alt: string | null };
export type About = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string;
  mission: string | null;
  vision: string | null;
  values: { title?: string; description?: string }[] | null;
  images: { url?: string; alt?: string; side?: "left" | "right" }[] | null;
  stats: { value?: string; label?: string }[];
  story_image_side: "left" | "right";
  why_choose_us: { icon?: string; title?: string; description?: string }[];
};
export type PageCopy = { id: number; key: string; value: string };
export type HeroBanner = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  badge_text: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
  image_alt: string | null;
  portrait_image_url: string | null;
};

const API_PREFIX = "/api/v1";

type ApiRequestOptions = RequestInit & { next?: { revalidate?: number } };

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const { next, ...requestOptions } = options;
  const backendUrl = typeof window === "undefined"
    ? (process.env.API_BASE_URL || "http://localhost:8000").replace(/\/$/, "")
    : "";
  const response = await fetch(`${backendUrl}${API_PREFIX}${path}`, {
    ...requestOptions,
    ...(next ? { next } : {}),
    headers,
    credentials: "include",
  } as RequestInit);
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const detail = body && typeof body.detail === "string" ? body.detail : response.statusText;
    throw new ApiError(detail || `Request failed (${response.status})`, response.status);
  }
  return body as T;
}

export const publicApi = {
  settings: () => apiRequest<SiteSettings>("/settings", { next: { revalidate: 60 } }),
  services: () => apiRequest<Service[]>("/services", { next: { revalidate: 60 } }),
  locations: () => apiRequest<Location[]>("/locations", { next: { revalidate: 60 } }),
  routes: () => apiRequest<Route[]>("/routes", { next: { revalidate: 60 } }),
  vehicles: () => apiRequest<VehicleType[]>("/vehicle-types", { next: { revalidate: 60 } }),
  cars: () => apiRequest<Vehicle[]>("/cars", { next: { revalidate: 60 } }),
  carMakes: () => apiRequest<CarMakeOption[]>("/car-makes", { next: { revalidate: 60 } }),
  storagePlans: () => apiRequest<StoragePlan[]>("/storage-plans", { next: { revalidate: 60 } }),
  heroBanners: () => apiRequest<HeroBanner[]>("/hero-banners", { next: { revalidate: 60 } }),
  pageCopy: () => apiRequest<PageCopy[]>("/page-copy", { next: { revalidate: 60 } }),
  faqs: () => apiRequest<Faq[]>("/faqs", { next: { revalidate: 60 } }),
  testimonials: () => apiRequest<Testimonial[]>("/testimonials", { next: { revalidate: 60 } }),
  about: () => apiRequest<About[]>("/about", { next: { revalidate: 60 } }),
  createInquiry: (input: Record<string, unknown>) =>
    apiRequest<Inquiry>("/inquiries", { method: "POST", body: JSON.stringify(input) }),
};

export function apiImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:)/i.test(url)) return url;
  return `${url.startsWith("/") ? url : `/${url}`}`;
}

export function isImageOptimizable(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const imageUrl = new URL(url);
    return imageUrl.protocol === "https:" && imageUrl.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}
