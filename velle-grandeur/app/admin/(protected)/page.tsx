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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Quick overview of listings and inquiries.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm text-neutral-500">Published listings</p>
          <p className="mt-2 text-3xl font-semibold">
            {published.count ?? 0}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-neutral-500">New inquiries</p>
          <p className="mt-2 text-3xl font-semibold">
            {inquiries.count ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
