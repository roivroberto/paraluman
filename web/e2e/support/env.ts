import path from "node:path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local" });
loadDotenv({ path: ".env", override: false });

process.env.CLERK_PUBLISHABLE_KEY ??=
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function firstCsvValue(value: string | undefined, fallback: string) {
  return value?.split(",").map((entry) => entry.trim()).find(Boolean) ?? fallback;
}

function lastCsvValue(value: string | undefined, fallback: string) {
  return value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .at(-1) ?? fallback;
}

export const authStateDir = path.join(process.cwd(), "e2e/.auth");
export const writerStorageStatePath = path.join(authStateDir, "writer.json");
export const editorStorageStatePath = path.join(authStateDir, "editor.json");

export const writerEmail =
  process.env.E2E_WRITER_EMAIL ??
  firstCsvValue(process.env.DEMO_WRITER_EMAILS, "writer@paraluman.news");

export const editorEmail =
  process.env.E2E_EDITOR_EMAIL ??
  lastCsvValue(process.env.DEMO_EDITOR_EMAILS, "editor@paraluman.news");

export const mockTranslationPrefix =
  process.env.E2E_TRANSLATION_PREFIX ?? "Filipino draft";
