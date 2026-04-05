# D-2 Admin API Reference

Base path: `/api/admin`

All endpoints require:
- Authenticated user
- User exists in `admin_users`

## Company

### `GET /company`
- Returns editable company profile object.

### `PATCH /company`
- Updates name/contact/about/logo path.

## Listings

### `GET /listings`
Query params:
- `category`
- `status`
- `limit`

### `POST /listings`
Creates listing and optional image metadata rows.

### `GET /listings/:id`
Returns single listing with image metadata.

### `PATCH /listings/:id`
Updates listing fields and image metadata.

Notes:
- Slug regenerates if title changes.
- `published_at` is managed based on status changes.

### `DELETE /listings/:id`
Deletes listing and linked `listing_images`.

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
