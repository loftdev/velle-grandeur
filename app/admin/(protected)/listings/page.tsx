"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const categories = [
  "apartment",
  "commercial_space",
  "condo",
  "house_and_lot",
  "lot",
];

type Listing = {
  id: string;
  title: string;
  status: string;
  category: string;
  price_cents: number;
  province: string;
  city: string | null;
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState<string | null>(null);

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
    // Initial/admin-filtered fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadListings();
  }, [loadListings]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

    const res = await fetch("/api/admin/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: form.category,
        status: form.status,
        title: form.title,
        description: form.description,
        price_cents: priceCents,
        province: form.province,
        city: form.city || null,
        contact_phone: form.contact_phone || null,
        images: [],
      }),
    });

    if (res.ok) {
      setCreateStatus("Listing created.");
      setForm({
        category: "condo",
        status: "draft",
        title: "",
        description: "",
        price: "",
        province: "",
        city: "",
        contact_phone: "",
      });
      await loadListings();
    } else {
      setCreateStatus("Unable to create listing.");
    }

    setCreating(false);
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
          <label className="grid gap-2 text-sm font-medium">
            Category
            <select
              name="category"
              value={form.category}
              onChange={(event) => updateForm("category", event.target.value)}
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
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="sold">Sold</option>
            </select>
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
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold">Sold</option>
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
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{listing.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                      {listing.status} · {listing.category.replace(/_/g, " ")}
                    </p>
                  </div>
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
