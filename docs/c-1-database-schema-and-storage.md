# C-1 Database Schema And Storage

## Enums

- `listing_category`
  - `apartment`, `commercial_space`, `condo`, `house_and_lot`, `lot`
- `listing_status`
  - `draft`, `published`, `sold`
- `inquiry_status`
  - `new`, `contacted`, `closed`

## Tables

### `company`

- Single-row pattern with `singleton_key` unique
- Stores company profile and logo path
- Contact and location fields:
  - `phone`, `email`, `address`
  - `latitude`, constrained to `-90` through `90`
  - `longitude`, constrained to `-180` through `180`
  - `business_hours`
- Latitude and longitude position the office map on the public Contact page

### `admin_users`

- Maps Supabase auth user IDs to admin access

### `listings`

- Core property records
- Uses `price_cents` integer
- Unique key on `(company_id, slug)`

### `listing_images`

- Image metadata per listing
- References storage object paths
- Up to 10 image metadata rows are accepted by the admin API per listing

### `inquiries`

- Lead submissions from public listing pages
- Stores `ip_hash` and `user_agent`

## Key Indexes

- `listings_company_status_published_idx`
- `listings_category_location_idx`
- `listing_images_listing_sort_idx`
- `inquiries_listing_created_idx`
- `inquiries_ip_created_idx`

## Storage Path Conventions

- Listing images:
  - `company/{company_id}/listing/{listing_id}/{uuid}.{ext}`
- Company logo:
  - `company/{company_id}/logo/{uuid}.{ext}`

Storage buckets restrict uploads to PNG, JPEG, and WebP. Listing images are
limited to 5 MB per file; company logos are limited to 2 MB.
