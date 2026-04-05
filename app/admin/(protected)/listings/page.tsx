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
      <div>
        <h1 className="text-3xl font-semibold">Listings</h1>
        <p className="mt-2 text-neutral-600">
          Create, edit, and publish property listings.
        </p>
      </div>

      <form className="card grid gap-4 p-6" onSubmit={handleCreate}>
        <h2 className="text-xl font-semibold">Create listing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Category
            <select
              value={form.category}
              onChange={(event) => updateForm("category", event.target.value)}
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
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="sold">Sold</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              required
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              required
              rows={4}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Price (PHP)
            <input
              value={form.price}
              onChange={(event) => updateForm("price", event.target.value)}
              required
              type="number"
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Province
            <input
              value={form.province}
              onChange={(event) => updateForm("province", event.target.value)}
              required
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            City
            <input
              value={form.city}
              onChange={(event) => updateForm("city", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Contact phone
            <input
              value={form.contact_phone}
              onChange={(event) => updateForm("contact_phone", event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
        </div>
        {createStatus ? (
          <p className="text-sm text-neutral-600">{createStatus}</p>
        ) : null}
        <button
          className="button bg-[var(--accent)] text-white"
          type="submit"
          disabled={creating}
        >
          {creating ? "Creating..." : "Create listing"}
        </button>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {loading ? (
          <p>Loading listings...</p>
        ) : (
          <div className="card divide-y divide-[var(--line)]">
            {listings.length === 0 ? (
              <p className="p-6 text-sm text-neutral-600">No listings yet.</p>
            ) : (
              listings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold">{listing.title}</p>
                    <p className="text-xs text-neutral-500">
                      {listing.status} · {listing.category.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Link
                    href={`/admin/listings/${listing.id}`}
                    className="text-sm text-[var(--accent)]"
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
