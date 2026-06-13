"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Inquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.items ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
          Client activity
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Inquiries</h1>
        <p className="mt-3 text-lg leading-8 text-neutral-600">
          Review and follow up with new leads.
        </p>
      </div>

      {loading ? (
        <p>Loading inquiries...</p>
      ) : (
        <div className="card divide-y divide-[var(--line)]">
          {inquiries.length === 0 ? (
            <p className="p-6 text-sm text-neutral-600">No inquiries yet.</p>
          ) : (
            inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{inquiry.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(inquiry.created_at).toLocaleString()} · {inquiry.status}
                  </p>
                </div>
                <Link
                  href={`/admin/inquiries/${inquiry.id}`}
                  className="button self-start border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--accent)] sm:self-auto"
                >
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
