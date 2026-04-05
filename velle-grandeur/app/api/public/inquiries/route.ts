import crypto from "crypto";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { createSupabaseServiceClient } from "../../../../lib/supabase/service";
import { jsonError, jsonOk } from "../../../../lib/api/errors";
import { isInquiryRateLimited } from "../../../../lib/api/rateLimit";

const schema = z.object({
  listing_id: z.string().uuid(),
  name: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().min(1),
  website: z.string().optional(),
});

async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

function hashIp(ip: string) {
  const pepper = process.env.INQUIRY_PEPPER ?? "vellegrandeur";
  return crypto.createHash("sha256").update(`${ip}${pepper}`).digest("hex");
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  const result = schema.safeParse(body);

  if (!result.success) {
    return jsonError("VALIDATION_ERROR", "Invalid inquiry data.", 400);
  }

  const { website, email, phone, ...values } = result.data;
  if (website && website.trim().length > 0) {
    return jsonError("VALIDATION_ERROR", "Invalid inquiry data.", 400);
  }

  const supabase = await createSupabaseServerClient();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, company_id")
    .eq("id", values.listing_id)
    .eq("status", "published")
    .maybeSingle();

  if (listingError || !listing) {
    return jsonError("NOT_FOUND", "Listing not found.", 404);
  }

  let serviceClient: ReturnType<typeof createSupabaseServiceClient>;
  try {
    serviceClient = createSupabaseServiceClient();
  } catch {
    return jsonError(
      "SERVER_ERROR",
      "Missing SUPABASE_SERVICE_ROLE_KEY configuration.",
      500,
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const ipHash = hashIp(ip);
  const rateLimit = await isInquiryRateLimited(
    serviceClient,
    ipHash,
    values.listing_id,
  );

  if ("error" in rateLimit) {
    return jsonError("SERVER_ERROR", "Unable to process inquiry.", 500);
  }

  if (rateLimit.limited) {
    return jsonError("RATE_LIMITED", "Too many inquiries. Try later.", 429);
  }

  const insert = await serviceClient
    .from("inquiries")
    .insert({
      ...values,
      email: email || null,
      phone: phone || null,
      company_id: listing.company_id,
      ip_hash: ipHash,
      user_agent: request.headers.get("user-agent") ?? null,
    })
    .select("id, status")
    .single();

  if (insert.error) {
    return jsonError("SERVER_ERROR", "Unable to save inquiry.", 500);
  }

  return jsonOk({ id: insert.data.id, status: insert.data.status }, 201);
}
