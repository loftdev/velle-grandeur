# D-2 Admin API Reference

Base path: `/api/admin`

All endpoints require:

- Authenticated user
- User exists in `admin_users`

## Company

### `GET /company`

- Returns editable company profile object.

### `PATCH /company`

- Updates name, contact details, about text, logo path, office coordinates, and
  business hours.
- Latitude must be between `-90` and `90`.
- Longitude must be between `-180` and `180`.

## Listings

### `GET /listings`

Query params:

- `category`
- `status`
- `limit`

### `POST /listings`

Creates listing and optional image metadata rows.

Returns the new `id` and `company_id`. The admin UI creates the database row as
a draft, uploads selected images, attaches their metadata, and then applies the
requested final status.

### `GET /listings/:id`

Returns single listing with image metadata.

### `PATCH /listings/:id`

Updates listing fields and image metadata.

Notes:

- Slug regenerates if title changes.
- `published_at` is managed based on status changes.
- A listing accepts up to 10 image metadata rows.

### `DELETE /listings/:id`

Deletes the listing, cascades linked `listing_images`, and removes the
corresponding Storage objects after the database deletion succeeds.

Returns `409 CONFLICT` if listing is referenced by inquiries.

## Inquiries

### `GET /inquiries`

Query params:

- `status`
- `limit`

### `GET /inquiries/:id`

Returns full inquiry details.

### `PATCH /inquiries/:id`

Updates inquiry status (`new | contacted | closed`).
