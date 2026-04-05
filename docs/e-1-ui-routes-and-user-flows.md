# E-1 UI Routes And User Flows

## Public Routes

- `/`
  - Landing page
  - Listing filters
  - Category sections
- `/listings/[slugOrId]`
  - Listing details
  - Inquiry form
- `/about`
- `/contact`

## Admin Routes

- `/admin/login`
  - Email/password sign-in
- `/admin`
  - Dashboard summary
- `/admin/company`
  - Company profile form
  - Logo upload to storage
- `/admin/listings`
  - Create listing
  - Filter listing list
- `/admin/listings/[id]`
  - Edit listing details
  - Upload/remove listing images
- `/admin/inquiries`
  - Inquiry list
- `/admin/inquiries/[id]`
  - Inquiry details
  - Status update

## Primary User Flows

### Public Inquiry Flow

1. Visitor opens listing detail.
2. Visitor submits inquiry form.
3. API validates + rate-limits.
4. Inquiry saved in DB with `new` status.

### Admin Listing Flow

1. Admin logs in.
2. Admin creates listing in draft/published/sold.
3. Admin uploads listing images.
4. Admin edits listing and saves updates.
