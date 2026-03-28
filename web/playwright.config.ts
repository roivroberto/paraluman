import { config as loadDotenv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadDotenv({ path: ".env.local" });
loadDotenv({ path: ".env", override: false });

process.env.CLERK_PUBLISHABLE_KEY ??=
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  webServer: {
    command:
      'PARALUMAN_E2E_MOCK_TRANSLATION=1 pnpm convex:dev --local --typecheck disable --tail-logs disable --run-sh "pnpm exec next dev --hostname localhost --port 3000"',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
