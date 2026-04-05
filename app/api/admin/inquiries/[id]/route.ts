import { z } from "zod";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";
import { jsonError, jsonOk } from "../../../../../lib/api/errors";
import { requireAdmin } from "../../../../../lib/api/guards";
import { inquiryStatuses } from "../../../../../lib/api/constants";

const bodySchema = z.object({
  status: z.enum(inquiryStatuses),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const { data, error } = await supabase
    .from("inquiries")
    .select(
      "id, company_id, listing_id, name, email, phone, message, status, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return jsonError("SERVER_ERROR", "Unable to load inquiry.", 500);
  }

  if (!data) {
    return jsonError("NOT_FOUND", "Inquiry not found.", 404);
  }

  return jsonOk(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const guard = await requireAdmin(supabase);
  if ("response" in guard) return guard.response;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Invalid inquiry data.", 400);
  }

  const update = await supabase
    .from("inquiries")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select(
      "id, company_id, listing_id, name, email, phone, message, status, created_at, updated_at",
    )
    .maybeSingle();

  if (update.error) {
    return jsonError("SERVER_ERROR", "Unable to update inquiry.", 500);
  }

  if (!update.data) {
    return jsonError("NOT_FOUND", "Inquiry not found.", 404);
  }

  return jsonOk(update.data);
}
