# E-1 UI Routes And User Flows

## Public Routes

- `/`
  - Responsive editorial-style landing page and property search
  - Listing filters for category, province, and city
  - Service highlights and published property sections
  - Three non-interactive placeholder cards when no published listings match
  - Filter-aware empty-state messaging
- Public navigation
  - Explicit Home, About, Contact, and Admin Login links
  - Company name also links to the home page
  - Company profile data is reused in the public footer
- `/listings/[slugOrId]`
  - Listing details
  - Inquiry form
- `/about`
  - Company profile, services, and approach sections
  - Uses the configured company name, logo, and about text
- `/contact`
  - Company email, phone, office address, and business hours
  - Embedded Google Map when valid coordinates are available
  - External directions link based on coordinates or address
  - Uses the configured Claveria coordinates while the location migration is
    pending on an existing database

## Admin Routes

- `/admin/login`
  - Email/password sign-in
  - Development builds display the configured test-account note
- `/admin`
  - Dashboard summary
- `/admin/company`
  - Company profile form
  - Logo upload to storage
  - Office address, latitude, longitude, and business-hours fields
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
