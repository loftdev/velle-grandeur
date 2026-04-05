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

## Current Known Limitations

- Public inquiry API currently does not send email notifications.
- Public listing detail uses server redirect to canonical slug based on latest listing slug.
- Listing/logo upload and metadata save are separate actions in admin forms.

## Recommended Follow-up Items

- Add integration tests for inquiry rate limiting.
- Add API contract tests for admin/public endpoints.
- Add deployment runbook and incident checklist docs.
- Add monitoring docs for Supabase quota and auth errors.
