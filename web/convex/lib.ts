import { ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export function normalizeEmail(email: string) {
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

export function resolveRoleForEmail(email: string) {
  const normalized = normalizeEmail(email);
  const editorEmails = parseEmailList(process.env.DEMO_EDITOR_EMAILS, [
    "editor@paraluman.news",
  ]);

  if (editorEmails.includes(normalized)) {
    return "editor" as const;
  }

  const writerEmails = parseEmailList(process.env.DEMO_WRITER_EMAILS, [
    "writer@paraluman.news",
  ]);

  if (writerEmails.includes(normalized)) {
    return "writer" as const;
  }

  return null;
}

export function assertProvisionedRole(
  role: "writer" | "editor" | null,
  email: string,
) {
  if (role) {
    return role;
  }

  throw new ConvexError(
    `The account ${normalizeEmail(email)} is not provisioned for Paraluman access.`,
  );
}

export async function getUserByClerkId(
  ctx: QueryCtx | MutationCtx,
  clerkId: string,
) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (query) => query.eq("clerkId", clerkId))
    .unique();
}

export async function getUserByEmail(
  ctx: QueryCtx | MutationCtx,
  email: string,
) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (query) => query.eq("email", normalizeEmail(email)))
    .unique();
}

export async function requireViewer(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity?.subject) {
    throw new ConvexError("Authentication required.");
  }

  const viewer = await getUserByClerkId(ctx, identity.subject);

  if (!viewer) {
    throw new ConvexError(
      "User profile not found in Convex yet. Complete Clerk sync first.",
    );
  }

  return viewer;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  role: "writer" | "editor",
) {
  const viewer = await requireViewer(ctx);

  if (viewer.role !== role) {
    throw new ConvexError(`This action requires ${role} access.`);
  }

  return viewer;
}

export function assertArticleEditable(
  article: Doc<"articles">,
  viewer: Doc<"users">,
) {
  if (article.status !== "DRAFT") {
    throw new ConvexError("Articles can only be edited while in draft state.");
  }

  if (viewer.role === "editor") {
    return;
  }

  if (article.authorId !== viewer._id) {
    throw new ConvexError("Writers can only edit their own articles.");
  }
}

export function assertTranslationReady(article: Doc<"articles">) {
  const requiredFields = [
    article.headline,
    article.deck,
    article.body,
    article.byline,
    article.category,
    article.heroImageUrl,
    article.heroImageCaption,
    article.heroImageAlt,
    article.slug,
  ];

  if (requiredFields.some((field) => !field.trim())) {
    throw new ConvexError("Complete all required article fields first.");
  }
}

export function assertLocalizationReady(localization: {
  translatedHeadline: string;
  translatedDeck: string;
  translatedBody: string;
}) {
  const requiredFields = [
    localization.translatedHeadline,
    localization.translatedDeck,
    localization.translatedBody,
  ];

  if (requiredFields.some((field) => !field.trim())) {
    throw new ConvexError(
      "Filipino headline, deck, and body are required before publish.",
    );
  }
}

export async function ensureUniqueSlug(
  ctx: QueryCtx | MutationCtx,
  desiredSlug: string,
  excludeId?: Id<"articles">,
) {
  let candidate = desiredSlug;
  let suffix = 2;

  while (candidate) {
    const existing = await ctx.db
      .query("articles")
      .withIndex("by_slug", (query) => query.eq("slug", candidate))
      .unique();

    if (!existing || existing._id === excludeId) {
      return candidate;
    }

    candidate = `${desiredSlug}-${suffix}`;
    suffix += 1;
  }

  throw new ConvexError("A valid slug is required.");
}

export async function insertAuditLog(
  ctx: MutationCtx,
  entry: {
    articleId: Id<"articles">;
    actorId: Id<"users"> | "system";
    action:
      | "article_created"
      | "article_updated"
      | "translation_requested"
      | "translation_completed"
      | "translation_failed"
      | "qa_checks_completed"
      | "editor_edit"
      | "retranslation_requested"
      | "article_rejected"
      | "article_approved"
      | "article_published";
    fromStatus: string | null;
    toStatus: string | null;
    metadata?: {
      rejectionReason?: string;
      glossaryApplied?: boolean;
      qaWarningsCount?: number;
      locale?: string;
      error?: string;
      mode?: string;
      slug?: string;
      message?: string;
    };
  },
) {
  await ctx.db.insert("audit_logs", {
    ...entry,
    metadata: entry.metadata ?? {},
    timestamp: Date.now(),
  });
}

function uniqueMatches(text: string, regex: RegExp) {
  return [...new Set(text.match(regex) ?? [])];
}

export function buildQaWarnings(args: {
  headline: string;
  deck: string;
  body: string;
  translatedHeadline: string;
  translatedDeck: string;
  translatedBody: string;
  glossaryTerms: Array<Doc<"glossary_terms">>;
}) {
  const warnings: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    message: string;
    field?: string;
  }> = [];

  const englishCombined = `${args.headline}\n${args.deck}\n${args.body}`;
  const filipinoCombined = `${args.translatedHeadline}\n${args.translatedDeck}\n${args.translatedBody}`;

  const sourceNumbers = uniqueMatches(englishCombined, /\b\d[\d,./:-]*\b/g);
  const targetNumbers = uniqueMatches(filipinoCombined, /\b\d[\d,./:-]*\b/g);

  if (sourceNumbers.join("|") !== targetNumbers.join("|")) {
    warnings.push({
      type: "numbers_mismatch",
      severity: "high",
      message:
        "Numbers or numeric formats differ between the English source and Filipino draft.",
      field: "translatedBody",
    });
  }

  const englishMonths = uniqueMatches(
    englishCombined,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi,
  );

  if (englishMonths.length > 0 && /January|February|March|April|May|June|July|August|September|October|November|December/i.test(filipinoCombined)) {
    warnings.push({
      type: "leftover_english_dates",
      severity: "medium",
      message:
        "The Filipino draft still contains English month names. Confirm dates and localization style.",
      field: "translatedBody",
    });
  }

  const quoteCountDifference =
    (englishCombined.match(/"/g) ?? []).length -
    (filipinoCombined.match(/"/g) ?? []).length;

  if (quoteCountDifference !== 0) {
    warnings.push({
      type: "quote_mismatch",
      severity: "high",
      message:
        "Quoted text markers do not align between the source and translated draft.",
      field: "translatedBody",
    });
  }

  const leftoverEnglish = uniqueMatches(
    filipinoCombined,
    /\b(the|and|with|from|student|newsroom|government|election)\b/gi,
  );

  if (leftoverEnglish.length > 0) {
    warnings.push({
      type: "leftover_english_words",
      severity: "low",
      message: `The Filipino draft still contains common English words: ${leftoverEnglish.join(", ")}.`,
      field: "translatedBody",
    });
  }

  const glossaryMismatches = args.glossaryTerms.filter((term) => {
    return (
      englishCombined.includes(term.englishTerm) &&
      !filipinoCombined.includes(term.filipinoTerm)
    );
  });

  if (glossaryMismatches.length > 0) {
    warnings.push({
      type: "glossary_mismatch",
      severity: "medium",
      message: `Glossary terms may be missing from the Filipino draft: ${glossaryMismatches
        .slice(0, 3)
        .map((term) => term.englishTerm)
        .join(", ")}.`,
      field: "translatedBody",
    });
  }

  return warnings;
}
