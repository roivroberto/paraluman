import "server-only";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseEmailList(value: string | undefined, fallback: string[]) {
  const raw = value?.trim();

  if (!raw) {
    return fallback;
  }

  return raw
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
}

export function getProvisionedRole(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const editorEmails = parseEmailList(process.env.DEMO_EDITOR_EMAILS, [
    "editor@paraluman.news",
  ]);

  if (editorEmails.includes(normalizedEmail)) {
    return "editor" as const;
  }

  const writerEmails = parseEmailList(process.env.DEMO_WRITER_EMAILS, [
    "writer@paraluman.news",
  ]);

  if (writerEmails.includes(normalizedEmail)) {
    return "writer" as const;
  }

  return null;
}
