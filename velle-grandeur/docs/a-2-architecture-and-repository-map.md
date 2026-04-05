# A-2 Architecture And Repository Map

## High-Level Architecture

- Next.js App Router serves public/admin pages and API route handlers.
- Supabase provides:
  - Auth session handling
  - Postgres storage with RLS
  - Public buckets for media assets
- Admin checks are enforced both in route handlers and via RLS policies.

## Runtime Flow

1. User hits page or API endpoint.
2. Next.js route/page executes.
3. Supabase server client reads session from cookies.
4. For admin APIs/pages, `admin_users` membership is validated.
5. Data is read/written in Postgres under RLS policy rules.

## Repository Map

- `app/`
  - Public pages and admin pages
  - `app/api/public/**` public APIs
  - `app/api/admin/**` admin APIs
- `components/`
  - Shared React UI blocks
- `lib/supabase/`
  - `client.ts` browser client
  - `server.ts` server client (cookie-based)
  - `service.ts` service-role client (server-only)
- `lib/api/`
  - Guards, errors, slug helpers, pagination, listing mappers, constants
- `lib/auth/`
  - Admin page guard helper
- `proxy.ts`
  - Session refresh bridge for `/admin/**` and `/api/admin/**`
- `supabase/migrations/`
  - SQL schema + policies
- `supabase/seed.sql`
  - Initial data scaffolding
