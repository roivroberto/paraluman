import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup, type Page } from "@playwright/test";
import {
  authStateDir,
  editorEmail,
  editorStorageStatePath,
  writerEmail,
  writerStorageStatePath,
} from "./support/env";

setup.describe.configure({ mode: "serial" });
setup.setTimeout(60_000);

function getClerkErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return null;
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function withClerkRetry<T>(
  operationName: string,
  operation: () => Promise<T>,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = getClerkErrorStatus(error);
      const retryable = status === 429 || (status !== null && status >= 500);

      if (!retryable || attempt === 3) {
        throw error;
      }

      console.warn(
        `Retrying Clerk ${operationName} after transient ${status} response (attempt ${attempt + 1}/3).`,
      );
      await sleep(attempt * 1_000);
    }
  }

  throw lastError;
}

async function ensureClerkUser(emailAddress: string) {
  const client = await clerkClient();
  const existing = await withClerkRetry("user lookup", () =>
    client.users.getUserList({
      emailAddress: [emailAddress],
      limit: 1,
    }),
  );

  if (existing.data[0]) {
    return existing.data[0];
  }

  return await withClerkRetry("user creation", () =>
    client.users.createUser({
      emailAddress: [emailAddress],
      password: `Paraluman-${randomBytes(12).toString("hex")}Aa1!`,
    }),
  );
}

async function authenticateAndPersist(
  page: Page,
  emailAddress: string,
  storageStatePath: string,
) {
  const client = await clerkClient();
  const user = await ensureClerkUser(emailAddress);
  const signInToken = await withClerkRetry("sign-in token creation", () =>
    client.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 300,
    }),
  );

  await page.goto("/login");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "ticket",
      ticket: signInToken.token,
    },
  });
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await page.waitForLoadState("networkidle");
  await page.context().storageState({ path: storageStatePath });
}

setup("initialize Clerk testing token", async () => {
  fs.mkdirSync(authStateDir, { recursive: true });
  await clerkSetup();
});

setup("capture writer auth state", async ({ page }) => {
  await authenticateAndPersist(page, writerEmail, writerStorageStatePath);
});

setup("capture editor auth state", async ({ page }) => {
  await authenticateAndPersist(page, editorEmail, editorStorageStatePath);
});
