import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  auditActionValidator,
  categoryValidator,
  glossaryCategoryValidator,
  qaWarningValidator,
  roleValidator,
  statusValidator,
} from "./constants";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    displayName: v.string(),
    role: roleValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  articles: defineTable({
    authorId: v.id("users"),
    slug: v.string(),
    status: statusValidator,
    sourceLanguage: v.literal("en"),
    headline: v.string(),
    deck: v.string(),
    body: v.string(),
    byline: v.string(),
    category: categoryValidator,
    heroImageUrl: v.string(),
    heroImageCaption: v.string(),
    heroImageAlt: v.string(),
    latestEditorNote: v.union(v.string(), v.null()),
    translationError: v.union(v.string(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"])
    .index("by_status_author", ["status", "authorId"]),

  article_localizations: defineTable({
    articleId: v.id("articles"),
    locale: v.literal("fil"),
    translatedHeadline: v.string(),
    translatedDeck: v.string(),
    translatedBody: v.string(),
    translationSource: v.union(v.literal("ai_assisted"), v.literal("human")),
    translationProvider: v.union(
      v.literal("google_cloud_translation"),
      v.null(),
    ),
    glossaryApplied: v.boolean(),
    editorEdited: v.boolean(),
    qaWarnings: v.array(qaWarningValidator),
    generatedAt: v.number(),
    generatedBy: v.union(v.id("users"), v.literal("system")),
    updatedAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_locale", ["locale"])
    .index("by_article_locale", ["articleId", "locale"]),

  glossary_terms: defineTable({
    englishTerm: v.string(),
    filipinoTerm: v.string(),
    category: glossaryCategoryValidator,
    notes: v.string(),
    active: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["active"])
    .index("by_english_term", ["englishTerm"]),

  audit_logs: defineTable({
    articleId: v.id("articles"),
    actorId: v.union(v.id("users"), v.literal("system")),
    action: auditActionValidator,
    fromStatus: v.union(v.string(), v.null()),
    toStatus: v.union(v.string(), v.null()),
    metadata: v.object({
      rejectionReason: v.optional(v.string()),
      glossaryApplied: v.optional(v.boolean()),
      qaWarningsCount: v.optional(v.number()),
      locale: v.optional(v.string()),
      error: v.optional(v.string()),
      mode: v.optional(v.string()),
      slug: v.optional(v.string()),
      message: v.optional(v.string()),
    }),
    timestamp: v.number(),
  }).index("by_article", ["articleId"]),

  publication_records: defineTable({
    articleId: v.id("articles"),
    slug: v.string(),
    approvedBy: v.id("users"),
    approvedAt: v.number(),
    publishedBy: v.id("users"),
    publishedAt: v.number(),
    enUrl: v.string(),
    filUrl: v.string(),
    filLocalizationId: v.id("article_localizations"),
    createdAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_slug", ["slug"]),
});
