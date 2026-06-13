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

- Shared admin shell
  - Uses the public site's typography, color palette, cards, and pill buttons
  - Sticky branded navigation with active-route indicators
  - Navigation wraps into a mobile-safe two-row layout
  - Forms, management rows, and actions collapse responsively on small screens
- `/admin/login`
  - Email/password sign-in
  - Development builds display the configured test-account note
  - Inputs include browser autocomplete and accessible field attributes
- `/admin`
  - Responsive dashboard summary cards for published listings and new inquiries
  - Quick links to listings, inquiries, and company settings
- `/admin/company`
  - Grouped company identity, location, and branding sections
  - Logo upload to storage
  - Office address, latitude, longitude, and business-hours fields
- `/admin/listings`
  - Responsive create-listing form
  - Category and status filters
  - Mobile-safe listing management rows
- `/admin/listings/[id]`
  - Edit listing details
  - Upload/remove listing images
- `/admin/inquiries`
  - Responsive inquiry list and empty state
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

### Admin Authorization Flow

1. User signs in through Supabase Auth.
2. The protected admin layout verifies the authenticated session.
3. The user's Auth UUID must have a matching `admin_users.user_id` row.
4. Authorized users enter `/admin`; other users return to `/admin/login`.
