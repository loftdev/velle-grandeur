# B-2 Supabase Setup And Deployment Notes

## Supabase Bootstrap

1. Create a Supabase project.
2. Run migration SQL:
   - `supabase/migrations/20260301230000_v1_schema.sql`
3. Run seed SQL:
   - `supabase/seed.sql`
4. Insert at least one admin user in `admin_users`.

## Storage Buckets

Expected buckets:
- `listing-images` (public)
- `company-assets` (public)

## Deployment Notes

- App is compatible with Vercel + Supabase.
- Ensure all env vars from `.env.example` are configured in deployment.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## First Deployment Checklist

- Migration applied successfully
- Seed executed
- Admin user exists
- Admin login works
- Public listing and inquiry flow works
