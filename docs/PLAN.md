# Sabay Publish MVP Implementation Plan

## Summary
- Build one deployable Next.js App Router app in `web/`, keeping repo-root `docs/` and `assets/` as source material.
- Chosen defaults: single app, plain multiline article body, no public homepage/listing page, translation failures return the article to `DRAFT`.
- Official setup references for this plan: [Next.js create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app), [Convex Next.js Quickstart](https://docs.convex.dev/quickstart/nextjs), [Convex + Clerk](https://docs.convex.dev/auth/clerk), [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart), [shadcn CLI](https://ui.shadcn.com/docs/cli), [Cloud Translation setup](https://docs.cloud.google.com/translate/docs/setup).

## Bootstrap and app shell
- Initialize `web/` with `pnpm create next-app@latest web --ts --tailwind --eslint --app --use-pnpm --yes --empty`.
- In `web/`, add Convex with `pnpm add convex`, run `npx convex dev`, and keep Convex as the only backend/database.
- Add Clerk with `pnpm add @clerk/nextjs`, configure `proxy.ts`, and use a custom `/login` route that renders Clerk’s `SignIn` component inside a Paraluman-branded shell.
- Configure Clerk + Convex per the official integration: `convex/auth.config.ts`, `ConvexProviderWithClerk`, `CLERK_JWT_ISSUER_DOMAIN`, and a Clerk webhook that upserts users into Convex.
- Initialize shadcn with `pnpm dlx shadcn@latest init --defaults`; before each component batch, use `pnpm dlx shadcn@latest docs ...`, then install via `pnpm dlx shadcn@latest add ...` instead of hand-copying UI code.
- Add the first shadcn batch via CLI: `button card badge input textarea select table dialog alert tabs separator scroll-area skeleton dropdown-menu sheet`.
- Standardize env vars early: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `GOOGLE_APPLICATION_CREDENTIALS`, `GCP_TRANSLATION_LOCATION`, `GCP_TRANSLATION_GLOSSARY_NAME`.
- Use multiple App Router root layouts so public article routes can emit the correct `html lang`; editorial/auth pages use one root layout, localized public pages use another.
- Copy the supplied logo into `web/public/branding/`; use `next/font` with `Cormorant Garamond` for headlines and `IBM Plex Sans` for UI; map Paraluman purple `#73068e` into shadcn/Tailwind theme tokens in global CSS.

## Implementation changes
- Convex schema follows the PRD tables exactly: `users`, `articles`, `article_localizations`, `glossary_terms`, `audit_logs`, `publication_records`, with indexes for Clerk ID, article slug, author, status, article+locale, and publication slug.
- Treat Convex `users` as the app authority for `writer | editor`; pre-create demo accounts in Clerk, disable public sign-up, and seed roles in Convex for the demo emails.
- Protect `/dashboard`, `/articles/*`, and `/editor/*` in `proxy.ts`; re-check auth, role, and status transitions inside every Convex mutation/action.
- Editorial routes are `/login`, `/dashboard`, `/articles/new`, `/articles/[id]`, `/editor/queue`, `/editor/review/[articleId]`, `/editor/glossary`, plus `/` redirecting to `/dashboard` when authenticated and `/login` otherwise.
- Public routes use `/(public)/[locale]/articles/[slug]` with `locale` restricted to `en | fil`; render through one shared server-side loader so both locales share layout but differ in localized content and metadata.
- Use client-heavy Convex React screens for editorial UI and server-rendered public article pages for SEO, canonicals, alternates, and localized metadata.
- Article form captures the PRD fields, stores body as plain multiline text, auto-generates slug client-side, and validates uniqueness server-side on save/submit.
- `submitForTranslation` validates required fields, sets `TRANSLATING`, writes `translation_requested`, and invokes a Convex action that calls Google Cloud Translation Advanced for `headline`, `deck`, and `body` only.
- Seed 10+ glossary terms into Convex for the read-only glossary page, and create one Google Cloud glossary resource from the same dataset for translation requests; do not build glossary editing in MVP.
- On translation success, upsert the Filipino localization, run deterministic QA checks, store warnings, clear `translationError`, write audit entries, and move to `NEEDS_REVIEW`.
- On translation failure, preserve the English draft, store the error, write failure context to the audit trail, and return the article to `DRAFT` with a visible retry path from the writer surfaces.
- Review UI is a two-column screen with English read-only on the left, Filipino editable on the right, a QA warnings panel, a sticky publish bar, `Re-translate`, and a required-note reject dialog.
- `Re-translate` is allowed only from `NEEDS_REVIEW`; `Reject & Return to Writer` sets `DRAFT`, saves `latestEditorNote`, and writes `article_rejected`.
- `approveAndPublish` is a single Convex mutation that validates editor role and localization presence, writes `article_approved`, creates `publication_records`, sets `PUBLISHED`, writes `article_published`, and makes both `/en/articles/[slug]` and `/fil/articles/[slug]` resolvable from the same publish timestamp.
- Public article pages render the PRD field mix, language switcher, hero image metadata, and Filipino AI disclosure; `generateMetadata` emits canonical URLs, alternates, and localized titles/descriptions.

## Test plan
- Initialize E2E coverage in `web/` with `pnpm create playwright@latest`.
- Make the Playwright auth setup self-sufficient by provisioning any missing Clerk demo users for the configured writer/editor emails, then persist auth state with Clerk sign-in tickets.
- Verify auth and authorization: unauthenticated users redirect to `/login`, writers cannot access `/editor/queue`, editors can.
- Verify draft lifecycle: create draft, required-field validation, slug collision behavior, translation submit, and translation failure recovery back to `DRAFT`.
- Verify review lifecycle: side-by-side render, inline Filipino edits setting `editorEdited`, QA warnings visibility, `Re-translate` refresh, reject note requirement, and writer visibility of the latest editor note.
- Verify publish lifecycle: `Approve & Publish` creates both public routes together, writes `publication_records`, writes `article_approved` and `article_published`, and blocks re-translation afterward.
- Verify public experience: English and Filipino pages render the right localized/shared fields, switch languages correctly, show the Filipino disclosure, and emit correct canonical, `hreflang`, and `lang` values.

## Assumptions and defaults
- Package manager: `pnpm`.
- App location: `web/`, because the repo root already contains non-app source material and this avoids manual merging into generated scaffolding.
- Content model: plain textarea body with paragraph breaks only; no rich text toolbar or block editor in MVP.
- No public homepage/listing page in v1; the demo centers on the editorial workflow and the two published article routes.
- Demo accounts are pre-created in Clerk before manual UI demos, while Playwright can provision missing test users automatically.
- Cloud Translation Advanced is enabled before implementation begins, and the glossary resource is provisioned once during setup.
