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
    return <p>Loading listing...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Listing details</h1>
        <p className="mt-2 text-neutral-600">Edit listing content and images.</p>
      </div>

      <form className="card grid gap-4 p-6" onSubmit={handleSave}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Category
            <select
              value={listing.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
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
              value={listing.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
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
            value={listing.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Description
          <textarea
            value={listing.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
            required
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Price (PHP)
            <input
              value={formatPrice(listing.price_cents)}
              onChange={(event) => updatePrice(event.target.value)}
              required
              type="number"
              min="0"
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Province
            <input
              value={listing.province}
              onChange={(event) => updateField("province", event.target.value)}
              required
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            City
            <input
              value={listing.city ?? ""}
              onChange={(event) => updateField("city", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Contact phone
            <input
              value={listing.contact_phone ?? ""}
              onChange={(event) => updateField("contact_phone", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Images</h2>
            <label className="text-sm text-[var(--accent)]">
              <input
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
                <div key={image.storage_path} className="card overflow-hidden">
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
        </div>

        {status ? <p className="text-sm text-neutral-600">{status}</p> : null}

        <button
          className="button bg-[var(--accent)] text-white"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save listing"}
        </button>
      </form>
    </div>
  );
}
