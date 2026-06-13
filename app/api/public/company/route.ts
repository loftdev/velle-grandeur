import { jsonError, jsonOk } from "../../../../lib/api/errors";
import { getPublicCompany } from "../../../../lib/api/company";

export async function GET() {
  const company = await getPublicCompany();
  if (!company) {
    return jsonError("NOT_FOUND", "Company not configured.", 404);
  }

  return jsonOk(company);
}
