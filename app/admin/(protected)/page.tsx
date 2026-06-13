import Link from "next/link";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  const published = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  const inquiries = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="badge inline-block bg-[var(--accent-soft)] text-[var(--accent)]">
          Administration
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Dashboard</h1>
        <p className="mt-3 text-lg leading-8 text-neutral-600">
          Manage the company profile, property listings, and incoming client
          inquiries.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/listings"
          className="card group p-6 transition hover:-translate-y-1 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Properties
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Published listings</h2>
            </div>
            <span className="text-2xl text-[var(--accent)] transition group-hover:translate-x-1">
              &rarr;
            </span>
          </div>
          <p className="mt-8 text-5xl font-semibold">
            {published.count ?? 0}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Currently visible on the public website
          </p>
        </Link>

        <Link
          href="/admin/inquiries"
          className="card group p-6 transition hover:-translate-y-1 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Client activity
              </p>
              <h2 className="mt-2 text-2xl font-semibold">New inquiries</h2>
            </div>
            <span className="text-2xl text-[var(--accent)] transition group-hover:translate-x-1">
              &rarr;
            </span>
          </div>
          <p className="mt-8 text-5xl font-semibold">
            {inquiries.count ?? 0}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Leads waiting for review or follow-up
          </p>
        </Link>
      </div>

      <div className="rounded-[28px] bg-[var(--foreground)] px-6 py-8 text-white sm:flex sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9b58f]">
            Company profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Keep public contact and location details current.
          </h2>
        </div>
        <Link
          href="/admin/company"
          className="button mt-5 inline-block bg-white text-[var(--foreground)] sm:mt-0"
        >
          Edit company
        </Link>
      </div>
    </div>
  );
}
