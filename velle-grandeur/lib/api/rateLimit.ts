import type { SupabaseClient } from "@supabase/supabase-js";

const WINDOW_MINUTES = 10;
const MAX_PER_IP = 5;
const MAX_PER_LISTING_IP = 2;

export async function isInquiryRateLimited(
  supabase: SupabaseClient,
  ipHash: string,
  listingId: string,
) {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const total = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (total.error) {
    return { error: total.error };
  }

  const listing = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("listing_id", listingId)
    .gte("created_at", since);

  if (listing.error) {
    return { error: listing.error };
  }

  const limited =
    (total.count ?? 0) >= MAX_PER_IP ||
    (listing.count ?? 0) >= MAX_PER_LISTING_IP;

  return { limited };
}
