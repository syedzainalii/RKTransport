"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { publicApi, type CarMakeOption, type Location, type Route, type Service, type SiteSettings, type StoragePlan, type VehicleType } from "../../lib/transport-api";
import ImageUpload, { type UploadedImage } from "../admin/dashboard/components/image-upload";
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

type VehicleDraft = {
  key: number;
  make: string;
  model: string;
  year: string;
  colour: string;
  plate: string;
  vehicleTypeId: string;
  runs: boolean | null;
  notListed: boolean;
  photos: UploadedImage[];
};

function emptyVehicle(key: number): VehicleDraft {
  return { key, make: "", model: "", year: "", colour: "", plate: "", vehicleTypeId: "", runs: null, notListed: false, photos: [] };
}

export default function BookingForm({ initialType = "transport", compact = false }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [carMakes, setCarMakes] = useState<CarMakeOption[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [plans, setPlans] = useState<StoragePlan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [bookingReference, setBookingReference] = useState("");
  const [submittedVehicles, setSubmittedVehicles] = useState<VehicleDraft[]>([]);
  const [vehicleDrafts, setVehicleDrafts] = useState<VehicleDraft[]>([emptyVehicle(0)]);
  const [nextVehicleKey, setNextVehicleKey] = useState(1);
  const [carErrors, setCarErrors] = useState<string[]>([]);
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
      scheduled_at: "",
      storage_plan_id: "",
      storage_start_date: "",
      storage_end_date: "",
      notes: "",
    },
  });
  const type = useWatch({ control, name: "type" }) || initialType;
  const pickupLocationId = useWatch({ control, name: "pickup_location_id" });
  const dropoffLocationId = useWatch({ control, name: "dropoff_location_id" });
  const updateVehicle = (index: number, patch: Partial<VehicleDraft>) => {
    setVehicleDrafts((current) => current.map((vehicle, vehicleIndex) => vehicleIndex === index ? { ...vehicle, ...patch } : vehicle));
  };
  const selectedRoute = routes.find((route) =>
    route.origin_location_id === Number(pickupLocationId) &&
    route.destination_location_id === Number(dropoffLocationId)
  );


  useEffect(() => {
    Promise.all([publicApi.locations(), publicApi.vehicles(), publicApi.storagePlans(), publicApi.services(), publicApi.settings(), publicApi.carMakes(), publicApi.routes()])
      .then(([locationData, vehicleData, planData, serviceData, settingsData, makeData, routeData]) => {
        setLocations(locationData);
        setVehicles(vehicleData);
        setPlans(planData);
        setServices(serviceData);
        setSettings(settingsData);
        setCarMakes(makeData);
        setRoutes(routeData);
      })
      .catch((reason: Error) => setError(`Unable to load booking options: ${reason.message}`));
  }, []);

  async function submit(values: BookingValues) {
    setError("");
    const draftErrors = vehicleDrafts.map((vehicle, index) => {
      const make = carMakes.find((item) => item.name.toLocaleLowerCase() === vehicle.make.trim().toLocaleLowerCase());
      const model = make?.models.find((item) => item.name.toLocaleLowerCase() === vehicle.model.trim().toLocaleLowerCase());
      if (!vehicle.make.trim() || !vehicle.model.trim()) return `Car ${index + 1}: enter the make and model.`;
      if (!vehicle.notListed && (!make || !model)) return `Car ${index + 1}: choose a listed make and model, or select “My car isn't listed”.`;
      const year = Number(vehicle.year);
      if (!Number.isInteger(year) || year < 1990 || year > new Date().getFullYear()) return `Car ${index + 1}: choose a valid year.`;
      if (!vehicle.vehicleTypeId || !vehicles.some((item) => item.id === Number(vehicle.vehicleTypeId))) return `Car ${index + 1}: choose a vehicle type.`;
      if (type === "recovery" && vehicle.runs === null) return `Car ${index + 1}: tell us whether it starts and drives.`;
      if (vehicle.photos.length > 2) return `Car ${index + 1}: add no more than two photos.`;
      return "";
    });
    setCarErrors(draftErrors);
    if (!vehicleDrafts.length || vehicleDrafts.length > 5 || draftErrors.some(Boolean)) return;
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
      const bookingVehicles = vehicleDrafts.map((vehicle) => ({
        make: vehicle.make.trim(),
        model: vehicle.model.trim(),
        year: Number(vehicle.year),
        colour: vehicle.colour.trim() || null,
        plate: vehicle.plate.trim() || null,
        vehicle_type_id: Number(vehicle.vehicleTypeId),
        runs: type === "recovery" ? vehicle.runs : null,
        photo_url: vehicle.photos[0]?.url || null,
        photo_urls: vehicle.photos.map((photo) => photo.url),
      }));
      const result = await publicApi.createBooking({
        type,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_email: values.customer_email || null,
        pickup_location_id: values.pickup_location_id ? Number(values.pickup_location_id) : null,
        dropoff_location_id: values.dropoff_location_id ? Number(values.dropoff_location_id) : null,
        pickup_address: values.pickup_address || null,
        dropoff_address: values.dropoff_address || null,
        vehicle_type_id: bookingVehicles[0].vehicle_type_id,
        vehicle_make: bookingVehicles[0].make,
        vehicle_model: bookingVehicles[0].model,
        vehicle_year: bookingVehicles[0].year,
        plate_number: bookingVehicles[0].plate,
        vehicles: bookingVehicles,
        scheduled_at: values.scheduled_at ? dubaiLocalDateToIso(values.scheduled_at) : null,
        storage_plan_id: type === "storage" && values.storage_plan_id ? Number(values.storage_plan_id) : null,
        storage_start_date: type === "storage" ? values.storage_start_date || null : null,
        storage_end_date: type === "storage" ? values.storage_end_date || null : null,
        notes: values.notes || null,
      });
      setSubmittedVehicles(vehicleDrafts);
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
      {submittedVehicles.length > 0 && <div className="mt-4 space-y-2">
        <h3 className="font-semibold">Your car{submittedVehicles.length === 1 ? "" : "s"}</h3>
        {submittedVehicles.map((vehicle) => <p key={vehicle.key} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
          {vehicle.year} {vehicle.make} {vehicle.model}{vehicle.colour ? `, ${vehicle.colour}` : ""}{vehicle.plate ? `, plate ${vehicle.plate}` : ""}{type === "recovery" && vehicle.runs === false ? ", does not start" : ""}
        </p>)}
      </div>}
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
      <section className="sm:col-span-2 space-y-4">
        <div><h2 className="text-lg font-bold">Your car</h2><p className="text-sm text-slate-600 dark:text-slate-300">Choose the car so we can prepare the right vehicle and equipment.</p></div>
        {vehicleDrafts.map((vehicle, index) => {
          const selectedMake = carMakes.find((make) => make.name.toLocaleLowerCase() === vehicle.make.toLocaleLowerCase());
          const availableModels = selectedMake?.models ?? [];
          const estimatedVehicleType = vehicles.find((item) => item.id === Number(vehicle.vehicleTypeId));
          return <fieldset key={vehicle.key} className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:grid-cols-2">
            <legend className="px-2 font-semibold">Car {index + 1}</legend>
            {!vehicle.notListed ? <div>
              <label htmlFor={`car-make-${vehicle.key}`} className="mb-1.5 block text-sm font-semibold">Car make <span aria-hidden="true">*</span></label>
              <input id={`car-make-${vehicle.key}`} list={`car-makes-${vehicle.key}`} value={vehicle.make} onChange={(event) => updateVehicle(index, { make: event.target.value, model: "", vehicleTypeId: "" })} placeholder="Search makes" className={inputClass} required aria-describedby={`make-hint-${vehicle.key}`} />
              <datalist id={`car-makes-${vehicle.key}`}>{carMakes.map((make) => <option key={make.id} value={make.name} />)}</datalist>
              <p id={`make-hint-${vehicle.key}`} className="mt-1 text-xs text-slate-500">Start typing to find your car make.</p>
            </div> : <label className="block text-sm font-semibold">Car make <span aria-hidden="true">*</span><input value={vehicle.make} onChange={(event) => updateVehicle(index, { make: event.target.value })} className={`${inputClass} mt-1`} maxLength={80} required /></label>}
            {!vehicle.notListed ? <div>
              <label htmlFor={`car-model-${vehicle.key}`} className="mb-1.5 block text-sm font-semibold">Car model <span aria-hidden="true">*</span></label>
              <select id={`car-model-${vehicle.key}`} value={vehicle.model} disabled={!selectedMake} onChange={(event) => {
                const selectedModel = availableModels.find((item) => item.name === event.target.value);
                const defaultType = selectedModel?.default_vehicle_type_id && vehicles.some((item) => item.id === selectedModel.default_vehicle_type_id) ? String(selectedModel.default_vehicle_type_id) : "";
                updateVehicle(index, { model: event.target.value, vehicleTypeId: defaultType });
              }} className={inputClass} required>
                <option value="">{selectedMake ? "Choose a model" : "Choose a make first"}</option>
                {availableModels.map((model) => <option key={model.id} value={model.name}>{model.name}</option>)}
              </select>
            </div> : <label className="block text-sm font-semibold">Car model <span aria-hidden="true">*</span><input value={vehicle.model} onChange={(event) => updateVehicle(index, { model: event.target.value })} className={`${inputClass} mt-1`} maxLength={80} required /></label>}
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium sm:col-span-2"><input type="checkbox" checked={vehicle.notListed} onChange={(event) => updateVehicle(index, { notListed: event.target.checked, make: "", model: "", vehicleTypeId: "" })} className="size-5 accent-emerald-800" />My car isn&apos;t listed</label>
            <div><label htmlFor={`car-year-${vehicle.key}`} className="mb-1.5 block text-sm font-semibold">Year <span aria-hidden="true">*</span></label><select id={`car-year-${vehicle.key}`} value={vehicle.year} onChange={(event) => updateVehicle(index, { year: event.target.value })} className={inputClass} required><option value="">Choose a year</option>{Array.from({ length: new Date().getFullYear() - 1989 }, (_, offset) => new Date().getFullYear() - offset).map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
            <div><label htmlFor={`car-type-${vehicle.key}`} className="mb-1.5 block text-sm font-semibold">Vehicle type <span aria-hidden="true">*</span></label><select id={`car-type-${vehicle.key}`} value={vehicle.vehicleTypeId} onChange={(event) => updateVehicle(index, { vehicleTypeId: event.target.value })} className={inputClass} required><option value="">Choose a type</option>{vehicles.map((vehicleType) => <option key={vehicleType.id} value={vehicleType.id}>{vehicleType.name}</option>)}</select>{estimatedVehicleType && Number(estimatedVehicleType.surcharge_aed) > 0 && <p className="mt-1 text-xs text-slate-500">Extra charge: AED {Number(estimatedVehicleType.surcharge_aed).toFixed(0)}</p>}</div>
            <label className="block text-sm font-semibold">Colour (optional)<input value={vehicle.colour} onChange={(event) => updateVehicle(index, { colour: event.target.value })} className={`${inputClass} mt-1`} maxLength={50} /></label>
            <label className="block text-sm font-semibold">Number plate (optional)<input value={vehicle.plate} onChange={(event) => updateVehicle(index, { plate: event.target.value })} placeholder="Dubai A 12345" className={`${inputClass} mt-1`} maxLength={32} /></label>
            {type === "recovery" && <div className="sm:col-span-2"><p className="mb-2 text-sm font-semibold">Does the car start and drive? <span aria-hidden="true">*</span></p><div className="flex gap-2"><button type="button" aria-pressed={vehicle.runs === true} onClick={() => updateVehicle(index, { runs: true })} className={`min-h-11 rounded-xl border px-5 font-semibold ${vehicle.runs === true ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 dark:border-slate-700"}`}>Yes</button><button type="button" aria-pressed={vehicle.runs === false} onClick={() => updateVehicle(index, { runs: false })} className={`min-h-11 rounded-xl border px-5 font-semibold ${vehicle.runs === false ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-300 dark:border-slate-700"}`}>No</button></div>{vehicle.runs === false && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">We&apos;ll send a flatbed.</p>}</div>}
            <div className="sm:col-span-2"><ImageUpload label="Add a photo (helps us prepare the right truck)" value={vehicle.photos} onChange={(images) => updateVehicle(index, { photos: Array.isArray(images) ? images : images ? [images] : [] })} multiple maxImages={2} showDescription={false} uploadEndpoint="/media/booking-photos" folder="booking-photos" hint="Optional. Add up to two JPG, PNG, or WebP photos." /></div>
            {carErrors[index] && <p role="alert" className="sm:col-span-2 text-sm text-red-700 dark:text-red-300">{carErrors[index]}</p>}
            {vehicleDrafts.length > 1 && <button type="button" onClick={() => { setVehicleDrafts((current) => current.filter((_, vehicleIndex) => vehicleIndex !== index)); setCarErrors([]); }} className="min-h-11 justify-self-start rounded-xl border border-red-300 px-4 font-semibold text-red-800 sm:col-span-2">Remove car {index + 1}</button>}
          </fieldset>;
        })}
        {vehicleDrafts.length < 5 && <button type="button" onClick={() => { setVehicleDrafts((current) => [...current, emptyVehicle(nextVehicleKey)]); setNextVehicleKey((current) => current + 1); }} className="min-h-11 rounded-xl border border-emerald-800 px-4 font-semibold text-emerald-900 dark:text-emerald-200">Add another car</button>}
        {type === "transport" && selectedRoute?.base_price_aed != null && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">Estimated price: AED {(vehicleDrafts.length * Number(selectedRoute.base_price_aed) + vehicleDrafts.reduce((sum, vehicle) => sum + Number(vehicles.find((item) => item.id === Number(vehicle.vehicleTypeId))?.surcharge_aed ?? 0), 0)).toFixed(0)}. Final price is confirmed by our team.</p>}
      </section>
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
