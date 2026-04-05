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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Inquiries</h1>
        <p className="mt-2 text-neutral-600">
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
              <div key={inquiry.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold">{inquiry.name}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(inquiry.created_at).toLocaleString()} · {inquiry.status}
                  </p>
                </div>
                <Link
                  href={`/admin/inquiries/${inquiry.id}`}
                  className="text-sm text-[var(--accent)]"
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
