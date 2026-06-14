"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  listingCategories,
  listingCategoryLabels,
  listingStatuses,
  listingStatusLabels,
  MAX_LISTING_IMAGES,
  MAX_LISTING_IMAGE_SIZE_BYTES,
} from "../../../../../lib/api/constants";
import { createSupabaseBrowserClient } from "../../../../../lib/supabase/client";

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
  return (cents / 100).toFixed(2);
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
  const [removingPath, setRemovingPath] = useState<string | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null,
  );
  const [imageOrderChanged, setImageOrderChanged] = useState(false);

  const loadListing = useCallback(async () => {
    const res = await fetch(`/api/admin/listings/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as Listing;
    setListing(data);
    setImageOrderChanged(false);
  }, [id]);

  useEffect(() => {
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

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (
      !listing ||
      fromIndex === toIndex ||
      toIndex < 0 ||
      toIndex >= images.length
    ) {
      return;
    }

    const reorderedImages = [...images];
    const [movedImage] = reorderedImages.splice(fromIndex, 1);
    reorderedImages.splice(toIndex, 0, movedImage);

    setListing({
      ...listing,
      images: reorderedImages.map((image, index) => ({
        ...image,
        sort_order: index,
      })),
    });
    setImageOrderChanged(true);
    setStatus("Image order changed. Save listing to apply it.");
  };

  const saveListing = async (nextImages: ListingImage[]) => {
    if (!listing) return;

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
        images: nextImages.map((image, index) => ({
          storage_path: image.storage_path,
          sort_order: index,
        })),
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiError | null;
      return {
        data: null,
        error: body?.error?.message ?? "Unable to update listing.",
      };
    }

    return {
      data: (await res.json()) as Listing,
      error: null,
    };
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!listing) return;

    setSaving(true);
    setStatus(null);

    const result = await saveListing(images);
    if (result?.data) {
      setListing(result.data);
      setImageOrderChanged(false);
      setStatus("Listing updated.");
    } else {
      setStatus(result?.error ?? "Unable to update listing.");
    }

    setSaving(false);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || !listing) return;

    if (images.length + files.length > MAX_LISTING_IMAGES) {
      setStatus(`A listing can have up to ${MAX_LISTING_IMAGES} images.`);
      return;
    }

    const invalidType = files.find((file) => !imageExtensions[file.type]);
    if (invalidType) {
      setStatus("Choose only PNG, JPEG, or WebP images.");
      return;
    }

    const oversized = files.find(
      (file) => file.size > MAX_LISTING_IMAGE_SIZE_BYTES,
    );
    if (oversized) {
      setStatus("Each listing image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    setStatus(null);

    const supabase = createSupabaseBrowserClient();
    const uploadedPaths: string[] = [];

    try {
      const uploadedImages: ListingImage[] = [];

      for (const file of files) {
        const extension = imageExtensions[file.type];
        const path = `company/${listing.company_id}/listing/${listing.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage
          .from("listing-images")
          .upload(path, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (upload.error) throw upload.error;
        uploadedPaths.push(path);

        const { data } = supabase.storage
          .from("listing-images")
          .getPublicUrl(path);

        uploadedImages.push({
          id: crypto.randomUUID(),
          image_url: data.publicUrl,
          storage_path: path,
          sort_order: images.length + uploadedImages.length,
        });
      }

      const result = await saveListing([...images, ...uploadedImages]);
      if (!result?.data) {
        throw new Error(result?.error ?? "Unable to attach listing images.");
      }

      setListing(result.data);
      setImageOrderChanged(false);
      setStatus(
        files.length === 1
          ? "Image uploaded and saved."
          : `${files.length} images uploaded and saved.`,
      );
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("listing-images").remove(uploadedPaths);
      }
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to upload listing images.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (storagePath: string) => {
    if (!listing) return;

    setRemovingPath(storagePath);
    setStatus(null);

    const remainingImages = images.filter(
      (image) => image.storage_path !== storagePath,
    );
    const result = await saveListing(remainingImages);

    if (!result?.data) {
      setStatus(result?.error ?? "Unable to remove listing image.");
      setRemovingPath(null);
      return;
    }

    setListing(result.data);
    setImageOrderChanged(false);

    const supabase = createSupabaseBrowserClient();
    const removal = await supabase.storage
      .from("listing-images")
      .remove([storagePath]);

    setStatus(
      removal.error
        ? "Image was removed from the listing, but the stored file could not be deleted."
        : "Image removed.",
    );
    setRemovingPath(null);
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
          <label className="grid content-start gap-2 text-sm font-medium">
            Category
            <select
              name="category"
              value={listing.category}
              onChange={(event) => updateField("category", event.target.value)}
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
              value={listing.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            >
              {listingStatuses.map((listingStatus) => (
                <option key={listingStatus} value={listingStatus}>
                  {listingStatusLabels[listingStatus]}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-neutral-500">
              Draft is private. Published appears publicly. Sold is archived
              from public results.
            </span>
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
              step="0.01"
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
            <label className="grid gap-2 text-sm font-medium sm:min-w-64">
              Upload images
              <input
                name="listing_image"
                type="file"
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleUpload}
                disabled={uploading || saving || removingPath !== null}
              />
            </label>
          </div>
          <p className="text-xs text-neutral-500">
            Up to {MAX_LISTING_IMAGES} PNG, JPEG, or WebP images, 5 MB each.
            Drag images or use the move buttons to change their order. The
            first image is used as the public card cover.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {images.length === 0 ? (
              <p className="text-sm text-neutral-600">No images uploaded.</p>
            ) : (
              images.map((image, index) => (
                <div
                  key={image.storage_path}
                  draggable
                  onDragStart={() => setDraggedImageIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedImageIndex !== null) {
                      moveImage(draggedImageIndex, index);
                    }
                    setDraggedImageIndex(null);
                  }}
                  onDragEnd={() => setDraggedImageIndex(null)}
                  className={`overflow-hidden rounded-2xl border bg-white ${
                    draggedImageIndex === index
                      ? "border-[var(--accent)] opacity-60"
                      : "border-[var(--line)]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.image_url}
                    alt={`${listing.title} image ${index + 1}`}
                    className="h-36 w-full object-cover"
                  />
                  <p className="truncate px-3 py-2 text-xs text-neutral-600">
                    {index === 0 ? "Cover image" : `Image ${index + 1}`}
                  </p>
                  <div className="grid grid-cols-3 border-t border-[var(--line)] text-xs">
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={
                        index === 0 ||
                        removingPath !== null ||
                        uploading ||
                        saving
                      }
                      className="py-2 disabled:text-neutral-300"
                      aria-label={`Move image ${index + 1} left`}
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      className="border-x border-[var(--line)] py-2 text-red-600 disabled:text-neutral-300"
                      onClick={() => handleRemoveImage(image.storage_path)}
                      disabled={removingPath !== null || uploading || saving}
                    >
                      {removingPath === image.storage_path
                        ? "Removing..."
                        : "Remove"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={
                        index === images.length - 1 ||
                        removingPath !== null ||
                        uploading ||
                        saving
                      }
                      className="py-2 disabled:text-neutral-300"
                      aria-label={`Move image ${index + 1} right`}
                    >
                      Right
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {imageOrderChanged ? (
            <p className="text-xs font-medium text-[var(--accent)]">
              The image order has unsaved changes.
            </p>
          ) : null}
        </section>

        {status ? <p className="text-sm text-neutral-600">{status}</p> : null}

        <button
          className="button w-full bg-[var(--accent)] text-white sm:w-auto sm:justify-self-start"
          type="submit"
          disabled={saving || uploading || removingPath !== null}
        >
          {saving ? "Saving..." : "Save listing"}
        </button>
      </form>
    </div>
  );
}
