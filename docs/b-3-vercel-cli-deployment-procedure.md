# B-3 Vercel CLI Deployment Procedure

This project is deployed to Vercel using the Vercel CLI rather than automatic
GitHub repository integration. A deployment packages the files currently
checked out in the local repository.

## Prerequisites

Install the project dependencies and verify the production build:

```bash
pnpm install
pnpm build
```

Do not deploy until the build succeeds.

Confirm that the Vercel CLI is installed:

```bash
vercel --version
```

If Vercel reports that the CLI is outdated, update it:

```bash
npm install --global vercel@latest
```

Restart the terminal, then run `vercel --version` again. This project has been
successfully deployed with Vercel CLI `54.13.0`. Use the latest compatible
version rather than relying on that version permanently.

## Link The Local Repository

Check whether the repository is already linked:

```bash
ls -la .vercel
cat .vercel/project.json
vercel project inspect
```

If `.vercel` does not exist, run:

```bash
vercel link
```

Use these selections:

```text
Set up current directory: yes
Scope: loftdev's projects
Link to existing project: no
Project name: velle-grandeur
Code directory: ./
Modify detected Next.js settings: no
```

Vercel creates `.vercel/project.json` after linking. Confirm the linked project:

```bash
vercel project inspect
```

Expected project:

```text
loftdevs-projects/velle-grandeur
```

The `.vercel` directory contains local project linkage metadata and is ignored
by Git.

## Configure Environment Variables

Local development uses `.env.local`. For example:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Production must use the deployed application URL:

```env
NEXT_PUBLIC_SITE_URL=https://velle-grandeur.vercel.app
```

Add it to the Production environment:

```bash
vercel env add NEXT_PUBLIC_SITE_URL production
```

Enter:

```text
https://velle-grandeur.vercel.app
```

Repeat `vercel env add` for every required variable listed in `.env.example`.
Keep server secrets, including `SUPABASE_SERVICE_ROLE_KEY`, out of variables
whose names begin with `NEXT_PUBLIC_`.

Review the configured variables:

```bash
vercel env ls
```

Pull the Production configuration into a temporary local file when it needs to
be inspected:

```bash
vercel env pull .env.vercel.production.local --environment=production --yes
```

Do not commit pulled or local environment files. This repository ignores
`.env*` and `.vercel`.

Vercel environment variables belong to the currently linked project. They are
not global variables for every project in the Vercel account.

## First Deployment

Run the local checks, then create a preview deployment:

```bash
pnpm install
pnpm build
vercel deploy
```

After validating the preview, promote the current local code to Production:

```bash
vercel deploy --prod
```

The production application URL is:

```text
https://velle-grandeur.vercel.app
```

## Subsequent Deployments

Confirm the active branch and working tree:

```bash
git branch --show-current
git status
```

For a production release, `git status` should report:

```text
nothing to commit, working tree clean
```

Install dependencies and build:

```bash
pnpm install
pnpm build
```

Create and validate a preview:

```bash
vercel deploy
```

Deploy the same checked-out code to Production:

```bash
vercel deploy --prod
```

`vercel --prod` is an equivalent shorthand.

## Branch And Local File Behavior

Vercel CLI deploys the current local project files. The active branch and any
uncommitted changes therefore affect the deployment.

For example:

```bash
git checkout feat/home-listing-empty-state
pnpm build
vercel deploy --prod
```

This deploys the local contents of `feat/home-listing-empty-state`, including
any uncommitted changes. Production deployments should normally be made from
the intended release branch with a clean working tree.

## Production Verification

After deployment:

1. Open `https://velle-grandeur.vercel.app`.
2. Verify Home, About, Contact, and Admin Login.
3. Confirm the Contact map and company details load.
4. Confirm published listings load, or the empty listing state appears.
5. Check the Vercel deployment logs for runtime errors.
6. Confirm admin authentication and protected-route behavior.
