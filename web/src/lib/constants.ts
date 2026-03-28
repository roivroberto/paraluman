export const ARTICLE_STATUSES = [
  "DRAFT",
  "TRANSLATING",
  "NEEDS_REVIEW",
  "PUBLISHED",
] as const;

export const ARTICLE_CATEGORIES = [
  "news",
  "opinion",
  "feature",
  "sports",
  "culture",
] as const;

export const APP_ROLES = ["writer", "editor"] as const;

export const LOCALES = ["en", "fil"] as const;

export const FILIPINO_DISCLOSURE =
  "Ang artikulong ito ay may AI-assisted na unang salin at sinuri ng editor bago inilathala.";

export const PLACEHOLDER_CONVEX_URL = "https://placeholder.convex.cloud";

export const DEMO_GLOSSARY_SEED = [
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
    notes: "Keep UP as the follow-up acronym where relevant.",
  },
  {
    englishTerm: "student council",
    filipinoTerm: "konseho ng mag-aaral",
    category: "house_style",
    notes: "Use the Filipino descriptive form in body copy.",
  },
  {
    englishTerm: "Quezon City",
    filipinoTerm: "Lungsod Quezon",
    category: "place",
    notes: "Use the official Filipino rendering in news copy.",
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
    notes: "Preferred over untranslated chairperson.",
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
    notes: "Use in explanatory contexts for verification coverage.",
  },
  {
    englishTerm: "youth vote",
    filipinoTerm: "boto ng kabataan",
    category: "house_style",
    notes: "Preferred translation for electoral stories.",
  },
] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type AppRole = (typeof APP_ROLES)[number];
export type AppLocale = (typeof LOCALES)[number];
