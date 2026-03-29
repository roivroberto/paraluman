# Sabay Publish MVP

Next.js + Convex + Clerk prototype for bilingual English/Filipino publishing.

## Setup

1. Install dependencies:
   `pnpm install`
2. Copy the environment template:
   `cp .env.example .env.local`
3. Fill the required environment variables for Clerk, Convex, and Google Cloud Translation.
4. Start the app:
   `pnpm convex:dev`
   `pnpm dev`

## Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:e2e`

## Environment

Required variables are documented in [`.env.example`](/home/victor/projects/paraluman/web/.env.example).

Optional:

- `ALLOWED_IMAGE_HOSTS` for remote article image domains
