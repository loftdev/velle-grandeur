"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../../../lib/supabase/client";

type Company = {
  id: string;
  name: string;
  logo_path: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  about: string | null;
};

export default function CompanyPage() {
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
    field: "name" | "phone" | "email" | "address" | "about" | "logo_path",
    value: string,
  ) => {
    if (!company) return;
    setCompany({ ...company, [field]: value });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!company) return;

    setSaving(true);
    setStatus(null);

    const res = await fetch("/api/admin/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: company.name,
        phone: company.phone || null,
        email: company.email || null,
        address: company.address || null,
        about: company.about || null,
        logo_path: company.logo_path || null,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as Company;
      setCompany(data);
      setStatus("Saved successfully.");
    } else {
      setStatus("Unable to save company settings.");
    }

    setSaving(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !company) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      setStatus("Missing NEXT_PUBLIC_SUPABASE_URL.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setStatus(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const companyId = company.id || "singleton";
    const path = `company/${companyId}/logo/${crypto.randomUUID()}.${ext}`;
    const supabase = createSupabaseBrowserClient();

    const upload = await supabase.storage
      .from("company-assets")
      .upload(path, file, { upsert: false });

    if (upload.error) {
      setStatus(upload.error.message);
      setUploading(false);
      event.target.value = "";
      return;
    }

    setCompany({
      ...company,
      logo_path: path,
      logo_url: `${supabaseUrl}/storage/v1/object/public/company-assets/${path}`,
    });
    setStatus("Logo uploaded. Save changes to persist.");
    setUploading(false);
    event.target.value = "";
  };

  if (!company) {
    return <p>Loading company settings...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Company Settings</h1>
        <p className="mt-2 text-neutral-600">
          Update the public profile details for VelleGrandeur.
        </p>
      </div>
      <form className="card grid gap-4 p-6" onSubmit={handleSave}>
        <label className="grid gap-2 text-sm font-medium">
          Company name
          <input
            value={company.name ?? ""}
            onChange={(event) => updateField("name", event.target.value)}
            required
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Phone
          <input
            value={company.phone ?? ""}
            onChange={(event) => updateField("phone", event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            value={company.email ?? ""}
            onChange={(event) => updateField("email", event.target.value)}
            type="email"
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Address
          <input
            value={company.address ?? ""}
            onChange={(event) => updateField("address", event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          About
          <textarea
            value={company.about ?? ""}
            onChange={(event) => updateField("about", event.target.value)}
            rows={4}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Logo path (bucket: company-assets)
          <input
            value={company.logo_path ?? ""}
            onChange={(event) => updateField("logo_path", event.target.value)}
            placeholder="company/<company_id>/logo/<uuid>.jpg"
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Upload logo
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        {uploading ? <p className="text-xs text-neutral-500">Uploading logo...</p> : null}
        {company.logo_url ? (
          <p className="text-xs text-neutral-500">Preview URL: {company.logo_url}</p>
        ) : null}
        {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
        <button
          className="button bg-[var(--accent)] text-white"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
