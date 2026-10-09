"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest, type SiteSettings } from "../../lib/transport-api";

// DEFAULT FALLBACK NUMBER (Replace with your actual UAE phone/WhatsApp number)
const FALLBACK_PHONE = "+971500000000";

function cleanTelNumber(phone?: string | null): string {
  const num = phone || FALLBACK_PHONE;
  return `tel:${num.replace(/[^\d+]/g, "")}`;
}

function cleanWhatsappNumber(phone?: string | null): string {
  let num = (phone || FALLBACK_PHONE).replace(/\D/g, "");

  // Convert local UAE number (e.g. 0501234567) to international format (971501234567)
  if (num.startsWith("05") && num.length === 10) {
    num = `971${num.slice(1)}`;
  }

  // Use api.whatsapp.com for best mobile deep-linking support
  return `https://api.whatsapp.com/send?phone=${num}`;
}

export default function StickyActions() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiRequest<SiteSettings>("/settings"),
  });

  const rawPhone = settings?.phone_primary;
  const rawWhatsapp = settings?.whatsapp || rawPhone;

  const telHref = cleanTelNumber(rawPhone);
  const waHref = cleanWhatsappNumber(rawWhatsapp);

  return (
    <nav
      aria-label="Quick contact actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden dark:border-slate-800/80 dark:bg-slate-950/95"
    >
      <div className="grid grid-cols-2 gap-3">
        <a
          href={telHref}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98] dark:bg-slate-100 dark:text-slate-900"
        >
          <svg
            className="size-4 shrink-0 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
          </svg>
          <span>Call Us</span>
        </a>

        <a
          href={waHref}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-transform hover:bg-emerald-500 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <svg
            className="size-4 shrink-0 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 2c-5.514 0-9.998 4.486-9.998 10.001 0 1.956.565 3.78 1.543 5.327l-1.576 5.766 5.922-1.552a9.92 9.92 0 004.109.89h.005c5.513 0 9.997-4.486 9.997-10.001 0-2.67-1.039-5.179-2.928-7.069A9.914 9.914 0 0012.031 2zm5.666 14.183c-.237.667-1.378 1.272-1.921 1.321-.527.047-1.21.072-3.522-.857-2.956-1.189-4.857-4.228-5.006-4.425-.148-.198-1.21-1.611-1.21-3.073 0-1.462.766-2.181 1.038-2.478.271-.297.592-.371.79-.371.198 0 .395.002.568.01.185.009.432-.07.676.518.247.592.84 2.051.913 2.2.074.148.123.321.025.518-.099.198-.148.321-.296.494-.148.173-.311.386-.444.518-.148.148-.302.309-.13.605.173.296.768 1.268 1.65 2.052 1.132 1.008 2.088 1.32 2.385 1.468.297.148.469.123.642-.074.173-.198.741-.864.939-1.161.198-.296.395-.247.667-.148.271.099 1.729.815 2.025.963.297.148.494.222.568.346.074.123.074.716-.163 1.383z" />
          </svg>
          <span>WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}