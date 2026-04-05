"use client";

import { use, useEffect, useState } from "react";

type Inquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
};

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadInquiry = async () => {
      const res = await fetch(`/api/admin/inquiries/${id}`);
      if (!res.ok) return;
      const data = (await res.json()) as Inquiry;
      setInquiry(data);
    };
    void loadInquiry();
  }, [id]);

  const handleSave = async () => {
    if (!inquiry) return;
    setSaving(true);
    setStatus(null);

    const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: inquiry.status }),
    });

    if (res.ok) {
      setStatus("Inquiry updated.");
    } else {
      setStatus("Unable to update inquiry.");
    }

    setSaving(false);
  };

  if (!inquiry) {
    return <p>Loading inquiry...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Inquiry</h1>
        <p className="mt-2 text-neutral-600">
          Submitted on {new Date(inquiry.created_at).toLocaleString()}.
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Name
          </p>
          <p className="text-lg font-semibold">{inquiry.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Contact
          </p>
          <p className="text-sm text-neutral-700">
            {inquiry.email ?? "No email provided"}
          </p>
          <p className="text-sm text-neutral-700">
            {inquiry.phone ?? "No phone provided"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Message
          </p>
          <p className="text-neutral-700">{inquiry.message}</p>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Status
          <select
            value={inquiry.status}
            onChange={(event) =>
              setInquiry({ ...inquiry, status: event.target.value })
            }
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
        <button
          className="button bg-[var(--accent)] text-white"
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
