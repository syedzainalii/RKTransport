"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { apiRequest, type CarMakeOption, type CarModelOption, type VehicleType } from "../../../../../lib/transport-api";

export default function CarsAdminPage() {
  const [makes, setMakes] = useState<CarMakeOption[]>([]);
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [search, setSearch] = useState("");
  const [newMake, setNewMake] = useState("");
  const [newModels, setNewModels] = useState<Record<number, string>>({});
  const [newModelTypes, setNewModelTypes] = useState<Record<number, string>>({});
  const [bulkModels, setBulkModels] = useState<Record<number, string>>({});
  const [makeNames, setMakeNames] = useState<Record<number, string>>({});
  const [modelNames, setModelNames] = useState<Record<number, string>>({});
  const [modelTypes, setModelTypes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => Promise.all([
    apiRequest<CarMakeOption[]>("/admin/car-makes"),
    apiRequest<VehicleType[]>("/admin/vehicle-types"),
  ]), []);

  const applyRows = useCallback(([makeRows, typeRows]: [CarMakeOption[], VehicleType[]]) => {
    setMakes(makeRows);
    setTypes(typeRows);
    setMakeNames(Object.fromEntries(makeRows.map((make) => [make.id, make.name])));
    setModelNames(Object.fromEntries(makeRows.flatMap((make) => make.models.map((model) => [model.id, model.name]))));
    setModelTypes(Object.fromEntries(makeRows.flatMap((make) => make.models.map((model) => [model.id, String(model.default_vehicle_type_id ?? "")]))));
  }, []);

  useEffect(() => {
    void load().then(applyRows).catch(() => setError("We couldn't load the car list. Please refresh and try again.")).finally(() => setLoading(false));
  }, [applyRows, load]);

  const filteredMakes = useMemo(() => makes
    .map((make) => ({ ...make, models: [...make.models].sort((a, b) => a.name.localeCompare(b.name)) }))
    .filter((make) => !search || make.name.toLowerCase().includes(search.toLowerCase()) || make.models.some((model) => model.name.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => a.name.localeCompare(b.name)), [makes, search]);

  async function saveAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      applyRows(await load());
      setMessage(success);
    } catch {
      setError("We couldn't save that change. Please check the information and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function createMake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newMake.trim();
    if (!name) return;
    await saveAction(() => apiRequest("/admin/car-makes", {
      method: "POST",
      body: JSON.stringify({ name, is_active: true, sort_order: makes.length + 1 }),
    }), "Make added.");
    setNewMake("");
  }

  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
    <header><p className="text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Booking options</p><h1 className="mt-1 text-3xl font-bold">Cars</h1><p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Manage the makes and models customers can choose when they book. The list is shown alphabetically on the website.</p></header>
    {message && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">{message}</p>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}
    <form onSubmit={createMake} className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
      <label className="flex-1 text-sm font-semibold">New car make<input value={newMake} onChange={(event) => setNewMake(event.target.value)} placeholder="For example, Toyota" maxLength={100} required className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700" /></label>
      <button disabled={busy} className="min-h-11 self-end rounded-lg bg-emerald-900 px-5 font-semibold text-white disabled:opacity-60">Add make</button>
    </form>
    <label className="mt-5 block text-sm font-semibold">Search makes and models<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by make or model" className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" /></label>
    {loading ? <div role="status" className="mt-6 space-y-3"><div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /><div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /></div> :
      filteredMakes.length === 0 ? <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">{makes.length ? "No makes or models match your search." : "No car makes yet. Add the first one above."}</p> :
        <div className="mt-5 space-y-4">{filteredMakes.map((make) => <article key={make.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={(event) => { event.preventDefault(); void saveAction(() => apiRequest(`/admin/car-makes/${make.id}`, { method: "PUT", body: JSON.stringify({ name: makeNames[make.id] || make.name, is_active: make.is_active, sort_order: make.sort_order }) }), "Make updated."); }} className="flex min-w-0 flex-1 gap-2">
              <label className="sr-only" htmlFor={`make-name-${make.id}`}>Make name</label><input id={`make-name-${make.id}`} value={makeNames[make.id] ?? make.name} onChange={(event) => setMakeNames((current) => ({ ...current, [make.id]: event.target.value }))} maxLength={100} className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-transparent px-3 text-lg font-bold dark:border-slate-700" />
              <button disabled={busy} className="min-h-11 rounded-lg border px-3 font-semibold dark:border-slate-700">Save name</button>
            </form>
            <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold dark:border-slate-700"><input type="checkbox" checked={make.is_active} onChange={(event) => void saveAction(() => apiRequest(`/admin/car-makes/${make.id}`, { method: "PUT", body: JSON.stringify({ name: make.name, is_active: event.target.checked, sort_order: make.sort_order }) }), event.target.checked ? "Make shown on the website." : "Make hidden from the website.")} className="size-5 accent-emerald-800" />Show on website</label>
            <button type="button" onClick={() => { if (window.confirm(`Delete ${make.name} and its models? This cannot be undone.`)) void saveAction(() => apiRequest(`/admin/car-makes/${make.id}`, { method: "DELETE" }), "Make deleted."); }} className="min-h-11 rounded-lg border border-red-300 px-3 font-semibold text-red-800">Delete</button>
          </div>
          <section className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <h2 className="font-semibold">Models</h2>
            {make.models.length ? <ul className="mt-3 space-y-3">{make.models.map((model) => <ModelEditor key={model.id} make={make} model={model} value={modelNames[model.id] ?? model.name} vehicleTypeId={modelTypes[model.id] ?? ""} types={types} busy={busy} onName={(value) => setModelNames((current) => ({ ...current, [model.id]: value }))} onType={(value) => setModelTypes((current) => ({ ...current, [model.id]: value }))} onSave={() => saveAction(() => apiRequest(`/admin/car-models/${model.id}`, { method: "PUT", body: JSON.stringify({ name: modelNames[model.id] ?? model.name, default_vehicle_type_id: modelTypes[model.id] ? Number(modelTypes[model.id]) : null, is_active: model.is_active }) }), "Model updated.")} onToggle={(active) => saveAction(() => apiRequest(`/admin/car-models/${model.id}`, { method: "PUT", body: JSON.stringify({ name: model.name, default_vehicle_type_id: model.default_vehicle_type_id, is_active: active }) }), active ? "Model shown on the website." : "Model hidden from the website.")} onDelete={() => { if (window.confirm(`Delete ${model.name}? This cannot be undone.`)) void saveAction(() => apiRequest(`/admin/car-models/${model.id}`, { method: "DELETE" }), "Model deleted."); }} />)}</ul> : <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No models yet. Add the first model below.</p>}
            <form onSubmit={(event) => { event.preventDefault(); const name = (newModels[make.id] || "").trim(); if (!name) return; void saveAction(() => apiRequest(`/admin/car-makes/${make.id}/models`, { method: "POST", body: JSON.stringify({ name, default_vehicle_type_id: newModelTypes[make.id] ? Number(newModelTypes[make.id]) : null, is_active: true }) }), "Model added."); setNewModels((current) => ({ ...current, [make.id]: "" })); setNewModelTypes((current) => ({ ...current, [make.id]: "" })); }} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="flex-1 text-sm font-semibold">New model<input value={newModels[make.id] || ""} onChange={(event) => setNewModels((current) => ({ ...current, [make.id]: event.target.value }))} placeholder={`For example, a ${make.name} model`} maxLength={100} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700" /></label>
              <label className="flex-1 text-sm font-semibold">Default vehicle type<select value={newModelTypes[make.id] || ""} onChange={(event) => setNewModelTypes((current) => ({ ...current, [make.id]: event.target.value }))} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-transparent px-2 dark:border-slate-700"><option value="">Choose type (optional)</option>{types.filter((type) => type.is_active !== false).map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
              <button disabled={busy} className="min-h-11 self-end rounded-lg border px-4 font-semibold dark:border-slate-700">Add model</button>
            </form>
            <form onSubmit={(event) => { event.preventDefault(); const names = (bulkModels[make.id] || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean); if (!names.length) return; void saveAction(() => apiRequest(`/admin/car-makes/${make.id}/models/bulk`, { method: "POST", body: JSON.stringify({ models: names }) }), "Models added."); setBulkModels((current) => ({ ...current, [make.id]: "" })); }} className="mt-4">
              <label className="block text-sm font-semibold">Add several models at once<p className="font-normal text-slate-600 dark:text-slate-300">Paste one model name per line.</p><textarea value={bulkModels[make.id] || ""} onChange={(event) => setBulkModels((current) => ({ ...current, [make.id]: event.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700" /></label>
              <button disabled={busy} className="mt-2 min-h-11 rounded-lg border px-4 font-semibold dark:border-slate-700">Add model list</button>
            </form>
          </section>
        </article>)}</div>}
  </main>;
}

function ModelEditor({ make, model, value, vehicleTypeId, types, busy, onName, onType, onSave, onToggle, onDelete }: {
  make: CarMakeOption; model: CarModelOption; value: string; vehicleTypeId: string; types: VehicleType[]; busy: boolean;
  onName: (value: string) => void; onType: (value: string) => void; onSave: () => void; onToggle: (active: boolean) => void; onDelete: () => void;
}) {
  return <li className="grid gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
    <label className="text-sm font-semibold">Model name<input aria-label={`${make.name} model name`} value={value} onChange={(event) => onName(event.target.value)} maxLength={100} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" /></label>
    <label className="text-sm font-semibold">Default vehicle type<select aria-label={`${make.name} default vehicle type`} value={vehicleTypeId} onChange={(event) => onType(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 dark:border-slate-700 dark:bg-slate-900"><option value="">Choose type</option>{types.filter((type) => type.is_active !== false).map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
    <button type="button" disabled={busy} onClick={onSave} className="min-h-11 rounded-lg border px-3 font-semibold dark:border-slate-700">Save</button>
    <div className="flex gap-2"><label className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-2 text-xs font-semibold dark:border-slate-700"><input type="checkbox" checked={model.is_active} onChange={(event) => onToggle(event.target.checked)} className="size-5 accent-emerald-800" />Show</label><button type="button" onClick={onDelete} className="min-h-11 rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-800">Delete</button></div>
  </li>;
}
