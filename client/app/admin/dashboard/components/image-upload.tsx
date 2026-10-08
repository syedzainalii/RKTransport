"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { apiRequest } from "../../../../lib/transport-api";

export type UploadedImage = { url: string; alt?: string | null };

type Props = {
  label: string;
  value: UploadedImage | UploadedImage[] | null;
  onChange: (value: UploadedImage | UploadedImage[] | null) => void;
  multiple?: boolean;
  folder?: string;
  hint?: string;
  uploadEndpoint?: string;
  showDescription?: boolean;
  maxImages?: number;
};

const MAX_UPLOAD_BYTES = 4_000_000;
const TARGET_BYTES = 1_500_000;

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1920 / bitmap.width, 1920 / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is unavailable.");
  let quality = 0.86;
  const encode = () => new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not process image.")), "image/jpeg", quality));
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let blob = await encode();
  while (blob.size > TARGET_BYTES && quality > 0.32) {
    quality -= 0.1;
    blob = await encode();
  }
  while (blob.size > TARGET_BYTES && canvas.width > 320 && canvas.height > 320) {
    canvas.width = Math.max(320, Math.round(canvas.width * 0.9));
    canvas.height = Math.max(320, Math.round(canvas.height * 0.9));
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    blob = await encode();
  }
  bitmap.close();
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("Please choose a smaller image.");
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

export default function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
  folder = "general",
  hint,
  uploadEndpoint = "/admin/media",
  showDescription = true,
  maxImages,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const images = multiple ? (Array.isArray(value) ? value : []) : value && !Array.isArray(value) ? [value] : [];

  async function uploadFiles(files: FileList | File[]) {
    const accepted = [...files].filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (!accepted.length) { setError("Choose a JPG, PNG, or WebP image."); return; }
    if (maxImages !== undefined && accepted.length + images.length > maxImages && replaceIndex === null) {
      setError(`You can add up to ${maxImages} photos.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const additions: UploadedImage[] = [];
      for (let index = 0; index < accepted.length; index++) {
        setProgress(`Preparing image ${index + 1} of ${accepted.length}…`);
        const file = await compressImage(accepted[index]);
        setProgress(`Uploading image ${index + 1} of ${accepted.length}…`);
        const form = new FormData();
        form.set("file", file);
        if (uploadEndpoint === "/admin/media") form.set("folder", folder);
        const result = await apiRequest<{ url: string }>(uploadEndpoint, { method: "POST", body: form });
        additions.push({ url: result.url, alt: "" });
      }
      if (replaceIndex !== null && additions[0]) {
        const updated = [...images];
        updated[replaceIndex] = { ...additions[0], alt: images[replaceIndex]?.alt || "" };
        onChange(multiple ? updated : updated[0]);
      } else {
        onChange(multiple ? [...images, ...additions] : additions[0]);
      }
      setReplaceIndex(null);
      setProgress("");
    } catch {
      setError("Image upload failed. Please try a smaller image or try again.");
      setProgress("");
    } finally {
      setBusy(false);
      setReplaceIndex(null);
      if (input.current) { input.current.value = ""; input.current.multiple = multiple; }
    }
  }

  function updateImage(index: number, patch: Partial<UploadedImage>) {
    const updated = images.map((image, imageIndex) => imageIndex === index ? { ...image, ...patch } : image);
    onChange(multiple ? updated : updated[0] ?? null);
  }

  function removeImage(index: number) {
    const updated = images.filter((_, imageIndex) => imageIndex !== index);
    onChange(multiple ? updated : null);
  }

  function reorderImages(from: number, to: number) {
    if (from === to) return;
    const updated = [...images];
    const [image] = updated.splice(from, 1);
    updated.splice(to, 0, image);
    onChange(updated);
  }

  return <section className="space-y-3">
    <div><h3 className="font-semibold">{label}</h3>{hint && <p className="text-sm text-slate-600 dark:text-slate-300">{hint}</p>}</div>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple && replaceIndex === null} className="sr-only" onChange={(event) => event.target.files && void uploadFiles(event.target.files)} />
    <button type="button" disabled={busy} onClick={() => input.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void uploadFiles(event.dataTransfer.files); }} className="flex min-h-20 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 text-center text-sm font-semibold hover:border-emerald-700 disabled:opacity-60 dark:border-slate-700">
      Drop an image here or choose a file · JPG, PNG or WebP
    </button>
    {busy && <div role="progressbar" aria-label={progress} className="h-2 overflow-hidden rounded bg-slate-200 dark:bg-slate-700"><div className="h-full w-2/3 animate-pulse bg-emerald-700" /></div>}
    {progress && <p role="status" className="text-sm">{progress}</p>}
    {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    {images.length > 0 && <div className={multiple ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "max-w-sm"}>
      {images.map((image, index) => <article key={`${image.url}-${index}`} draggable={multiple} onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex !== null) reorderImages(dragIndex, index); setDragIndex(null); }} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"><Image src={image.url} alt={image.alt || ""} fill unoptimized sizes="(max-width: 640px) 50vw, 240px" className="object-cover" /></div>
        {showDescription && <label className="mt-2 block text-xs font-medium">Describe this image (helps Google and screen readers)<input value={image.alt || ""} onChange={(event) => updateImage(index, { alt: event.target.value })} maxLength={255} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-transparent px-2 text-sm dark:border-slate-700" /></label>}
        {multiple && <p className="mt-1 text-xs text-slate-500">Drag to change order</p>}
        <div className="mt-2 flex gap-2"><button type="button" disabled={busy} onClick={() => { setReplaceIndex(index); if (input.current) input.current.multiple = false; input.current?.click(); }} className="min-h-11 flex-1 rounded-lg border px-2 text-sm font-semibold disabled:opacity-60 dark:border-slate-700">Replace</button><button type="button" disabled={busy} onClick={() => removeImage(index)} className="min-h-11 flex-1 rounded-lg border border-red-300 px-2 text-sm font-semibold text-red-800 disabled:opacity-60">Remove</button></div>
      </article>)}
    </div>}
  </section>;
}
