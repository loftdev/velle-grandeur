"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../../lib/supabase/client";

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const logoExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type Company = {
  id: string;
  name: string;
  logo_path: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  about: string | null;
  latitude: number | null;
  longitude: number | null;
  business_hours: string | null;
};

type ApiError = {
  error?: {
    message?: string;
  };
};

export default function CompanyPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/company");
      if (!res.ok) return;
      const data = (await res.json()) as Company;
      setCompany(data);
    };
    void load();
  }, []);

  const updateField = (
    field:
      | "name"
      | "phone"
      | "email"
      | "address"
      | "about"
      | "business_hours",
    value: string,
  ) => {
    if (!company) return;
    setCompany({ ...company, [field]: value });
  };

  const updateCoordinate = (
    field: "latitude" | "longitude",
    value: string,
  ) => {
    if (!company) return;
    setCompany({
      ...company,
      [field]: value === "" ? null : Number(value),
    });
  };

  const saveCompany = async (nextCompany: Company) => {
    const res = await fetch("/api/admin/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nextCompany.name,
        phone: nextCompany.phone || null,
        email: nextCompany.email || null,
        address: nextCompany.address || null,
        about: nextCompany.about || null,
        latitude: nextCompany.latitude,
        longitude: nextCompany.longitude,
        business_hours: nextCompany.business_hours || null,
        logo_path: nextCompany.logo_path || null,
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiError | null;
      return {
        data: null,
        error: body?.error?.message ?? "Unable to save company settings.",
      };
    }

    return {
      data: (await res.json()) as Company,
      error: null,
    };
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!company) return;

    setSaving(true);
    setStatus(null);

    const result = await saveCompany(company);

    if (result.data) {
      setCompany(result.data);
      setStatus("Saved successfully.");
      router.refresh();
    } else {
      setStatus(result.error);
    }

    setSaving(false);
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !company) return;

    const extension = logoExtensions[file.type];
    if (!extension) {
      setStatus("Choose a PNG, JPEG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setStatus("Logo images must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (!company.id) {
      setStatus("Save the company profile before uploading a logo.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setStatus(null);

    const path = `company/${company.id}/logo/${crypto.randomUUID()}.${extension}`;
    const supabase = createSupabaseBrowserClient();

    const upload = await supabase.storage
      .from("company-assets")
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (upload.error) {
      setStatus(upload.error.message);
      setUploading(false);
      event.target.value = "";
      return;
    }

    const previousLogoPath = company.logo_path;
    const result = await saveCompany({
      ...company,
      logo_path: path,
    });

    if (!result.data) {
      await supabase.storage.from("company-assets").remove([path]);
      setStatus(`${result.error} The uploaded file was removed.`);
      setUploading(false);
      event.target.value = "";
      return;
    }

    setCompany(result.data);
    router.refresh();

    if (previousLogoPath && previousLogoPath !== path) {
      const removal = await supabase.storage
        .from("company-assets")
        .remove([previousLogoPath]);

      setStatus(
        removal.error
          ? "Logo saved, but the previous file could not be removed."
          : "Logo uploaded and saved.",
      );
    } else {
      setStatus("Logo uploaded and saved.");
    }

    setUploading(false);
    event.target.value = "";
  };

  const handleLogoRemove = async () => {
    if (!company?.logo_path) return;

    setUploading(true);
    setStatus(null);

    const previousLogoPath = company.logo_path;
    const result = await saveCompany({
      ...company,
      logo_path: null,
    });

    if (!result.data) {
      setStatus(result.error);
      setUploading(false);
      return;
    }

    setCompany(result.data);
    router.refresh();

    const supabase = createSupabaseBrowserClient();
    const removal = await supabase.storage
      .from("company-assets")
      .remove([previousLogoPath]);

    setStatus(
      removal.error
        ? "Logo was removed from the company profile, but the stored file could not be deleted."
        : "Logo removed.",
    );
    setUploading(false);
  };

  if (!company) {
    return <p className="text-neutral-600">Loading company settings...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
          Public profile
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
          Company settings
        </h1>
        <p className="mt-3 text-lg leading-8 text-neutral-600">
          Update the public profile details for VelleGrandeur.
        </p>
      </div>
      <form
        className="card grid max-w-4xl gap-8 p-6 sm:p-8"
        onSubmit={handleSave}
      >
        <section className="grid gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Identity and contact
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Public information</h2>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Company name
            <input
              name="name"
              autoComplete="organization"
              value={company.name ?? ""}
              onChange={(event) => updateField("name", event.target.value)}
              required
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Phone
              <input
                name="phone"
                autoComplete="tel"
                value={company.phone ?? ""}
                onChange={(event) => updateField("phone", event.target.value)}
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <input
                name="email"
                autoComplete="email"
                value={company.email ?? ""}
                onChange={(event) => updateField("email", event.target.value)}
                type="email"
                className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            About
            <textarea
              name="about"
              value={company.about ?? ""}
              onChange={(event) => updateField("about", event.target.value)}
              rows={5}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
        </section>

        <section className="grid gap-5 border-t border-[var(--line)] pt-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Location
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Office details</h2>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Full office address
            <input
              name="address"
              autoComplete="street-address"
              value={company.address ?? ""}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Street, city, province, postal code, Philippines"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Latitude
            <input
              name="latitude"
              value={company.latitude ?? ""}
              onChange={(event) =>
                updateCoordinate("latitude", event.target.value)
              }
              type="number"
              min="-90"
              max="90"
              step="any"
              placeholder="14.5995"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Longitude
            <input
              name="longitude"
              value={company.longitude ?? ""}
              onChange={(event) =>
                updateCoordinate("longitude", event.target.value)
              }
              type="number"
              min="-180"
              max="180"
              step="any"
              placeholder="120.9842"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          </div>
          <p className="-mt-2 text-xs text-neutral-500">
            Coordinates position the office map on the public Contact page.
          </p>
          <label className="grid gap-2 text-sm font-medium">
            Business hours
            <textarea
              name="business_hours"
              value={company.business_hours ?? ""}
              onChange={(event) =>
                updateField("business_hours", event.target.value)
              }
              rows={3}
              placeholder={
                "Monday-Friday, 9:00 AM-5:00 PM\nViewings by appointment"
              }
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
        </section>

        <section className="grid gap-5 border-t border-[var(--line)] pt-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Branding
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Company logo</h2>
          </div>
          <label className="grid gap-2 text-sm font-medium">
            {company.logo_url ? "Replace logo" : "Upload logo"}
            <input
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoUpload}
              disabled={uploading || saving}
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3"
            />
          </label>
          <p className="-mt-3 text-xs text-neutral-500">
            PNG, JPEG, or WebP. Maximum file size: 2 MB. Use a square image with
            a transparent or simple background for the clearest navigation logo.
          </p>
          {company.logo_path ? (
            <button
              type="button"
              onClick={handleLogoRemove}
              disabled={uploading || saving}
              className="justify-self-start text-sm font-semibold text-red-700 underline"
            >
              Remove logo
            </button>
          ) : null}
        </section>
        {uploading ? (
          <p className="text-xs text-neutral-500">Uploading logo...</p>
        ) : null}
        {company.logo_url ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.logo_url}
              alt={`${company.name} logo preview`}
              className="max-h-32 max-w-full object-contain"
            />
          </div>
        ) : null}
        {status ? (
          <p
            className="text-sm text-neutral-600"
            role="status"
            aria-live="polite"
          >
            {status}
          </p>
        ) : null}
        <button
          className="button w-full bg-[var(--accent)] text-white sm:w-auto sm:justify-self-start"
          type="submit"
          disabled={saving || uploading}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
