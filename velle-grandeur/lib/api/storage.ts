import { getSupabaseEnv } from "../supabase/env";

export function getPublicStorageUrl(bucket: string, path: string) {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}
