# VelleGrandeur

VelleGrandeur is a single-client real estate website + admin dashboard built with Next.js App Router and Supabase.

Detailed project documentation:
- `docs/README.md` (numbered documentation flow)
- `docs/a-3-technology-stack.md` (dedicated stack reference)

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- Supabase Auth, Postgres, Storage
- Route Handlers under `app/api/**`

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Required values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INQUIRY_PEPPER`.

3. Run the app:

```bash
pnpm dev
```

## Supabase setup

1. Create a Supabase project.
2. Run SQL migration in Supabase SQL Editor:

- `supabase/migrations/20260301230000_v1_schema.sql`

3. Seed initial company row:

- `supabase/seed.sql`

4. Add one admin user UUID from Supabase Auth into `admin_users`.

## Features implemented

- Public pages: Home, Listing Detail, About, Contact
- Public APIs:
  - `GET /api/public/company`
  - `GET /api/public/listings`
  - `GET /api/public/listings/:slugOrId`
  - `POST /api/public/inquiries`
- Admin pages: Login, Dashboard, Company, Listings, Inquiries
- Admin APIs:
  - `GET/PATCH /api/admin/company`
  - `GET/POST /api/admin/listings`
  - `GET/PATCH/DELETE /api/admin/listings/:id`
  - `GET /api/admin/inquiries`
  - `GET/PATCH /api/admin/inquiries/:id`

## Notes

- Listing URLs use `:slug-:id`.
- Public listing responses include only `published` listings (sold/draft are hidden).
- Inquiries use honeypot + IP-based rate limiting.
- `price_cents` is stored as integer cents.
