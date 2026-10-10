import { MessageCircle, Phone, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "971561379697";
const PHONE_NUMBER = "+971561379697";
const QUOTE_MESSAGE = "Hello RK Transport, I would like a quote for car transport between Dubai and Abu Dhabi. Please contact me with details.";

export default function QuotePage() {
  const quoteUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(QUOTE_MESSAGE)}`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Get a Quick Quote</h1>
        <p className="text-sm text-slate-400 mb-8">
          We handle all transport inquiries instantly via WhatsApp or phone call.
        </p>
        
        <div className="flex flex-col gap-3">
          <a
            href={quoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
          >
            <MessageCircle className="size-4" />
            Chat on WhatsApp
            <ArrowRight className="size-4" />
          </a>

          <a
            href={`tel:${PHONE_NUMBER}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Phone className="size-4" />
            Call {PHONE_NUMBER}
          </a>
        </div>
      </div>
    </main>
  );
}