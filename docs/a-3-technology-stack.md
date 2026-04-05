# A-3 Technology Stack

## Purpose

This document is the single source of truth for the technologies used by VelleGrandeur.

## Core Application Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript 5
- Runtime: Node.js 20+
- Package manager: pnpm 10

## Frontend Stack

- React 19
- Tailwind CSS 4
- Next.js file-based routing under `app/`

## Backend and Data Stack

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Next.js Route Handlers for API endpoints (`app/api/**`)
- Zod for API request validation

## Security and Access Stack

- Supabase Row Level Security (RLS)
- Admin authorization via `admin_users` table
- Supabase cookie session handling (`@supabase/ssr`)
- Inquiry abuse controls:
  - honeypot field
  - IP hash rate limiting

## Data and Migration Stack

- SQL migrations in `supabase/migrations/`
- Seed scripts in `supabase/seed.sql`
- Enum-driven status/category model in Postgres

## Development Tooling

- ESLint 9 + `eslint-config-next`
- Next.js production build via webpack mode for stable local checks

## Deployment Target

- Recommended: Vercel for app hosting
- Required external service: Supabase project

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `INQUIRY_PEPPER`

## Version Source

The authoritative package versions are defined in `package.json` and lockfile `pnpm-lock.yaml`.
