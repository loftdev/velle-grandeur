# B-1 Local Setup And Environment

## Prerequisites

- Node.js 20+
- pnpm 10+
- Supabase project

## Install

```bash
pnpm install
```

## Environment Variables

Create local env file:

```bash
cp .env.example .env.local
```

Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `INQUIRY_PEPPER`

## Run

```bash
pnpm dev
```

## Verify

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`
- Public APIs: `/api/public/*`
- Admin APIs: `/api/admin/*` (auth required)

## Development Admin Account

The admin login form displays this test account in development builds:

- Email: `test.admin@example.com`
- Password: `password`

The matching Supabase Auth user must exist and its UUID must be present in
`admin_users`. Do not reuse these credentials for staging or production.
