# Documentation Index

This folder uses an ordered naming convention so documentation stays easy to grow.

## Naming Convention

Use this format for every doc:

- `<category-letter>-<sequence>-<topic>.md`

Examples:

- `a-1-project-overview.md`
- `a-2-architecture-and-repository-map.md`
- `d-1-public-api-reference.md`

## Category Map

- `a` = Product and architecture
- `b` = Setup and operations
- `c` = Data model and security
- `d` = API references
- `e` = UI pages and user flows
- `f` = QA, quality checks, and known limitations

## Current Document Flow

1. `a-1-project-overview.md`
2. `a-2-architecture-and-repository-map.md`
3. `b-1-local-setup-and-environment.md`
4. `b-2-supabase-setup-and-deployment-notes.md`
5. `c-1-database-schema-and-storage.md`
6. `c-2-auth-rls-and-security.md`
7. `d-1-public-api-reference.md`
8. `d-2-admin-api-reference.md`
9. `e-1-ui-routes-and-user-flows.md`
10. `f-1-quality-checks-and-known-limitations.md`

## How To Add New Docs

1. Choose the category letter by topic.
2. Increment only within that category.
   - Example: next API document after `d-2` should be `d-3-...`.
3. Keep file names lowercase kebab-case.
4. Update this index list when adding files.
