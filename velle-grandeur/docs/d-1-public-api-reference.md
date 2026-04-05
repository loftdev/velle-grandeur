# D-1 Public API Reference

Base path: `/api/public`

## Common Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "..."
  }
}
```

## `GET /company`

Returns company profile for public website rendering.

## `GET /listings`

### Query Parameters

- `category` (enum)
- `province` (string)
- `city` (string)
- `cursor` (string)
- `limit` (1-50, default 12)

### Behavior

- Returns only published listings.
- Includes listing images with public URLs.
- Supports cursor pagination with `next_cursor`.

## `GET /listings/:slugOrId`

- Accepts UUID or `slug-uuid` format.
- Returns single published listing.
- Redirects with `301` to canonical API slug when slug is stale.

## `POST /inquiries`

### Body

- `listing_id` (uuid, required)
- `name` (required)
- `email` (optional)
- `phone` (optional)
- `message` (required)
- `website` (honeypot, should be empty)

### Response

`201` with:

```json
{
  "id": "<inquiry-id>",
  "status": "new"
}
```

### Rate Limit Rules

- 5 per 10 min per IP hash
- 2 per 10 min per listing + IP hash
