# Sabay Publish MVP

Next.js + Convex + Clerk prototype for bilingual English/Filipino publishing.

## Setup

1. Install dependencies:
   `pnpm install`
2. Copy the environment template:
   `cp .env.example .env.local`
3. Fill the required Next.js/Vercel environment variables in `.env.local`.
4. Sync the Convex-side backend variables from `.env.local` into the configured
   Convex dev deployment:
   `pnpm convex:sync-env`
5. Start the app:
   `pnpm convex:dev`
   `pnpm dev`

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:e2e`

## Deployment

- Hosting target: Vercel project `paraluman-web`
- GitHub repo connection: `roivroberto/paraluman`
- Vercel root directory: `web`
- Production branch: `main`
- Custom domain: `https://paraluman.rvco.dev`
- Convex project: `paraluman`
- Convex deployments: dev `grateful-tortoise-98`, prod `reliable-reindeer-345`
- Clerk webhook endpoint: `https://paraluman.rvco.dev/api/webhooks/clerk`

### Current domain wiring

- Vercel project domain: `paraluman.rvco.dev`
- Cloudflare DNS record: `A paraluman.rvco.dev -> 76.76.21.21`

### Production config notes

- Set `NEXT_PUBLIC_SITE_URL=https://paraluman.rvco.dev` in Vercel.
- Set `NEXT_PUBLIC_CONVEX_URL=https://reliable-reindeer-345.convex.cloud` in Vercel.
- Keep the matching Clerk, Convex, and Google Cloud runtime secrets configured in the hosted environments.
- Use a single Convex project for this app, with separate dev and prod deployments.
- Vercel production should use `CONVEX_DEPLOYMENT=prod:reliable-reindeer-345` and `NEXT_PUBLIC_CONVEX_URL=https://reliable-reindeer-345.convex.cloud`.
- Convex prod should use the hosted Google credential value in `GOOGLE_SERVICE_ACCOUNT_JSON` instead of a local file path.
- Variables read from `web/convex/*`, including `CLERK_JWT_ISSUER_DOMAIN`, must be set in Convex itself with `pnpm exec convex env set --prod ...` or in the Convex dashboard.
- Setting `NEXT_PUBLIC_SITE_URL` only in Convex does not configure Next.js metadata. That value must exist in Vercel because the Next.js app builds and serves the canonical URLs.
- Vercel hosts the Next.js app in `web/`. Convex remains a separate hosted backend and needs its own environment values.

## Environment

Required variables are documented in [`.env.example`](./.env.example).

For hosted Convex deployments, set `GOOGLE_SERVICE_ACCOUNT_JSON` to the full
service-account JSON contents. The runtime also accepts
`GOOGLE_APPLICATION_CREDENTIALS_JSON` as a backward-compatible alias. Local
development can continue using `GOOGLE_APPLICATION_CREDENTIALS` with a
filesystem path.

`.env.local` is not enough for variables consumed by files under `convex/`.
After changing `CLERK_JWT_ISSUER_DOMAIN`, demo role emails, or hosted Google
Cloud values locally, run `pnpm convex:sync-env` again for the dev deployment.

Clerk production should point its webhook to
`https://paraluman.rvco.dev/api/webhooks/clerk` and use the matching
`CLERK_WEBHOOK_SECRET` configured in Vercel production.

Optional:

- `ALLOWED_IMAGE_HOSTS` for remote article image domains
