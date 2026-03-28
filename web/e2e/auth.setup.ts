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

async function ensureClerkUser(emailAddress: string) {
  const client = await clerkClient();
  const existing = await client.users.getUserList({
    emailAddress: [emailAddress],
    limit: 1,
  });

  if (existing.data[0]) {
    return existing.data[0];
  }

  return await client.users.createUser({
    emailAddress: [emailAddress],
    password: `Paraluman-${randomBytes(12).toString("hex")}Aa1!`,
  });
}

async function authenticateAndPersist(
  page: Page,
  emailAddress: string,
  storageStatePath: string,
) {
  const client = await clerkClient();
  const user = await ensureClerkUser(emailAddress);
  const signInToken = await client.signInTokens.createSignInToken({
    userId: user.id,
    expiresInSeconds: 300,
  });

  await page.goto("/login");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "ticket",
      ticket: signInToken.token,
    },
  });
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
