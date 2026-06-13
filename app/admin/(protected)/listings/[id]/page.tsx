"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../../../../../lib/supabase/client";

const categories = [
  "apartment",
  "commercial_space",
  "condo",
  "house_and_lot",
  "lot",
] as const;

type ListingImage = {
  id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
};

type Listing = {
  id: string;
  company_id: string;
  category: string;
  status: string;
  title: string;
  description: string;
  price_cents: number;
  province: string;
  city: string | null;
  contact_phone: string | null;
  images: ListingImage[];
};

function formatPrice(cents: number) {
  return (cents / 100).toFixed(0);
}

function getFileExtension(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "jpg";
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadListing = useCallback(async () => {
    const res = await fetch(`/api/admin/listings/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as Listing;
    setListing(data);
  }, [id]);

  useEffect(() => {
    // Load listing once route param is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadListing();
  }, [loadListing]);

  const images = useMemo(() => listing?.images ?? [], [listing]);

  const updateField = (
    field: "category" | "status" | "title" | "description" | "province" | "city" | "contact_phone",
    value: string,
  ) => {
    if (!listing) return;
    setListing({ ...listing, [field]: value });
  };

  const updatePrice = (value: string) => {
    if (!listing) return;
    const cents = Math.max(0, Math.round(Number(value || "0") * 100));
    setListing({ ...listing, price_cents: cents });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!listing) return;

    setSaving(true);
    setStatus(null);

    const res = await fetch(`/api/admin/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: listing.category,
        status: listing.status,
        title: listing.title,
        description: listing.description,
        price_cents: listing.price_cents,
        province: listing.province,
        city: listing.city || null,
        contact_phone: listing.contact_phone || null,
        images: images.map((image, index) => ({
          storage_path: image.storage_path,
          sort_order: index,
        })),
      }),
    });

    if (res.ok) {
      setStatus("Listing updated.");
      await loadListing();
    } else {
      setStatus("Unable to update listing.");
    }

    setSaving(false);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !listing) return;

    setUploading(true);
    setStatus(null);

    const supabase = createSupabaseBrowserClient();
    const ext = getFileExtension(file);
    const path = `company/${listing.company_id}/listing/${listing.id}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(path, file, { upsert: false });

    if (error) {
      setStatus(error.message);
      setUploading(false);
      event.target.value = "";
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      setStatus("Missing NEXT_PUBLIC_SUPABASE_URL.");
      setUploading(false);
      event.target.value = "";
      return;
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/listing-images/${path}`;

    setListing({
      ...listing,
      images: [
        ...images,
        {
          id: crypto.randomUUID(),
          image_url: imageUrl,
          storage_path: path,
          sort_order: images.length,
        },
      ],
    });

    event.target.value = "";
    setUploading(false);
  };

  const handleRemoveImage = (storagePath: string) => {
    if (!listing) return;
    setListing({
      ...listing,
      images: images.filter((image) => image.storage_path !== storagePath),
    });
  };

  if (!listing) {
    return <p className="text-neutral-600">Loading listing...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
          Property management
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
          Listing details
        </h1>
        <p className="mt-3 text-lg leading-8 text-neutral-600">
          Edit listing content, publishing status, and property images.
        </p>
      </div>

      <form className="card grid gap-7 p-6 sm:p-8" onSubmit={handleSave}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Category
            <select
              name="category"
              value={listing.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Status
            <select
              name="status"
              value={listing.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="sold">Sold</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Title
          <input
            name="title"
            autoComplete="off"
            value={listing.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Description
          <textarea
            name="description"
            value={listing.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
            required
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Price (PHP)
            <input
              name="price"
              autoComplete="off"
              value={formatPrice(listing.price_cents)}
              onChange={(event) => updatePrice(event.target.value)}
              required
              type="number"
              min="0"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Province
            <input
              name="province"
              autoComplete="address-level1"
              value={listing.province}
              onChange={(event) => updateField("province", event.target.value)}
              required
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            City
            <input
              name="city"
              autoComplete="address-level2"
              value={listing.city ?? ""}
              onChange={(event) => updateField("city", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Contact phone
            <input
              name="contact_phone"
              autoComplete="tel"
              value={listing.contact_phone ?? ""}
              onChange={(event) => updateField("contact_phone", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
        </div>

        <section className="space-y-5 border-t border-[var(--line)] pt-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Gallery
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Property images</h2>
            </div>
            <label className="button cursor-pointer self-start border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--accent)]">
              <input
                name="listing_image"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
              {uploading ? "Uploading..." : "Upload image"}
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {images.length === 0 ? (
              <p className="text-sm text-neutral-600">No images uploaded.</p>
            ) : (
              images.map((image) => (
                <div
                  key={image.storage_path}
                  className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.image_url}
                    alt={listing.title}
                    className="h-36 w-full object-cover"
                  />
                  <button
                    type="button"
                    className="w-full py-2 text-xs text-red-600"
                    onClick={() => handleRemoveImage(image.storage_path)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {status ? <p className="text-sm text-neutral-600">{status}</p> : null}

        <button
          className="button w-full bg-[var(--accent)] text-white sm:w-auto sm:justify-self-start"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save listing"}
        </button>
      </form>
    </div>
  );
}
