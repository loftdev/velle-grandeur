# B-2 Supabase Setup And Deployment Notes

## Supabase Bootstrap

1. Create a Supabase project.
2. Run migration SQL in timestamp order:
   - `supabase/migrations/20260301230000_v1_schema.sql`
   - `supabase/migrations/20260613193000_company_location_fields.sql`
3. Run seed SQL:
   - `supabase/seed.sql`
4. Insert at least one admin user in `admin_users`.

The company location migration adds office coordinates and business hours. It
also seeds the current office location:

- Address: `Poblacion, Claveria, Misamis Oriental, Philippines`
- Latitude: `8.611484`
- Longitude: `124.894067`

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
- Company address and coordinates render correctly on `/contact`
- Public listing and inquiry flow works
