"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { publicApi, type Location, type Service, type SiteSettings, type StoragePlan, type VehicleType } from "../../lib/transport-api";
import { Button } from "./ui/button";

type Props = { initialType?: "transport" | "recovery" | "storage"; compact?: boolean };
const formSchema = z.object({
  type: z.enum(["transport", "recovery", "storage"]),
  customer_name: z.string().trim().min(2, "Enter your name."),
  customer_phone: z.string().regex(/^\+971[0-9]{8,9}$/, "Use the +971 international format."),
  customer_email: z.union([z.email(), z.literal("")]),
  pickup_location_id: z.string(),
  dropoff_location_id: z.string(),
  pickup_address: z.string(),
  dropoff_address: z.string(),
  vehicle_type_id: z.string(),
  vehicle_make: z.string(),
  vehicle_model: z.string(),
  vehicle_year: z.string(),
  plate_number: z.string(),
  scheduled_at: z.string(),
  storage_plan_id: z.string(),
  storage_start_date: z.string(),
  storage_end_date: z.string(),
  notes: z.string(),
});
const validatedFormSchema = formSchema.superRefine((values, context) => {
  if (values.type === "transport" && (!values.pickup_location_id || !values.dropoff_location_id)) {
    context.addIssue({
      code: "custom",
      message: "Select both pickup and drop-off locations.",
      path: ["pickup_location_id"],
    });
  }
  if (values.type === "recovery" && values.pickup_address.trim().length < 5) {
    context.addIssue({
      code: "custom",
      message: "Enter the recovery location.",
      path: ["pickup_address"],
    });
  }
  if (values.type === "storage") {
    if (!values.storage_plan_id || !values.storage_start_date) {
      context.addIssue({
        code: "custom",
        message: "Choose a storage option and start date.",
        path: ["storage_plan_id"],
      });
    }
    if (values.storage_end_date && values.storage_start_date && values.storage_end_date < values.storage_start_date) {
      context.addIssue({
        code: "custom",
        message: "Storage end date must be on or after the start date.",
        path: ["storage_end_date"],
      });
    }
  }
});
type BookingValues = z.infer<typeof formSchema>;

export default function BookingForm({ initialType = "transport", compact = false }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [plans, setPlans] = useState<StoragePlan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [bookingReference, setBookingReference] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<BookingValues>({
    resolver: zodResolver(validatedFormSchema),
    defaultValues: {
      type: initialType,
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      pickup_location_id: "",
      dropoff_location_id: "",
      pickup_address: "",
      dropoff_address: "",
      vehicle_type_id: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: "",
      plate_number: "",
      scheduled_at: "",
      storage_plan_id: "",
      storage_start_date: "",
      storage_end_date: "",
      notes: "",
    },
  });
  const type = useWatch({ control, name: "type" }) || initialType;

  useEffect(() => {
    Promise.all([publicApi.locations(), publicApi.vehicles(), publicApi.storagePlans(), publicApi.services(), publicApi.settings()])
      .then(([locationData, vehicleData, planData, serviceData, settingsData]) => {
        setLocations(locationData);
        setVehicles(vehicleData);
        setPlans(planData);
        setServices(serviceData);
        setSettings(settingsData);
      })
      .catch((reason: Error) => setError(`Unable to load booking options: ${reason.message}`));
  }, []);

  async function submit(values: BookingValues) {
    setError("");
    setSubmitting(true);
    try {
      if (values.scheduled_at) {
        if (isDubaiDateTimeInPast(values.scheduled_at)) {
          setError("Choose a date and time in the future.");
          return;
        }
        const localDate = values.scheduled_at.slice(0, 10);
        const localTime = values.scheduled_at.slice(11, 16);
        if (settings?.blocked_dates.includes(localDate)) {
          setError("That date is unavailable. Please choose another date.");
          return;
        }
        if (settings?.booking_time_slots.length && !settings.booking_time_slots.includes(localTime)) {
          setError("Choose one of the available time slots.");
          return;
        }
      }
      if (type === "storage") {
        if (values.storage_start_date < minimumDubaiDate()) {
          setError("Choose a storage start date that is not in the past.");
          return;
        }
        if (settings?.blocked_dates.includes(values.storage_start_date)) {
          setError("That storage start date is unavailable. Please choose another date.");
          return;
        }
      }
      const result = await publicApi.createBooking({
        type,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_email: values.customer_email || null,
        pickup_location_id: values.pickup_location_id ? Number(values.pickup_location_id) : null,
        dropoff_location_id: values.dropoff_location_id ? Number(values.dropoff_location_id) : null,
        pickup_address: values.pickup_address || null,
        dropoff_address: values.dropoff_address || null,
        vehicle_type_id: values.vehicle_type_id ? Number(values.vehicle_type_id) : null,
        vehicle_make: values.vehicle_make || null,
        vehicle_model: values.vehicle_model || null,
        vehicle_year: values.vehicle_year ? Number(values.vehicle_year) : null,
        plate_number: values.plate_number || null,
        scheduled_at: values.scheduled_at ? dubaiLocalDateToIso(values.scheduled_at) : null,
        storage_plan_id: type === "storage" && values.storage_plan_id ? Number(values.storage_plan_id) : null,
        storage_start_date: type === "storage" ? values.storage_start_date || null : null,
        storage_end_date: type === "storage" ? values.storage_end_date || null : null,
        notes: values.notes || null,
      });
      setBookingReference(result.ref);
      reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 shadow-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  const availableTypes = services.filter((service) => ["transport", "recovery", "storage"].includes(service.category) && service.is_active);
  return (
    bookingReference ? <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} role="status" className="rounded-3xl border border-emerald-200 bg-white p-6 text-slate-900 shadow-xl dark:border-emerald-900 dark:bg-slate-900 dark:text-white sm:p-8">
      <p className="text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Request received</p>
      <h2 className="mt-2 text-2xl font-bold">We’ll be in contact with you as soon as possible.</h2>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Keep your booking reference for tracking.</p>
      <p className="mt-3 rounded-xl bg-emerald-50 p-4 font-mono text-lg font-bold text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">{bookingReference}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={settings?.phone_primary ? `tel:${settings.phone_primary}` : "/contact"} className="inline-flex min-h-11 items-center rounded-xl bg-emerald-900 px-4 font-semibold text-white">Call RK Transport</a>
        <a href={(settings?.whatsapp || settings?.phone_primary) ? `https://wa.me/${(settings.whatsapp || settings.phone_primary)!.replace(/\D/g, "")}` : "/contact"} target={(settings?.whatsapp || settings?.phone_primary) ? "_blank" : undefined} rel={(settings?.whatsapp || settings?.phone_primary) ? "noreferrer" : undefined} className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 font-semibold dark:border-slate-700">WhatsApp</a>
      </div>
    </motion.section> :
    <form onSubmit={handleSubmit(submit)} className={`grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:p-7 ${compact ? "" : "md:grid-cols-2"}`}>
      <div className="sm:col-span-2">
        <label htmlFor="booking-type" className="mb-1.5 block text-sm font-semibold">What do you need?</label>
        <select id="booking-type" {...register("type")} className={inputClass}>
          {(availableTypes.length ? availableTypes : [
            { category: "transport", title: "Car transport" },
            { category: "recovery", title: "Lift & recovery" },
            { category: "storage", title: "Car storage" },
          ]).map((service) => <option key={service.category} value={service.category}>{service.title}</option>)}
        </select>
      </div>
      <Field name="customer_name" label="Your name" required className={inputClass} register={register} error={errors.customer_name?.message} />
      <Field name="customer_phone" label="Phone (+971)" required type="tel" className={inputClass} register={register} error={errors.customer_phone?.message} />
      <Field name="customer_email" label="Email (optional)" type="email" className={inputClass} register={register} error={errors.customer_email?.message} />
      <div>
        <label htmlFor="vehicle_type_id" className="mb-1.5 block text-sm font-semibold">Vehicle type</label>
        <select id="vehicle_type_id" {...register("vehicle_type_id")} className={inputClass}>
          <option value="">Select vehicle type</option>
          {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
        </select>
      </div>
      <Field name="vehicle_make" label="Make (optional)" className={inputClass} register={register} />
      <Field name="vehicle_model" label="Model (optional)" className={inputClass} register={register} />
      <Field name="vehicle_year" label="Vehicle year (optional)" type="number" className={inputClass} register={register} />
      <Field name="plate_number" label="Plate number (optional)" className={inputClass} register={register} />
      {type !== "recovery" && (
        <LocationSelect name="pickup_location_id" label="Pickup location" items={locations} className={inputClass} register={register} required={type === "transport"} />
      )}
      {type !== "recovery" && (
        <LocationSelect name="dropoff_location_id" label="Drop-off location" items={locations} className={inputClass} register={register} required={type === "transport"} />
      )}
      {type === "recovery" && <Field name="pickup_address" label="Recovery location" required className={inputClass} register={register} />}
      {type !== "recovery" && <Field name="pickup_address" label="Pickup address or landmark (optional)" className={inputClass} register={register} />}
      {type !== "recovery" && <Field name="dropoff_address" label="Drop-off address or landmark (optional)" className={inputClass} register={register} />}
      {type === "storage" && (
        <>
          <div>
            <label htmlFor="storage_plan_id" className="mb-1.5 block text-sm font-semibold">Storage option</label>
            <select id="storage_plan_id" required {...register("storage_plan_id")} className={inputClass}>
              <option value="">Choose an option</option>
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
            </select>
          </div>
          <Field name="storage_start_date" label="Storage start" type="date" min={minimumDubaiDate()} required className={inputClass} register={register} />
          <Field name="storage_end_date" label="Storage end (optional)" type="date" className={inputClass} register={register} />
        </>
      )}
      <Field name="scheduled_at" label={type === "recovery" ? "When do you need help?" : "Preferred date and time"} type="datetime-local" min={minimumDubaiDateTime()} className={inputClass} register={register} />
      <div className="sm:col-span-2">
        <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold">Additional details</label>
        <textarea id="notes" placeholder="Share any extra details that will help us prepare." {...register("notes")} rows={3} className={inputClass} />
      </div>
      {Object.keys(errors).length > 0 && <p role="alert" className="sm:col-span-2 text-sm text-red-800">{Object.values(errors).map((error) => error?.message).filter(Boolean).join(" ")}</p>}
      {error && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <Button type="submit" disabled={submitting} className="min-h-12 rounded-xl sm:col-span-2">
        {submitting ? "Sending…" : "Request a callback"}
      </Button>
    </form>
  );
}

function dubaiLocalDateToIso(value: string): string {
  return new Date(`${value}:00+04:00`).toISOString();
}

function minimumDubaiDateTime(): string {
  return new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

function minimumDubaiDate(): string {
  return new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function isDubaiDateTimeInPast(value: string): boolean {
  return new Date(`${value}:00+04:00`).getTime() < Date.now();
}

function Field({ name, label, className, required, type = "text", min, register, error }: {
  name: keyof BookingValues; label: string; className: string; required?: boolean; type?: string; min?: string;
  register: ReturnType<typeof useForm<BookingValues>>["register"]; error?: string;
}) {
  const id = `booking-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <input id={id} type={type} required={required} min={min} {...register(name)} className={className} />
      {error && <p className="mt-1 text-xs text-red-800">{error}</p>}
    </div>
  );
}

function LocationSelect({ name, label, items, className, register, required }: {
  name: "pickup_location_id" | "dropoff_location_id"; label: string; items: Location[]; className: string;
  register: ReturnType<typeof useForm<BookingValues>>["register"];
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <select id={name} required={required} {...register(name)} className={className}>
        <option value="">Select a location</option>
        {items.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
      </select>
    </div>
  );
}
