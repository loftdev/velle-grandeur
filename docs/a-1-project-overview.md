# A-1 Project Overview

## Purpose

VelleGrandeur is a single-client real estate platform for the Philippines.

It provides:
- A public website for browsing listings and sending inquiries.
- A protected admin dashboard to manage company profile, listings, and inquiries.

## Core Decisions

- Framework: Next.js App Router
- Backend: Supabase (Auth, Postgres, Storage)
- API style: Route Handlers (`app/api/**`)
- Listing URL style: `slug-id`
- Pricing model: `price_cents` integer
- Public listing visibility: only `published`
- Inquiry anti-spam: honeypot + rate limit

## Main Feature Set

- Public home with filtering by category/province/city.
- Public listing detail page with inquiry form.
- Admin login and protected admin area.
- Admin CRUD for company and listings.
- Admin inquiry review and status updates.

## Scope Boundary (Current)

Included:
- Single-client deployment
- SEO-friendly listing detail URL
- Supabase storage for logo and listing images

Not included:
- Multi-tenant platform features
- Email notification workflows
- Marketplace-style advanced search/ranking

Future direction:
- Multi-tenant roadmap is documented in `docs/a-4-multi-tenant-roadmap.md`
