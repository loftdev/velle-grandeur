# A-4 Multi-Tenant Roadmap

## Status Today

Current scope is intentionally single-client (VelleGrandeur only).

This remains a limitation of the current project version.

## Roadmap Goal

Evolve the current architecture so the same platform can serve multiple real estate companies (tenants) while keeping tenant data isolated.

## Target Multi-Tenant Model

- Tenant entity: `company`
- Every tenant-owned table row carries `company_id`
- APIs and admin UI always resolve tenant context first
- RLS policies enforce tenant isolation

## Guiding Principles

- Keep existing single-tenant behavior stable while introducing tenant support
- Prefer additive migration steps
- Avoid breaking public URLs where possible
- Make tenant context explicit in all admin operations

## Phased Plan

### Phase 1: Data Model Hardening

- Ensure all tenant-owned tables have non-null `company_id`
- Add missing tenant indexes (`company_id`, status/date composites)
- Audit constraints and foreign keys for cross-tenant leakage risks

### Phase 2: Auth and Authorization

- Add mapping table for user-to-company memberships
- Add role model per tenant (owner/admin/editor)
- Update admin guard logic to validate membership and role by tenant

### Phase 3: API Tenant Context

- Make tenant context explicit in admin APIs
- Public APIs resolve tenant by hostname, path segment, or configured tenant slug
- Reject requests with ambiguous or missing tenant context

### Phase 4: Tenant-Aware UI and Routing

- Add tenant selection for multi-company admin users
- Render branding/theme/content based on active tenant
- Add tenant-safe navigation and breadcrumbs in admin area

### Phase 5: Operations and Platform Capabilities

- Tenant onboarding flow (create company + initial admin)
- Observability by tenant (logs, errors, usage)
- Optional billing and plan limits

## Migration Approach from Current Project

1. Keep existing `company` row as the first tenant.
2. Introduce tenant membership model without removing current admin behavior.
3. Gradually switch guard and API logic to tenant-aware checks.
4. Add new tenants only after tenant-aware RLS and API checks are complete.

## Out of Scope for Current Version

- Tenant self-service signup
- Subscription billing
- Domain automation per tenant
- Full platform analytics dashboard

## Exit Criteria for Multi-Tenant Readiness

- No cross-tenant reads/writes possible through API or SQL policies
- Admin users can only manage companies they belong to
- Public site can correctly resolve tenant context for each request
- Existing single-tenant production behavior remains stable during migration
