import { v } from "convex/values";

export const roles = ["writer", "editor"] as const;
export const statuses = [
  "DRAFT",
  "TRANSLATING",
  "NEEDS_REVIEW",
  "PUBLISHED",
] as const;
export const categories = [
  "news",
  "opinion",
  "feature",
  "sports",
  "culture",
] as const;
export const glossaryCategories = [
  "org",
  "title",
  "place",
  "name",
  "house_style",
] as const;

export const auditActions = [
  "article_created",
  "article_updated",
  "translation_requested",
  "translation_completed",
  "translation_failed",
  "qa_checks_completed",
  "editor_edit",
  "retranslation_requested",
  "article_rejected",
  "article_approved",
  "article_published",
] as const;

export const roleValidator = v.union(...roles.map((role) => v.literal(role)));
export const statusValidator = v.union(
  ...statuses.map((status) => v.literal(status)),
);
export const categoryValidator = v.union(
  ...categories.map((category) => v.literal(category)),
);
export const glossaryCategoryValidator = v.union(
  ...glossaryCategories.map((category) => v.literal(category)),
);
export const auditActionValidator = v.union(
  ...auditActions.map((action) => v.literal(action)),
);

export const qaWarningValidator = v.object({
  type: v.string(),
  severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  message: v.string(),
  field: v.optional(v.string()),
});

export const demoGlossarySeed = [
  {
    englishTerm: "Commission on Elections",
    filipinoTerm: "Komisyon sa Halalan (COMELEC)",
    category: "org",
    notes: "Use full form on first mention; COMELEC acceptable afterward.",
  },
  {
    englishTerm: "Department of Education",
    filipinoTerm: "Kagawaran ng Edukasyon (DepEd)",
    category: "org",
    notes: "DepEd may be used after first mention.",
  },
  {
    englishTerm: "Supreme Court",
    filipinoTerm: "Korte Suprema",
    category: "org",
    notes: "Capitalize as a proper institution name.",
  },
  {
    englishTerm: "University of the Philippines",
    filipinoTerm: "Unibersidad ng Pilipinas",
    category: "org",
    notes: "Use UP after first mention where needed.",
  },
  {
    englishTerm: "student council",
    filipinoTerm: "konseho ng mag-aaral",
    category: "house_style",
    notes: "Use in campus governance stories.",
  },
  {
    englishTerm: "Quezon City",
    filipinoTerm: "Lungsod Quezon",
    category: "place",
    notes: "Preferred Filipino place naming in copy.",
  },
  {
    englishTerm: "President",
    filipinoTerm: "Pangulo",
    category: "title",
    notes: "Capitalize when used as a formal title before a name.",
  },
  {
    englishTerm: "Chairperson",
    filipinoTerm: "Tagapangulo",
    category: "title",
    notes: "Preferred over an untranslated form.",
  },
  {
    englishTerm: "Paraluman",
    filipinoTerm: "Paraluman",
    category: "name",
    notes: "Do not translate the newsroom name.",
  },
  {
    englishTerm: "fact-check",
    filipinoTerm: "beripikasyon ng datos",
    category: "house_style",
    notes: "Use in explanatory verification contexts.",
  },
  {
    englishTerm: "youth vote",
    filipinoTerm: "boto ng kabataan",
    category: "house_style",
    notes: "Preferred translation for youth electoral coverage.",
  },
] as const;
