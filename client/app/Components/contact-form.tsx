"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { publicApi } from "../../lib/transport-api";
import { Button } from "./ui/button";

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  phone: z.string().regex(/^\+971[0-9]{8,9}$/, "Use the +971 international format."),
  email: z.union([z.email(), z.literal("")]),
  subject: z.string(),
  message: z.string().trim().min(4, "Please provide a little more detail."),
});
type InquiryValues = z.infer<typeof inquirySchema>;

export default function ContactForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", phone: "", email: "", subject: "", message: "" },
  });

  async function submit(values: InquiryValues) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await publicApi.createInquiry({
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        subject: values.subject || null,
        message: values.message,
      });
      setMessage("Thank you. Your message has been sent.");
      reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send your message.");
    } finally {
      setBusy(false);
    }
  }

  const field = "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <Field name="name" label="Name" className={field} register={register} error={errors.name?.message} />
      <Field name="phone" label="Phone (+971)" type="tel" className={field} register={register} error={errors.phone?.message} />
      <Field name="email" label="Email (optional)" type="email" className={field} register={register} error={errors.email?.message} />
      <Field name="subject" label="Subject (optional)" className={field} register={register} />
      <div><label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold">How can we help?</label><textarea id="contact-message" {...register("message")} rows={5} className={field} />{errors.message && <p className="mt-1 text-xs text-red-800">{errors.message.message}</p>}</div>
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <Button type="submit" disabled={busy} className="min-h-12">{busy ? "Sending…" : "Send message"}</Button>
    </form>
  );
}

function Field({ name, label, className, type = "text", register, error }: {
  name: keyof InquiryValues; label: string; className: string; type?: string;
  register: ReturnType<typeof useForm<InquiryValues>>["register"]; error?: string;
}) {
  const id = `contact-${name}`;
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label><input id={id} type={type} {...register(name)} className={className} />{error && <p className="mt-1 text-xs text-red-800">{error}</p>}</div>;
}
