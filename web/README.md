# Sabay Publish MVP

Paraluman's bilingual publishing prototype built with Next.js, Convex, Clerk, and Google Cloud Translation Advanced.

## Local setup

1. Install dependencies:
   `pnpm install`

2. Copy the environment template:
   `cp .env.example .env.local`

3. Fill `.env.local` with your Clerk, Convex, and Google values.
   If you need remote hero images, also set `ALLOWED_IMAGE_HOSTS` to a
   comma-separated hostname allowlist. Leave it blank to permit only local/public
   assets.

4. Set the same auth/runtime values on the local Convex deployment:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://<your-clerk-instance>.clerk.accounts.dev"
npx convex env set DEMO_WRITER_EMAILS "writer.paraluman@tmpx.simplelogin.com"
npx convex env set DEMO_EDITOR_EMAILS "editor.paraluman@tmpx.simplelogin.com,editor2.paraluman@tmpx.simplelogin.com"
npx convex env set GOOGLE_APPLICATION_CREDENTIALS "/absolute/path/to/service-account.json"
```

`.env.local` is read by Next.js. Convex functions do not read it directly at runtime. For `pnpm convex:dev --local`, Convex uses the env stored in the local Convex deployment, which you manage with `npx convex env set ...`. In this repo, local auth did not work until the Convex env was set explicitly.

5. Start the app:
   `pnpm convex:dev --local`
   `pnpm dev`

6. Verify:
   `pnpm typecheck`
   `pnpm test:e2e`

`pnpm test:e2e` now provisions any missing Clerk users for the configured
writer/editor demo emails before capturing auth state. Manual live walkthroughs
still need demo accounts you can access outside the test runner.

## Required environment variables

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `GOOGLE_CLOUD_PROJECT`
- `GCP_TRANSLATION_LOCATION`
- `GCP_TRANSLATION_GLOSSARY_NAME`

## Optional environment variables

- `ALLOWED_IMAGE_HOSTS`

## Google Cloud translation setup

The app can translate without a glossary, but glossary-backed translation needs one extra Google Cloud setup pass.

1. Create a service account key and point `GOOGLE_APPLICATION_CREDENTIALS` at the downloaded JSON file.
2. Grant the service account `Cloud Translation API Editor` so Convex can call Translation Advanced.
3. Create a Cloud Storage bucket for the glossary CSV. If the service account should create buckets itself, it also needs a role that includes `storage.buckets.create` such as `Storage Admin`. If you create the bucket with a human owner account instead, the service account only needs object read access on that bucket.
4. Upload a two-column CSV with no header row for the `en -> fil` glossary.
5. Create the Cloud Translation glossary resource in `us-central1`.
6. Set `GCP_TRANSLATION_GLOSSARY_NAME` only after that glossary resource exists. Leave it blank to run translation without glossary enforcement.

### Current project values

The current local Google Cloud setup for this repo uses:

- `GOOGLE_CLOUD_PROJECT=paraluman`
- `GCP_TRANSLATION_LOCATION=us-central1`
- glossary bucket: `gs://paraluman-translation-glossary-7c16816a1828`
- glossary resource: `projects/135390599943/locations/us-central1/glossaries/paraluman-en-fil`
- `GCP_TRANSLATION_GLOSSARY_NAME=paraluman-en-fil`

If you are using the existing Paraluman Google Cloud project, reuse those values.

### Local checklist

1. Save the service-account JSON somewhere outside the repo.
2. Put the JSON path in `.env.local` as `GOOGLE_APPLICATION_CREDENTIALS`.
3. Set the same `GOOGLE_APPLICATION_CREDENTIALS` value in the local Convex deployment with `npx convex env set ...`.
4. Export the same `GOOGLE_APPLICATION_CREDENTIALS` value in the shell that starts Convex.
5. Set the Google runtime values in Convex with `npx convex env set ...`.
6. Restart `pnpm convex:dev --local` after changing Google credentials or Convex env values.

For local development, export `GOOGLE_APPLICATION_CREDENTIALS` in the same shell that starts Convex:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
pnpm convex:dev --local
```

Set the Google runtime values in local Convex:

```bash
npx convex env set GOOGLE_APPLICATION_CREDENTIALS "/absolute/path/to/service-account.json"
npx convex env set GOOGLE_CLOUD_PROJECT "paraluman"
npx convex env set GCP_TRANSLATION_LOCATION "us-central1"
npx convex env set GCP_TRANSLATION_GLOSSARY_NAME "paraluman-en-fil"
```

The app also needs matching values in `.env.local`:

```env
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
GOOGLE_CLOUD_PROJECT=paraluman
GCP_TRANSLATION_LOCATION=us-central1
GCP_TRANSLATION_GLOSSARY_NAME=paraluman-en-fil
```

### Verifying the setup

1. Start Convex from a shell where `GOOGLE_APPLICATION_CREDENTIALS` is exported, and confirm the same path is also present in `npx convex env list`.
2. Start Next.js with `pnpm dev`.
3. Sign in and submit an article for translation.
4. If glossary setup is correct, translations should apply the seeded newsroom terms such as `Commission on Elections -> Komisyon sa Halalan (COMELEC)`.
5. Smoke-check the main editorial routes. `/editor/review/new` should render the app's 404 state, not a Convex validation error.
6. In development, app routes should not emit uncaught runtime errors. Expect Clerk's development-key warning on auth pages. If you intentionally visit a missing route, Chromium will also surface the expected 404 network error for that document request.

The repo includes a glossary exporter at `convex/glossary_payload.ts`. It now emits a Google-compatible CSV payload with no header row.

## Demo notes

- `DEMO_WRITER_EMAILS` and `DEMO_EDITOR_EMAILS` do not create Clerk users during normal app startup. They control role assignment inside Convex when an authenticated Clerk user syncs into the local database. The Playwright setup will create missing Clerk users for those emails on demand when you run `pnpm test:e2e`.
- Keep demo account usernames and passwords out of the repo. Share them through your normal secret manager or another out-of-band channel.
- If you change the demo emails in `.env.local`, update the same values in local Convex runtime env with `npx convex env set ...` or existing users may sync with stale roles.
- The UI seeds the read-only glossary into Convex the first time an authenticated user syncs successfully.
