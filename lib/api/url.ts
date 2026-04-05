import { headers } from "next/headers";

export async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}
