"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listingCategories,
  listingCategoryLabels,
  listingStatuses,
  listingStatusLabels,
  MAX_LISTING_IMAGES,
  MAX_LISTING_IMAGE_SIZE_BYTES,
} from "../../../../lib/api/constants";
import { createSupabaseBrowserClient } from "../../../../lib/supabase/client";
import AdminListingThumbnailStrip from "../../../../components/AdminListingThumbnailStrip";

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type ApiError = {
  error?: {
    message?: string;
  };
};

type Listing = {
  id: string;
  title: string;
  status: string;
  category: string;
  price_cents: number;
  province: string;
  city: string | null;
  images: {
    id: string;
    image_url: string;
    sort_order: number;
  }[];
};

export default function AdminListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null,
  );

  const [form, setForm] = useState({
    category: "condo",
    status: "draft",
    title: "",
    description: "",
    price: "",
    province: "",
    city: "",
    contact_phone: "",
  });

  const imagePreviews = useMemo(
    () =>
      imageFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [imageFiles],
  );

  useEffect(
    () => () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [imagePreviews],
  );

  const loadListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    const res = await fetch(`/api/admin/listings?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setListings(data.items ?? []);
    }
    setLoading(false);
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (imageFiles.length + files.length > MAX_LISTING_IMAGES) {
      setCreateStatus(`Select up to ${MAX_LISTING_IMAGES} images.`);
      return;
    }

    const invalidType = files.find((file) => !imageExtensions[file.type]);
    if (invalidType) {
      setCreateStatus("Choose only PNG, JPEG, or WebP images.");
      return;
    }

    const oversized = files.find(
      (file) => file.size > MAX_LISTING_IMAGE_SIZE_BYTES,
    );
    if (oversized) {
      setCreateStatus("Each listing image must be 5 MB or smaller.");
      return;
    }

    setImageFiles((current) => [...current, ...files]);
    setCreateStatus(null);
  };

  const moveSelectedImage = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      toIndex < 0 ||
      toIndex >= imageFiles.length
    ) {
      return;
    }

    setImageFiles((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const removeSelectedImage = (index: number) => {
    setImageFiles((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setCreateStatus(null);

    const numericPrice = Number(form.price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setCreateStatus("Please enter a valid non-negative price.");
      setCreating(false);
      return;
    }

    const priceCents = Math.round(numericPrice * 100);

    const createRes = await fetch("/api/admin/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: form.category,
        status: "draft",
        title: form.title,
        description: form.description,
        price_cents: priceCents,
        province: form.province,
        city: form.city || null,
        contact_phone: form.contact_phone || null,
        images: [],
      }),
    });

    if (!createRes.ok) {
      const body = (await createRes.json().catch(() => null)) as ApiError | null;
      setCreateStatus(body?.error?.message ?? "Unable to create listing.");
      setCreating(false);
      return;
    }

    const created = (await createRes.json()) as {
      id: string;
      company_id: string;
    };
    const supabase = createSupabaseBrowserClient();
    const uploadedPaths: string[] = [];

    try {
      for (const file of imageFiles) {
        const extension = imageExtensions[file.type];
        const path = `company/${created.company_id}/listing/${created.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage
          .from("listing-images")
          .upload(path, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (upload.error) throw upload.error;
        uploadedPaths.push(path);
      }

      const finalizeRes = await fetch(`/api/admin/listings/${created.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          images: uploadedPaths.map((storagePath, index) => ({
            storage_path: storagePath,
            sort_order: index,
          })),
        }),
      });

      if (!finalizeRes.ok) {
        const body = (await finalizeRes.json().catch(() => null)) as
          | ApiError
          | null;
        throw new Error(
          body?.error?.message ?? "Unable to finish creating listing.",
        );
      }

      router.push(`/admin/listings/${created.id}`);
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("listing-images").remove(uploadedPaths);
      }
      await fetch(`/api/admin/listings/${created.id}`, { method: "DELETE" });
      setCreateStatus(
        error instanceof Error
          ? error.message
          : "Unable to upload listing images.",
      );
      setCreating(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
          Property management
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Listings</h1>
        <p className="mt-3 text-lg leading-8 text-neutral-600">
          Create, edit, and publish property listings.
        </p>
      </div>

      <form className="card grid gap-6 p-6 sm:p-8" onSubmit={handleCreate}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            New property
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Create listing</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid content-start gap-2 text-sm font-medium">
            Category
            <select
              name="category"
              value={form.category}
              onChange={(event) => updateForm("category", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            >
              {listingCategories.map((category) => (
                <option key={category} value={category}>
                  {listingCategoryLabels[category]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid content-start gap-2 text-sm font-medium">
            Status
            <select
              name="status"
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            >
              {listingStatuses.map((status) => (
                <option key={status} value={status}>
                  {listingStatusLabels[status]}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-neutral-500">
              Draft is private. Published appears publicly. Sold is archived
              from public results.
            </span>
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Title
            <input
              name="title"
              autoComplete="off"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              required
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              required
              rows={4}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Price (PHP)
            <input
              name="price"
              autoComplete="off"
              value={form.price}
              onChange={(event) => updateForm("price", event.target.value)}
              required
              type="number"
              min="0"
              step="0.01"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Province
            <input
              name="province"
              autoComplete="address-level1"
              value={form.province}
              onChange={(event) => updateForm("province", event.target.value)}
              required
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            City
            <input
              name="city"
              autoComplete="address-level2"
              value={form.city}
              onChange={(event) => updateForm("city", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Contact phone
            <input
              name="contact_phone"
              autoComplete="tel"
              value={form.contact_phone}
              onChange={(event) => updateForm("contact_phone", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
        </div>
        <section className="grid gap-4 border-t border-[var(--line)] pt-6">
          <div>
            <p className="text-sm font-medium">Property images</p>
            <p className="mt-1 text-xs text-neutral-500">
              Add up to {MAX_LISTING_IMAGES} PNG, JPEG, or WebP images. Maximum
              5 MB each. The first image becomes the card cover.
            </p>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Choose images
            <input
              name="listing_images"
              type="file"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleImageSelection}
              disabled={creating}
            />
          </label>
          {imagePreviews.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {imagePreviews.map(({ file, url }, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  draggable
                  onDragStart={() => setDraggedImageIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedImageIndex !== null) {
                      moveSelectedImage(draggedImageIndex, index);
                    }
                    setDraggedImageIndex(null);
                  }}
                  onDragEnd={() => setDraggedImageIndex(null)}
                  className={`overflow-hidden rounded-xl border bg-white ${
                    draggedImageIndex === index
                      ? "border-[var(--accent)] opacity-60"
                      : "border-[var(--line)]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Selected listing image ${index + 1}`}
                    className="h-28 w-full object-cover"
                  />
                  <p className="truncate px-3 py-2 text-xs text-neutral-600">
                    {index === 0 ? "Cover: " : ""}
                    {file.name}
                  </p>
                  <div className="grid grid-cols-3 border-t border-[var(--line)] text-xs">
                    <button
                      type="button"
                      onClick={() => moveSelectedImage(index, index - 1)}
                      disabled={index === 0}
                      className="py-2 disabled:text-neutral-300"
                      aria-label={`Move ${file.name} left`}
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      className="border-x border-[var(--line)] py-2 text-red-700"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSelectedImage(index, index + 1)}
                      disabled={index === imageFiles.length - 1}
                      className="py-2 disabled:text-neutral-300"
                      aria-label={`Move ${file.name} right`}
                    >
                      Right
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
        {createStatus ? (
          <p className="text-sm text-neutral-600">{createStatus}</p>
        ) : null}
        <button
          className="button w-full bg-[var(--accent)] text-white sm:w-auto sm:justify-self-start"
          type="submit"
          disabled={creating}
        >
          {creating ? "Creating..." : "Create listing"}
        </button>
      </form>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Inventory
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Manage listings</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              aria-label="Filter by category"
              name="category_filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              <option value="">All categories</option>
              {listingCategories.map((category) => (
                <option key={category} value={category}>
                  {listingCategoryLabels[category]}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              name="status_filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              <option value="">All statuses</option>
              {listingStatuses.map((status) => (
                <option key={status} value={status}>
                  {listingStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading listings...</p>
        ) : (
          <div className="card divide-y divide-[var(--line)]">
            {listings.length === 0 ? (
              <p className="p-6 text-sm text-neutral-600">No listings yet.</p>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_20rem_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{listing.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                      {listingStatusLabels[
                        listing.status as keyof typeof listingStatusLabels
                      ] ?? listing.status}
                      {" · "}
                      {listingCategoryLabels[
                        listing.category as keyof typeof listingCategoryLabels
                      ] ?? listing.category.replace(/_/g, " ")}
                    </p>
                  </div>
                  <AdminListingThumbnailStrip
                    images={listing.images ?? []}
                    title={listing.title}
                  />
                  <Link
                    href={`/admin/listings/${listing.id}`}
                    className="button self-start border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--accent)] sm:self-auto"
                  >
                    Manage
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
