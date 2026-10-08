"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { publicApi } from "../../lib/transport-api";
import { Button } from "./ui/button";

const reviewSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  phone: z.string().regex(/^\+971[0-9]{8,9}$/, "Use the +971 international format."),
  email: z.union([z.email(), z.literal("")]),
  trip: z.string(),
  rating: z.number().min(1, "Please choose a star rating.").max(5),
  review: z.string().trim().min(10, "Please write at least a short sentence."),
  canPublish: z.boolean(),
});
type ReviewValues = z.infer<typeof reviewSchema>;

export default function ReviewForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { name: "", phone: "", email: "", trip: "", rating: 0, review: "", canPublish: true },
  });

  async function submit(values: ReviewValues) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const body = [
        values.review,
        "",
        `Rating: ${values.rating}/5`,
        values.trip ? `Trip: ${values.trip}` : null,
        `OK to show on website: ${values.canPublish ? "Yes" : "No"}`,
      ].filter((line) => line !== null).join("\n");
      await publicApi.createInquiry({
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        subject: `Customer review: ${values.rating}/5 stars`,
        message: body,
      });
      setMessage("Thank you for your review! We really appreciate your feedback.");
      reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send your review. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const field = "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p id="rating-label" className="mb-1.5 block text-sm font-semibold">How was your experience?</p>
        <Controller
          control={control}
          name="rating"
          render={({ field: { value, onChange } }) => <StarRating value={value} onChange={onChange} />}
        />
        {errors.rating && <p className="mt-1 text-xs text-red-800">{errors.rating.message}</p>}
      </div>

      <Field name="name" label="Your name" className={field} register={register} error={errors.name?.message} />
      <Field name="trip" label="Your trip (optional, e.g. Dubai to Abu Dhabi)" className={field} register={register} />
      <div>
        <label htmlFor="review-text" className="mb-1.5 block text-sm font-semibold">Your review</label>
        <textarea id="review-text" {...register("review")} rows={5} placeholder="Tell us how the pickup, drive and delivery went." className={field} />
        {errors.review && <p className="mt-1 text-xs text-red-800">{errors.review.message}</p>}
      </div>
      <Field name="phone" label="Phone (+971, kept private)" type="tel" className={field} register={register} error={errors.phone?.message} />
      <Field name="email" label="Email (optional, kept private)" type="email" className={field} register={register} error={errors.email?.message} />

      <label className="flex min-h-11 items-start gap-3 text-sm">
        <input type="checkbox" {...register("canPublish")} className="mt-1 size-5 accent-emerald-800" />
        <span>You may show my name and review on the RK Transport website.</span>
      </label>

      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <Button type="submit" disabled={busy} className="min-h-12">{busy ? "Sending…" : "Submit review"}</Button>
    </form>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  const shown = hover || value;
  return (
    <div>
      <div role="radiogroup" aria-labelledby="rating-label" className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} out of 5 stars, ${labels[star - 1]}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onFocus={() => setHover(star)}
            onBlur={() => setHover(0)}
            className={`grid size-11 place-items-center text-4xl leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${star <= shown ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
          >
            ★
          </button>
        ))}
      </div>
      <p className="mt-1 min-h-5 text-sm text-slate-600 dark:text-slate-300" aria-live="polite">{shown ? labels[shown - 1] : "Tap a star to rate"}</p>
    </div>
  );
}

function Field({ name, label, className, type = "text", register, error }: {
  name: keyof ReviewValues; label: string; className: string; type?: string;
  register: ReturnType<typeof useForm<ReviewValues>>["register"]; error?: string;
}) {
  const id = `review-${name}`;
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label><input id={id} type={type} {...register(name)} className={className} />{error && <p className="mt-1 text-xs text-red-800">{error}</p>}</div>;
}