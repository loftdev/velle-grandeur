# F-1 Quality Checks And Known Limitations

## Quality Commands

- Lint:

```bash
pnpm lint
```

- Production build:

```bash
pnpm exec next build --webpack
```

- Whitespace and conflict-marker check:

```bash
git diff --check
```

## Latest UI Verification

The finalized public UI was verified in the Next.js development server on
June 13, 2026:

- Home, About, Contact, and Admin Login loaded successfully.
- No console errors or warnings were reported.
- No application requests failed.
- The Contact page map loaded at `8.611484, 124.894067`.
- Lint, production build, and `git diff --check` passed.

The redesigned admin UI was verified on June 14, 2026:

- The test account authenticated and opened the protected `/admin` dashboard.
- Its Supabase Auth UUID was confirmed in `admin_users`.
- Dashboard navigation and active-route styling rendered correctly on desktop.
- The mobile navbar overflow was removed with a responsive two-row layout.
- Admin forms and management rows use responsive grids and stacked actions.
- Login and company form development-indicator accessibility issues were fixed.
- Lint, production build, and `git diff --check` passed.

## Current Known Limitations

- Public inquiry API currently does not send email notifications.
- Public listing detail uses server redirect to canonical slug based on latest listing slug.
- Listing/logo upload and metadata save are separate actions in admin forms.
- The Next.js development-tools button is visible during `next dev`; it is not
  included in production builds.

## Recommended Follow-up Items

- Add integration tests for inquiry rate limiting.
- Add API contract tests for admin/public endpoints.
- Add an incident response and rollback checklist.
- Add monitoring docs for Supabase quota and auth errors.
